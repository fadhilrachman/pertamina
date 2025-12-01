<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import ModalDelete from "~/components/general/ModalDelete/index.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import { useUserStore } from "~/store/user-management/user-store";
import type { UserType } from "~/types/user-type";
import ModalFormRole from "../role/ModalFormRole.vue";
import ModalFormUser from "./ModalFormUser.vue";
import { formatTableDate } from "~/utils/functions";

const userStore = useUserStore();
const { data, loadingWrite } = storeToRefs(userStore);
const modalAddRef = ref<InstanceType<typeof ModalFormRole> | null>(null);
const formModeRef = ref(<"add" | "update">"add");
const deleteModalRef = ref<ElementEvent | null>(null);
const selectedUser = ref<UserType | null>(null);

const params = reactive({
  search: "",
  page: 1,
  limit: 10,
});
const tableColumns: TableColumn[] = [
  { key: "name", label: "Name", headerClass: "min-w-[180px]" },
  { key: "email", label: "Email", headerClass: "min-w-[220px]" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Created At" },
  { key: "actions", label: "Actions", align: "right" as const },
];

const openAddRoleModal = () => {
  formModeRef.value = "add";
  modalAddRef.value?.open();
};

const openUpdateRoleModal = (row: UserType) => {
  userStore.setSelectedData(row);
  formModeRef.value = "update";
  modalAddRef.value?.open();
};

const handleDeleteModalMounted = (instance: ElementEvent) => {
  deleteModalRef.value = instance;
};

const openDeleteRoleModal = (row: Record<string, any>) => {
  selectedUser.value = row as UserType;
  deleteModalRef.value?.show();
};

const closeDeleteRoleModal = () => deleteModalRef.value?.hide();

const handleConfirmDelete = async () => {
  if (!selectedUser.value) return;
  try {
    await userStore.deleteDataUser({ id: String(selectedUser.value.id) });
    userStore.getDataUser({ ...params });
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

    userStore.getDataUser({ ...params });
  }
);

onMounted(() => {
  userStore.getDataUser({
    ...params,
  });
});
</script>

<template>
  <section class="space-y-8">
    <header class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">User Management</h1>
        <p class="text-gray-500">Manage users and access</p>
      </div>
      <div class="flex justify-between space-x-2">
        <GeneralButton
          color="primary"
          label="Invite User"
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
                @on-click="openUpdateRoleModal(row as UserType)"
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
    <ModalFormUser ref="modalAddRef" :mode="formModeRef" />
    <ModalDelete
      id="modal-delete-user"
      :target-label="selectedUser?.name || 'this user'"
      :is-loading="loadingWrite"
      confirm-label="Delete"
      @mounted="handleDeleteModalMounted"
      @cancel="closeDeleteRoleModal"
      @confirm="handleConfirmDelete"
    />
  </section>
</template>
