<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import ModalDelete from "~/components/general/ModalDelete/index.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import { useFacilitiesSkuStore } from "~/store/master-data/facilities-sku-store";
import { usePageStore } from "~/store/page";
import type { FacilitiesSkuType } from "~/types/facilities-sku-type";
import CardDetailWarehouse from "~/components/features/warehouse/sku/CardDetailWarehouse.vue";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import ModalFormSku from "./ModalFormSku.vue";
import ModalFormEditSku from "./ModalFormEditSku.vue";
import type { SessionResponseType } from "~/types/user-type";
import ModalImportSku from "./ModalImportSku.vue";
import { useSkuStore } from "~/store/master-data/sku-store";

const $page = usePageStore();
const facilitiesSkuStore = useFacilitiesSkuStore();
const { data, loadingWrite, loadingList } = storeToRefs(facilitiesSkuStore);
const modalAddRef = ref<InstanceType<typeof ModalFormSku> | null>(null);
const modalEditRef = ref<InstanceType<typeof ModalFormEditSku> | null>(null);
const deleteModalRef = ref<ElementEvent | null>(null);
const selectedSku = ref<Record<string, any> | null>(null);
const importModalRef = ref<InstanceType<typeof ModalImportSku> | null>(null);
const skuStore = useSkuStore();
const facilitiesStore = useFacilitiesStore();
const { dataDetail } = storeToRefs(facilitiesStore);
const route = useRoute();
const { data: authData } = useAuth();

const isManagementRole = computed(() => {
  const session = authData.value as SessionResponseType | null;
  const roleName = session?.data?.role?.name || "";
  return roleName.toLowerCase() === "management";
});

const warehouseId = computed(() => String(route.params.warehouse_id || ""));
const warehouse = computed(() => dataDetail.value?.data);

const params = reactive({
  search: "",
  page: 1,
  limit: 10,
  status: "",
});

const tableData = computed(
  () =>
    data.value?.data?.data ||
    (Array.isArray(data.value?.data) ? data.value?.data : [])
);

const tableColumns: TableColumn[] = [
  { key: "sku_code", label: "SKU Code" },
  { key: "sku_name", label: "Name", headerClass: "min-w-[200px]" },
  { key: "low_stock_threshold", label: "Min Stock" },
  { key: "high_stock_threshold", label: "Max Stock" },
  // { key: "status", label: "Status" },
  { key: "description", label: "Description" },
  { key: "actions", label: "Actions", align: "right" as const },
];

