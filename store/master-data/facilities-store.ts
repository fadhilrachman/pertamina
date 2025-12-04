import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";

import { toast } from "vue3-toastify";
import { DATA_FACILITES } from "../../dummy.json";
import { defineStore } from "pinia";
import type { FacilitiesType } from "~/types/facilities-type";
import {
  deleteFacilities,
  getDetailFacilities,
  getFacilities,
  postFacilities,
  putFacilities,
} from "~/services/master-data/facilities-services";

export const useFacilitiesStore = defineStore("facilities", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    data: {} as ResponseApi<FacilitiesType>,
    dataDetail: {} as ResponseApiDetail<FacilitiesType>,
    selectedData: {} as FacilitiesType,
  }),
  actions: {
    setSelectedData(data: FacilitiesType) {
      this.selectedData = data;
    },
    async getDataFacilities(
      params: QueryParams & { search?: string; status?: string }
    ) {
      this.loadingList = true;
      try {
        const response = await getFacilities(params); // API_UNCOMMENT
        // console.log({ response });

        this.data = response; // API_UNCOMMENT
        // this.data = {
        //   // count: 10,
        //   data: {
        //     data: DATA_FACILITES,
        //     limit: 10,
        //     page: 1,
        //     total: 200,
        //     total_pages: 10,
        //   },
        //   code: 200,
        //   error: "",
        //   message: "Success",
        //   success: true,
        // };
      } catch (error) {
        toast.error("Failed get data facilities", {
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
        const response = await getDetailFacilities({ id: id }); // API_UNCOMMENT
        this.dataDetail = response;
      } catch (error) {
        toast.error("Failed get data facilities", {
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
        await postFacilities(body); // API_UNCOMMENT
        toast.success("Success create data facilities");
        return true;
      } catch (error) {
        toast.error("Failed create data facilities", {
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
        await putFacilities(body); // API_UNCOMMENT
        toast.success("Success update data facilities");
        return true;
      } catch (error) {
        toast.error("Failed update data facilities", {
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
        await deleteFacilities({ id }); // API_UNCOMMENT
        toast.success("Success delete data facilities");
        return true;
      } catch (error) {
        toast.error("Failed delete data facilities", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },
  },
});
