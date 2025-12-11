import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import type { ResponseApiDetail } from "~/types/common";
import type { SuperadminDashboardType } from "~/types/superadmin-dashboard-type";
import {
  getSuperadminDashboard,
  type SuperadminDashboardParams,
} from "~/services/superadmin/dashboard-services";

export const useSuperadminDashboardStore = defineStore(
  "superadminDashboard",
  {
    state: () => ({
      loadingDashboard: false,
      dataDashboard: {} as ResponseApiDetail<SuperadminDashboardType>,
    }),
    actions: {
      async getDashboard(params: SuperadminDashboardParams) {
        this.loadingDashboard = true;
        try {
          const data = await getSuperadminDashboard(params);
          this.dataDashboard = data;
        } catch (error) {
          toast.error("Failed get superadmin dashboard", {
            toastClassName: "toastify-error",
          });
          throw error;
        } finally {
          this.loadingDashboard = false;
        }
      },
    },
  }
);

