<script setup lang="ts">
import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import Modal from "~/components/general/Modal/index.vue";
import type { ElementEvent } from "~/types/element";
import type { AdjustmentQueryParams } from "~/services/stock-management/stock-adjustment-services";
import { useStockAdjustmentStore } from "~/store/stock-management/stock-adjustment-store";
import type { StockAdjustmentItem } from "~/types/stock-adjustment-type";

const props = defineProps<{
  id: string;
  facilityId?: string | number | null;
}>();

const emit = defineEmits<{
  (e: "mounted", payload: ElementEvent): void;
}>();

const handleModalMounted = (instance: ElementEvent) => {
  emit("mounted", instance);
};

type AdjustmentHistoryItem = {
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

const fetchHistory = async () => {
  const params: AdjustmentQueryParams = {
    page: 1,
    limit: 50,
  };

  if (props.facilityId) {
    params.facility_id = String(props.facilityId);
  }

  try {
    await adjustmentStore.getAdjustments(params);
  } catch (error) {
    console.error("Failed to fetch adjustment history", error);
  }
};

watch(
  () => props.facilityId,
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

  return raw.map((trx) => {
    const before = Number(trx.stock_before ?? 0);
    const after = Number(trx.stock_after ?? 0);
    const adjustment = Number(trx.adjustment ?? 0);

    return {
      id: trx.transaction_id || "-",
      warehouse: trx.facility?.name || "-",
      sku:
        trx.facility_sku?.name ||
        trx.facility_sku?.facility_sku_id ||
        "-",
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
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-xs font-semibold">
              <th class="px-6 py-3 text-left">ADJUSTMENT ID</th>
              <th class="px-6 py-3 text-left">WAREHOUSE</th>
              <th class="px-6 py-3 text-left">SKU</th>
              <th class="px-6 py-3 text-right">BEFORE</th>
              <th class="px-6 py-3 text-right">AFTER</th>
              <th class="px-6 py-3 text-right">ADJUSTMENT</th>
              <th class="px-6 py-3 text-right">DATE</th>
              <th class="px-6 py-3 text-left">USER</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loadingList">
              <tr>
                <td
                  colspan="8"
                  class="px-6 py-6 text-center text-sm text-gray-500"
                >
                  Loading adjustment history...
                </td>
              </tr>
            </template>
            <template v-else-if="!historyItems.length">
              <tr>
                <td
                  colspan="8"
                  class="px-6 py-6 text-center text-sm text-gray-500"
                >
                  No adjustment history found.
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="item in historyItems"
                :key="item.id"
                class="border-t border-gray-100"
              >
                <td class="px-6 py-4 align-top text-gray-900">
                  {{ item.id }}
                </td>
                <td class="px-6 py-4 align-top text-gray-900">
                  {{ item.warehouse }}
                </td>
                <td
                  class="px-6 py-4 align-top text-gray-900 whitespace-pre-line"
                >
                  {{ item.sku }}
                </td>
                <td class="px-6 py-4 align-top text-right text-gray-900">
                  {{ item.before }}
                </td>
                <td class="px-6 py-4 align-top text-right text-gray-900">
                  {{ item.after }}
                </td>
                <td
                  class="px-6 py-4 align-top text-right font-semibold"
                  :class="
                    item.adjustment > 0
                      ? 'text-emerald-600'
                      : item.adjustment < 0
                      ? 'text-red-600'
                      : 'text-gray-900'
                  "
                >
                  {{ formatAdjustment(item.adjustment) }}
                </td>
                <td
                  class="px-6 py-4 align-top text-right text-gray-900 whitespace-pre-line"
                >
                  {{ item.date }}
                </td>
                <td class="px-6 py-4 align-top text-gray-900">
                  {{ item.user }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </template>
  </Modal>
</template>

<style scoped></style>
