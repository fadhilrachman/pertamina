<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useAuthStore } from "~/store/auth";
import { usePageStore } from "~/store/page";
import type { ElementEvent } from "~/types/element";

const $auth = useAuthStore();
const $router = useRouter();
const $page = usePageStore();
const { data } = useAuth();

const emit = defineEmits(["on-click-open-sidebar"]);
const modalLogout = ref<ElementEvent | null>(null);
const isProfileOpen = ref(false);

const handleLogoutModalMounted = (instance: ElementEvent) => {
  modalLogout.value = instance;
};

const closeLogoutModal = () => {
  modalLogout.value?.hide();
};

const openLogoutModal = () => {
  modalLogout.value?.show();
};

const toggleProfileMenu = () => {
  isProfileOpen.value = !isProfileOpen.value;
};

const closeProfileMenu = () => {
  isProfileOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  const trigger = document.getElementById("profile-menu-trigger");
  const dropdown = document.getElementById("profile-menu-dropdown");
  const target = event.target as Node | null;

  if (!trigger || !dropdown || !target) return;

  if (!trigger.contains(target) && !dropdown.contains(target)) {
    isProfileOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

async function logout() {
  $auth.logout().then(() => {
    window.location.href = "/login";
  });
}
</script>

<template>
  <GeneralModalConfirmation
    id="modal-logout"
    title="Confirm Logout"
    subtitle="Are you sure you want to log out? This will end your current session. Press 'Log out' to continue."
    confirm-label="Log Out"
    :is-loading="$auth.isLoading"
    @mounted="handleLogoutModalMounted"
    @negative="closeLogoutModal"
    @positive="logout()"
  >
    <template #icon>
      <IconsInfo class="stroke-red-500" size="32" />
    </template>
  </GeneralModalConfirmation>

  <div class="w-full flex items-center justify-between">
    <div class="flex items-center">
      <!-- burger menu -->
      <GeneralIconButton
        class="block md:hidden mr-4"
        @click="emit('on-click-open-sidebar')"
      >
        <template #icon>
          <IconsMenu />
        </template>
      </GeneralIconButton>

      <slot name="header" />

      <h1 v-if="!$slots.header" class="text-2xl font-[600]">
        {{ $page.$state.title }}
      </h1>
    </div>

    <div class="flex items-center space-x-4">
      <div v-if="data" class="relative">
        <button
          id="profile-menu-trigger"
          type="button"
          class="flex items-center space-x-3 focus:outline-none"
          @click.stop="toggleProfileMenu"
        >
          <general-avatar :src="null" />
          <div class="text-left">
            <p class="text-base text-black font-[600] mb-1">Test Admin</p>
            <p class="text-sm font-[400] text-gray-500">
              {{ capitalizeString("admin", "_") }}
            </p>
          </div>
        </button>

        <div
          v-if="isProfileOpen"
          id="profile-menu-dropdown"
          class="absolute right-0 mt-2 w-48 rounded-lg border bg-white py-2 shadow-lg z-50"
        >
          <button
            type="button"
            class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            @click="
              () => {
                closeProfileMenu();
                $router.push('/change-password');
              }
            "
          >
            <IconsSettings size="16" class="mr-2 stroke-gray-700" />
            <span>Change Password</span>
          </button>

          <button
            type="button"
            class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            @click="
              () => {
                closeProfileMenu();
                openLogoutModal();
              }
            "
          >
            <IconsLogout size="16" class="mr-2 stroke-gray-700" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
