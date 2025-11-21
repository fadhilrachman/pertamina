<script setup lang="ts">
import { computed, onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import ModalFormSku from "~/components/features/master-data/sku/ModalFormSku.vue";
import ModalDelete from "~/components/general/ModalDelete/index.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import { useSkuStore } from "~/store/master-data/sku-store";
import { usePageStore } from "~/store/page";
import type { SKUType } from "~/types/sku-type";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import ModalFormFacilitiesSku from "./ModalFormFacilitiesSku.vue";
import { useFacilitiesSkuStore } from "~/store/master-data/facilities-sku-store";

const $page = usePageStore();
const skuStore = useFacilitiesSkuStore();
const facilitiesStore = useFacilitiesStore();
const route = useRoute();
const router = useRouter();
const { data: dataFacilities } = storeToRefs(facilitiesStore);
const { data, loadingWrite, loadingList } = storeToRefs(skuStore);
const modalAddRef = ref<InstanceType<typeof ModalFormSku> | null>(null);
const formModeRef = ref(<"add" | "update">"add");
const deleteModalRef = ref<ElementEvent | null>(null);
const selectedSku = ref<Record<string, any> | null>(null);

const parseFacilitiesQuery = (value: unknown) => {
  if (Array.isArray(value)) return value[0] ? String(value[0]) : "";
  return value ? String(value) : "";
};

const params = reactive({
  search: "",
  page: 1,
  limit: 10,
  status: "",
  facilities_id: parseFacilitiesQuery(route.query.facilities_id),
});
const tableColumns: TableColumn[] = [
  { key: "sku_code", label: "SKU Code" },
  { key: "name", label: "Name", headerClass: "min-w-[200px]" },
  { key: "unit", label: "Unit" },
  { key: "status", label: "Status" },
  { key: "description", label: "Description" },
  { key: "created_at", label: "Created At" },
  { key: "actions", label: "Actions", align: "right" as const },
];

const statusOptions = [
  { id: "", label: "All Status" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

const facilitiesOptions = computed(
  () =>
    dataFacilities.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || []
);
const tableData = computed(() =>
  params.facilities_id ? data?.value?.data?.data || [] : []
);
const tableEmptyText = computed(() =>
  params.facilities_id ? "No records found." : "Select Facility First"
);
const openAddSkuModal = () => {
  formModeRef.value = "add";
  modalAddRef.value?.open();
};

const openUpdateSkuModal = (row: SKUType) => {
  // skuStore.setSelectedData(row);
  formModeRef.value = "update";
  modalAddRef.value?.open();
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
    await skuStore.deleteDataFacilitiesSku({
      id: String(selectedSku.value.id),
      facilities_id: parseFacilitiesQuery(route.query.facilities_id),
    });
    skuStore.getDataFacilitiesSku({ ...params });
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

const handleStatusChange = (value: string | number) => {
  params.status = String(value);
  params.page = 1;
};

const handleFacilitiesChange = (
  value: string | number | (string | number)[] | null
) => {
  params.facilities_id = Array.isArray(value)
    ? value[0]
      ? String(value[0])
      : ""
    : value
    ? String(value)
    : "";
  params.page = 1;
  syncFacilitiesQuery();
};

const syncFacilitiesQuery = () => {
  const newQuery = { ...route.query };
  if (params.facilities_id) {
    newQuery.facilities_id = params.facilities_id;
  } else {
    delete (newQuery as Record<string, unknown>).facilities_id;
  }
  router.replace({ query: newQuery });
};

watch(
  () => ({ ...params }),
  () => {
    console.log({ params });

    skuStore.getDataFacilitiesSku({ ...params });
  }
);

watch(
  () => route.query.facilities_id,
  (next) => {
    const parsed = parseFacilitiesQuery(next);
    if (parsed !== params.facilities_id) {
      params.facilities_id = parsed;
      params.page = 1;
    }
  }
);

onMounted(() => {
  skuStore.getDataFacilitiesSku({
    ...params,
  });

  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
});

onBeforeMount(() => {
  $page.setTitle("SKU Master");
});
</script>

<template>
  <main class="space-y-8">
    <header class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">
          Facilities SKU Master
        </h1>
        <p class="text-gray-500">Manage Stock Keeping Units</p>
      </div>
      <div class="flex justify-between space-x-2">
        <GeneralButton color="success" label="Download Template">
          <template #prefix>
            <IconsDownload size="18" class="text-white" />
          </template>
        </GeneralButton>
        <GeneralButton color="warning" label="Import">
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
      </div>
    </header>
    <section class="flex bg-white p-6 rounded-xl items-end space-x-2">
      <GeneralSearchInput
        label="Search Name"
        placeholder="Search Name"
        class="max-w-[360px]"
        :debounce="1000"
        @change="handleSearchChange"
      />

      <div class="min-w-[240px] space-y-1">
        <label class="text-sm font-medium text-gray-700">Facilities</label>
        <GeneralDropdownSearch
          v-model="params.facilities_id"
          :options="facilitiesOptions"
          placeholder="Search facilities"
          @change="handleFacilitiesChange"
        />
      </div>

      <GeneralDropdown
        v-model="params.status"
        variant="field"
        :options="statusOptions"
        label="Status"
        placeholder="All Status"
        class="w-max"
        @change="handleStatusChange"
      />
    </section>
    <section class="space-y-4">
      <div class="bg-white p-6 rounded-xl space-y-4">
        <GeneralTable
          :columns="tableColumns"
          :data="tableData"
          :empty-text="tableEmptyText"
          :loading="loadingList"
          row-key="id"
          striped
        >
          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <GeneralIconButton
                class="h-9 w-9"
                color="default"
                @on-click="openUpdateSkuModal(row as SKUType)"
              >
                <template #icon>
                  <IconsEdit size="18" class="text-gray-700" />
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
          :total="data?.data?.total || 0"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </section>
    <ModalFormFacilitiesSku ref="modalAddRef" :mode="formModeRef" />
    <ModalDelete
      id="modal-delete-sku"
      :target-label="selectedSku?.name || 'this SKU'"
      :is-loading="loadingWrite"
      confirm-label="Delete"
      @mounted="handleDeleteModalMounted"
      @cancel="closeDeleteSkuModal"
      @confirm="handleConfirmDelete"
    />
  </main>
</template>
