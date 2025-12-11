<script setup lang="ts">
import { onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import ModalFormSku from "~/components/features/master-data/sku/ModalFormSku.vue";
import ModalDelete from "~/components/general/ModalDelete/index.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import { useSkuStore } from "~/store/master-data/sku-store";
import { usePageStore } from "~/store/page";
import type { SKUType } from "~/types/sku-type";
import { useStockOnHand } from "~/store/stock-on-hand/stock-on-hand-store";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import { formatTableDate } from "~/utils/functions";

const statusBadgeClass = (status: string | undefined) => {
  if (!status) return "bg-gray-100 text-gray-600 border border-gray-200";

  const normalized = status.toLowerCase();

  if (["available", "active"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }

  if (["low", "warning"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }

  if (["out_of_stock", "inactive"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 border border-rose-200";
  }

  return "bg-gray-100 text-gray-600 border border-gray-200";
};

const formatStatusLabel = (status: string | undefined) => {
  if (!status) return "-";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const $page = usePageStore();
const stockOnHandStore = useStockOnHand();
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
const { data, loadingWrite, loadingList } = storeToRefs(stockOnHandStore);
const deleteModalRef = ref<ElementEvent | null>(null);
const selectedSku = ref<Record<string, any> | null>(null);

const params = reactive({
  sku_id: "",
  facility_id: "",
  page: 1,
  limit: 10,
  status: "",
});
const tableColumns: TableColumn[] = [
  { key: "sku_code", label: "SKU Code" },
  { key: "sku_name", label: "SKU Name" },
  { key: "category", label: "Category" },
  { key: "warehouse", label: "Warehouse" },
  { key: "on_hand_qty", label: "On-hand Quantity" },

  { key: "unit_of_measure", label: "UOM" },

  { key: "min_stock", label: "Min Stock" },
  { key: "max_stock", label: "Max Stock" },
  { key: "status", label: "Status" },
  { key: "last_movement", label: "Last Movement" },

  // { key: "actions", label: "Actions", align: "right" as const },
];

const statusOptions = [
  { id: "available", label: "Available" },
  { id: "low", label: "Low" },
  { id: "out_of_stock", label: "Out of Stock" },
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

const handleStatusChange = (value: string | number) => {
  params.status = String(value);
  params.page = 1;
};

watch(
  () => ({ ...params }),
  () => {
    console.log({ params });

    stockOnHandStore.getDataStockOnHand({ ...params });
  }
);

onMounted(() => {
  stockOnHandStore.getDataStockOnHand({
    ...params,
  });
  skuStore.getDataSku({ page: 1, limit: 1000 });
  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
});

onBeforeMount(() => {
  $page.setTitle("On Hand Stock");
});
</script>

<template>
  <main class="space-y-8">
    <header class="flex justify-between items-end">
      <GeneralTitle
        title="Stock On Hand"
        subtitle="Current stock per SKU and warehouse"
      />
      <div class="flex justify-between space-x-2">
        <GeneralButton color="success" label="Export to Excel">
          <template #prefix>
            <IconsDownload size="18" class="text-white" />
          </template>
        </GeneralButton>
      </div>
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
        v-model="params.status"
        variant="field"
        :options="statusOptions"
        label="Status"
        placeholder="All Status"
        class="w-max"
        @change="handleStatusChange"
      />
    </section>
    <section class="space-y-4">
      <div class="bg-white p-6 rounded-xl space-y-4">
        <div class="text-sm text-neutral-600">
          <span> Total On-Hand Quantity: </span>
          <span class="text-blue-500 font-medium"> 150,579 </span>
        </div>
        <GeneralTable
          :columns="tableColumns"
          :data="data?.data?.data || []"
          :loading="loadingList"
          row-key="id"
          striped
        >
          <template #cell-status="{ value }">
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="statusBadgeClass(value as string | undefined)"
            >
              {{ formatStatusLabel(value as string | undefined) }}
            </span>
          </template>
          <template #cell-last_movement="{ value }">
            {{ formatTableDate(value as string) }}
          </template>
          <!-- <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <GeneralIconButton class="h-9 w-9" color="default" :ghost="true">
                <template #icon>
                  <IconsEdit size="16" class="text-gray-700" />
                </template>
              </GeneralIconButton>
              <GeneralIconButton
                class="h-9 w-9 bg-white"
                color="default"
                :bordered="false"
                @on-click="openDeleteSkuModal(row)"
              >
                <template #icon>
                  <IconsDelete size="18" class="text-red-500" />
                </template>
              </GeneralIconButton>
            </div>
          </template> -->
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
  </main>
</template>
