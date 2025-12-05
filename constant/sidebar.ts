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
    visibleForRole: "non-administrator",
  },
  // {
  //   id: "menu__superadmin-companies",
  //   label: "Company (Superadmin)",
  //   route: "/superadmin/company",
  //   icon: markRaw(IconsBuilding),
  // },
  {
    label: "User Management",
    icon: markRaw(IconsUser),
    id: "menu__user-management",
    startWith: "/user-management",
    isOpen: false,
    visibleForRole: "non-administrator",
    menu: [
      {
        label: "User",
        id: "menu__user-management",
        route: "/user-management/user",
        icon: markRaw(IconsUser),
      },
      // {
      //   label: "Roles",
      //   id: "menu__user-management",
      //   route: "/user-management/roles",
      //   icon: markRaw(IconsUserRole),
      // },
    ],
  },
  {
    label: "User Management ", // (Superadmin)
    icon: markRaw(IconsUser),
    id: "menu__superadmin",
    startWith: "/superadmin",
    isOpen: false,
    visibleForRole: "administrator",
    menu: [
      {
        label: "Companies",
        id: "menu__superadmin-companies",
        route: "/superadmin/company",
        icon: markRaw(IconsBuilding),
      },
      {
        label: "Users",
        id: "menu__superadmin-users",
        route: "/superadmin/user",
        icon: markRaw(IconsUser),
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
      // {
      //   label: "Stock",
      //   id: "menu__stock-management-stock",
      //   route: "/stock-management/stock",
      //   icon: markRaw(IconsStockIn),
      // },
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

      {
        label: "Transactions",
        route: "/stock-management/transactions",
        id: "menu__stock-management-transactions",
        icon: markRaw(IconsTransactions),
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
    label: "Warehouses",
    id: "menu__warehouses",
    route: "/warehouse",
    icon: markRaw(IconsBuilding),
  },

  // {
  //   label: "Master Data",
  //   icon: markRaw(IconsDatabase),
  //   id: "menu__master-data",
  //   startWith: "/master-data",
  //   isOpen: false,
  //   menu: [
  //     {
  //       label: "SKU",
  //       id: "menu__master-sku",
  //       route: "/master-data/sku",
  //       icon: markRaw(IconsSku),
  //     },
  //     {
  //       label: "Facilities / Warehouses",
  //       id: "menu__master-facilities",
  //       route: "/master-data/facilities",
  //       icon: markRaw(IconsBuilding),
  //     },

  //     {
  //       label: "Facilities SKU",
  //       id: "menu__master-facilities-sku",
  //       route: "/master-data/facilities-sku",
  //       icon: markRaw(IconsTruck),
  //     },
  //     // {
  //     //   label: "Vehicles",
  //     //   id: "menu__master-vehicle",
  //     //   route: "/master-data/vehicles",
  //     //   icon: markRaw(IconsTruck),
  //     // },
  //   ],
  // },
];
