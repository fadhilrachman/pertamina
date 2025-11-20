import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";

import { toast } from "vue3-toastify";
import { DATA_SKU } from "../../dummy.json";
import { defineStore } from "pinia";
import type { CompanyType } from "~/types/company-type";
import {
  deleteCompany,
  getCompany,
  postCompany,
  putCompany,
} from "~/services/company/company-services";

export const useCompanyStore = defineStore("company", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    data: {} as ResponseApi<CompanyType>,
    dataDetail: {} as ResponseApiDetail<CompanyType>,
    selectedData: {} as CompanyType,
  }),
  actions: {
    setSelectedData(data: CompanyType) {
      this.selectedData = data;
    },
    async getDataCompany(
      params: QueryParams & { search?: string; status?: string }
    ) {
      this.loadingList = true;
      try {
        // const { data } = await getCompany(params);  // API_UNCOMMENT
        // this.data = data // API_UNCOMMENT
        this.data = {
          // count: 10,
          data: {
            data: DATA_SKU,
            limit: 10,
            page: 1,
            total: 200,
            total_pages: 10,
          },
          code: 200,
          error: "",
          message: "Success",
          success: true,
        };
      } catch (error) {
        toast.error("Failed get data company", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingList = false;
      }
    },

    async createDataCompany(body: any) {
      this.loadingWrite = true;
      try {
        // await postCompany(body); // API_UNCOMMENT
        toast.success("Success create data company");
        return true;
      } catch (error) {
        toast.error("Failed create data company", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async updateDataCompany(body: any) {
      this.loadingWrite = true;
      try {
        // await putCompany(body); // API_UNCOMMENT
        toast.success("Success update data company");
        return true;
      } catch (error) {
        toast.error("Failed update data company", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async deleteDataCompany({ id }: { id: string }) {
      this.loadingWrite = true;
      try {
        // await deleteCompany({ id }); // API_UNCOMMENT
        toast.success("Success delete data company");
        return true;
      } catch (error) {
        toast.error("Failed delete data company", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },
  },
});
