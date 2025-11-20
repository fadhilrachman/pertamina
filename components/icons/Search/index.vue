<script setup lang="ts">
const props = defineProps({
  size: {
    type: String,
    default: "20",
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
    viewBox="0 0 24 24"
    fill="none"
    :class="props.class"
  >
    <circle
      cx="11"
      cy="11"
      r="6.5"
      stroke="currentColor"
      stroke-width="1.8"
    />
    <path
      d="m16.5 16.5 4 4"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped></style>
