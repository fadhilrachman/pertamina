import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";
import {
  deleteSku,
  getSku,
  getSkuDetail,
  postSku,
  putSku,
} from "../../services/master-data/sku-services";
import { toast } from "vue3-toastify";
import { DATA_SKU } from "../../dummy.json";
import { defineStore } from "pinia";
import type { SKUType } from "~/types/sku-type";

export const useSkuStore = defineStore("sku", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    data: {} as ResponseApi<SKUType>,
    dataDetail: {} as ResponseApiDetail<SKUType>,
    selectedData: {} as SKUType,
  }),
  actions: {
    setSelectedData(data: SKUType) {
      this.selectedData = data;
    },
    async getDataSku(
      params: QueryParams & { search?: string; status?: string }
    ) {
      this.loadingList = true;
      try {
        const data = await getSku(params); // API_UNCOMMENT
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
        toast.error("Failed get data SKU", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingList = false;
      }
    },

    async getDataDetailSku({ id }: { id: string }) {
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

    async createDataSku(body: any) {
      this.loadingWrite = true;
      try {
        await postSku(body); // API_UNCOMMENT
        toast.success("Success create data SKU");
        return true;
      } catch (error) {
        toast.error("Failed create data SKU", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async updateDataSku(body: any) {
      this.loadingWrite = true;
      try {
        await putSku(body); // API_UNCOMMENT
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

    async deleteDataSku({ id }: { id: string }) {
      this.loadingWrite = true;
      try {
        await deleteSku({ id }); // API_UNCOMMENT
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