const statusOptions = [
  { id: "", label: "All Status" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];
const openAddSkuModal = async () => {
  await nextTick();

  modalAddRef.value?.open();
};

const openUpdateSkuModal = async (row: FacilitiesSkuType) => {
  // Simpan baris Facilities SKU yang dipilih di store,
  // supaya bisa dibaca oleh ModalFormEditSku.
  facilitiesSkuStore.setSelectedData(row);
  await nextTick();
  modalEditRef.value?.open();
};

const handleDeleteModalMounted = (instance: ElementEvent) => {
  deleteModalRef.value = instance;
};

const openDeleteSkuModal = (row: Record<string, any>) => {
  selectedSku.value = row;
  deleteModalRef.value?.show();
};

const closeDeleteSkuModal = () => deleteModalRef.value?.hide();

const handleConfirmDelete = async () => {
  if (!selectedSku.value) return;
  try {
    // await skuStore.deleteDataSku({ id: selectedSku.value.sku_id });
    await facilitiesSkuStore.deleteDataFacilitiesSku({
      id: String(selectedSku.value.sku_id),
      facility_id: warehouseId.value,
    });
    facilitiesSkuStore.getDataFacilitiesSku({
      ...params,
      facility_id: warehouseId.value,
    });
    closeDeleteSkuModal();
  } catch (error) {
    throw error;
  }
};

const handleSearchChange = (value: string) => {
  params.search = value;
};

const handlePageChange = (page: number) => {
  params.page = page;
};

const handlePageSizeChange = (pageSize: number) => {
  params.limit = pageSize;
  params.page = 1;
};

const handleDownloadTemplate = () => {
  const link = document.createElement("a");
  link.href = "/template/template_import_sku_facility_sku.csv";
  link.download = "template_import_sku_facility_sku.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const openImportModal = async () => {
  await nextTick();
  importModalRef.value?.open();
};

watch(
  () => ({ ...params, facility_id: warehouseId.value }),
  () => {
    facilitiesSkuStore.getDataFacilitiesSku({
      ...params,
      facility_id: warehouseId.value,
    });
  }
);

onMounted(() => {
  if (warehouseId.value) {
    facilitiesStore.getDataDetailFacilities({ id: warehouseId.value });
  }
  facilitiesSkuStore.getDataFacilitiesSku({
    ...params,
    facility_id: warehouseId.value,
  });
});

onBeforeMount(() => {
  $page.setTitle("SKU Master");
});
</script>

<template>
  <main class="space-y-8">
    <header class="flex justify-between items-end">
      <GeneralTitle title="SKU Master" subtitle="Manage Stock Keeping Units" />
      <div class="flex justify-between space-x-2">
        <GeneralButton
          color="success"
          label="Download Template"
          type="button"
          @on-click="handleDownloadTemplate"
        >
          <template #prefix>
            <IconsDownload size="18" class="text-white" />
          </template>
        </GeneralButton>
        <template v-if="!isManagementRole">
          <GeneralButton
            color="warning"
            label="Import"
            type="button"
            @on-click="openImportModal"
          >
            <template #prefix>
              <IconsUpload size="18" class="text-white" />
            </template>
          </GeneralButton>
          <GeneralButton
            color="primary"
            label="Add SKU"
            @on-click="openAddSkuModal"
          >
            <template #prefix>
              <IconsPlus size="18" class="text-white" />
            </template>
          </GeneralButton>
        </template>
      </div>
    </header>

    <section class="grid grid-cols-12 gap-4 items-start">
      <div class="col-span-12 lg:col-span-4">
        <CardDetailWarehouse :warehouse="warehouse || null" />
      </div>

      <div class="col-span-12 lg:col-span-8 space-y-4">
        <section class="flex bg-white p-6 rounded-xl items-end space-x-2">
          <GeneralSearchInput
            label="Search Name"
            placeholder="Search Name"
            class="max-w-[360px]"
            :debounce="1000"
            @change="handleSearchChange"
          />
        </section>

        <section class="space-y-4">
          <div class="bg-white p-6 rounded-xl space-y-4">
            <GeneralTable
              :columns="tableColumns"
              :data="tableData"
              :loading="loadingList"
              row-key="id"
              striped
            >
              <!-- <template #cell-created_at="{ value }">
                {{ formatTableDate(value as string) }}
              </template> -->
              <template #cell-actions="{ row }">
                <div v-if="!isManagementRole" class="flex justify-end gap-2">
                  <GeneralIconButton
                    class="h-9 w-9"
                    color="default"
                    :ghost="true"
                    @on-click="openUpdateSkuModal(row as FacilitiesSkuType)"
                  >
                    <template #icon>
                      <IconsEdit size="16" class="text-gray-700" />
                    </template>
                  </GeneralIconButton>
                  <GeneralIconButton
                    class="h-9 w-9 bg-white"
                    color="default"
                    :bordered="false"
                    @on-click="openDeleteSkuModal(row)"
                  >
                    <template #icon>
                      <IconsDelete size="18" class="text-red-500" />
                    </template>
                  </GeneralIconButton>
                </div>
              </template>
            </GeneralTable>
            <GeneralPagination
              :page="params.page"
              :page-size="params.limit"
              :total="data?.data?.total ?? tableData.length"
              @update:page="handlePageChange"
              @update:page-size="handlePageSizeChange"
            />
          </div>
        </section>
      </div>
    </section>
    <ModalFormSku ref="modalAddRef" />
    <ModalImportSku ref="importModalRef" :list-params="params" />
    <ModalFormEditSku ref="modalEditRef" />
    <ModalDelete
      id="modal-delete-sku"
      :target-label="selectedSku?.sku_name || selectedSku?.name || 'this SKU'"
      :is-loading="loadingWrite"
      confirm-label="Delete"
      @mounted="handleDeleteModalMounted"
      @cancel="closeDeleteSkuModal"
      @confirm="handleConfirmDelete"
    />
  </main>
</template>
