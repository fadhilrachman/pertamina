<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import Modal from "~/components/general/Modal/index.vue";
import type { ElementEvent } from "~/types/element";
import { useStockTransaction } from "~/store/stock-management/stock-transaction-store";
import { formatTableDate } from "~/utils/functions";
import type { StockTransactionAttachment } from "~/types/stock-transaction-type";

const props = defineProps<{
  id: string;
}>();

const emit = defineEmits<{
  (e: "mounted", payload: ElementEvent): void;
}>();

const stockTransactionStore = useStockTransaction();
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

const attachments = computed<StockTransactionAttachment[]>(() => {
  const list = selectedData.value?.attachments;
  return Array.isArray(list) ? list : [];
});

const formatFileSize = (size?: number) => {
  if (!size && size !== 0) return "-";
  if (size >= 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
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
                  ? `${currentLine.sku_code} - ${currentLine.sku_name}`
                  : "-"
              }}
            </p>
          </div>

          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-500">Quantity</p>
            <p class="font-semibold text-gray-900">
              {{ currentLine?.qty ?? "-" }}
            </p>
          </div>

          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-500">Warehouse</p>
            <p class="font-semibold text-gray-900">
              {{ currentLine?.facility_name ?? "-" }}
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

        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-gray-500">Attachments</p>
            <span
              class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700"
            >
              {{ attachments.length }}
            </span>
          </div>

          <div
            v-if="attachments.length === 0"
            class="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500"
          >
            No attachments uploaded.
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="file in attachments"
              :key="file.id"
              class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="h-5 w-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M7 3.75A2.25 2.25 0 0 1 9.25 1.5h4.5L18.75 6v14.25A2.25 2.25 0 0 1 16.5 22.5h-7.5A2.25 2.25 0 0 1 6.75 20.25v-16.5Z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 8.25h4.5"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 12h6"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 15.75h6"
                    />
                  </svg>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-gray-800">
                    {{ file.file_name || "Attachment" }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ formatFileSize(file.file_size) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <a
                  v-if="file.storage_url"
                  :href="file.storage_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  View
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped></style>
