<script setup lang="ts">
import { computed, onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import { useSkuStore } from "~/store/master-data/sku-store";
import { usePageStore } from "~/store/page";
import { useStockOnHand } from "~/store/stock-on-hand/stock-on-hand-store";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import { formatTableDate } from "~/utils/functions";
import ModalAdjustmentHistory from "../stock-adjustment/ModalAdjustmentHistory.vue";
import type { SessionResponseType } from "~/types/user-type";
import {
  GeneralDropdownSearch,
  GeneralOutlinedButton,
  GeneralPagination,
  GeneralTable,
  GeneralTitle,
  IconsHistory,
} from "#components";
import { useSuperadminFacilitiesStore } from "~/store/superadmin/facilities-store";
import { useSuperadminStockOnHandStore } from "~/store/superadmin/stock-on-hand-store";
import { useSuperadminCompanyStore } from "~/store/superadmin/company-store";
import type { CompanyType } from "~/types/company-type";

const $page = usePageStore();

const stockOnHandStore = useSuperadminStockOnHandStore();
const facilitiesStore = useSuperadminFacilitiesStore();
const companyStore = useSuperadminCompanyStore();
// const skuStore = useSkuStore();
const { data: dataFacilities } = storeToRefs(facilitiesStore);
const { data: companyData } = storeToRefs(companyStore);
// const { data: dataSkuStore } = storeToRefs(skuStore);
const { data: authData } = useAuth();

const companyOptions = computed(
  () =>
    companyData.value?.data?.data?.map((item: CompanyType) => ({
      id: item.id,
      label: item.name,
    })) || []
);

const facilitiesOptions = computed(
  () =>
    dataFacilities.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || []
);

// const skuOptions = computed(
//   () =>
//     dataSkuStore.value?.data?.data?.map((item) => ({
//       id: item.id,
//       label: item.name,
//     })) || []
// );
const { data, loadingWrite, loadingList } = storeToRefs(stockOnHandStore);

const historyModalRef = ref<ElementEvent | null>(null);

const params = reactive({
  company_id: "",
  sku_id: "",
  facility_id: "",
  page: 1,
  limit: 10,
  status: "",
});

const tableData = computed(() => {
  const raw =
    data.value?.data?.data ||
    (Array.isArray(data.value?.data) ? data.value?.data : []);

  return (raw as any[]).map((item) => ({
    ...item,
    company_name: item.company_name ?? item.company?.name ?? "-",
    warehouse: item.warehouse ?? item.facility?.name ?? "-",
    sku_name: item.sku?.sku_code ?? "-",
    sku_code: item.sku?.sku_name ?? "-",
  }));
});

const tableColumns: TableColumn[] = [
  { key: "company_name", label: "Company" },
  { key: "warehouse", label: "Warehouse" },
  { key: "sku_code", label: "SKU Code" },
  { key: "sku_name", label: "SKU Name" },

  { key: "on_hand_qty", label: "On-Hand Quantity" },
  { key: "unit_of_measure", label: "UOM" },

  // { key: "actions", label: "Actions", align: "right" as const },
];

const handleCompanyChange = (value: any) => {
  params.company_id = String(value ?? "");
  params.facility_id = "";
  params.page = 1;

  facilitiesStore.getDataFacilities({
    page: 1,
    limit: 1000,
    company_id: params.company_id || undefined,
    search: "",
  });
};

const handleFacilitiesChange = (value: any) => {
  params.facility_id = value;
  params.page = 1;
};
const handleSkuChange = (value: any) => {
  params.sku_id = value;
};

const handlePageChange = (page: number) => {
  params.page = page;
};

const handlePageSizeChange = (pageSize: number) => {
  params.limit = pageSize;
  params.page = 1;
};

const handleHistoryModalMounted = (instance: ElementEvent) => {
  historyModalRef.value = instance;
};

const openHistoryModal = () => {
  historyModalRef.value?.show();
};

const handleDownloadTemplate = () => {
  const link = document.createElement("a");
  link.href = "/template/stock_adjustment.xlsx";
  link.download = "stock_adjustment.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
watch(
  () => ({ ...params }),
  () => {
    stockOnHandStore.getDataStockOnHand({ ...params });
  }
);

onMounted(() => {
  stockOnHandStore.getDataStockOnHand({
    ...params,
  });
  // skuStore.getDataSku({ page: 1, limit: 1000 });
  companyStore.getDataCompanies({ page: 1, limit: 100, search: "" });
  facilitiesStore.getDataFacilities({
    page: 1,
    limit: 1000,
    company_id: params.company_id || undefined,
    search: "",
  });
});

onBeforeMount(() => {
  $page.setTitle("On Hand Stock");
});
</script>

<template>
  <main class="space-y-8">
    <header class="flex justify-between items-end">
      <GeneralTitle title="Stock" subtitle="Manage your stock" />
      <div class="flex justify-between space-x-2 items-center">
        <GeneralOutlinedButton
          label="History"
          type="button"
          @on-click="openHistoryModal"
        >
          <template #prefix>
            <IconsHistory size="18" class="text-gray-700" />
          </template>
        </GeneralOutlinedButton>
      </div>
    </header>
    <section class="flex bg-white p-6 rounded-xl items-end space-x-2">
      <div class="min-w-[240px] space-y-1">
        <label class="mb-1.5 text-sm font-[600] text-gray-700">Company</label>
        <GeneralDropdownSearch
          v-model="params.company_id"
          :options="companyOptions"
          placeholder="All Companies"
          @change="handleCompanyChange"
        />
      </div>
      <div class="min-w-[240px] space-y-1">
        <label class="mb-1.5 text-sm font-[600] text-gray-700">Warehouse</label>
        <GeneralDropdownSearch
          v-model="params.facility_id"
          :options="facilitiesOptions"
          placeholder="Select Warehouse"
          @change="handleFacilitiesChange"
        />
      </div>
    </section>
    <section class="space-y-4" v-if="params.facility_id || params.company_id">
      <div class="bg-white p-6 rounded-xl space-y-4">
        <GeneralTable
          :columns="tableColumns"
          :data="tableData"
          :loading="loadingList"
          row-key="id"
          striped
        >
          <template #cell-last_movement="{ value }">
            {{ formatTableDate(value as string) }}
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

    <ModalAdjustmentHistory
      id="modal-stock-history"
      :company-id="params.company_id"
      :facility-id="params.facility_id"
      @mounted="handleHistoryModalMounted"
    />
  </main>
</template>
