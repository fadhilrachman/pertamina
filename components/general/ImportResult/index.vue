<script setup lang="ts">
import { computed, type PropType } from "vue";
import GeneralTable, {
  type TableColumn,
} from "~/components/general/Table/index.vue";
import type { ImportResult, ImportRowReport } from "~/types/import";

const props = defineProps({
  title: {
    type: String,
    default: "Import Result",
  },
  result: {
    type: Object as PropType<ImportResult | null>,
    default: null,
  },
});

const summary = computed(() => ({
  total: props.result?.total_rows ?? 0,
  success: props.result?.success_rows ?? 0,
  failed: props.result?.failed_rows ?? 0,
}));

const rowReports = computed<ImportRowReport[]>(
  () => props.result?.row_reports ?? []
);

const columns: TableColumn[] = [
  { key: "row_number", label: "Row", align: "center" },
  { key: "code", label: "Code" },
  { key: "status", label: "Status", align: "center" },
];

const hasResult = computed(() => {
  const res = props.result;
  if (!res) return false;
  const hasRows =
    Array.isArray(res.row_reports) && res.row_reports.length > 0;
  const hasSummary =
    typeof res.total_rows === "number" ||
    typeof res.success_rows === "number" ||
    typeof res.failed_rows === "number";
  const hasErrors = Array.isArray(res.errors) && res.errors.length > 0;
  const hasDetail = Boolean(res.success_detail);
  return hasRows || hasSummary || hasErrors || hasDetail;
});

const statusClass = (status?: string) => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "success" || normalized === "sukses") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }
  return "bg-rose-50 text-rose-700 border border-rose-200";
};
</script>

<template>
  <div
    v-if="hasResult"
    class="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4"
  >
    <div class="flex items-start justify-between gap-2">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-primary-600">
          {{ props.title }}
        </p>
        <p class="text-sm text-gray-600">
          Detail baris yang berhasil dan gagal sesuai respons API.
        </p>
      </div>
      <span
        v-if="props.result?.success_detail"
        class="inline-flex max-w-[360px] whitespace-normal break-words rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold leading-snug text-blue-700 md:text-xs"
      >
        {{ props.result?.success_detail }}
      </span>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200">
        <p class="text-xs font-medium text-gray-500">Total Rows</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900">
          {{ summary.total }}
        </p>
      </div>
      <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200">
        <p class="text-xs font-medium text-gray-500">Success</p>
        <p class="mt-1 text-2xl font-semibold text-emerald-600">
          {{ summary.success }}
        </p>
      </div>
      <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200">
        <p class="text-xs font-medium text-gray-500">Failed</p>
        <p class="mt-1 text-2xl font-semibold text-rose-600">
          {{ summary.failed }}
        </p>
      </div>
    </div>

    <div
      v-if="props.result?.errors?.length"
      class="rounded-lg bg-white p-3 text-sm text-rose-700 ring-1 ring-rose-200"
    >
      <p class="font-semibold">Errors</p>
      <ul class="mt-1 list-disc space-y-1 pl-5">
        <li v-for="(err, idx) in props.result?.errors" :key="idx">
          {{ err }}
        </li>
      </ul>
    </div>

    <GeneralTable
      :columns="columns"
      :data="rowReports"
      :striped="false"
      :empty-text="'Tidak ada detail baris yang dikembalikan.'"
    >
      <template #cell-status="{ value }">
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          :class="statusClass(String(value))"
        >
          {{ value || "-" }}
        </span>
      </template>
    </GeneralTable>
  </div>
</template>

<style scoped></style>
