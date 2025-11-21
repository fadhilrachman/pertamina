import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";

import { toast } from "vue3-toastify";
import { defineStore } from "pinia";
import type { CompanyType } from "~/types/company-type";

import type { StockOnHandType } from "~/types/stock-on-hand-type";
import { getStockOnHand } from "~/services/on-hand-stock/on-hand-stock-services";

export const useStockOnHand = defineStore("stockOnHand", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    data: {} as ResponseApi<StockOnHandType>,
    dataDetail: {} as ResponseApiDetail<CompanyType>,
    selectedData: {} as StockOnHandType,
  }),
  actions: {
    setSelectedData(data: StockOnHandType) {
      this.selectedData = data;
    },
    async getDataStockOnHand(
      params: QueryParams & { search?: string; status?: string }
    ) {
      this.loadingList = true;
      try {
        const response = await getStockOnHand(params); // API_UNCOMMENT
        this.data = response; // API_UNCOMMENT
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
        toast.error("Failed get data stock", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingList = false;
      }
    },
  },
});
