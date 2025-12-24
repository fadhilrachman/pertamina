<script setup lang="ts">
import { useActiveRoute } from "@/composables/useActiveRoute";
import { sidebarMenu } from "@/constant/sidebar";
import type { IChildSidebar, ISidebar } from "@/types/sidebar";
import type { SessionResponseType } from "~/types/user-type";
import Logo from "~/assets/image/logo-pertamina-drilling.png";
const { data } = useAuth();
const route = useRoute();
const { isActive } = useActiveRoute();

const menuData = reactive<ISidebar[]>(
  sidebarMenu.map((item) => ({
    ...item,
    menu: item.menu ? [...item.menu] : undefined,
  }))
);

const sessionRoleName = computed(() => {
  const raw = data.value as SessionResponseType | null;
  return raw?.data?.role?.name || "";
});

const sessionData = computed<SessionResponseType | null>(() => {
  return (data.value as SessionResponseType | null) ?? null;
});

const normalizedRole = computed(() => sessionRoleName.value.toLowerCase());

const isAdministrator = computed(() => normalizedRole.value === "superadmin");

const emit = defineEmits(["on-mounted", "on-click-close-sidebar"]);

const isParentRouteActive = (destination: string) => {
  if (!destination) {
    return false;
  }
  return route.path.startsWith(destination);
};

const isMenuActive = (menuItem: ISidebar) => {
  const destination = menuItem?.startWith || "";
  const byStartWith = destination ? route.path.startsWith(destination) : false;
  const byChild =
    menuItem?.menu?.some((child) => route.path.startsWith(child.route)) ||
    false;
  return byStartWith || byChild;
};

const getMenuActiveClass = (menuItem: ISidebar) => {
  const base =
    "w-full flex whitespace-nowrap items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors";
  const state = isMenuActive(menuItem)
    ? "bg-primary-50 text-primary-600"
    : "hover:bg-gray-100 hover:text-gray-900";
  return `${base} ${state}`;
};

const getIconMenuActive = (menuItem: ISidebar) => {
  return isMenuActive(menuItem) ? "stroke-primary-600" : "stroke-gray-700";
};

const getActiveClass = (route: string) => {
  return isActive(route) ? "stroke-primary-600" : "stroke-gray-700";
};

const toggleMenu = (item: ISidebar) => {
  item.isOpen = !item.isOpen;
};

const getIconWrapperClass = (destination: string) => {
  const base =
    "flex h-6 w-6 items-center justify-center rounded-2xl  transition-colors";
  const active = destination && isActive(destination);
  return active ? `${base} border-primary-200 bg-primary-50` : `${base} `;
};

const getParentIconWrapperClass = (menuItem: ISidebar) => {
  const base =
    "flex h-6 w-6 items-center whitespace-nowrap justify-center rounded-2xl  transition-colors";
  return isMenuActive(menuItem)
    ? `${base} border-primary-200 bg-primary-50`
    : `${base} `;
};

const getChevronIconClass = (menuItem: ISidebar) => {
  const base = "h-4 w-4 transition-transform duration-200";
  const rotation = menuItem.isOpen ? "rotate-180" : "";
  const state = getIconMenuActive(menuItem);
  return `${base} ${rotation} ${state}`.trim();
};

const filteredMenu = computed(() =>
  menuData.filter((menuItem: ISidebar) => {
    const hiddenRoles = (menuItem.hiddenForRoles || []).map((r) =>
      r.toLowerCase()
    );
    if (hiddenRoles.includes(normalizedRole.value)) {
      return false;
    }

    const visibleFor = menuItem.visibleForRole;
    if (visibleFor === "administrator" && !isAdministrator.value) {
      return false;
    }

    if (visibleFor === "non-administrator" && isAdministrator.value) {
      return false;
    }

    return true;
  })
);

const getVisibleChildren = (menuItem: ISidebar) => {
  const hiddenRoles = (menuItem.hiddenForRoles || []).map((r) =>
    r.toLowerCase()
  );
  const isParentHidden = hiddenRoles.includes(normalizedRole.value);
  if (isParentHidden) return [];

  return (menuItem.menu || []).filter((subMenu) => {
    const hiddenChildRoles = (subMenu.hiddenForRoles || []).map((r) =>
      r.toLowerCase()
    );
    return !hiddenChildRoles.includes(normalizedRole.value);
  });
};

watch(
  () => route.path,
  () => {
    menuData.forEach((menuItem: ISidebar) => {
      if (menuItem.menu && menuItem.menu.length > 0) {
        const hasActiveChild = menuItem.menu.some((subMenu: IChildSidebar) =>
          route.path.startsWith(subMenu.route)
        );
        if (hasActiveChild) {
          menuItem.isOpen = true;
        }
      }
    });
  },
  { immediate: true }
);
</script>

<template>
  <aside
    class="w-full h-full space-y-6 md:w-[280px] pb-10 fixed top-0 left-0 border-r border-gray-100 overflow-y-auto z-40 bg-white transition-transform -translate-x-full text-gray-500 md:translate-x-0"
  >
    <div
      class="flex h-[60px] items-center border-b justify-between gap-3 py-3 px-4"
    >
      <NuxtLink to="/" class="flex items-center gap-3">
        <!-- <img
          src="/images/logo-pertamina.svg"
          alt="Pertamina logo"
          class="w-14"
        /> -->
        <div class="leading-tight">
          <!-- <p
            class="text-sm font-semibold uppercase tracking-wide text-gray-900"
          >
            LOGO
          </p> -->
          <img
            :src="sessionData?.data?.current_company?.logo || Logo"
            alt="Logo"
            class="max-h-[30px]"
          />
          <!-- <p class="text-[11px] uppercase tracking-[0.2em] text-gray-500">
            Lorem, ipsum dolor.
          </p> -->
        </div>
      </NuxtLink>
      <button
        class="md:hidden h-9 w-9 whitespace-nowrap flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-gray-700"
        @click="emit('on-click-close-sidebar')"
      >
        <IconsClose class="stroke-current" />
      </button>
    </div>

    <div class="px-4 whitespace-nowrap">
      <ul class="space-y-2">
        <li v-for="menuItem in filteredMenu" :key="menuItem.id">
          <template v-if="getVisibleChildren(menuItem).length > 0">
            <button
              class="w-full flex items-center justify-between text-sm"
              :class="getMenuActiveClass(menuItem)"
              @click="toggleMenu(menuItem)"
            >
              <div class="flex items-center gap-3">
                <span :class="getParentIconWrapperClass(menuItem)">
                  <component
                    :is="menuItem.icon"
                    :class="getIconMenuActive(menuItem)"
                  />
                </span>
                <span class="text-sm">{{ menuItem?.label }}</span>
              </div>
              <IconsChevronDown :class="getChevronIconClass(menuItem)" />
            </button>

            <ul v-show="menuItem.isOpen" class="space-y-1 mt-2 pl-4">
              <li
                v-for="subMenuItem in getVisibleChildren(menuItem)"
                :key="subMenuItem.id"
              >
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
