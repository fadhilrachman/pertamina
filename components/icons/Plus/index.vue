<script setup lang="ts">
const props = defineProps({
  size: {
    type: String,
    default: "24",
  },
  class: {
    type: String,
    default: "text-gray-900",
  },
});
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="props.size"
    :height="props.size"
    :class="props.class"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      fill="currentColor"
      d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"
    />
  </svg>
</template>

<style scoped></style>
