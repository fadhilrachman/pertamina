<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import type { TableColumn } from "~/components/general/Table/index.vue";
import { usePageStore } from "~/store/page";
import { useSuperadminFacilitiesStore } from "~/store/superadmin/facilities-store";
import { useSuperadminCompanyStore } from "~/store/superadmin/company-store";
import type { CompanyType } from "~/types/company-type";
import { useRouter } from "vue-router";

const $page = usePageStore();
const router = useRouter();
const facilitiesStore = useSuperadminFacilitiesStore();
const { data, loadingList } = storeToRefs(facilitiesStore);

const companyStore = useSuperadminCompanyStore();
const { data: companyData } = storeToRefs(companyStore);

const formModeRef = ref(<"add" | "update">"add");

const params = reactive({
  company_id: "",
  search: "",
  page: 1,
  limit: 10,
  status: "",
});

const companyOptions = computed(
  () =>
    companyData.value?.data?.data
      ?.map((item: CompanyType) => ({
        id: item.id ?? "",
        label: item.name,
      }))
      .filter((option) => option.id !== "") || []
);
const tableColumns: TableColumn[] = [
  { key: "code", label: "Code" },
  { key: "company", label: "Company" },
  { key: "name", label: "Warehouse Name", headerClass: "min-w-[200px]" },
  { key: "address", label: "Address" },
  { key: "capacity", label: "Capacity" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", align: "right" as const },
];

const statusOptions = [
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

const handleCompanyChange = (value: string) => {
  params.company_id = value;
  params.page = 1;
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
  companyStore.getDataCompanies({ page: 1, limit: 100, search: "" });
  facilitiesStore.getDataFacilities({
    ...params,
  });
});
</script>

<template>
  <main class="space-y-8">
    <header class="flex justify-between items-end">
      <GeneralTitle title="Warehouse Master" subtitle="Manage warehouses" />
      <div class="flex justify-between space-x-2"></div>
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
        <label class="mb-1.5 text-sm font-[600] text-gray-700">Company</label>
        <GeneralDropdownSearch
          v-model="params.company_id"
          :options="companyOptions"
          placeholder="All Companies"
          @change="handleCompanyChange"
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
          :loading="loadingList"
          :columns="tableColumns"
          :data="data?.data?.data"
          row-key="id"
          striped
        >
          <template #cell-company="{ value }">
            {{ (value as any)?.name ?? "-" }}
          </template>
          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <GeneralIconButton
                class="h-9 w-9"
                color="default"
                :ghost="true"
                @on-click="
                  () => {
                    router.push(`/superadmin/warehouse/${row.id}/sku`);
                  }
                "
              >
                <template #icon>
                  <IconsEye size="16" class="text-gray-700" />
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
  </main>
</template>
