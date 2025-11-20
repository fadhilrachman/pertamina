import {
  IconsBuilding,
  IconsCube,
  IconsDashboard,
  IconsDatabase,
  IconsSku,
  IconsStockAdjustment,
  IconsStockIn,
  IconsStockOut,
  IconsTransactions,
  IconsTruck,
  IconsUser,
  IconsUserRole,
  IconsWarehouse,
} from "#components";
import type { ISidebar } from "@/types/sidebar";
import { markRaw } from "vue";

export const sidebarMenu: ISidebar[] = [
  {
    id: "menu__dashboard",
    label: "Dashboard",
    route: "/dashboard",
    icon: markRaw(IconsDashboard),
    active: false,
  },
  {
    id: "menu__companies",
    label: "Company",
    route: "/company",
    icon: markRaw(IconsBuilding),
  },
  {
    label: "User Management",
    icon: markRaw(IconsUser),
    id: "menu__user-management",
    startWith: "/user-management",
    isOpen: false,
    menu: [
      {
        label: "User",
        id: "menu__user-management",
        route: "/user-management/user",
        icon: markRaw(IconsUser),
      },
      {
        label: "Roles",
        id: "menu__user-management",
        route: "/user-management/roles",
        icon: markRaw(IconsUserRole),
      },
    ],
  },
  {
    label: "Stock Management",
    icon: markRaw(IconsCube),
    id: "menu__stock-management",
    startWith: "/stock-management",
    isOpen: false,
    menu: [
      {
        label: "Stock In",
        id: "menu__stock-management-in",
        route: "/stock-management/stock-in",
        icon: markRaw(IconsStockIn),
      },
      {
        label: "Stock Out",
        route: "/stock-management/stock-out",
        id: "menu__stock-management-out",
        icon: markRaw(IconsStockOut),
      },
      {
        label: "Stock Adjustment",
        route: "/stock-management/stock-adjustment",
        id: "menu__stock-management-adjustment",
        icon: markRaw(IconsStockAdjustment),
      },
    ],
  },

  {
    id: "menu__onhand",
    label: "On-hand Stock",
    route: "/on-hand-stock",
    icon: markRaw(IconsWarehouse),
  },
  {
    label: "Master Data",
    icon: markRaw(IconsDatabase),
    id: "menu__master-data",
    startWith: "/master-data",
    isOpen: false,
    menu: [
      {
        label: "SKU",
        id: "menu__master-sku",
        route: "/master-data/sku",
        icon: markRaw(IconsSku),
      },
      {
        label: "Facilities / Warehouses",
        id: "menu__master-facilities",
        route: "/master-data/facilities",
        icon: markRaw(IconsBuilding),
      },
      {
        label: "Vehicles",
        id: "menu__master-vehicles",
        route: "/master-data/vehicles",
        icon: markRaw(IconsTruck),
      },
    ],
  },
];
