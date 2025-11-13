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
    <path
      d="M3 10.5 12 4l9 6.5V20a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z"
      stroke-width="1.8"
      stroke-linejoin="round"
    />
    <path d="M3 10.5h18" stroke-width="1.8" stroke-linecap="round" />
    <path d="M9 16h6" stroke-width="1.8" stroke-linecap="round" />
  </svg>
</template>

<style scoped></style>
