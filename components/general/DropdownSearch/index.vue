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

const normalizedOptions = computed(() => props.options);

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
  />
</template>

<style scoped>
/* basic alignment to match other inputs */
:deep(.vs__dropdown-toggle) {
  min-height: 44px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  font-size: 0.875rem;
  height: 44px;
  background-color: #ffffff;
  box-shadow: none;
  align-items: center;
}

:deep(.vs__dropdown-toggle:focus-within) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
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

:deep(.vs__placeholder),
:deep(.vs__selected-options input::placeholder) {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 400;
  opacity: 1;
}

:deep(.vs__search input) {
  font-size: 1rem;
  color: #111827;
}

:deep(.vs__selected) {
  color: #111827;
  font-size: 1rem;
  font-weight: 500;
}

:deep(.vs__selected-options) {
  padding: 0;
  margin: 0;
}

:deep(.vs__actions),
:deep(.vs__open-indicator) {
  color: #4b5563;
}
</style>
