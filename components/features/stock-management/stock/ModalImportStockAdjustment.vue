<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import type { ElementEvent } from "~/types/element";
import { useStockTransaction } from "~/store/stock-management/stock-transaction-store";
import { useStockOnHand } from "~/store/stock-on-hand/stock-on-hand-store";

const props = defineProps<{
  listParams: {
    sku_id: string;
    facility_id: string;
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

const stockTransactionStore = useStockTransaction();
const { loadingWrite } = storeToRefs(stockTransactionStore);
const stockOnHandStore = useStockOnHand();

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
    await stockTransactionStore.importStockAdjustment(selectedFile.value);

    await stockOnHandStore.getDataStockOnHand({
      ...props.listParams,
    } as any);

    emit("uploaded", selectedFile.value);
    close();
  } catch {
    // Error & toast sudah ditangani di store
  }
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
    id="modal-import-stock-adjustment"
    title="Import Stock Adjustment"
    subtitle="Upload file CSV/Excel untuk melakukan penyesuaian stok secara bulk."
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
            File Stock Adjustment
          </label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            @change="handleFileChange"
          />
          <p v-if="selectedFile" class="mt-1 text-xs text-gray-500">
            Selected file: {{ selectedFile.name }}
          </p>
          <p class="mt-1 text-xs text-gray-400">
            Gunakan format template <code>stock_adjustment.xlsx</code>
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
