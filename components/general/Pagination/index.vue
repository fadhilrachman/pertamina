<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    page: number;
    pageSize: number;
    total: number;
    maxLinks?: number;
  }>(),
  {
    maxLinks: 5,
  }
);

const emit = defineEmits<{
  (e: "update:page", value: number): void;
  (e: "change", value: number): void;
  (e: "update:pageSize", value: number): void;
  (e: "pageSizeChange", value: number): void;
}>();

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / (props.pageSize || 1)))
);

const currentPage = computed(() =>
  Math.min(Math.max(props.page, 1), totalPages.value)
);

const startItem = computed(() =>
  props.total === 0 ? 0 : (currentPage.value - 1) * props.pageSize + 1
);

const endItem = computed(() =>
  props.total === 0
    ? 0
    : Math.min(currentPage.value * props.pageSize, props.total)
);

const pageNumbers = computed(() => {
  const pages: number[] = [];
  const max = props.maxLinks;
  const total = totalPages.value;
  const half = Math.floor(max / 2);

  let start = Math.max(1, currentPage.value - half);
  let end = Math.min(total, start + max - 1);

  if (end - start + 1 < max) {
    start = Math.max(1, end - max + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const goToPage = (page: number) => {
  const safePage = Math.min(Math.max(page, 1), totalPages.value);
  emit("update:page", safePage);
  emit("change", safePage);
};
</script>

<template>
  <div class="flex items-center justify-between flex-wrap gap-4 text-sm">
    <div class="flex items-center gap-3">
      <label class="text-gray-600">Rows per page:</label>
      <select
        class="h-9 rounded-lg border border-gray-200 bg-white px-3 text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        :value="pageSize"
        @change="
          (e) => {
            const value = Number((e.target as HTMLSelectElement).value);
            emit('update:pageSize', value);
            emit('pageSizeChange', value);
            goToPage(1);
          }
        "
      >
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
      <p class="text-gray-600">
        <span v-if="total > 0">
          Showing
          <span class="font-medium text-gray-900">{{ startItem }}</span>
          -
          <span class="font-medium text-gray-900">{{ endItem }}</span>
          of
          <span class="font-medium text-gray-900">{{ total }}</span>
          data
        </span>
        <span v-else>No data to display</span>
      </p>
    </div>

    <div class="flex items-center gap-2">
      <button
        class="h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
        :disabled="currentPage === 1"
        aria-label="Previous page"
        @click="goToPage(currentPage - 1)"
      >
        ‹
      </button>

      <button
        v-for="pageNumber in pageNumbers"
        :key="pageNumber"
        class="h-9 w-9 rounded-lg border transition"
        :class="
          pageNumber === currentPage
            ? 'border-primary-500 bg-primary-500 text-white'
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
        "
        @click="goToPage(pageNumber)"
      >
        {{ pageNumber }}
      </button>

      <button
        class="h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
        :disabled="currentPage === totalPages"
        aria-label="Next page"
        @click="goToPage(currentPage + 1)"
      >
        ›
      </button>
    </div>
  </div>
</template>
