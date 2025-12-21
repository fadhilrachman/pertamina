<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import type { ElementEvent } from "~/types/element";
import { useFacilitiesSkuStore } from "~/store/master-data/facilities-sku-store";
import { toast } from "vue3-toastify";
import type { ImportResult } from "~/types/import";

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
const fileInputRef = ref<HTMLInputElement | null>(null);
const importResult = ref<ImportResult | null>(null);

const facilitiesSkuStore = useFacilitiesSkuStore();
const { loadingWrite } = storeToRefs(facilitiesSkuStore);
const route = useRoute();

const handleModalMounted = (instance: ElementEvent) => {
  modalInstance.value = instance;
};

const resetFileInput = () => {
  selectedFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const open = () => {
  resetFileInput();
  importResult.value = null;
  modalInstance.value?.show();
};

const close = () => {
  modalInstance.value?.hide();
  resetFileInput();
  importResult.value = null;
};

const handleCancel = () => {
  if (loadingWrite.value) return;
  close();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  const file = target?.files?.[0] || null;

  if (!file) {
    resetFileInput();
    return;
  }

  const allowedExtensions = [".csv", ".xlsx"];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const lowerName = file.name.toLowerCase();
  const isAllowed = allowedExtensions.some((ext) => lowerName.endsWith(ext));

  if (!isAllowed) {
    resetFileInput();
    toast.error("Invalid file type. Use CSV or XLSX.", {
      toastClassName: "toastify-error",
    });
    return;
  }

  if (file.size > maxSize) {
    resetFileInput();
    toast.error("File too large. Max size is 5MB.", {
      toastClassName: "toastify-error",
    });
    return;
  }

  selectedFile.value = file;
};

const parseImportResult = (payload: unknown): ImportResult | null => {
  const base = (payload as any)?.data ?? payload;
  if (!base || typeof base !== "object") return null;

  const reports = Array.isArray((base as any).row_reports)
    ? (base as any).row_reports
    : [];

  return {
    errors: (base as any).errors ?? [],
    failed_rows:
      (base as any).failed_rows ?? (base as any).failedRows ?? undefined,
    row_reports: reports,
    success_detail:
      (base as any).success_detail ?? (base as any).detail ?? undefined,
    success_rows:
      (base as any).success_rows ?? (base as any).successRows ?? undefined,
    total_rows:
      (base as any).total_rows ?? (base as any).totalRows ?? undefined,
  };
};

const handleUpload = async () => {
  if (!selectedFile.value || loadingWrite.value) return;

  try {
    const response = await facilitiesSkuStore.importFacilitiesSku(
      selectedFile.value
    );
    importResult.value = parseImportResult(response);

    const facilityId = route.params.warehouse_id;
    if (facilityId) {
      await facilitiesSkuStore.getDataFacilitiesSku({
        ...props.listParams,
        facility_id: String(facilityId),
      } as any);
    }

    emit("uploaded", selectedFile.value);
  } catch {
    // Error & toast already handled in store
  } finally {
    resetFileInput();
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
            ref="fileInputRef"
            type="file"
            accept=".csv,.xlsx"
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
            label="Close"
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

        <GeneralImportResult
          :result="importResult"
          title="Hasil Import SKU"
        />
      </div>
    </template>
  </GeneralModal>
</template>

<style scoped></style>
