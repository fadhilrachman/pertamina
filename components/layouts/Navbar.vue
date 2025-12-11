<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import Logo from "~/assets/image/logo-pertamina-drilling.png";
import type { SessionResponseType } from "~/types/user-type";
import { useAuthStore } from "~/store/auth";

const { data } = useAuth();
const $auth = useAuthStore();

const sessionData = computed<SessionResponseType | null>(() => {
  return (data.value as SessionResponseType | null) ?? null;
});

const displayName = computed(() => {
  const session = sessionData.value;
  if (!session?.data) return "User";

  const { first_name, last_name, email } = session.data;
  const fullName = [first_name, last_name].filter(Boolean).join(" ");

  return fullName || email || "User";
});

const displayRole = computed(() => {
  const session = sessionData.value;
  return session?.data?.role?.name || "User";
});

const displayEmail = computed(() => {
  const session = sessionData.value;
  return session?.data?.email || "";
});

const isProfileOpen = ref(false);

const toggleProfileMenu = () => {
  isProfileOpen.value = !isProfileOpen.value;
};

const closeProfileMenu = () => {
  isProfileOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  const trigger = document.getElementById("navbar-profile-trigger");
  const dropdown = document.getElementById("navbar-profile-dropdown");
  const target = event.target as Node | null;

  if (!trigger || !dropdown || !target) return;

  if (!trigger.contains(target) && !dropdown.contains(target)) {
    closeProfileMenu();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

async function handleLogout() {
  await $auth.logout();
}
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
        <!-- <IconsBell size="18" class="stroke-neutral-600" /> -->

        <div class="relative">
          <button
            id="navbar-profile-trigger"
            type="button"
            class="flex items-center space-x-3 focus:outline-none"
            @click.stop="toggleProfileMenu"
          >
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
              <p
                v-if="displayEmail"
                class="text-xs text-gray-400 leading-tight truncate max-w-[180px]"
              >
                {{ displayEmail }}
              </p>
            </div>
          </button>

          <div
            v-if="isProfileOpen"
            id="navbar-profile-dropdown"
            class="absolute right-0 mt-2 w-64 rounded-lg border bg-white py-2 shadow-lg z-50"
          >
            <div class="px-4 pb-2 border-b border-gray-100">
              <p class="text-sm font-semibold text-gray-900">
                {{ displayName }}
              </p>
              <p v-if="displayRole" class="text-xs text-gray-500">
                {{ displayRole }}
              </p>
              <p v-if="displayEmail" class="text-xs text-gray-400 truncate">
                {{ displayEmail }}
              </p>
            </div>
            <button
              type="button"
              class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              @click="handleLogout"
            >
              <IconsLogout size="16" class="mr-2 stroke-gray-700" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
