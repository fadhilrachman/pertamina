import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";

import { toast } from "vue3-toastify";
import { defineStore } from "pinia";
import {
  getDashboardOverview,
  getDashboardStockDistribution,
  getDashboardTopMovingSku,
} from "~/services/dashboard/dashboard-services";
import type {
  DashboarOverViewType,
  StockDistributionType,
  TopMovingSkuType,
} from "~/types/dashboard-type";

export const useDashboardStore = defineStore("dashboardStore", {
  state: () => ({
    loadingOverview: false,
    loadingStockDistribution: false,
    loadingTopMovingSku: false,
    loadingWrite: false,
    loadingDetail: false,
    dataOverview: {} as ResponseApiDetail<DashboarOverViewType>,
    dataStockDistribution: {} as ResponseApiDetail<StockDistributionType>,
    dataTopMovingSku: {} as ResponseApiDetail<TopMovingSkuType>,
  }),
  actions: {
    async getDataDashboardOverview(params: { facility_id?: string }) {
      this.loadingOverview = true;
      try {
        const data = await getDashboardOverview(params); // API_UNCOMMENT
        this.dataOverview = data; // API_UNCOMMENT
      } catch (error) {
        toast.error("Failed get data overview", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingOverview = false;
      }
    },
    async getDataDashboardStockDistribution(params: { facility_id?: string }) {
      this.loadingStockDistribution = true;
      try {
        const data = await getDashboardStockDistribution(params); // API_UNCOMMENT
        this.dataStockDistribution = data; // API_UNCOMMENT
      } catch (error) {
        toast.error("Failed get data overview", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingStockDistribution = false;
      }
    },
    async getDataDashboardTopMovingSku(params: { facility_id?: string }) {
      this.loadingTopMovingSku = true;
      try {
        const data = await getDashboardTopMovingSku(params); // API_UNCOMMENT
        this.dataTopMovingSku = data; // API_UNCOMMENT
      } catch (error) {
        toast.error("Failed get data SKU", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingTopMovingSku = false;
      }
    },
  },
});
