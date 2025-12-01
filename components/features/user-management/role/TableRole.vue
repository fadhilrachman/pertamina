<script setup lang="ts">
import { onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import ModalFormSku from "~/components/features/master-data/sku/ModalFormSku.vue";
import ModalDelete from "~/components/general/ModalDelete/index.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import { useSkuStore } from "~/store/master-data/sku-store";
import type { SKUType } from "~/types/sku-type";
import ModalFormRole from "./ModalFormRole.vue";
import { formatTableDate } from "~/utils/functions";
// import ModalFormRole from "./role/ModalFormRole.vue";

const roleStore = useSkuStore();
const { data, loadingWrite } = storeToRefs(roleStore);
const modalAddRef = ref<InstanceType<typeof ModalFormSku> | null>(null);
const formModeRef = ref(<"add" | "update">"add");
const deleteModalRef = ref<ElementEvent | null>(null);
const selectedSku = ref<Record<string, any> | null>(null);

const params = reactive({
  search: "",
  page: 1,
  limit: 10,
});
const tableColumns: TableColumn[] = [
  { key: "name", label: "Name", headerClass: "min-w-[200px]" },
  { key: "created_at", label: "Created At" },
  { key: "actions", label: "Actions", align: "right" as const },
];

const statusOptions = [
  { id: "", label: "All Status" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];
const openAddRoleModal = () => {
  formModeRef.value = "add";
  modalAddRef.value?.open();
};

const openUpdateRoleModal = (row: SKUType) => {
  roleStore.setSelectedData(row);
  formModeRef.value = "update";
  modalAddRef.value?.open();
};

const handleDeleteModalMounted = (instance: ElementEvent) => {
  deleteModalRef.value = instance;
};

const openDeleteRoleModal = (row: Record<string, any>) => {
  selectedSku.value = row;
  deleteModalRef.value?.show();
};

const closeDeleteRoleModal = () => deleteModalRef.value?.hide();

const handleConfirmDelete = async () => {
  if (!selectedSku.value) return;
  try {
    await roleStore.deleteDataSku({ id: String(selectedSku.value.sku_code) });
    roleStore.getDataSku({ ...params });
    closeDeleteRoleModal();
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

watch(
  () => ({ ...params }),
  () => {
    console.log({ params });

    roleStore.getDataSku({ ...params });
  }
);

onMounted(() => {
  roleStore.getDataSku({
    ...params,
  });
});
</script>

<template>
  <section class="space-y-8">
    <header class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Roles Management</h1>
        <p class="text-gray-500">Manage Stock Keeping Units</p>
      </div>
      <div class="flex justify-between space-x-2">
        <GeneralButton
          color="primary"
          label="Add Role"
          @on-click="openAddRoleModal"
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
    </section>
    <section class="space-y-4">
      <div class="bg-white p-6 rounded-xl space-y-4">
        <GeneralTable
          :columns="tableColumns"
          :data="data?.data?.data"
          row-key="id"
          striped
        >
          <template #cell-created_at="{ value }">
            {{ formatTableDate(value as string) }}
          </template>
          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <GeneralIconButton
                class="h-9 w-9"
                color="default"
                :ghost="true"
                @on-click="openUpdateRoleModal(row as SKUType)"
              >
                <template #icon>
                  <IconsEdit size="16" class="text-gray-700" />
                </template>
              </GeneralIconButton>
              <GeneralIconButton
                class="h-9 w-9 bg-white"
                color="default"
                :bordered="false"
                @on-click="openDeleteRoleModal(row)"
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
    <ModalFormRole ref="modalAddRef" :mode="formModeRef" />
    <ModalDelete
      id="modal-delete-sku"
      :target-label="selectedSku?.name || 'this SKU'"
      :is-loading="loadingWrite"
      confirm-label="Delete"
      @mounted="handleDeleteModalMounted"
      @cancel="closeDeleteRoleModal"
      @confirm="handleConfirmDelete"
    />
  </section>
</template>
