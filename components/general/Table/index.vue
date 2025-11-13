<script setup lang="ts">
import { computed, type PropType } from "vue";

type ColumnAlign = "left" | "center" | "right";

export interface TableColumn {
  key: string;
  label: string;
  align?: ColumnAlign;
  headerClass?: string;
  cellClass?: string;
}

const props = defineProps({
  columns: {
    type: Array as PropType<readonly TableColumn[]>,
    required: true,
  },
  data: {
    type: Array as PropType<readonly Record<string, any>[]>,
    default: () => [],
  },
  rowKey: {
    type: String,
    default: "",
  },
  striped: {
    type: Boolean,
    default: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: "Loading data...",
  },
  emptyText: {
    type: String,
    default: "No records found.",
  },
});

const columnCount = computed(() => props.columns.length);

const alignClass = (align: ColumnAlign | undefined) => {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
};

const rowBackgroundClass = (index: number) => {
  if (!props.striped) return "bg-white";
  return index % 2 === 0 ? "bg-white" : "bg-gray-50";
};
</script>

<template>
  <div class="overflow-x-auto border-gray-200 bg-white shadow-sm">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :class="[
              'px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600',
              alignClass(column.align),
              column.headerClass,
            ]"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>

      <tbody v-if="loading">
        <tr>
          <td
            :colspan="columnCount"
            class="px-4 py-10 text-center text-sm text-gray-500"
          >
            <slot name="loading">
              {{ loadingText }}
            </slot>
          </td>
        </tr>
      </tbody>

      <tbody v-else-if="data.length === 0">
        <tr>
          <td
            :colspan="columnCount"
            class="px-4 py-10 text-center text-sm text-gray-500"
          >
            <slot name="empty">
              {{ emptyText }}
            </slot>
          </td>
        </tr>
      </tbody>

      <tbody v-else class="divide-y divide-gray-200">
        <tr
          v-for="(row, rowIndex) in data"
          :key="rowKey ? row[rowKey] ?? rowIndex : rowIndex"
          :class="rowBackgroundClass(rowIndex)"
        >
          <td
            v-for="column in columns"
            :key="`${rowIndex}-${column.key}`"
            :class="[
              'whitespace-nowrap px-4 py-3 text-sm text-gray-700',
              alignClass(column.align),
              column.cellClass,
            ]"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="row[column.key]"
              :column="column"
            >
              {{ row[column.key] ?? "-" }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped></style>
