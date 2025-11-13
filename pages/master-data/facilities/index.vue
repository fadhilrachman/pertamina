<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from "vue";
import ModalAddFacilities from "~/components/features/master-data/facilities/ModalAddFacilities.vue";
import ModalAddSku from "~/components/features/master-data/sku/ModalAddSku.vue";
import type { TableColumn } from "~/components/general/Table/index.vue";
import { useFacilitesStore } from "~/store/master-data/facilities-store";
import { usePageStore } from "~/store/page";

const $page = usePageStore();
const facilitiesStore = useFacilitesStore();
const { data } = storeToRefs(facilitiesStore);
const modalAddRef = ref<InstanceType<typeof ModalAddSku> | null>(null);
const tableColumns: TableColumn[] = [
  { key: "facility_code", label: "Facility Code" },
  { key: "name", label: "Facility Name", headerClass: "min-w-[200px]" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "capacity", label: "Capacity" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", align: "right" as const },
];

const openAddSkuModal = () => {
  modalAddRef.value?.open();
};

const handleEditFacility = (row: Record<string, any>) => {
  console.log("Edit Facility", row);
};

const handleDeleteFacility = (row: Record<string, any>) => {
  console.log("Delete Facility", row);
};

onMounted(() => {
  facilitiesStore.getDataFacilities({ page: "1", per_page: "10" });
});

// onBeforeMount(() => {
//   $page.setTitle("SKU Master");
// });
</script>

<template>
  <main class="space-y-8">
    <header class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Warehouse Master</h1>
        <p class="text-gray-500">Manage facilities and warehouses</p>
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
          label="Add Warehouse"
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
            <GeneralIconButton
              class="h-9 w-9"
              color="default"
              @on-click="handleEditFacility(row)"
            >
              <template #icon>
                <IconsEdit size="18" class="text-gray-700" />
              </template>
            </GeneralIconButton>
            <GeneralIconButton
              class="h-9 w-9 bg-white"
              color="default"
              :bordered="false"
              @on-click="handleDeleteFacility(row)"
            >
              <template #icon>
                <IconsDelete size="18" class="text-red-500" />
              </template>
            </GeneralIconButton>
          </div>
        </template>
      </GeneralTable>
    </section>
    <ModalAddFacilities ref="modalAddRef" />
  </main>
</template>
