<script setup lang="ts">
import { storeToRefs } from "pinia";
import Modal from "~/components/general/Modal/index.vue";
import type { ElementEvent } from "~/types/element";
import { useCompanyStore } from "~/store/company/company-store";

const props = defineProps<{
  id: string;
}>();

const emit = defineEmits<{
  (e: "mounted", payload: ElementEvent): void;
}>();

const companyStore = useCompanyStore();
const { selectedData } = storeToRefs(companyStore);

const handleModalMounted = (instance: ElementEvent) => {
  emit("mounted", instance);
};
</script>

<template>
  <Modal
    :id="props.id"
    title="Company Detail"
    :is-has-close="true"
    class-modal="max-w-lg"
    @mounted="handleModalMounted"
  >
    <template #body>
      <div class="space-y-6">
        <div class="space-y-2">
          <p class="text-sm font-medium text-gray-500">Logo</p>
          <div
            class="h-16 w-16 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50"
          >
            <template
              v-if="selectedData.logo && typeof selectedData.logo === 'string'"
            >
              <img
                :src="selectedData.logo"
                alt="Company logo"
                class="max-h-full max-w-full object-contain"
              />
            </template>
            <template v-else>
              <span class="text-xs text-gray-400">No logo</span>
            </template>
          </div>
        </div>

        <div class="space-y-1">
          <p class="text-sm font-medium text-gray-500">Company Name</p>
          <p class="text-base font-semibold text-gray-900">
            {{ selectedData.name || "-" }}
          </p>
          <p class="text-sm text-gray-600">
            {{ selectedData.email || "-" }}
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-500">PIC Name</p>
            <p class="text-sm text-gray-900">
              {{ selectedData.pic_name || "-" }}
            </p>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-500">Email</p>
            <p class="text-sm text-gray-900 break-all">
              {{ selectedData.email || "-" }}
            </p>
          </div>
        </div>

        <div class="space-y-1">
          <p class="text-sm font-medium text-gray-500">Address</p>
          <p class="text-sm text-gray-900 whitespace-pre-line">
            {{ selectedData.address || "-" }}
          </p>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped></style>
