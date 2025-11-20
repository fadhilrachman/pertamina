<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import GeneralTextInput from "~/components/general/TextInput/index.vue";
import IconsSearch from "~/components/icons/Search/index.vue";

const props = withDefaults(
  defineProps<{
    id?: string;
    modelValue?: string;
    label?: string;
    placeholder?: string;
    debounce?: number;
    clearable?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    color?: "primary" | "success" | "info" | "warning" | "error";
  }>(),
  {
    id: "",
    modelValue: "",
    label: "",
    placeholder: "Search...",
    debounce: 1000,
    clearable: true,
    disabled: false,
    invalid: false,
    color: "primary",
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "change", value: string): void;
}>();

const text = ref(props.modelValue ?? "");
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const emitDebouncedChange = (value: string) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    emit("change", value);
  }, props.debounce);
};

watch(
  () => props.modelValue,
  (value) => {
    if (value !== text.value) {
      text.value = value ?? "";
    }
  }
);

watch(
  text,
  (value) => {
    emit("update:modelValue", value);
    emitDebouncedChange(value);
  },
  { immediate: false }
);

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});
</script>

<template>
  <GeneralTextInput
    :id="props.id"
    :label="props.label"
    :placeholder="props.placeholder"
    :model-value="text"
    :clearable="props.clearable"
    :disabled="props.disabled"
    :invalid="props.invalid"
    :color="props.color"
    @update:model-value="(value) => (text = String(value ?? ''))"
  >
    <template #prefix>
      <IconsSearch size="18" class="stroke-primary-500" />
    </template>
  </GeneralTextInput>
</template>

<style scoped></style>
