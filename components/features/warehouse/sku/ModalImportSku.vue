<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import type { ElementEvent } from "~/types/element";
import { useFacilitiesSkuStore } from "~/store/master-data/facilities-sku-store";

const props = defineProps<{
  listParams: {
    search: string;
    page: number;
    limit: number;
    status: string;
  };
}>();

const emit = defineEmits<{
  (e: "opened"): void;
  (e: "closed"): void;
  (e: "uploaded", file: File): void;
}>();

const modalInstance = ref<ElementEvent | null>(null);
const selectedFile = ref<File | null>(null);

const facilitiesSkuStore = useFacilitiesSkuStore();
const { loadingWrite } = storeToRefs(facilitiesSkuStore);
const route = useRoute();

const handleModalMounted = (instance: ElementEvent) => {
  modalInstance.value = instance;
};

const open = () => {
  selectedFile.value = null;
  modalInstance.value?.show();
};

const close = () => {
  modalInstance.value?.hide();
};

const handleCancel = () => {
  if (loadingWrite.value) return;
  close();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  const file = target?.files?.[0] || null;
  selectedFile.value = file;
};

const handleUpload = async () => {
  if (!selectedFile.value || loadingWrite.value) return;

  try {
    await facilitiesSkuStore.importFacilitiesSku(selectedFile.value);

    const facilityId = route.params.warehouse_id;
    if (facilityId) {
      await facilitiesSkuStore.getDataFacilitiesSku({
        ...props.listParams,
        facility_id: String(facilityId),
      } as any);
    }

    emit("uploaded", selectedFile.value);
    close();
  } catch {}
};

const handleModalOpened = () => emit("opened");
const handleModalClosed = () => emit("closed");

defineExpose({
  open,
  close,
});
</script>

<template>
  <GeneralModal
    id="modal-import-sku-warehouse"
    title="Import SKU"
    subtitle="Upload file template SKU untuk menambahkan SKU ke warehouse ini"
    :is-has-close="true"
    class-modal="max-w-lg"
    @mounted="handleModalMounted"
    @modal-opened="handleModalOpened"
    @modal-closed="handleModalClosed"
  >
    <template #body>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            File Template SKU
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            @change="handleFileChange"
          />
          <p v-if="selectedFile" class="mt-1 text-xs text-gray-500">
            Selected file: {{ selectedFile.name }}
          </p>
          <p class="mt-1 text-xs text-gray-400">
            Format yang disarankan: file hasil unduhan template
            <code>sku_template.xlsx</code>.
          </p>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <GeneralOutlinedButton
            label="Cancel"
            type="button"
            :disabled="loadingWrite"
            @on-click="handleCancel"
          />
          <GeneralButton
            type="button"
            color="primary"
            label="Upload"
            :disabled="!selectedFile || loadingWrite"
            :loading="loadingWrite"
            @on-click="handleUpload"
          />
        </div>
      </div>
    </template>
  </GeneralModal>
</template>

<style scoped></style>
