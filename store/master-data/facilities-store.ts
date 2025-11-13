import type { QueryParams, ResponseApi } from "~/types/common";
import {
  deleteFacilities,
  getFacilities,
  getFacilitiesDetail,
  postFacilities,
  putFacilities,
} from "../../services/master-data/facilities-services";
import { toast } from "vue3-toastify";
import { DATA_FACILITES } from "../../dummy.json";
import { defineStore } from "pinia";

export const useFacilitesStore = defineStore("Facilities", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    data: {} as ResponseApi<any>,
    dataDetail: {},
  }),
  actions: {
    async getDataFacilities(params: QueryParams) {
      this.loadingList = true;
      try {
        // const { data } = await getFacilities(params);
        this.data = {
          count: 10,
          result: DATA_FACILITES,
          total_pages: 1,
        };
      } catch (error) {
        toast.error("Failed get data Facilities", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingList = false;
      }
    },

    async getDataDetailFacilities({ id }: { id: string }) {
      this.loadingDetail = true;
      try {
        const { data } = await getFacilitiesDetail({ id });
        this.dataDetail = data;
      } catch (error) {
        toast.error("Failed get data Facilities", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingDetail = false;
      }
    },

    async createDataFacilities(body: any) {
      this.loadingWrite = true;
      try {
        await postFacilities(body);
        toast.success("Success create data Facilities");
        return true;
      } catch (error) {
        toast.error("Failed create data Facilities", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async updateDataFacilities(body: any) {
      this.loadingWrite = true;
      try {
        await putFacilities(body);
        toast.success("Success update data Facilities");
        return true;
      } catch (error) {
        toast.error("Failed update data Facilities", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async deleteDataFacilities({ id }: { id: string }) {
      this.loadingWrite = true;
      try {
        await deleteFacilities({ id });
        toast.success("Success delete data Facilities");
        return true;
      } catch (error) {
        toast.error("Failed delete data Facilities", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },
  },
});
