<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <div class="space-y-1">
    <h1 class="text-2xl font-bold text-gray-900">
      {{ props.title }}
    </h1>
    <p v-if="props.subtitle" class="text-gray-500 text-sm">
      {{ props.subtitle }}
    </p>
  </div>
</template>

<style scoped></style>
