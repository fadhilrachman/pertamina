<script setup lang="ts">
import { computed, onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import { useSkuStore } from "~/store/master-data/sku-store";
import { usePageStore } from "~/store/page";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import { useStockTransaction } from "~/store/stock-management/stock-transaction-store";
import type { StockTransactionType } from "~/types/stock-transaction-type";
import { formatTableDate } from "~/utils/functions";
import ModalTransactionDetail from "./ModalTransactionDetail.vue";

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

const $page = usePageStore();
const stockTransactionStore = useStockTransaction();
const facilitiesStore = useFacilitiesStore();
const skuStore = useSkuStore();
const { data: dataFacilities } = storeToRefs(facilitiesStore);
const { data: dataSkuStore } = storeToRefs(skuStore);

const facilitiesOptions = computed(
  () =>
    dataFacilities.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || []
);

const skuOptions = computed(
  () =>
    dataSkuStore.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || []
);
const { data, loadingWrite, loadingList } = storeToRefs(stockTransactionStore);
const deleteModalRef = ref<ElementEvent | null>(null);
const selectedSku = ref<Record<string, any> | null>(null);

const params = reactive({
  sku_id: "",
  facility_id: "",
  trx_type: "",
  page: 1,
  limit: 10,
});

const tableColumns: TableColumn[] = [
  { key: "trx_no", label: "Transaction ID" },
  { key: "trx_type", label: "Type" },
  { key: "sku", label: "SKU" },
  { key: "qty", label: "Quantity", align: "right" as const },
  { key: "warehouse", label: "Warehouse" },
  { key: "purpose", label: "Purpose" },
  { key: "trx_date", label: "Date" },
  { key: "actions", label: "Actions", align: "right" as const },
];

type TransactionTableRow = {
  id: string;
  trx_no: string;
  trx_type: string;
  sku: string;
  qty: number;
  warehouse: string;
  purpose: string;
  trx_date: string;
  // extra metadata to support detail modal
  transaction: StockTransactionType;
  lineIndex: number;
};

const tableData = computed<TransactionTableRow[]>(() => {
  const items = (data.value?.data?.data || []) as StockTransactionType[];

  const rows: TransactionTableRow[] = [];

  items.forEach((trx) => {
    if (!trx.lines || trx.lines.length === 0) {
      rows.push({
        id: trx.id,
        trx_no: trx.trx_no,
        trx_type: trx.trx_type,
        sku: "-",
        qty: 0,
        warehouse: "-",
        purpose: trx.purpose,
        trx_date: trx.trx_date,
        transaction: trx,
        lineIndex: 0,
      } as any);
      return;
    }

    trx.lines.forEach((line, index) => {
      rows.push({
        id: line.id || `${trx.id}-${line.sku_id}`,
        trx_no: trx.trx_no,
        trx_type: trx.trx_type,
        sku: `${line.sku_code} - ${line.sku_name}`,
        qty: line.qty,
        warehouse: line.facility_name,
        purpose: trx.purpose,
        trx_date: trx.trx_date,
        transaction: trx,
        lineIndex: index,
      } as any);
    });
  });

  return rows as any;
});

const typeOptions = [
  { id: "IN", label: "IN" },
  { id: "OUT", label: "OUT" },
];

const handleFacilitiesChange = (value: any) => {
  params.facility_id = value;
};
const handleSkuChange = (value: any) => {
  params.sku_id = value;
};

const handlePageChange = (page: number) => {
  params.page = page;
};

const handlePageSizeChange = (pageSize: number) => {
  params.limit = pageSize;
  params.page = 1;
};

const handleTypeChange = (value: string | number) => {
  params.trx_type = String(value);
  params.page = 1;
};

const detailModalRef = ref<ElementEvent | null>(null);

const handleDetailModalMounted = (instance: ElementEvent) => {
  detailModalRef.value = instance;
};

const handleViewTransaction = (row: any) => {
  stockTransactionStore.setSelectedData(
    row.transaction as StockTransactionType
  );
  stockTransactionStore.setSelectedLineIndex(row.lineIndex ?? 0);
  detailModalRef.value?.show();
};

watch(
  () => ({ ...params }),
  () => {
    stockTransactionStore.getDataTransactions({ ...params });
  }
);

onMounted(() => {
  stockTransactionStore.getDataTransactions({
    ...params,
  });
  skuStore.getDataSku({ page: 1, limit: 1000 });
  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
});

onBeforeMount(() => {
  $page.setTitle("Stock Transactions");
});
</script>

<template>
  <main class="space-y-8">
    <header class="flex justify-between items-end">
      <GeneralTitle
        title="Transactions"
        subtitle="View and manage all stock movements"
      />
      <!-- <div class="flex justify-between space-x-2">
        <GeneralButton color="success" label="Export to Excel">
          <template #prefix>
            <IconsDownload size="18" class="text-white" />
          </template>
        </GeneralButton>
      </div> -->
    </header>
    <section class="flex bg-white p-6 rounded-xl items-end space-x-2">
      <!-- <GeneralSearchInput
        label="Search Name"
        placeholder="Search Name"
        class="max-w-[360px]"
        :debounce="1000"
        @change="handleFacilitiesChange"
      /> -->
      <div class="min-w-[240px] space-y-1">
        <label class="mb-1.5 text-sm font-[600] text-gray-700"
          >Facilities</label
        >
        <GeneralDropdownSearch
          v-model="params.facility_id"
          :options="facilitiesOptions"
          placeholder="All Facilities"
          @change="handleFacilitiesChange"
        />
      </div>
      <div class="min-w-[240px] space-y-1">
        <label class="mb-1.5 text-sm font-[600] text-gray-700">SKU</label>
        <GeneralDropdownSearch
          v-model="params.sku_id"
          :options="skuOptions"
          placeholder="All SKU"
          @change="handleSkuChange"
        />
      </div>

      <GeneralDropdown
        v-model="params.trx_type"
        variant="field"
        :options="typeOptions"
        label="Type"
        placeholder="All Type"
        class="w-max"
        @change="handleTypeChange"
      />
    </section>
    <section class="space-y-4">
      <div class="bg-white p-6 rounded-xl space-y-4">
        <div class="flex items-center space-x-6">
          <div class="text-sm text-neutral-600">
            <span> Total IN: </span>
            <span class="text-green-500 font-medium"
              >{{ data?.data?.total_in }}
            </span>
          </div>
          <div class="text-sm text-neutral-600">
            <span> Total OUT: </span>
            <span class="text-red-500 font-medium">
              {{ data?.data?.total_out }}
            </span>
          </div>
        </div>
        <GeneralTable
          :columns="tableColumns"
          :data="tableData"
          :loading="loadingList"
          row-key="id"
          striped
        >
          <template #cell-trx_date="{ value }">
            {{ formatTableDate(value as string) }}
          </template>
          <template #cell-trx_type="{ value }">
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="trxTypeBadgeClass(value as string | undefined)"
            >
              {{ (value as string) || "-" }}
            </span>
          </template>
          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <GeneralIconButton
                class="h-9 w-9 bg-white"
                color="default"
                :bordered="false"
                @on-click="handleViewTransaction(row)"
              >
                <template #icon>
                  <IconsEye size="18" />
                </template>
              </GeneralIconButton>
            </div>
          </template>
        </GeneralTable>
        <GeneralPagination
          :page="params.page"
          :page-size="params.limit"
          :total="data?.data?.total || 0"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </section>

    <ModalTransactionDetail
      id="modal-transaction-detail"
      @mounted="handleDetailModalMounted"
    />
  </main>
</template>
