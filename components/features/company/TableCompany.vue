<script setup lang="ts">
import { storeToRefs } from "pinia";
import ModalDelete from "~/components/general/ModalDelete/index.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import type { CompanyType } from "~/types/company-type";
import { useCompanyStore } from "~/store/company/company-store";
import { formatTableDate } from "~/utils/functions";
import ModalFormCompany from "./ModalFormCompany.vue";
import ModalDetailCompany from "./ModalDetailCompany.vue";

const companyStore = useCompanyStore();
const { data, loadingWrite } = storeToRefs(companyStore);
const modalAddRef = ref<InstanceType<typeof ModalFormCompany> | null>(null);
const formModeRef = ref(<"add" | "update">"add");
const deleteModalRef = ref<ElementEvent | null>(null);
const selectedCompany = ref<Record<string, any> | null>(null);
const detailModalRef = ref<ElementEvent | null>(null);

const params = reactive({
  search: "",
  page: 1,
  limit: 10,
});
const tableColumns: TableColumn[] = [
  { key: "name", label: "Company Name", headerClass: "min-w-[200px]" },
  { key: "pic_name", label: "PIC Name", headerClass: "min-w-[160px]" },
  { key: "email", label: "Email", headerClass: "min-w-[220px]" },
  { key: "actions", label: "Actions", align: "right" as const },
];

const openAddCompanyModal = () => {
  formModeRef.value = "add";
  modalAddRef.value?.open();
};

const openUpdateCompanyModal = (row: CompanyType) => {
  companyStore.setSelectedData(row);
  formModeRef.value = "update";
  modalAddRef.value?.open();
};

const handleDeleteModalMounted = (instance: ElementEvent) => {
  deleteModalRef.value = instance;
};

const openDeleteCompanyModal = (row: Record<string, any>) => {
  selectedCompany.value = row;
  deleteModalRef.value?.show();
};

const closeDeleteCompanyModal = () => deleteModalRef.value?.hide();

const handleConfirmDelete = async () => {
  if (!selectedCompany.value) return;
  try {
    await companyStore.deleteDataCompany({
      id: String(selectedCompany.value.id),
    });
    companyStore.getDataCompany({ ...params });
    closeDeleteCompanyModal();
  } catch (error) {
    throw error;
  }
};

const handleDetailModalMounted = (instance: ElementEvent) => {
  detailModalRef.value = instance;
};

const openDetailCompanyModal = (row: CompanyType) => {
  companyStore.setSelectedData(row);
  detailModalRef.value?.show();
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
    companyStore.getDataCompany({ ...params });
  }
);

onMounted(() => {
  companyStore.getDataCompany({
    ...params,
  });
});
</script>

<template>
  <section class="space-y-8">
    <header class="flex justify-between items-end">
      <GeneralTitle title="Company" subtitle="Manage companies" />
      <div class="flex justify-between space-x-2">
        <GeneralButton
          color="primary"
          label="Add Company"
          @on-click="openAddCompanyModal"
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
                @on-click="openDetailCompanyModal(row as CompanyType)"
              >
                <template #icon>
                  <IconsEye size="16" class="text-gray-700" />
                </template>
              </GeneralIconButton>
              <GeneralIconButton
                class="h-9 w-9"
                color="default"
                :ghost="true"
                @on-click="openUpdateCompanyModal(row as CompanyType)"
              >
                <template #icon>
                  <IconsEdit size="16" class="text-gray-700" />
                </template>
              </GeneralIconButton>
              <GeneralIconButton
                class="h-9 w-9 bg-white"
                color="default"
                :bordered="false"
                @on-click="openDeleteCompanyModal(row as CompanyType)"
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
    <ModalFormCompany ref="modalAddRef" :mode="formModeRef" />
    <ModalDetailCompany
      id="modal-detail-company"
      @mounted="handleDetailModalMounted"
    />
    <ModalDelete
      id="modal-delete-company"
      :target-label="selectedCompany?.name || 'this company'"
      :is-loading="loadingWrite"
      confirm-label="Delete"
      @mounted="handleDeleteModalMounted"
      @cancel="closeDeleteCompanyModal"
      @confirm="handleConfirmDelete"
    />
  </section>
</template>
