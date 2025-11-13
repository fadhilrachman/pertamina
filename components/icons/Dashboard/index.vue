<script setup lang="ts">
const props = defineProps({
  size: {
    type: String,
    default: "24",
  },
  class: {
    type: String,
    default: "stroke-gray-400",
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
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke-width="1.8" />
    <rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5" stroke-width="1.8" />
    <rect x="13.5" y="10" width="7" height="10.5" rx="1.5" stroke-width="1.8" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke-width="1.8" />
  </svg>
</template>

<style scoped></style>
