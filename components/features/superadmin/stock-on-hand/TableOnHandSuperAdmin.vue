<script setup lang="ts">
import { computed, onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { toast } from "vue3-toastify";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import { usePageStore } from "~/store/page";
import { formatTableDate } from "~/utils/functions";
import { useSuperadminFacilitiesStore } from "~/store/superadmin/facilities-store";
import { useSuperadminStockOnHandStore } from "~/store/superadmin/stock-on-hand-store";
import { useSuperadminCompanyStore } from "~/store/superadmin/company-store";
import type { CompanyType } from "~/types/company-type";
import { downloadSuperadminStockOnHand } from "~/services/superadmin/stock-on-hand-services";

const statusBadgeClass = (status: string | undefined) => {
  if (!status) return "bg-gray-100 text-gray-600 border border-gray-200";

  const normalized = status.toLowerCase();

  if (["available", "active"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }

  if (["low", "warning"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }

  if (["out_of_stock", "inactive"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 border border-rose-200";
  }

  return "bg-gray-100 text-gray-600 border border-gray-200";
};

const formatStatusLabel = (status: string | undefined) => {
  if (!status) return "-";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const $page = usePageStore();
const stockOnHandStore = useSuperadminStockOnHandStore();
const facilitiesStore = useSuperadminFacilitiesStore();
const companyStore = useSuperadminCompanyStore();
// const skuStore = useSkuStore();
const { data: dataFacilities } = storeToRefs(facilitiesStore);
const { data: companyData } = storeToRefs(companyStore);
// const { data: dataSkuStore } = storeToRefs(skuStore);
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
const deleteModalRef = ref<ElementEvent | null>(null);
const selectedSku = ref<Record<string, any> | null>(null);
const exporting = ref(false);

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
    facility_name: item.facility_name ?? item.facility?.name ?? "-",
    sku_name: item.sku_name ?? item.sku?.sku_name ?? item.sku?.name ?? "-",
    sku_code: item.sku_code ?? item.sku?.sku_code ?? item.sku?.code ?? "-",
    category: item.category ?? item.sku?.category ?? "-",
    unit_of_measure:
      item.unit_of_measure ??
      item.unit ??
      item.sku?.unit_of_measure ??
      item.sku?.unit ??
      "-",
    min_stock:
      item.min_stock ??
      item.min_qty ??
      item.facility?.min_stock ??
      item.facility?.min_qty ??
      "-",
    max_stock:
      item.max_stock ??
      item.max_qty ??
      item.facility?.max_stock ??
      item.facility?.max_qty ??
      "-",
    warehouse: item.warehouse ?? item.facility?.name ?? "-",
    last_movement: item.last_movement ?? item.updated_at ?? item.created_at,
    on_hand_qty: item.on_hand_qty ?? item.on_hand ?? item.quantity ?? 0,
  }));
});

const totalOnHandQty = computed(() =>
  tableData.value.reduce((sum, item) => sum + Number(item.on_hand_qty || 0), 0)
);

const tableColumns: TableColumn[] = [
  { key: "company_name", label: "Company" },
  { key: "facility_name", label: "Warehouse" },
  { key: "sku_code", label: "SKU Code" },
  { key: "sku_name", label: "SKU Name" },
  { key: "category", label: "Category" },
  { key: "on_hand_qty", label: "On-hand Quantity" },

  { key: "unit_of_measure", label: "UOM" },

  { key: "min_stock", label: "Min Stock" },
  { key: "max_stock", label: "Max Stock" },
  { key: "status", label: "Status" },
  { key: "last_movement", label: "Last Movement" },

  // { key: "actions", label: "Actions", align: "right" as const },
];

const statusOptions = [
  { id: "available", label: "Available" },
  { id: "low", label: "Low" },
  { id: "out_of_stock", label: "Out of Stock" },
  { id: "overstock", label: "Overstock" },
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

const handleStatusChange = (value: string | number) => {
  params.status = String(value);
  params.page = 1;
};

const handleExportExcel = async () => {
  if (exporting.value) return;

  exporting.value = true;

  try {
    const blob = await downloadSuperadminStockOnHand({
      company_id: params.company_id || undefined,
      facility_id: params.facility_id || undefined,
      sku_id: params.sku_id || undefined,
      status: params.status || undefined,
      page: params.page,
      limit: params.limit,
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stock_on_hand.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error("Failed to export stock on hand", error);
    toast.error(
      error?.message || "Failed to export stock on hand. Please try again.",
      {
        toastClassName: "toastify-error",
      }
    );
  } finally {
    exporting.value = false;
  }
};

watch(
  () => ({ ...params }),
  () => {
    console.log({ params });

    stockOnHandStore.getDataStockOnHand({ ...params });
  }
);

onMounted(() => {
  companyStore.getDataCompanies({ page: 1, limit: 100, search: "" });
  stockOnHandStore.getDataStockOnHand({
    ...params,
  });
  // skuStore.getDataSku({ page: 1, limit: 1000 });
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
      <GeneralTitle
        title="Stock On Hand"
        subtitle="Current stock per SKU and warehouse"
      />
      <div class="flex justify-between space-x-2">
        <GeneralButton
          color="success"
          label="Export to Excel"
          :loading="exporting"
          :disabled="exporting"
          @on-click="handleExportExcel"
        >
          <template #prefix>
            <IconsDownload size="18" class="text-white" />
          </template>
        </GeneralButton>
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
          placeholder="All Warehouse"
          @change="handleFacilitiesChange"
        />
      </div>
      <!-- <div class="min-w-[240px] space-y-1">
        <label class="mb-1.5 text-sm font-[600] text-gray-700">SKU</label>
        <GeneralDropdownSearch
          v-model="params.sku_id"
          :options="skuOptions"
          placeholder="All SKU"
          @change="handleSkuChange"
        />
      </div> -->

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
        <div class="text-sm text-neutral-600">
          <span> Total On-Hand Quantity: </span>
          <span class="text-blue-500 font-medium">
            {{ totalOnHandQty.toLocaleString() }}
          </span>
        </div>
        <GeneralTable
          :columns="tableColumns"
          :data="tableData"
          :loading="loadingList"
          row-key="id"
          striped
        >
          <template #cell-status="{ value }">
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="statusBadgeClass(value as string | undefined)"
            >
              {{ formatStatusLabel(value as string | undefined) }}
            </span>
          </template>
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
  </main>
</template>
