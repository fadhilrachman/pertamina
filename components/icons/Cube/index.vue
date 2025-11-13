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
      d="M12 3 4 7v10l8 4 8-4V7l-8-4z"
      stroke-width="1.8"
      stroke-linejoin="round"
    />
    <path d="M12 3v18" stroke-width="1.8" stroke-linejoin="round" />
    <path d="m4 7 8 4 8-4" stroke-width="1.8" stroke-linejoin="round" />
  </svg>
</template>

<style scoped></style>
