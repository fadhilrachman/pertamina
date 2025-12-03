<script setup lang="ts">
import { computed } from "vue";
import Logo from "~/assets/image/logo-pertamina-drilling.png";

const { data } = useAuth();

const displayName = computed(() => {
  const raw = (data.value as any)?.data;
  return raw?.user?.name || raw?.user?.email || "Test Admin";
});

const displayRole = computed(() => "Admin");
</script>

<template>
  <nav
    class="fixed w-full z-0 bg-white border-b px-6 md:pr-8 md:pl-[300px] h-[60px] flex items-center justify-between"
  >
    <div class="flex items-center gap-4 whitespace-nowrap">
      <img :src="Logo" alt="Pertamina Drilling logo" class="h-7 w-auto" />
      <div class="h-6 border-l border-gray-300" />
      <h3 class="font-semibold text-gray-700 pl-1">
        Inventory Management System
      </h3>
    </div>

    <div class="flex items-center space-x-4">
      <!-- <GeneralTextInput
        class="w-[400px] placeholder:text-neutral-400"
        :clearable="true"
        placeholder="Search SKU, Warehouse, or Transaction..."
      /> -->
      <div class="flex items-center space-x-4">
        <IconsBell size="18" class="stroke-neutral-600" />

        <div class="flex items-center space-x-3">
          <div
            class="bg-blue-600 h-9 w-9 rounded-full flex items-center justify-center"
          >
            <IconsUser size="18" class="stroke-white" />
          </div>
          <div class="text-left hidden sm:block">
            <p class="text-sm font-semibold text-gray-900 leading-tight">
              {{ displayName }}
            </p>
            <p class="text-xs text-gray-500 leading-tight">
              {{ displayRole }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
