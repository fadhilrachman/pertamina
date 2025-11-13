<script setup lang="ts">
import { useActiveRoute } from "@/composables/useActiveRoute";
import { sidebarMenu } from "@/constant/sidebar";
import type { IChildSidebar, ISidebar } from "@/types/sidebar";

const { data } = useAuth();
const route = useRoute();
const { isActive } = useActiveRoute();

let menuData = reactive(sidebarMenu);

const emit = defineEmits(["on-mounted", "on-click-close-sidebar"]);

const isParentRouteActive = (destination: string) => {
  if (!destination) {
    return false;
  }
  return route.path.startsWith(destination);
};

const getMenuActiveClass = (destination: string) => {
  const base =
    "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm  transition-colors";
  const state = isParentRouteActive(destination)
    ? "bg-primary-50 text-primary-700"
    : "hover:bg-gray-100 hover:text-gray-900";
  return `${base} ${state}`;
};

const getIconMenuActive = (destination: string) => {
  return isParentRouteActive(destination)
    ? "stroke-primary-700"
    : "stroke-gray-500";
};

const getActiveClass = (route: string) => {
  return isActive(route) ? "stroke-primary-700" : "stroke-gray-500";
};

const toggleMenu = (index: number) => {
  menuData[index].isOpen = !menuData[index].isOpen;
};

const getIconWrapperClass = (destination: string) => {
  const base =
    "flex h-6 w-6 items-center justify-center rounded-2xl  transition-colors";
  const active = destination && isActive(destination);
  return active ? `${base} border-primary-200 bg-primary-50` : `${base} `;
};

const getParentIconWrapperClass = (destination: string) => {
  const base =
    "flex h-6 w-6 items-center justify-center rounded-2xl  transition-colors";
  return isParentRouteActive(destination)
    ? `${base} border-primary-200 bg-primary-50`
    : `${base} `;
};

const getChevronIconClass = (menuItem: ISidebar) => {
  const base = "h-4 w-4 transition-transform duration-200";
  const rotation = menuItem.isOpen ? "rotate-180" : "";
  const state = getIconMenuActive(menuItem?.startWith || "");
  return `${base} ${rotation} ${state}`.trim();
};

watchEffect(() => {
  menuData = menuData.map((menuItem: ISidebar) => {
    if (menuItem.menu && menuItem.menu.length > 0) {
      menuItem.menu.map((subMenu: IChildSidebar) => {
        if (route.path.includes(subMenu.route)) {
          menuItem.isOpen = true;
        }
      });
    }
    return menuItem;
  });
});
</script>

<template>
  <aside
    class="w-full h-full space-y-6 md:w-[280px] fixed top-0 left-0 border-r border-gray-100 overflow-y-auto z-40 bg-white transition-transform -translate-x-full text-gray-500 md:translate-x-0"
  >
    <div
      class="flex h-[60px] items-center border-b justify-between gap-3 py-3 px-4"
    >
      <NuxtLink to="/" class="flex items-center gap-3">
        <img
          src="/images/logo-pertamina.svg"
          alt="Pertamina logo"
          class="w-14"
        />
        <div class="leading-tight">
          <p
            class="text-sm font-semibold uppercase tracking-wide text-gray-900"
          >
            LOGO
          </p>
          <p class="text-[11px] uppercase tracking-[0.2em] text-gray-500">
            Lorem, ipsum dolor.
          </p>
        </div>
      </NuxtLink>
      <button
        class="md:hidden h-9 w-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-gray-700"
        @click="emit('on-click-close-sidebar')"
      >
        <IconsClose class="stroke-current" />
      </button>
    </div>

    <div class="px-4">
      <ul class="space-y-2">
        <li v-for="(menuItem, index) in menuData" :key="menuItem.id">
          <template v-if="menuItem.menu && menuItem.menu.length > 0">
            <button
              class="w-full flex items-center justify-between text-sm"
              :class="getMenuActiveClass(menuItem?.startWith || '')"
              @click="toggleMenu(index)"
            >
              <div class="flex items-center gap-3">
                <span
                  :class="getParentIconWrapperClass(menuItem?.startWith || '')"
                >
                  <component
                    :is="menuItem.icon"
                    :class="getIconMenuActive(menuItem?.startWith || '')"
                  />
                </span>
                <span class="text-sm">{{ menuItem?.label }}</span>
              </div>
              <IconsChevronDown :class="getChevronIconClass(menuItem)" />
            </button>

            <ul v-show="menuItem.isOpen" class="space-y-1 mt-2 pl-4">
              <li v-for="subMenuItem in menuItem.menu" :key="subMenuItem.id">
                <AppNavigationLink
                  class="pl-4"
                  :id="subMenuItem.id"
                  :name="subMenuItem.label"
                  :destination="subMenuItem.route"
                >
                  <template #icon>
                    <span :class="getIconWrapperClass(subMenuItem.route)">
                      <component
                        :is="subMenuItem.icon"
                        :class="getActiveClass(subMenuItem.route)"
                      />
                    </span>
                  </template>
                </AppNavigationLink>
              </li>
            </ul>
          </template>

          <AppNavigationLink
            v-else
            :id="menuItem.id"
            :name="menuItem.label"
            :destination="menuItem.route"
          >
            <template #icon>
              <span :class="getIconWrapperClass(menuItem.route || '')">
                <component
                  :is="menuItem.icon"
                  :class="getActiveClass(menuItem.route || '')"
                />
              </span>
            </template>
          </AppNavigationLink>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped></style>
