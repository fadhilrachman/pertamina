<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import ModalDelete from "~/components/general/ModalDelete/index.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import type { UserType } from "~/types/user-type";
import { useSuperadminUserStore } from "~/store/superadmin/user-store";
import { formatTableDate } from "~/utils/functions";
import ModalFormSuperadminUser from "./ModalFormSuperadminUser.vue";

const userStore = useSuperadminUserStore();
const { data, loadingWrite, loadingList } = storeToRefs(userStore);

const deleteModalRef = ref<ElementEvent | null>(null);
const selectedUser = ref<UserType | null>(null);

const modalAddRef = ref<InstanceType<typeof ModalFormSuperadminUser> | null>(
  null
);
const formModeRef = ref<"add" | "update">("add");

const params = reactive({
  search: "",
  page: 1,
  limit: 10,
});

const tableColumns: TableColumn[] = [
  { key: "name", label: "Name", headerClass: "min-w-[180px]" },
  { key: "email", label: "Email", headerClass: "min-w-[220px]" },
  { key: "role", label: "Role" },
  { key: "created_at", label: "Created At" },
  { key: "actions", label: "Actions", align: "right" as const },
];

const handleDeleteModalMounted = (instance: ElementEvent) => {
  deleteModalRef.value = instance;
};

const openDeleteUserModal = (row: Record<string, any>) => {
  selectedUser.value = row as UserType;
  deleteModalRef.value?.show();
};

const closeDeleteUserModal = () => deleteModalRef.value?.hide();

const handleConfirmDelete = async () => {
  if (!selectedUser.value) return;
  try {
    await userStore.deleteUser({ id: String(selectedUser.value.id) });
    userStore.getDataUsers({ ...params });
    closeDeleteUserModal();
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

const openAddUserModal = () => {
  formModeRef.value = "add";
  selectedUser.value = null;
  modalAddRef.value?.open();
};

const openUpdateUserModal = async (row: UserType) => {
  userStore.setSelectedData(row);
  formModeRef.value = "update";
  selectedUser.value = row;

  try {
    await userStore.getUserDetail({ id: String(row.id) });
  } catch (error) {
    // Keep the modal usable even if detail fetch fails
    console.error("Failed to fetch user detail", error);
  } finally {
    modalAddRef.value?.open();
  }
};

watch(
  () => ({ ...params }),
  () => {
    userStore.getDataUsers({ ...params });
  }
);

onMounted(() => {
  userStore.getDataUsers({
    ...params,
  });
});
</script>

<template>
  <section class="space-y-8">
    <header class="flex justify-between items-end">
      <GeneralTitle title="Users " subtitle="Manage all users in the system" />
      <div class="flex justify-between space-x-2">
        <GeneralButton
          color="primary"
          label="Add User"
          @on-click="openAddUserModal"
        >
          <template #prefix>
            <IconsPlus size="18" class="text-white" />
          </template>
        </GeneralButton>
      </div>
    </header>

    <section class="flex bg-white p-6 rounded-xl items-end space-x-2">
      <GeneralSearchInput
        label="Search"
        placeholder="Search by email or name"
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
          :loading="loadingList"
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
                @on-click="openUpdateUserModal(row as UserType)"
              >
                <template #icon>
                  <IconsEdit size="16" class="text-gray-700" />
                </template>
              </GeneralIconButton>
              <GeneralIconButton
                class="h-9 w-9 bg-white"
                color="default"
                :bordered="false"
                @on-click="openDeleteUserModal(row)"
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

    <ModalFormSuperadminUser ref="modalAddRef" :mode="formModeRef" />

    <ModalDelete
      id="modal-delete-superadmin-user"
      :target-label="selectedUser?.name || 'this user'"
      :is-loading="loadingWrite"
      confirm-label="Delete"
      @mounted="handleDeleteModalMounted"
      @cancel="closeDeleteUserModal"
      @confirm="handleConfirmDelete"
    />
  </section>
</template>
