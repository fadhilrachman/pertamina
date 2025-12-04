<script setup lang="ts">
import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import Modal from "~/components/general/Modal/index.vue";
import type { ElementEvent } from "~/types/element";
import { useStockTransaction } from "~/store/stock-management/stock-transaction-store";
import type { StockTransactionType } from "~/types/stock-transaction-type";

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

const stockTransactionStore = useStockTransaction();
const { data, loadingList } = storeToRefs(stockTransactionStore);

const fetchHistory = async () => {
  const params: Record<string, any> = {
    page: 1,
    limit: 50,
    trx_type: "adjusment",
  };

  if (props.facilityId) {
    params.facility_id = String(props.facilityId);
  }

  await stockTransactionStore.getDataTransactions(params);
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
    (data.value?.data?.data as unknown as StockTransactionType[]) || [];

  const items: AdjustmentHistoryItem[] = [];

  raw.forEach((trx) => {
    (trx.lines || []).forEach((line) => {
      items.push({
        id: trx.trx_no,
        warehouse: line.facility_name,
        sku: `${line.sku_code} - ${line.sku_name}`,
        // Untuk saat ini, kita hanya tahu quantity akhir;
        // nilai before dan adjustment diisi sama dengan qty.
        before: 0,
        after: line.qty,
        adjustment: line.qty,
        user: trx.created_by,
        date: formatDateTime(trx.trx_date),
      });
    });
  });

  return items;
});

const formatAdjustment = (value: number) => {
  if (value === 0) return "0";
  const sign = value > 0 ? "+" : "-";
  return `${sign}${Math.abs(value)}`;
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
