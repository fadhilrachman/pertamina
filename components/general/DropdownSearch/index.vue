<script setup lang="ts">
import { computed, type PropType } from "vue";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

interface SelectOption {
  id: string | number;
  label: string;
}

type OptionValue = string | number | Array<string | number> | null;

const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "Search option",
  },
  options: {
    type: Array as PropType<ReadonlyArray<SelectOption>>,
    default: () => [],
  },
  modelValue: {
    type: [String, Number, Array, null] as PropType<OptionValue>,
    default: "",
  },
  multiple: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: OptionValue): void;
  (e: "change", value: OptionValue): void;
}>();

const normalizedOptions = computed(() => {
  const base = props.options ?? [];

  // Untuk single select, tambahkan opsi placeholder dengan value ""
  // mirip dengan GeneralDropdown, kecuali jika sudah ada option dengan id kosong.
  if (!props.multiple) {
    const hasEmpty =
      base && base.some((option) => option.id === "" || option.id === null);

    if (!hasEmpty) {
      return [
        { id: "", label: props.placeholder },
        ...base,
      ];
    }
  }

  return base;
});

const model = computed({
  get: () => props.modelValue,
  set: (val: OptionValue) => {
    emit("update:modelValue", val);
    emit("change", val);
  },
});
</script>

<template>
  <v-select
    v-model="model"
    :id="props.id || undefined"
    :options="normalizedOptions"
    label="label"
    :reduce="(option: SelectOption) => option.id"
    :multiple="props.multiple"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :clearable="!props.multiple"
    :class="['w-full', { 'v-select--invalid': props.invalid }]"
    :aria-invalid="props.invalid"
  >
    <!-- Samakan gaya teks option dengan Dropdown (placeholder abu-abu) -->
    <template #option="{ label }">
      <span
        :class="[
          'text-sm font-normal',
          label === props.placeholder ? 'text-neutral-400' : 'text-gray-900',
        ]"
      >
        {{ label }}
      </span>
    </template>

    <template #selected-option="{ label }">
      <span
        :class="[
          'text-sm font-normal',
          label === props.placeholder ? 'text-neutral-400' : 'text-gray-900',
        ]"
      >
        {{ label }}
      </span>
    </template>
  </v-select>
</template>

<style scoped>
:deep(.vs__dropdown-toggle) {
  min-height: 44px;
  height: 44px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  /* Samakan dengan GeneralDropdown (px-2.5 = 0.625rem) */
  padding: 0 0.625rem;
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
  font-size: 1rem;
  font-weight: 400;
}

:deep(.vs__selected-options) {
  /* Hilangkan padding/margin default supaya sejajar dengan Dropdown */
  padding: 0;
  margin: 0;
}

:deep(.vs__search) {
  margin: 0;
}

:deep(.vs__actions),
:deep(.vs__open-indicator) {
  color: #4b5563;
}

:deep(.vs__dropdown-menu) {
  border: 1px solid #e5e7eb;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.07),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 0.25rem 0;
  margin-top: 6px;
}

:deep(.vs__dropdown-option) {
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  color: #111827;
}

:deep(.vs__dropdown-option--highlight) {
  background: #eff6ff;
  color: #1d4ed8;
}

:deep(.vs__dropdown-option--selected) {
  background: #eef2ff;
  color: #312e81;
}

:deep(.vs__clear) {
  display: none;
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
</style>
