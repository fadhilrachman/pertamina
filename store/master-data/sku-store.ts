import type { QueryParams, ResponseApi } from "~/types/common";
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

export const useSkuStore = defineStore("sku", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    data: {} as ResponseApi<any>,
    dataDetail: {},
  }),
  actions: {
    async getDataSku(params: QueryParams) {
      this.loadingList = true;
      try {
        // const { data } = await getSku(params);
        this.data = {
          count: 10,
          result: DATA_SKU,
          total_pages: 1,
        };
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
        const { data } = await getSkuDetail({ id });
        this.dataDetail = data;
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
        await postSku(body);
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
        await putSku(body);
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
        await deleteSku({ id });
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
