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
      d="M4.5 10.5h15V19a2.5 2.5 0 0 1-2.5 2.5h-10A2.5 2.5 0 0 1 4.5 19z"
      stroke-width="1.8"
      stroke-linejoin="round"
    />
    <path d="M3 10.5h18" stroke-width="1.8" stroke-linecap="round" />
    <path d="M12 4v7" stroke-width="1.8" stroke-linecap="round" />
    <path
      d="m9.5 9 2.5 2.5L14.5 9"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped></style>
