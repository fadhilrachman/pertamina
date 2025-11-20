<script setup lang="ts">
import { computed } from "vue";
import Button from "../Button/index.vue";
import Modal from "../Modal/index.vue";
import OutlinedButton from "../OutlinedButton/index.vue";

const emit = defineEmits<{
  (e: "mounted", payload: any): void;
  (e: "cancel"): void;
  (e: "confirm"): void;
}>();

const props = defineProps({
  id: {
    type: String,
    default: "modal-delete",
  },
  title: {
    type: String,
    default: "Delete Confirmation",
  },
  targetLabel: {
    type: String,
    default: "this item",
  },
  confirmLabel: {
    type: String,
    default: "Delete",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const description = computed(
  () => `Are you sure you want to delete ${props.targetLabel}?`
);
</script>

<template>
  <Modal
    class-modal="max-w-[320px]"
    :id="props.id"
    title=""
    @mounted="emit('mounted', $event)"
  >
    <template #body>
      <div class="flex flex-col gap-2 items-center text-center">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full bg-error-50"
        >
          <IconsDelete class="stroke-error-500" size="28" />
        </div>

        <div class="space-y-1 mb-4">
          <p class="text-lg text-gray-900 font-[600]">
            {{ props.title }}
          </p>
          <p class="text-sm text-gray-600">
            {{ description }}
          </p>
        </div>

        <div class="flex w-full gap-3">
          <OutlinedButton
            label="Cancel"
            class="w-full"
            color="default"
            @on-click="emit('cancel')"
          />
          <Button
            size="sm"
            :loading="props.isLoading"
            :label="props.confirmLabel"
            color="error"
            class="w-full"
            @on-click="emit('confirm')"
          />
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped></style>
