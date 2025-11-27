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
import type { PayloadVehicleType, VehicleType } from "~/types/vehicle-type";

export const useVehiclesStore = defineStore("Vehicles", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    data: {} as ResponseApi<VehicleType>,
    dataDetail: {},
    selectedData: {} as VehicleType,
  }),
  actions: {
    setSelectedData(data: VehicleType) {
      this.selectedData = data;
    },
    async getDataVehicles(params: QueryParams & { facility_id?: string }) {
      this.loadingList = true;
      try {
        const respoonse = await getVehicles(params);
        this.data = respoonse;
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

    async createDataVehicles(body: PayloadVehicleType) {
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

    async updateDataVehicles(body: PayloadVehicleType & { id: string }) {
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
