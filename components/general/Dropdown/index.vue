<script setup lang="ts">
import { computed, onMounted, ref, type PropType } from "vue";
import { Dropdown, type DropdownInterface, initFlowbite } from "flowbite";

interface SelectOption {
  id: string | number;
  label: string;
}

const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  variant: {
    type: String as () => "menu" | "field",
    default: "menu",
  },
  label: {
    type: String,
    default: "",
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
  color: {
    type: String as () => "primary" | "success" | "info" | "warning" | "error",
    default: "primary",
  },
  placeholder: {
    type: String,
    default: "Select option",
  },
  options: {
    type: Array as PropType<ReadonlyArray<SelectOption>>,
    default: () => [],
  },
  modelValue: {
    type: [String, Number],
    default: "",
  },
  multiple: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
  (e: "change", value: string | number): void;
}>();

const dropdown = ref<DropdownInterface | null>(null);
const isFocused = ref(false);

onMounted(() => {
  if (props.variant !== "menu") return;
  initFlowbite();

  const $trigger = document.getElementById(`${props.id}-activator`);
  const $target = document.getElementById(`${props.id}`);
  if ($target && $trigger) {
    dropdown.value = new Dropdown($target, $trigger);
  }
});

const hideDropdown = () => dropdown.value?.hide();

const variantColors = {
  primary: "border-primary-500",
  success: "border-success-500",
  info: "border-info-500",
  warning: "border-warning-500",
  error: "border-error-500",
};

const containerClasses = computed(() => {
  const baseClass =
    "w-full rounded-lg overflow-hidden stroke-gray-500 border-2 flex h-10";
  const border = props.invalid
    ? "border-error-500"
    : isFocused.value
    ? variantColors[props.color]
    : "border-gray-200";
  const background = props.disabled ? "bg-gray-100" : "bg-white";
  const cursor = props.disabled ? "cursor-not-allowed" : "";
  return `${baseClass} ${border} ${background} ${cursor}`;
});

const selectClasses = computed(() => {
  const baseClass =
    "block px-2.5 w-full placeholder-neutral-400 h-full border-none text-gray-900 bg-transparent focus:ring-0";
  const cursor = props.disabled ? "cursor-not-allowed" : "";
  return `${baseClass} ${cursor}`;
});

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if (!target) return;
  emit("update:modelValue", target.value);
  emit("change", target.value);
};
</script>

<template>
  <template v-if="props.variant === 'menu'">
    <div :id="`${props.id}-activator`" :data-dropdown-toggle="props.id">
      <slot name="activator" />
    </div>

    <div :id="`${props.id}`" class="z-10 px-3 hidden">
      <div class="bg-white rounded-lg border shadow-sm">
        <div :aria-labelledby="`${props.id}-activator`" class="divide-y">
          <slot name="content" :close="hideDropdown" />
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="flex flex-col items-start w-full space-y-1">
      <label
        v-if="props.label"
        :for="props.id"
        class="mb-1.5 text-sm font-[600] text-gray-700"
      >
        {{ props.label }}
        <span v-if="props.required" class="text-error-500">*</span>
      </label>

      <div :class="containerClasses">
        <select
          :id="props.id || undefined"
          :value="props.modelValue"
          :disabled="props.disabled"
          :multiple="props.multiple"
          :class="selectClasses"
          @focusin="isFocused = true"
          @focusout="isFocused = false"
          @change="handleChange"
        >
          <option
            v-if="!props.multiple"
            disabled
            :value="''"
            :selected="!props.modelValue"
          >
            {{ props.placeholder }}
          </option>
          <option
            v-for="option in props.options"
            :key="option.id"
            :value="option.id"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
  </template>
</template>

<style scoped></style>
