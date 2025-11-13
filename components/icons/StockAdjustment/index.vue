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
      d="M15 4h4.5V8.5"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9 20H4.5V15.5"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M19 5 12.5 11.5a2 2 0 0 1-2.828 0L5 6.828"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="m19 18-6.5-6.5a2 2 0 0 0-2.828 0L5 16.172"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped></style>
