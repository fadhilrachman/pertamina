<script setup lang="ts">
const props = defineProps<{
  text: string;
}>();
</script>

<template>
  <p class="text-gray-500 text-sm">
    {{ props.text }}
  </p>
</template>

<style scoped></style>

