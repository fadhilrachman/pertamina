import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";

import { toast } from "vue3-toastify";
import { DATA_SKU } from "../../dummy.json";
import { defineStore } from "pinia";
import type {
  FacilitiesSkuType,
  PayloadFacilitiesSkuType,
} from "~/types/facilities-sku-type";
import {
  deleteFacilitiesSku,
  getFacilitiesSku,
  postFacilitiesSku,
  putFacilitiesSku,
} from "~/services/master-data/facilities-sku-services";

export const useFacilitiesSkuStore = defineStore("facilitiesSku", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    data: {} as ResponseApi<FacilitiesSkuType> | null,
    dataDetail: {} as ResponseApiDetail<FacilitiesSkuType>,
    selectedData: {} as FacilitiesSkuType,
  }),
  actions: {
    setSelectedData(data: FacilitiesSkuType) {
      this.selectedData = data;
    },
    async getDataFacilitiesSku(
      params: QueryParams & {
        search?: string;
        status?: string;
        facility_id: string;
      }
    ) {
      this.loadingList = true;
      try {
        const data = await getFacilitiesSku(params); // API_UNCOMMENT
        this.data = data; // API_UNCOMMENT
        // this.data = {
        //   // count: 10,
        //   data: {
        //     data: DATA_SKU,
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
        this.data = null;
        if (!params.facility_id) return null;
        toast.error("Failed get data SKU", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingList = false;
      }
    },

    async getDataDetailFacilitiesSku({ id }: { id: string }) {
      this.loadingDetail = true;
      try {
        // const { data } = await getSkuDetail({ id }); // API_UNCOMMENT
        // this.dataDetail = data;
      } catch (error) {
        toast.error("Failed get data SKU", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingDetail = false;
      }
    },

    async createDataFacilitiesSku(
      body: PayloadFacilitiesSkuType & { facility_id: string }
    ) {
      this.loadingWrite = true;
      try {
        await postFacilitiesSku(body); // API_UNCOMMENT
        toast.success("Success assign data SKU to Facilities");
        return true;
      } catch (error) {
        toast.error("Failed assign data SKU to Facilities", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async updateDataFacilitiesSku(
      body: PayloadFacilitiesSkuType & { facility_id: string } & { id: string }
    ) {
      this.loadingWrite = true;
      try {
        await putFacilitiesSku(body); // API_UNCOMMENT
        toast.success("Success update data SKU");
        return true;
      } catch (error) {
        toast.error("Failed update data SKU", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async deleteDataFacilitiesSku({
      id,
      facility_id,
    }: {
      id: string;
      facility_id: string;
    }) {
      this.loadingWrite = true;
      try {
        await deleteFacilitiesSku({ id, facility_id }); // API_UNCOMMENT
        toast.success("Success delete data SKU");
        return true;
      } catch (error) {
        toast.error("Failed delete data SKU", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },
  },
});
