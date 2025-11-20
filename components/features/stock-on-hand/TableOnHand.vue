<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import ModalDelete from "~/components/general/ModalDelete/index.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import type { StockOnHandType } from "~/types/stock-on-hand-type";
import { DATA_STOCK_ON_HAND } from "~/dummy.json";

const params = reactive({
  search: "",
  page: 1,
  limit: 10,
});

const tableColumns: TableColumn[] = [
  { key: "sku_code", label: "SKU Code" },
  { key: "sku_name", label: "Product Name", headerClass: "min-w-[220px]" },
  { key: "warehouse", label: "Warehouse", headerClass: "min-w-[180px]" },
  { key: "unit", label: "UoM" },
  { key: "on_hand_qty", label: "On Hand Qty" },
  { key: "reserved_qty", label: "Reserved Qty" },
  { key: "available_qty", label: "Available Qty" },
  { key: "last_transaction_at", label: "Last Movement" },
  { key: "actions", label: "Actions", align: "right" as const },
];

const allData = ref<StockOnHandType[]>([...DATA_STOCK_ON_HAND]);
const selectedStock = ref<StockOnHandType | null>(null);
const deleteModalRef = ref<ElementEvent | null>(null);
const isDeleting = ref(false);

const filteredData = computed(() => {
  const keyword = params.search.trim().toLowerCase();
  if (!keyword) return allData.value;

  return allData.value.filter((item) => {
    const haystack = `${item.sku_code} ${item.sku_name} ${item.warehouse}`;
    return haystack.toLowerCase().includes(keyword);
  });
});

const totalRows = computed(() => filteredData.value.length);

const pagedData = computed(() => {
  const start = (params.page - 1) * params.limit;
  const end = start + params.limit;
  return filteredData.value.slice(start, end);
});

const handleSearchChange = (value: string) => {
  params.search = value;
  params.page = 1;
};

const handlePageChange = (page: number) => {
  params.page = page;
};

const handlePageSizeChange = (pageSize: number) => {
  params.limit = pageSize;
  params.page = 1;
};

const handleDeleteModalMounted = (instance: ElementEvent) => {
  deleteModalRef.value = instance;
};

const openDeleteStockModal = (row: Record<string, any>) => {
  selectedStock.value = row as StockOnHandType;
  deleteModalRef.value?.show();
};

const closeDeleteStockModal = () => deleteModalRef.value?.hide();

const handleConfirmDelete = async () => {
  if (!selectedStock.value) return;

  try {
    isDeleting.value = true;
    allData.value = allData.value.filter(
      (item) => item.id !== selectedStock.value?.id
    );
    closeDeleteStockModal();
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <section class="space-y-8">
    <header class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Stock On Hand</h1>
        <p class="text-gray-500">
          Current stock per SKU and warehouse
        </p>
      </div>
      <div class="flex justify-between space-x-2">
        <GeneralButton color="success" label="Download Data">
          <template #prefix>
            <IconsDownload size="18" class="text-white" />
          </template>
        </GeneralButton>
      </div>
    </header>
    <section class="flex bg-white p-6 rounded-xl items-end space-x-2">
      <GeneralSearchInput
        label="Search Name"
        placeholder="Search Name"
        class="max-w-[360px]"
        :debounce="1000"
        @change="handleSearchChange"
      />
    </section>
    <section class="space-y-4">
      <div class="bg-white p-6 rounded-xl space-y-4">
        <GeneralTable
          :columns="tableColumns"
          :data="pagedData"
          row-key="id"
          striped
        >
          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <GeneralIconButton
                class="h-9 w-9 bg-white"
                color="default"
                :bordered="false"
                @on-click="openDeleteStockModal(row)"
              >
                <template #icon>
                  <IconsDelete size="18" class="text-red-500" />
                </template>
              </GeneralIconButton>
            </div>
          </template>
        </GeneralTable>
        <GeneralPagination
          :page="params.page"
          :page-size="params.limit"
          :total="totalRows"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </section>
    <ModalDelete
      id="modal-delete-sku"
      :target-label="selectedStock?.sku_name || 'this stock record'"
      :is-loading="isDeleting"
      confirm-label="Delete"
      @mounted="handleDeleteModalMounted"
      @cancel="closeDeleteStockModal"
      @confirm="handleConfirmDelete"
    />
  </section>
</template>
