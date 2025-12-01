<script setup lang="ts">
import { computed, onBeforeMount, onMounted, reactive, ref, watch } from "vue";
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
import ModalFormStockIn from "./ModalFormStockIn.vue";
import ModalFormStockOut from "./ModalFormStockOut.vue";
import ModalFormStockAdjusment from "./ModalFormStockAdjusment.vue";
import type { StockOnHandType } from "~/types/stock-on-hand-type";

const $page = usePageStore();
const formModeRef = ref(<"add" | "update">"add");

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

const stockInModalRef = ref<InstanceType<typeof ModalFormStockIn> | null>(null);
const stockOutModalRef = ref<InstanceType<typeof ModalFormStockOut> | null>(
  null
);
const stockAdjustmentModalRef = ref<InstanceType<
  typeof ModalFormStockAdjusment
> | null>(null);

const params = reactive({
  sku_id: "",
  facility_id: "",
  page: 1,
  limit: 10,
  status: "",
});
const tableColumns: TableColumn[] = [
  { key: "warehouse", label: "Warehouse" },
  { key: "sku_code", label: "SKU Code" },
  { key: "sku_name", label: "SKU Name" },

  { key: "on_hand_qty", label: "On-Hand Quantity" },
  { key: "unit_of_measure", label: "UOM" },

  { key: "actions", label: "Actions", align: "right" as const },
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

const openStockInModal = () => {
  formModeRef.value = "add";

  stockInModalRef.value?.open();
};

const openStockOutModal = () => {
  formModeRef.value = "add";

  stockOutModalRef.value?.open();
};

const openUpdateStockInModal = async (row: StockOnHandType) => {
  console.log({ row });

  stockOnHandStore.setSelectedData(row);
  formModeRef.value = "update";

  await nextTick();
  stockInModalRef.value?.open();
};

const openUpdateStockOutModal = async (row: StockOnHandType) => {
  stockOnHandStore.setSelectedData(row);
  formModeRef.value = "update";

  await nextTick();
  stockOutModalRef.value?.open();
};

const openStockAdjustmentModal = async (row: StockOnHandType) => {
  stockOnHandStore.setSelectedData(row);
  await nextTick();
  stockAdjustmentModalRef.value?.open();
};

const fileInputRef = ref<HTMLInputElement | null>(null);

const handleClickImport = () => {
  fileInputRef.value?.click();
};

const handleImportFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  const file = target?.files?.[0];
  if (!file) return;

  console.log("Selected import file:", file.name);
  // TODO: call real import API here

  // reset so same file can be chosen again
  if (target) target.value = "";
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
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Stock</h1>
        <p class="text-gray-500">Manage your stock</p>
      </div>
      <div class="flex justify-between space-x-2 items-center">
        <GeneralOutlinedButton label="History" type="button">
          <template #prefix>
            <IconsHistory size="18" class="text-gray-700" />
          </template>
        </GeneralOutlinedButton>
        <GeneralButton color="success" label="Download Template">
          <template #prefix>
            <IconsDownload size="18" class="text-white" />
          </template>
        </GeneralButton>
        <GeneralButton
          color="primary"
          label="Import Bulk"
          type="button"
          @on-click="handleClickImport"
        >
          <template #prefix>
            <IconsUpload size="18" class="text-white" />
          </template>
        </GeneralButton>
        <input
          ref="fileInputRef"
          type="file"
          class="hidden"
          accept=".xlsx,.xls,.csv"
          @change="handleImportFileChange"
        />
        <!-- <GeneralButton
          color="error"
          label="Stock Out"
          @on-click="openStockOutModal"
        >
          <template #prefix>
            <IconsStockOut size="18" class="text-white" />
          </template>
        </GeneralButton>
        <GeneralButton
          color="primary"
          label="Stock In"
          @on-click="openStockInModal"
        >
          <template #prefix>
            <IconsStockIn size="18" class="text-white" />
          </template>
        </GeneralButton> -->
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
        <label class="mb-1.5 text-sm font-[600] text-gray-700">Warehouse</label>
        <GeneralDropdownSearch
          v-model="params.facility_id"
          :options="facilitiesOptions"
          placeholder="Select Warehouse"
          @change="handleFacilitiesChange"
        />
      </div>
      <div class="min-w-[240px] space-y-1">
        <label class="mb-1.5 text-sm font-[600] text-gray-700">Sku</label>
        <GeneralDropdownSearch
          v-model="params.sku_id"
          :options="skuOptions"
          placeholder="All SKU"
          @change="handleSkuChange"
        />
      </div>
    </section>
    <section class="space-y-4" v-if="params.facility_id">
      <div class="bg-white p-6 rounded-xl space-y-4">
        <GeneralTable
          :columns="tableColumns"
          :data="data?.data?.data || []"
          :loading="loadingList"
          row-key="id"
          striped
        >
          <template #cell-last_movement="{ value }">
            {{ formatTableDate(value as string) }}
          </template>
          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <!-- <GeneralButton
                color="error"
                label="Stock Out"
                size="xs"
                @on-click="openUpdateStockOutModal(row as StockOnHandType)"
              >
              </GeneralButton>
              <GeneralButton
                color="primary"
                label="Stock in"
                size="xs"
                @on-click="openUpdateStockInModal(row as StockOnHandType)"
              >
              </GeneralButton> -->
              <GeneralButton
                color="warning"
                label="Adjust"
                size="xs"
                @on-click="openStockAdjustmentModal(row as StockOnHandType)"
              >
              </GeneralButton>
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

    <ModalFormStockIn ref="stockInModalRef" :mode="formModeRef" />
    <ModalFormStockOut ref="stockOutModalRef" :mode="formModeRef" />
    <ModalFormStockAdjusment ref="stockAdjustmentModalRef" />
  </main>
</template>
