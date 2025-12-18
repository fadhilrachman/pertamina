<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import Modal from "~/components/general/Modal/index.vue";
import type { ElementEvent } from "~/types/element";
import { useSuperadminTransactionsStore } from "~/store/superadmin/transactions-store";
import { formatTableDate } from "~/utils/functions";

const props = defineProps<{
  id: string;
}>();

const emit = defineEmits<{
  (e: "mounted", payload: ElementEvent): void;
}>();

const stockTransactionStore = useSuperadminTransactionsStore();
const { selectedData, selectedLineIndex } = storeToRefs(stockTransactionStore);

const currentLine = computed(() => {
  const trx = selectedData.value;
  const index = selectedLineIndex.value ?? 0;
  return trx?.lines?.[index];
});

const trxTypeBadgeClass = (type: string | undefined) => {
  if (!type) return "bg-gray-100 text-gray-600 border border-gray-200";

  const normalized = type.toUpperCase();

  if (normalized === "IN") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }

  if (normalized === "OUT") {
    return "bg-rose-50 text-rose-700 border border-rose-200";
  }

  return "bg-gray-100 text-gray-600 border border-gray-200";
};

const handleModalMounted = (instance: ElementEvent) => {
  emit("mounted", instance);
};
</script>

<template>
  <Modal
    :id="props.id"
    title="Transaction Details"
    :is-has-close="true"
    class-modal="max-w-xl"
    @mounted="handleModalMounted"
  >
    <template #body>
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-y-6 gap-x-8">
          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-500">Transaction ID</p>
            <p class="font-semibold text-gray-900">
              {{ selectedData?.trx_no || "-" }}
            </p>
          </div>

          <div class="space-y-1 flex flex-col items-start">
            <p class="text-sm font-medium text-gray-500">Type</p>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold"
              :class="trxTypeBadgeClass(selectedData?.trx_type)"
            >
              {{ selectedData?.trx_type || "-" }}
            </span>
          </div>

          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-500">SKU</p>
            <p class="font-semibold text-gray-900">
              {{
                currentLine
                  ? `${currentLine.sku?.sku_code ?? currentLine.sku_code ?? "-"} - ${
                      currentLine.sku?.sku_name ?? currentLine.sku_name ?? "-"
                    }`
                  : "-"
              }}
            </p>
          </div>

          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-500">Quantity</p>
            <p class="font-semibold text-gray-900">
              {{ currentLine?.quantity ?? currentLine?.qty ?? "-" }}
            </p>
          </div>

          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-500">Warehouse</p>
            <p class="font-semibold text-gray-900">
              {{
                currentLine?.warehouse?.name ??
                currentLine?.facility_name ??
                "-"
              }}
            </p>
          </div>

          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-500">Purpose</p>
            <p class="font-semibold text-gray-900">
              {{ selectedData?.purpose || "-" }}
            </p>
          </div>
        </div>

        <div class="space-y-1">
          <p class="text-sm font-medium text-gray-500">Date</p>
          <p class="font-semibold text-gray-900">
            {{ formatTableDate(selectedData?.trx_date, "MMMM Do, YYYY") }}
          </p>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped></style>
