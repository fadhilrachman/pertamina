<script setup lang="ts">
import { onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import ModalDelete from "~/components/general/ModalDelete/index.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import { usePageStore } from "~/store/page";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import type { FacilitiesType } from "~/types/facilities-type";
import ModalFormFacilities from "./ModalFormFacilities.vue";

const $page = usePageStore();
const facilitiesStore = useFacilitiesStore();
const { data, loadingWrite, loadingList } = storeToRefs(facilitiesStore);
const modalAddRef = ref<InstanceType<typeof ModalFormFacilities> | null>(null);
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
  { key: "code", label: "Code" },
  { key: "name", label: "Facility Name", headerClass: "min-w-[200px]" },
  { key: "address", label: "Address" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", align: "right" as const },
];

const statusOptions = [
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];
const openAddFacilities = () => {
  formModeRef.value = "add";
  modalAddRef.value?.open();
};

const openUpdateFacilities = (row: FacilitiesType) => {
  facilitiesStore.setSelectedData(row);
  formModeRef.value = "update";
  modalAddRef.value?.open();
};

const handleDeleteModalMounted = (instance: ElementEvent) => {
  deleteModalRef.value = instance;
};

const openDeleteFacilities = (row: Record<string, any>) => {
  selectedSku.value = row;
  deleteModalRef.value?.show();
};

const closeDeleteFacilities = () => deleteModalRef.value?.hide();

const handleConfirmDelete = async () => {
  if (!selectedSku.value) return;
  try {
    await facilitiesStore.deleteDataFacilities({
      id: String(selectedSku.value.id),
    });
    facilitiesStore.getDataFacilities({ ...params });
    closeDeleteFacilities();
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

watch(
  () => ({ ...params }),
  () => {
    console.log({ params });

    facilitiesStore.getDataFacilities({ ...params });
  }
);

onMounted(() => {
  facilitiesStore.getDataFacilities({
    ...params,
  });
});
</script>

<template>
  <main class="space-y-8">
    <header class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Warehouse Master</h1>
        <p class="text-gray-500">Manage facilities and warehouses</p>
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
          label="Add Warehouse"
          @on-click="openAddFacilities"
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
          :loading="loadingList"
          :columns="tableColumns"
          :data="data?.data?.data"
          row-key="id"
          striped
        >
          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <GeneralIconButton
                class="h-9 w-9"
                color="default"
                @on-click="openUpdateFacilities(row as FacilitiesType)"
              >
                <template #icon>
                  <IconsEdit size="18" class="text-gray-700" />
                </template>
              </GeneralIconButton>
              <GeneralIconButton
                class="h-9 w-9 bg-white"
                color="default"
                :bordered="false"
                @on-click="openDeleteFacilities(row)"
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
    <ModalFormFacilities ref="modalAddRef" :mode="formModeRef" />
    <ModalDelete
      id="modal-delete-sku"
      :target-label="selectedSku?.name || 'this SKU'"
      :is-loading="loadingWrite"
      confirm-label="Delete"
      @mounted="handleDeleteModalMounted"
      @cancel="closeDeleteFacilities"
      @confirm="handleConfirmDelete"
    />
  </main>
</template>
