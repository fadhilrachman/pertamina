import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";
import type { CompanyType } from "~/types/company-type";
import {
  deleteSuperadminCompany,
  getSuperadminCompanies,
  postSuperadminCompany,
  putSuperadminCompany,
} from "~/services/superadmin/company-services";

export const useSuperadminCompanyStore = defineStore("superadminCompany", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    listParams: null as (QueryParams & { search?: string }) | null,
    data: {} as ResponseApi<CompanyType>,
    dataDetail: {} as ResponseApiDetail<CompanyType>,
    selectedData: {} as CompanyType,
  }),
  actions: {
    setSelectedData(data: CompanyType) {
      this.selectedData = data;
    },

    async getDataCompanies(params: QueryParams & { search?: string }) {
      this.loadingList = true;
      this.listParams = params;

      try {
        const response: any = await getSuperadminCompanies(params);
        const pagination = response.data?.pagination ?? {};

        this.data = {
          code: response.code ?? 200,
          data: {
            data: response.data?.list ?? [],
            limit:
              pagination.page_size ??
              pagination.limit ??
              params.limit,
            page: pagination.page ?? params.page,
            total: pagination.total_count ?? 0,
            total_pages: pagination.total_pages ?? 1,
          },
          error: response.error ?? "",
          message: response.message ?? "",
          success: response.success ?? true,
        };
      } catch (error) {
        toast.error("Failed get data companies (superadmin)", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingList = false;
      }
    },

    async refetchDataCompanies() {
      if (!this.listParams) return;
      await this.getDataCompanies(this.listParams);
    },

    async createCompany(body: any) {
      this.loadingWrite = true;
      try {
        await postSuperadminCompany(body);
        toast.success("Success create company");
        return true;
      } catch (error) {
        toast.error("Failed create company", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async updateCompany(body: any) {
      this.loadingWrite = true;
      try {
        await putSuperadminCompany(body);
        toast.success("Success update company");
        return true;
      } catch (error) {
        toast.error("Failed update company", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async deleteCompany({ id }: { id: string }) {
      this.loadingWrite = true;
      try {
        await deleteSuperadminCompany({ id });
        toast.success("Success delete company");
        return true;
      } catch (error) {
        toast.error("Failed delete company", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },
  },
});

