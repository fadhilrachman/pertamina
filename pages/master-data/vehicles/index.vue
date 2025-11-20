<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from "vue";
import ModalAddSku from "~/components/features/master-data/sku/ModalFormSku.vue";
import ModalAddVehicles from "~/components/features/master-data/vehicles/ModalAddVehicles.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import { useVehiclesStore } from "~/store/master-data/vehicles-store";
import { usePageStore } from "~/store/page";

const $page = usePageStore();
const vehiclesStore = useVehiclesStore();
const { data } = storeToRefs(vehiclesStore);
const modalAddRef = ref<InstanceType<typeof ModalAddSku> | null>(null);
const tableColumns: TableColumn[] = [
  { key: "vehicle_id", label: "Vehicle ID" },
  { key: "plate_number", label: "Plate Number" },
  { key: "type", label: "Type" },
  { key: "capacity", label: "Capacity" },
  { key: "assigned_facility", label: "Assigned Facility" },
  { key: "actions", label: "Actions", align: "right" as const },
];

const openAddSkuModal = () => {
  modalAddRef.value?.open();
};

onMounted(() => {
  vehiclesStore.getDataVehicles({ page: "1", per_page: "10" });
});

// onBeforeMount(() => {
//   $page.setTitle("SKU Master");
// });
</script>

<template>
  <main class="space-y-8">
    <header class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Vehicle Master</h1>
        <p class="text-gray-500">Manage fleet vehicles</p>
      </div>
      <div class="flex justify-between space-x-2">
        <GeneralButton color="success" label="Download Template">
          <template #prefix>
            <IconsDownload size="18" class="text-white" />
          </template>
        </GeneralButton>
        <GeneralButton color="warning" label="Import">
          <template #prefix>
            <IconsUpload size="18" class="text-white" />
          </template>
        </GeneralButton>
        <GeneralButton
          color="primary"
          label="Add Vehicles"
          @on-click="openAddSkuModal"
        >
          <template #prefix>
            <IconsPlus size="18" class="text-white" />
          </template>
        </GeneralButton>
      </div>
    </header>
    <section class="bg-white p-6 rounded-xl space-y-4">
      <GeneralTable
        :columns="tableColumns"
        :data="data.result"
        row-key="id"
        striped
      >
        <template #cell-actions="{ row }">
          <div class="flex justify-end gap-2">
            <GeneralIconButton class="h-9 w-9" color="default">
              <template #icon>
                <IconsEdit size="18" class="text-gray-700" />
              </template>
            </GeneralIconButton>
            <GeneralIconButton
              class="h-9 w-9 bg-white"
              color="default"
              :bordered="false"
            >
              <template #icon>
                <IconsDelete size="18" class="text-red-500" />
              </template>
            </GeneralIconButton>
          </div>
        </template>
      </GeneralTable>
    </section>
    <ModalAddVehicles ref="modalAddRef" />
  </main>
</template>
