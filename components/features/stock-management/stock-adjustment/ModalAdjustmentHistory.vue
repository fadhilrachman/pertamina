<script setup lang="ts">
import Modal from "~/components/general/Modal/index.vue";
import type { ElementEvent } from "~/types/element";

const props = defineProps<{
  id: string;
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

const historyItems: AdjustmentHistoryItem[] = [
  {
    id: "ADJ-0F87298A",
    warehouse: "DURI",
    sku: "5801271935 - FASTENING BRACKET",
    before: 0,
    after: 8,
    adjustment: 8,
    user: "admin@pdsi.com",
    date: "Nov 10, 2025\n14:27",
  },
  {
    id: "ADJ-23499EFC",
    warehouse: "DURI",
    sku: "2476812 - WHEEL BEARING",
    before: 0,
    after: 3,
    adjustment: 3,
    user: "admin@pdsi.com",
    date: "Nov 07, 2025\n09:17",
  },
];

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
              <td class="px-6 py-4 align-top text-gray-900 whitespace-pre-line">
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
          </tbody>
        </table>
      </div>
    </template>
  </Modal>
</template>

<style scoped></style>
