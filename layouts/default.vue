<script setup lang="ts">
import type { DrawerInterface } from "flowbite";

const drawerSidebar = ref<DrawerInterface | null>(null);

const windowWidth = ref(0);

const isMdAndUp = computed((): boolean => {
  return windowWidth.value >= 768;
});

function resizeHandler() {
  if (process.client) {
    windowWidth.value = window.innerWidth;
  }
}

const closeSidebar = () => {
  drawerSidebar.value?.hide();
};

const handleSidebarMounted = (instance: DrawerInterface) => {
  drawerSidebar.value = instance;
};

watch(isMdAndUp, closeSidebar);

onMounted(() => {
  if (process.client) {
    window.addEventListener("resize", resizeHandler);
    windowWidth.value = window.innerWidth;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <LayoutsSidebar
      @on-mounted="handleSidebarMounted"
      @on-click-close-sidebar="closeSidebar"
    />
    <LayoutsNavbar />
    <div class="md:pl-[276px] pt-[60px] min-h-screen w-full">
      <!-- <GeneralButton label="Uhuy" size="sm" /> -->
      <div class="p-6">
        <slot />
      </div>
    </div>
  </div>
</template>
