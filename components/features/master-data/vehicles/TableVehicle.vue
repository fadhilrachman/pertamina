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
import ModalFormVehicle from "./ModalFormVehicle.vue";
import { useVehiclesStore } from "~/store/master-data/vehicles-store";
import type { VehicleType } from "~/types/vehicle-type";

const $page = usePageStore();
const vehiclesStore = useVehiclesStore();
const { data, loadingWrite, loadingList } = storeToRefs(vehiclesStore);
const modalAddRef = ref<InstanceType<typeof ModalFormSku> | null>(null);
const formModeRef = ref(<"add" | "update">"add");
const deleteModalRef = ref<ElementEvent | null>(null);
const selectedSku = ref<Record<string, any> | null>(null);

const params = reactive({
  search: "",
  page: 1,
  limit: 10,
  status: "",
});
const tableColumns: TableColumn[] = [
  {
    key: "license_plate",
    label: "License Plate",
    headerClass: "min-w-[150px]",
  },
  { key: "type", label: "Type" },
  { key: "capacity", label: "Capacity" },
  {
    key: "facility_name",
    label: "Facility Name",
    headerClass: "min-w-[180px]",
  },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", align: "right" as const },
];
const statusOptions = [
  { id: "", label: "All Status" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];
const openAddVehicleModal = async () => {
  formModeRef.value = "add";
  await nextTick();

  modalAddRef.value?.open();
};

const openUpdateVehicleModal = async (row: VehicleType) => {
  vehiclesStore.setSelectedData(row);
  formModeRef.value = "update";

  await nextTick();
  modalAddRef.value?.open();
};

const handleDeleteModalMounted = (instance: ElementEvent) => {
  deleteModalRef.value = instance;
};

const openDeleteVehicleModal = (row: Record<string, any>) => {
  selectedSku.value = row;
  deleteModalRef.value?.show();
};

const closeDeleteVehicleModal = () => deleteModalRef.value?.hide();

const handleConfirmDelete = async () => {
  if (!selectedSku.value) return;
  try {
    await vehiclesStore.deleteDataVehicles({
      id: String(selectedSku.value.id),
    });
    vehiclesStore.getDataVehicles({ ...params });
    closeDeleteVehicleModal();
  } catch (error) {
    throw error;
  }
};

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

const handleStatusChange = (value: string | number) => {
  params.status = String(value);
  params.page = 1;
};

watch(
  () => ({ ...params }),
  () => {
    console.log({ params });

    vehiclesStore.getDataVehicles({ ...params });
  }
);

onMounted(() => {
  vehiclesStore.getDataVehicles({
    ...params,
  });
});

onBeforeMount(() => {
  $page.setTitle("Vehicle Master");
});
</script>

<template>
  <main class="space-y-8">
    <header class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Vehicle Master</h1>
        <p class="text-gray-500">Manage fleet vehicles</p>
      </div>
      <div class="flex justify-between space-x-2">
        <GeneralButton
          color="primary"
          label="Add Vehicle"
          @on-click="openAddVehicleModal"
        >
          <template #prefix>
            <IconsPlus size="18" class="text-white" />
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
        <GeneralTable
          :columns="tableColumns"
          :data="data?.data?.data"
          :loading="loadingList"
          row-key="id"
          striped
        >
          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <GeneralIconButton
                class="h-9 w-9"
                color="default"
                @on-click="openUpdateVehicleModal(row as VehicleType)"
              >
                <template #icon>
                  <IconsEdit size="18" class="text-gray-700" />
                </template>
              </GeneralIconButton>
              <GeneralIconButton
                class="h-9 w-9 bg-white"
                color="default"
                :bordered="false"
                @on-click="openDeleteVehicleModal(row)"
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
          :total="data?.data?.total || 0"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </section>
    <ModalFormVehicle ref="modalAddRef" :mode="formModeRef" />
    <ModalDelete
      id="modal-delete-sku"
      :target-label="selectedSku?.name || 'this SKU'"
      :is-loading="loadingWrite"
      confirm-label="Delete"
      @mounted="handleDeleteModalMounted"
      @cancel="closeDeleteVehicleModal"
      @confirm="handleConfirmDelete"
    />
  </main>
</template>
