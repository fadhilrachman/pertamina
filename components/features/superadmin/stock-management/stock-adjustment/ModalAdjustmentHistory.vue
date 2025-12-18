<script setup lang="ts">
import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import Modal from "~/components/general/Modal/index.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import type { AdjustmentQueryParams } from "~/services/stock-management/stock-adjustment-services";
import { useStockAdjustmentStore } from "~/store/stock-management/stock-adjustment-store";
import type { StockAdjustmentItem } from "~/types/stock-adjustment-type";

const props = defineProps<{
  id: string;
  facilityId?: string | number | null;
  facilitySkuId?: string | number | null;
  companyId?: string | number | null;
}>();

const emit = defineEmits<{
  (e: "mounted", payload: ElementEvent): void;
}>();

const handleModalMounted = (instance: ElementEvent) => {
  emit("mounted", instance);
};

type AdjustmentHistoryItem = {
  rowKey: string;
  id: string;
  warehouse: string;
  sku: string;
  before: number;
  after: number;
  adjustment: number;
  user: string;
  date: string;
};

const adjustmentStore = useStockAdjustmentStore();
const { data, loadingList } = storeToRefs(adjustmentStore);

const tableColumns: TableColumn[] = [
  {
    key: "id",
    label: "ADJUSTMENT ID",
    headerClass: "px-6",
    cellClass: "px-6 py-4 align-top text-gray-900",
  },
  {
    key: "warehouse",
    label: "WAREHOUSE",
    headerClass: "px-6",
    cellClass: "px-6 py-4 align-top text-gray-900",
  },
  {
    key: "sku",
    label: "SKU",
    headerClass: "px-6",
    cellClass: "px-6 py-4 align-top text-gray-900 whitespace-pre-line",
  },
  {
    key: "before",
    label: "BEFORE",
    align: "right",
    headerClass: "px-6",
    cellClass: "px-6 py-4 align-top text-gray-900",
  },
  {
    key: "after",
    label: "AFTER",
    align: "right",
    headerClass: "px-6",
    cellClass: "px-6 py-4 align-top text-gray-900",
  },
  {
    key: "adjustment",
    label: "ADJUSTMENT",
    align: "right",
    headerClass: "px-6",
    cellClass: "px-6 py-4 align-top font-semibold",
  },
  {
    key: "date",
    label: "DATE",
    align: "right",
    headerClass: "px-6",
    cellClass: "px-6 py-4 align-top text-gray-900 whitespace-pre-line",
  },
  {
    key: "user",
    label: "USER",
    headerClass: "px-6",
    cellClass: "px-6 py-4 align-top text-gray-900",
  },
];

const fetchHistory = async () => {
  if (!props.facilityId && !props.companyId) {
    adjustmentStore.data = {
      code: 200,
      data: {
        data: [],
        limit: 0,
        page: 1,
        total: 0,
        total_pages: 0,
      },
      error: "",
      message: "",
      success: true,
    };
    return;
  }

  const params: AdjustmentQueryParams = {
    page: 1,
    limit: 50,
  };

  if (props.facilityId) {
    params.facility_id = String(props.facilityId);
  }

  // if (props.facilitySkuId) {
  //   params.facility_sku_id = String(props.facilitySkuId);
  // } else if (props.facilityId) {
  //   params.facility_sku_id = String(props.facilityId);
  // }

  if (props.companyId) {
    params.company_id = String(props.companyId);
  }

  try {
    await adjustmentStore.getAdjustments(params, { superadmin: true });
  } catch (error) {
    console.error("Failed to fetch adjustment history", error);
  }
};

watch(
  () => [props.facilityId, props.facilitySkuId, props.companyId],
  () => {
    fetchHistory();
  },
  { immediate: true }
);

const formatDateTime = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart}\n${timePart}`;
};

const historyItems = computed<AdjustmentHistoryItem[]>(() => {
  const raw =
    (data.value?.data?.data as unknown as StockAdjustmentItem[]) || [];

  return raw.map((trx, index) => {
    const before = Number(trx.stock_before ?? 0);
    const after = Number(trx.stock_after ?? 0);
    const adjustment = Number(trx.adjustment ?? 0);

    const trxId = trx.transaction_id || "";
    const rowKey = trxId || `${trx.trx_date || "unknown"}-${index}`;

    return {
      rowKey,
      id: trx.transaction_id || "-",
      warehouse: trx.facility?.name || "-",
      sku: trx.facility_sku?.name || trx.facility_sku?.facility_sku_id || "-",
      before: Number.isFinite(before) ? before : 0,
      after: Number.isFinite(after) ? after : 0,
      adjustment: Number.isFinite(adjustment) ? adjustment : 0,
      user: trx.created_by?.name || trx.created_by?.email || "-",
      date: formatDateTime(trx.trx_date || ""),
    };
  });
});

const formatAdjustment = (value: number | null | undefined) => {
  const numeric = typeof value === "number" ? value : Number(value || 0);
  if (!Number.isFinite(numeric) || numeric === 0) return "0";
  const sign = numeric > 0 ? "+" : "-";
  return `${sign}${Math.abs(numeric)}`;
};
</script>

<template>
  <Modal
    :id="props.id"
    title="Stock Adjustment History"
    :is-has-close="true"
    class-modal="max-w-4xl"
    @mounted="handleModalMounted"
  >
    <template #body>
      <GeneralTable
        :columns="tableColumns"
        :data="historyItems"
        :loading="loadingList"
        row-key="rowKey"
        striped
        loading-text="Loading adjustment history..."
        empty-text="No adjustment history found."
      >
        <template #cell-adjustment="{ value }">
          <span
            :class="
              Number(value) > 0
                ? 'text-emerald-600'
                : Number(value) < 0
                ? 'text-red-600'
                : 'text-gray-900'
            "
          >
            {{ formatAdjustment(value as number) }}
          </span>
        </template>
      </GeneralTable>
    </template>
  </Modal>
</template>

<style scoped></style>
