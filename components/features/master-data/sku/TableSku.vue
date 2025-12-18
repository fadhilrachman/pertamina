<script setup lang="ts">
import { onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import ModalFormSku from "~/components/features/master-data/sku/ModalFormSku.vue";
import ModalDelete from "~/components/general/ModalDelete/index.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import { useSkuStore } from "~/store/master-data/sku-store";
import { usePageStore } from "~/store/page";
import type { SKUType } from "~/types/sku-type";
import { formatTableDate } from "~/utils/functions";

const $page = usePageStore();
const skuStore = useSkuStore();
const { data, loadingWrite, loadingList } = storeToRefs(skuStore);
const modalAddRef = ref<InstanceType<typeof ModalFormSku> | null>(null);
const formModeRef = ref(<"add" | "update">"add");
const deleteModalRef = ref<ElementEvent | null>(null);
const selectedSku = ref<Record<string, any> | null>(null);

const params = reactive({
  search: "",
  page: 1,
  limit: 10,
  status: "",
});
const tableColumns: TableColumn[] = [
  { key: "sku_code", label: "SKU Code" },
  { key: "name", label: "Name", headerClass: "min-w-[200px]" },
  { key: "category", label: "Category" },
  { key: "unit", label: "UOM" },
  { key: "max_stock", label: "Max Stock" },
  { key: "min_stock", label: "Min Stock" },
  // { key: "status", label: "Status" },
  { key: "description", label: "Description" },
  // { key: "created_at", label: "Created At" },
  { key: "actions", label: "Actions", align: "right" as const },
];

const statusOptions = [
  { id: "", label: "All Status" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];
const openAddSkuModal = async () => {
  formModeRef.value = "add";
  await nextTick();

  modalAddRef.value?.open();
};

const openUpdateSkuModal = async (row: SKUType) => {
  skuStore.setSelectedData(row);
  formModeRef.value = "update";
  await nextTick();
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
    await skuStore.deleteDataSku({ id: String(selectedSku.value.id) });
    skuStore.getDataSku({ ...params });
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

const handleStatusChange = (value: string | number) => {
  params.status = String(value);
  params.page = 1;
};

watch(
  () => ({ ...params }),
  () => {
    skuStore.getDataSku({ ...params });
  }
);

onMounted(() => {
  skuStore.getDataSku({
    ...params,
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
          :data="data?.data?.data"
          :loading="loadingList"
          row-key="id"
          striped
        >
          <!-- <template #cell-created_at="{ value }">
            {{ formatTableDate(value as string) }}
          </template> -->
          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <GeneralIconButton
                class="h-9 w-9"
                color="default"
                :ghost="true"
                @on-click="openUpdateSkuModal(row as SKUType)"
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
          :total="data?.data?.total || 0"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </section>
    <ModalFormSku ref="modalAddRef" :mode="formModeRef" />
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
