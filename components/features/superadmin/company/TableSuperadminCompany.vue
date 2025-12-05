<script setup lang="ts">
import { onMounted, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import type { TableColumn } from "~/components/general/Table/index.vue";
import { useSuperadminCompanyStore } from "~/store/superadmin/company-store";

const companyStore = useSuperadminCompanyStore();
const { data, loadingList } = storeToRefs(companyStore);

const params = reactive({
  search: "",
  page: 1,
  limit: 10,
});

const tableColumns: TableColumn[] = [
  { key: "name", label: "Company Name", headerClass: "min-w-[200px]" },
  { key: "pic_name", label: "PIC Name", headerClass: "min-w-[160px]" },
  { key: "email", label: "Email", headerClass: "min-w-[220px]" },
];

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
    companyStore.getDataCompanies({ ...params });
  }
);

onMounted(() => {
  companyStore.getDataCompanies({
    ...params,
  });
});
</script>

<template>
  <section class="space-y-8">
    <header class="flex justify-between items-end">
      <GeneralTitle title="Companies (Superadmin)" subtitle="Manage all companies" />
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
          :loading="loadingList"
          row-key="id"
          striped
        />
        <GeneralPagination
          :page="params.page"
          :page-size="params.limit"
          :total="data?.data?.total || 0"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </section>
  </section>
</template>

