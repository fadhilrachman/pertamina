<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { storeToRefs } from "pinia";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import { usePageStore } from "~/store/page";
import { useStockOnHand } from "~/store/stock-on-hand/stock-on-hand-store";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import { useFacilitiesSkuStore } from "~/store/master-data/facilities-sku-store";
import { formatTableDate } from "~/utils/functions";
import ModalFormStockIn from "./ModalFormStockIn.vue";
import ModalFormStockOut from "./ModalFormStockOut.vue";
import ModalFormStockAdjusment from "./ModalFormStockAdjusment.vue";
import ModalAdjustmentHistory from "../stock-adjustment/ModalAdjustmentHistory.vue";
import type { StockOnHandType } from "~/types/stock-on-hand-type";
import type { SessionResponseType } from "~/types/user-type";
import ModalImportStockAdjustment from "./ModalImportStockAdjustment.vue";

const $page = usePageStore();
const formModeRef = ref(<"add" | "update">"add");

const stockOnHandStore = useStockOnHand();
const facilitiesStore = useFacilitiesStore();
const facilitiesSkuStore = useFacilitiesSkuStore();
const { data: dataFacilities } = storeToRefs(facilitiesStore);
const { data: dataFacilitiesSku } = storeToRefs(facilitiesSkuStore);
const { data: authData } = useAuth();

const isManagementRole = computed(() => {
  const session = authData.value as SessionResponseType | null;
  const roleName = session?.data?.role?.name || "";
  return roleName.toLowerCase() === "management";
});

const facilitiesOptions = computed(
  () =>
    dataFacilities.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || []
);

const skuOptions = computed(() => {
  if (!params.facility_id) return [];

  const list =
    dataFacilitiesSku.value?.data?.data ||
    (Array.isArray(dataFacilitiesSku.value?.data)
      ? dataFacilitiesSku.value?.data
      : []);

  return list.map((item: any) => ({
    id: item.sku_id || item.id,
    label: item.sku_name || item.name || item.sku_code || item.sku_id,
  }));
});
const { data, loadingWrite, loadingList } = storeToRefs(stockOnHandStore);

const stockAdjustmentModalRef = ref<InstanceType<
  typeof ModalFormStockAdjusment
> | null>(null);
const historyModalRef = ref<ElementEvent | null>(null);
const importModalRef = ref<InstanceType<
  typeof ModalImportStockAdjustment
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

const fetchFacilitySkus = async (facilityId: string | number | null) => {
  const parsed = facilityId ? String(facilityId) : "";
  if (!parsed) return;

  await facilitiesSkuStore.getDataFacilitiesSku({
    facility_id: parsed,
    page: 1,
    limit: 1000,
  });
};

const handleFacilitiesChange = (value: any) => {
  params.facility_id = value ? String(value) : "";
  params.page = 1;
};
const handleSkuChange = (value: any) => {
  params.sku_id = value ? String(value) : "";
  params.page = 1;
};

const handlePageChange = (page: number) => {
  params.page = page;
};

const handlePageSizeChange = (pageSize: number) => {
  params.limit = pageSize;
  params.page = 1;
};

const openStockAdjustmentModal = async (row: StockOnHandType) => {
  stockOnHandStore.setSelectedData(row);
  await nextTick();
  stockAdjustmentModalRef.value?.open();
};

const openImportModal = async () => {
  await nextTick();
  importModalRef.value?.open();
};

const handleHistoryModalMounted = (instance: ElementEvent) => {
  historyModalRef.value = instance;
};

const openHistoryModal = () => {
  historyModalRef.value?.show();
};

const handleDownloadTemplate = () => {
  const link = document.createElement("a");
  link.href = "/template/template_import_stock_adjustment.csv";
  link.download = "template_import_stock_adjustment.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
watch(
  () => params.facility_id,
  (next) => {
    params.sku_id = "";
    fetchFacilitySkus(next);
  }
);

watch(
  () => ({ ...params }),
  () => {
    stockOnHandStore.getDataStockOnHand({ ...params });
  }
);

onMounted(() => {
  stockOnHandStore.getDataStockOnHand({
    ...params,
  });
  fetchFacilitySkus(params.facility_id);
  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
});

onBeforeMount(() => {
  $page.setTitle("On Hand Stock");
});
</script>

<template>
  <main class="space-y-8">
    <header class="flex justify-between items-end">
      <GeneralTitle title="Stock" subtitle="Manage your stock" />
      <div class="flex justify-between space-x-2 items-center">
        <GeneralOutlinedButton
          label="History"
          type="button"
          @on-click="openHistoryModal"
        >
          <template #prefix>
            <IconsHistory size="18" class="text-gray-700" />
          </template>
        </GeneralOutlinedButton>
        <template v-if="!isManagementRole">
          <GeneralButton
            color="success"
            label="Download Template"
            type="button"
            @on-click="handleDownloadTemplate"
          >
            <template #prefix>
              <IconsDownload size="18" class="text-white" />
            </template>
          </GeneralButton>
          <GeneralButton
            color="primary"
            label="Import Bulk"
            type="button"
            @on-click="openImportModal"
          >
            <template #prefix>
              <IconsUpload size="18" class="text-white" />
            </template>
          </GeneralButton>
        </template>
      </div>
    </header>
    <section class="flex bg-white p-6 rounded-xl items-end space-x-2">
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
        <label class="mb-1.5 text-sm font-[600] text-gray-700">SKU</label>
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
            <div v-if="!isManagementRole" class="flex justify-end gap-2">
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
    <ModalImportStockAdjustment ref="importModalRef" :list-params="params" />
    <ModalAdjustmentHistory
      id="modal-stock-history"
      :facility-id="params.facility_id"
      @mounted="handleHistoryModalMounted"
    />
  </main>
</template>
