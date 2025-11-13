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
      d="M6 5h12M6 12h12M6 19h12"
      stroke-width="1.8"
      stroke-linecap="round"
    />
    <path
      d="M7 5v3M7 12v3M7 19v3"
      stroke-width="1.8"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped></style>
