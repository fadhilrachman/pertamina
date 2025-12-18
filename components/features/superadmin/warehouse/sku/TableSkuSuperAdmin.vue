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
import { useRoute } from "vue-router";
import ModalDelete from "~/components/general/ModalDelete/index.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import type { ElementEvent } from "~/types/element";
import { useFacilitiesSkuStore } from "~/store/master-data/facilities-sku-store";
import { usePageStore } from "~/store/page";
import type { FacilitiesSkuType } from "~/types/facilities-sku-type";
import CardDetailWarehouse from "~/components/features/warehouse/sku/CardDetailWarehouse.vue";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import type { SessionResponseType } from "~/types/user-type";
import { useSuperadminFacilitiesStore } from "~/store/superadmin/facilities-store";
import { useSuperadminFacilitySkuStore } from "~/store/superadmin/facility-sku-store";

const $page = usePageStore();
const facilitiesSkuStore = useSuperadminFacilitySkuStore();
const { data, loadingWrite, loadingList } = storeToRefs(facilitiesSkuStore);

const facilitiesStore = useSuperadminFacilitiesStore();
const { dataDetail, loadingDetail } = storeToRefs(facilitiesStore);
const route = useRoute();
const { data: authData } = useAuth();

const warehouseId = computed(() => String(route.params.warehouse_id || ""));
const warehouse = computed(() => dataDetail.value?.data);

const params = reactive({
  search: "",
  page: 1,
  limit: 10,
  status: "",
});

const tableData = computed(() => {
  const raw =
    data.value?.data?.data ||
    (Array.isArray(data.value?.data) ? data.value?.data : []);

  return (raw as any[]).map((item) => ({
    ...item,
    sku_code: item.sku_code ?? item.sku?.sku_code ?? item.sku?.code ?? "-",
    sku_name: item.sku_name ?? item.sku?.sku_name ?? item.sku?.name ?? "-",
  }));
});

const tableColumns: TableColumn[] = [
  { key: "sku_code", label: "SKU Code" },
  { key: "sku_name", label: "Name", headerClass: "min-w-[200px]" },
  { key: "low_stock_threshold", label: "Min Stock" },
  { key: "high_stock_threshold", label: "Max Stock" },
  // { key: "status", label: "Status" },
  { key: "description", label: "Description" },
];

const handleSearchChange = (value: string) => {
  params.search = value;
};

const handlePageChange = (page: number) => {
  params.page = page;
};

const handlePageSizeChange = (pageSize: number) => {
  params.limit = pageSize;
  params.page = 1;
};

watch(
  () => ({ ...params, facility_id: warehouseId.value }),
  () => {
    facilitiesSkuStore.getDataFacilitySku({
      ...params,
      facility_id: warehouseId.value,
    });
  }
);

onMounted(() => {
  if (warehouseId.value) {
    facilitiesStore.getFacilityDetail({ id: warehouseId.value });
  }
  facilitiesSkuStore.getDataFacilitySku({
    ...params,
    facility_id: warehouseId.value,
  });
});

onBeforeMount(() => {
  $page.setTitle("SKU Master");
});
</script>

<template>
  <main class="space-y-8">
    <header class="flex justify-start items-end">
      <GeneralTitle title="SKU Master" subtitle="Manage Stock Keeping Units" />
    </header>

    <section class="grid grid-cols-12 gap-4 items-start">
      <div class="col-span-12 lg:col-span-4">
        <CardDetailWarehouse :warehouse="warehouse || null" />
      </div>

      <div class="col-span-12 lg:col-span-8 space-y-4">
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
              :data="tableData"
              :loading="loadingList"
              row-key="id"
              striped
            />
            <GeneralPagination
              :page="params.page"
              :page-size="params.limit"
              :total="data?.data?.total ?? tableData.length"
              @update:page="handlePageChange"
              @update:page-size="handlePageSizeChange"
            />
          </div>
        </section>
      </div>
    </section>
  </main>
</template>
