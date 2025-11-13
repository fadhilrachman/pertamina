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
    <circle cx="7" cy="7" r="3.5" stroke-width="1.8" />
    <circle cx="17" cy="7" r="3.5" stroke-width="1.8" />
    <circle cx="12" cy="17" r="3.5" stroke-width="1.8" />
    <path
      d="M9.5 8.5 10.8 10M14.5 8.5 13.2 10M12 13.5v1"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped></style>
