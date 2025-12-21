<script setup lang="ts">
import { computed, type PropType } from "vue";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

interface SelectOption {
  id: string | number;
  label: string;
}

type OptionValue = Array<string | number>;

const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Select options",
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  searchable: {
    type: Boolean,
    default: true,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  options: {
    type: Array as PropType<ReadonlyArray<SelectOption>>,
    default: () => [],
  },
  modelValue: {
    type: Array as PropType<OptionValue>,
    default: () => [],
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: OptionValue): void;
  (e: "change", value: OptionValue): void;
}>();

const normalizedOptions = computed(() => props.options ?? []);

const model = computed<OptionValue>({
  get: () => (Array.isArray(props.modelValue) ? props.modelValue : []),
  set: (val) => {
    emit("update:modelValue", val);
    emit("change", val);
  },
});
</script>

<template>
  <div class="flex flex-col items-start w-full space-y-1">
    <label
      v-if="props.label"
      :for="props.id"
      class="mb-1.5 text-sm font-[600] text-gray-700"
    >
      {{ props.label }}
      <span v-if="props.required" class="text-error-500">*</span>
    </label>
    <v-select
      v-model="model"
      :id="props.id || undefined"
      :options="normalizedOptions"
      label="label"
      :reduce="(option: SelectOption) => option.id"
      multiple
      :close-on-select="false"
      :searchable="props.searchable"
      :clearable="props.clearable"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :class="['w-full', { 'v-select--invalid': props.invalid }]"
      :aria-invalid="props.invalid"
    >
      <template #option="{ label }">
        <div class="flex items-center justify-between w-full">
          <span class="text-sm text-gray-900">{{ label }}</span>
          <span
            class="checkmark inline-flex h-4 w-4 items-center justify-center rounded border border-gray-300 text-primary-600"
          >
            <svg
              aria-hidden="true"
              class="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </div>
      </template>

      <template #selected-option="{ label }">
        <span class="text-sm font-normal text-gray-900">
          {{ label }}
        </span>
      </template>

      <template #no-options>
        <span class="px-1 text-sm text-neutral-500">No options</span>
      </template>
    </v-select>
  </div>
</template>

<style scoped>
:deep(.vs__dropdown-toggle) {
  min-height: 44px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.25rem 0.625rem;
  background: #ffffff;
  box-shadow: none;
  align-items: center;
}

:deep(.vs__dropdown-toggle:hover) {
  border-color: #d1d5db;
}

:deep(.vs__dropdown-toggle:focus-within) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

:deep(.vs__placeholder),
:deep(.vs__selected-options input::placeholder) {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 400;
  opacity: 1;
}

:deep(.vs__search input),
:deep(.vs__selected) {
  color: #111827;
  font-size: 0.95rem;
  font-weight: 400;
}

:deep(.vs__selected) {
  background-color: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #312e81;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
}

:deep(.vs__selected button) {
  color: #6b7280;
  margin-left: 6px;
}

:deep(.vs__selected button:hover) {
  color: #111827;
}

:deep(.vs__dropdown-menu) {
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.07),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 0.25rem 0;
  margin-top: 6px;
}

:deep(.vs__dropdown-option) {
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  color: #111827;
  display: flex;
  align-items: center;
}

:deep(.vs__dropdown-option--highlight) {
  background: #eff6ff;
  color: #1d4ed8;
}

:deep(.vs__dropdown-option--selected) {
  background: #eef2ff;
  color: #312e81;
}

:deep(.vs__dropdown-option .checkmark) {
  opacity: 0;
  transition: opacity 0.12s ease;
}

:deep(.vs__dropdown-option--selected .checkmark) {
  opacity: 1;
  border-color: #3b82f6;
  background-color: #eff6ff;
}

:deep(.vs__clear) {
  color: #6b7280;
}

:deep(.vs__clear:hover) {
  color: #111827;
}

:deep(.v-select--invalid .vs__dropdown-toggle),
:deep(.vs__dropdown-toggle.vs__dropdown-toggle--invalid) {
  border-color: #ef4444 !important;
  box-shadow: none !important;
}

:deep(.v-select--invalid .vs__dropdown-toggle:focus-within),
:deep(.vs__dropdown-toggle.vs__dropdown-toggle--invalid:focus-within) {
  border-color: #ef4444 !important;
  box-shadow: none !important;
}

:deep(.vs--disabled .vs__dropdown-toggle) {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
}

:deep(.vs--disabled .vs__selected),
:deep(.vs--disabled .vs__search) {
  background-color: transparent;
}

:deep(.vs--disabled .vs__selected),
:deep(.vs--disabled .vs__placeholder),
:deep(.vs--disabled .vs__search) {
  color: #9ca3af;
}
</style>
