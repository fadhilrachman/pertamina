<script setup lang="ts">
import { computed } from "vue";
import Loading from "~/components/icons/Loading/index.vue";

const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  type: {
    type: String as () => "button" | "submit" | "reset",
    default: "button",
  },
  label: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String as () => "primary" | "success" | "info" | "warning" | "error",
    default: "primary",
  },
  size: {
    type: String as () => "sm" | "md" | "lg" | "xs",
    default: "md",
  },
  form: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "on-click"): void;
}>();

const buttonClass = computed((): string => {
  const baseClass =
    "font-light text-white stroke-white rounded-lg flex items-center justify-center transition";
  const hoverClass = props.disabled || props.loading ? "" : bgButtonHover.value;
  const disabled = props.disabled ? bgColorDisabled.value : bgColor.value;
  const cursor =
    props.disabled || props.loading ? "cursor-not-allowed" : "cursor-pointer";
  return `${baseClass} ${sizeClass.value} ${disabled} ${cursor} ${hoverClass}`;
});

const variant = {
  primary: "bg-primary-500 ",
  success: "bg-success-500 ",
  info: "bg-info-500 ",
  warning: "bg-warning-500 ",
  error: "bg-error-700 ",
};

const variantDisabled = {
  primary: "bg-primary-300 ",
  success: "bg-success-300 ",
  info: "bg-info-300 ",
  warning: "bg-warning-300 ",
  error: "bg-error-300 ",
};

const variantHover = {
  primary: "hover:bg-primary-400 ",
  success: "hover:bg-success-400 ",
  info: "hover:bg-info-400 ",
  warning: "hover:bg-warning-400 ",
  error: "hover:bg-error-400 ",
};

const bgColor = computed(() => {
  return variant[props.color];
});

const bgColorDisabled = computed(() => {
  return variantDisabled[props.color];
});

const bgButtonHover = computed(() => {
  return variantHover[props.color];
});

const sizeClass = computed(() => {
  const sizes: Record<"sm" | "md" | "lg" | "xs", string> = {
    xs: "py-1.5 px-2 text-xs",
    sm: "py-2 px-3 text-xs",
    md: "py-2.5 px-3.5 text-sm",
    lg: "py-3 px-4 text-base",
  };

  return sizes[props.size];
});
</script>

<template>
  <button
    :id="props.id"
    :type="type"
    :form="props.form || undefined"
    :disabled="props.disabled"
    :class="buttonClass"
    @click="emit('on-click')"
  >
    <Loading v-if="props.loading" />
    <span v-else class="flex items-center gap-2">
      <slot name="prefix" />
      <span>{{ props.label }}</span>
      <slot name="suffix" />
    </span>
  </button>
</template>

<style scoped></style>
