import type { QueryParams, ResponseApi } from "~/types/common";
import {
  deleteVehicles,
  getVehicles,
  getVehiclesDetail,
  postVehicles,
  putVehicles,
} from "../../services/master-data/vehicles-services";
import { toast } from "vue3-toastify";
import { DATA_VEHICLES } from "../../dummy.json";
import { defineStore } from "pinia";

export const useVehiclesStore = defineStore("Vehicles", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    data: {} as ResponseApi<any>,
    dataDetail: {},
  }),
  actions: {
    async getDataVehicles(params: QueryParams) {
      this.loadingList = true;
      try {
        // const { data } = await getVehicles(params);
        this.data = {
          count: 10,
          result: DATA_VEHICLES,
          total_pages: 1,
        };
      } catch (error) {
        toast.error("Failed get data Vehicles", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingList = false;
      }
    },

    async getDataDetailVehicles({ id }: { id: string }) {
      this.loadingDetail = true;
      try {
        const { data } = await getVehiclesDetail({ id });
        this.dataDetail = data;
      } catch (error) {
        toast.error("Failed get data Vehicles", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingDetail = false;
      }
    },

    async createDataVehicles(body: any) {
      this.loadingWrite = true;
      try {
        await postVehicles(body);
        toast.success("Success create data Vehicles");
        return true;
      } catch (error) {
        toast.error("Failed create data Vehicles", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async updateDataVehicles(body: any) {
      this.loadingWrite = true;
      try {
        await putVehicles(body);
        toast.success("Success update data Vehicles");
        return true;
      } catch (error) {
        toast.error("Failed update data Vehicles", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async deleteDataVehicles({ id }: { id: string }) {
      this.loadingWrite = true;
      try {
        await deleteVehicles({ id });
        toast.success("Success delete data Vehicles");
        return true;
      } catch (error) {
        toast.error("Failed delete data Vehicles", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },
  },
});
