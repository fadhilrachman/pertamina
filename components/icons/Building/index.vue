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
      d="M5 21V5.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V21"
      stroke-width="1.8"
      stroke-linejoin="round"
    />
    <path
      d="M3 21h18"
      stroke-width="1.8"
      stroke-linecap="round"
    />
    <path
      d="M9 9h2M13 9h2M9 13h2M13 13h2M9 17h6"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped></style>
