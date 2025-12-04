<script setup lang="ts">
import type { FacilitiesType } from "~/types/facilities-type";

const props = defineProps<{
  warehouse: FacilitiesType | null | undefined;
}>();
</script>

<template>
  <section
    class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Warehouse
        </p>
        <h2 class="text-xl font-semibold text-gray-900">
          {{ warehouse?.name || "-" }}
        </h2>
        <p class="text-xs text-gray-500 flex items-center gap-1">
          <span>Code</span>
          <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            {{ warehouse?.code || "-" }}
          </span>
        </p>
      </div>

      <span
        v-if="warehouse?.status"
        class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
        :class="
          warehouse.status === 'active'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-gray-200 bg-gray-50 text-gray-500'
        "
      >
        {{ warehouse.status === "active" ? "Active" : "Inactive" }}
      </span>
    </div>

    <div class="grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2">
      <div class="space-y-1">
        <p class="text-xs font-medium text-gray-500">Address</p>
        <p class="mt-0.5 leading-snug">
          {{ warehouse?.address || "-" }}
        </p>
      </div>
      <div class="space-y-3">
        <div>
          <p class="text-xs font-medium text-gray-500">City</p>
          <p class="mt-0.5">
            {{ warehouse?.city || "-" }}
          </p>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500">Capacity</p>
          <p class="mt-0.5">
            {{ warehouse?.capacity || "-" }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
