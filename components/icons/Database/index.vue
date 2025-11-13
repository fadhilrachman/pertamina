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
    <ellipse
      cx="12"
      cy="6"
      rx="7.5"
      ry="3.5"
      stroke-width="1.8"
    />
    <path
      d="M4.5 6v6c0 1.933 3.357 3.5 7.5 3.5s7.5-1.567 7.5-3.5V6"
      stroke-width="1.8"
    />
    <path
      d="M4.5 12v6c0 1.933 3.357 3.5 7.5 3.5s7.5-1.567 7.5-3.5v-6"
      stroke-width="1.8"
    />
  </svg>
</template>

<style scoped></style>
