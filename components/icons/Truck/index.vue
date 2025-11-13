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
      d="M3 7h11v10H3z"
      stroke-width="1.8"
      stroke-linejoin="round"
    />
    <path
      d="M14 12h2.5L21 8.5V17h-7"
      stroke-width="1.8"
      stroke-linejoin="round"
    />
    <circle cx="7.5" cy="18.5" r="1.5" fill="none" stroke-width="1.8" />
    <circle cx="17.5" cy="18.5" r="1.5" fill="none" stroke-width="1.8" />
  </svg>
</template>

<style scoped></style>
