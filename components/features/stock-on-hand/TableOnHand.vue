<script setup lang="ts">
import { computed, onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import type { TableColumn } from "~/components/general/Table/index.vue";
import { usePageStore } from "~/store/page";
import { useStockOnHand } from "~/store/stock-on-hand/stock-on-hand-store";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import { useFacilitiesSkuStore } from "~/store/master-data/facilities-sku-store";
import { formatTableDate } from "~/utils/functions";
import { toast } from "vue3-toastify";

const statusBadgeClass = (status: string | undefined) => {
  if (!status) return "bg-gray-100 text-gray-600 border border-gray-200";

  const normalized = status.toLowerCase();

  if (["available", "active"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }

  if (["low", "warning"].includes(normalized)) {
    return "bg-amber-100 text-amber-700 border border-amber-200";
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
const stockOnHandStore = useStockOnHand();
const facilitiesStore = useFacilitiesStore();
const facilitiesSkuStore = useFacilitiesSkuStore();
const { data: dataFacilities } = storeToRefs(facilitiesStore);
const { data: dataFacilitiesSku } = storeToRefs(facilitiesSkuStore);

const facilitiesOptions = computed(
  () =>
    dataFacilities.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || []
);

const skuOptions = computed(() => {
  if (!params.facility_id) return [];

  const list =
    dataFacilitiesSku.value?.data?.data ||
    (Array.isArray(dataFacilitiesSku.value?.data)
      ? dataFacilitiesSku.value?.data
      : []);

  return list.map((item: any) => ({
    id: item.sku_id || item.id,
    label: item.sku_name || item.name || item.sku_code || item.sku_id,
  }));
});
const { data, loadingWrite, loadingList } = storeToRefs(stockOnHandStore);
const exporting = ref(false);
const tableData = computed(
  () => (data.value?.data?.data as any[]) || ([] as any[])
);
const totalOnHandQty = computed(() =>
  tableData.value.reduce(
    (sum, item) => sum + Number(item?.on_hand_qty ?? item?.on_hand ?? 0),
    0
  )
);
const rowClassByStatus = (row: any) => {
  const status =
    typeof row?.status === "string" ? row.status.toLowerCase() : "";
  if (status === "low") return "!bg-yellow-50";
  return "";
};

const params = reactive({
  sku_id: "",
  facility_id: "",
  page: 1,
  limit: 10,
  status: "",
});
const tableColumns: TableColumn[] = [
  { key: "sku_code", label: "SKU Code" },
  { key: "sku_name", label: "SKU Name" },
  { key: "category", label: "Category" },
  { key: "warehouse", label: "Warehouse" },
  { key: "on_hand_qty", label: "On-hand Quantity" },

  { key: "unit_of_measure", label: "UOM" },

  { key: "min_stock", label: "Min Stock" },
  { key: "max_stock", label: "Max Stock" },
  { key: "status", label: "Status" },
  { key: "last_movement", label: "Last Movement" },
];

const statusOptions = [
  { id: "available", label: "Available" },
  { id: "low", label: "Low" },
  { id: "out_of_stock", label: "Out of Stock" },
  { id: "overstock", label: "Overstock" },
];

const handleFacilitiesChange = (value: any) => {
  params.facility_id = value;
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
    const blob = await stockOnHandStore.downloadStockOnHand({
      facility_id: params.facility_id || undefined,
      sku_id: params.sku_id || undefined,
      status: params.status || undefined,
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
    stockOnHandStore.getDataStockOnHand({ ...params });
  }
);

const fetchFacilitySkus = async (facilityId: string | number | null) => {
  const parsed = facilityId ? String(facilityId) : "";
  if (!parsed) return;

  await facilitiesSkuStore.getDataFacilitiesSku({
    facility_id: parsed,
    page: 1,
    limit: 1000,
  });
};

watch(
  () => params.facility_id,
  (next) => {
    params.sku_id = "";
    fetchFacilitySkus(next);
  }
);

onMounted(() => {
  stockOnHandStore.getDataStockOnHand({
    ...params,
  });
  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
  fetchFacilitySkus(params.facility_id);
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
        <label class="mb-1.5 text-sm font-[600] text-gray-700"
          >Warehouses</label
        >
        <GeneralDropdownSearch
          v-model="params.facility_id"
          :options="facilitiesOptions"
          placeholder="All Warehouses "
          @change="handleFacilitiesChange"
        />
      </div>
      <div class="min-w-[240px] space-y-1">
        <label class="mb-1.5 text-sm font-[600] text-gray-700">SKU</label>
        <GeneralDropdownSearch
          v-model="params.sku_id"
          :options="skuOptions"
          placeholder="All SKU"
          @change="handleSkuChange"
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
          :row-class="rowClassByStatus"
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
