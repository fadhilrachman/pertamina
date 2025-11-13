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
      d="M4.5 8.5h15V5a2.5 2.5 0 0 0-2.5-2.5h-10A2.5 2.5 0 0 0 4.5 5z"
      stroke-width="1.8"
      stroke-linejoin="round"
    />
    <path d="M3 8.5h18" stroke-width="1.8" stroke-linecap="round" />
    <path d="M12 20v-7" stroke-width="1.8" stroke-linecap="round" />
    <path
      d="m14.5 15-2.5-2.5L9.5 15"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped></style>
