<script setup lang="ts">
import { useActiveRoute } from "@/composables/useActiveRoute";
const { isActive } = useActiveRoute();

const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  destination: {
    type: String,
    default: "#",
  },
  name: {
    type: String,
    default: "",
  },
});

const router = useRouter();

const linkClass = computed((): string => {
  const active = isActive(props.destination || "");
  const base =
    "py-2 px-3 gap-3 flex w-full items-center rounded-lg text-sm font-medium text-gray-700 transition-colors";
  const state = active
    ? "bg-primary-50 text-primary-600"
    : "hover:bg-gray-100 hover:text-gray-900";
  return `${base} ${state}`;
});

const handleNavigate = () => {
  if (!props.destination) return;
  if (router.currentRoute.value.path === props.destination) return;
  router.push(props.destination);
};
</script>

<template>
  <button
    :id="props.id"
    type="button"
    :class="linkClass"
    @click="handleNavigate"
  >
    <slot name="icon" />
    <span>{{ props.name }}</span>
  </button>
</template>

<style scoped></style>
