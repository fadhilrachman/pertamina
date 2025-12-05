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

        const raw = response.data ?? {};

        let list: CompanyType[] = [];
        let limit = params.limit;
        let page = params.page;
        let total = 0;
        let total_pages = 1;

        if (Array.isArray(raw.data)) {
          // Shape: { data: [...], limit, page, total, total_pages }
          list = raw.data;
          limit = raw.limit ?? limit;
          page = raw.page ?? page;
          total = raw.total ?? total;
          total_pages = raw.total_pages ?? total_pages;
        } else if (Array.isArray(raw.list)) {
          // Shape: { list: [...], pagination: {...} }
          const pagination = raw.pagination ?? {};
          list = raw.list;
          limit =
            pagination.page_size ?? pagination.limit ?? limit;
          page = pagination.page ?? page;
          total = pagination.total_count ?? total;
          total_pages = pagination.total_pages ?? total_pages;
        } else if (Array.isArray(raw)) {
          // Shape: data is directly an array
          list = raw;
        } else if (raw && typeof raw === "object") {
          // Shape: { 0: {...}, 1: {...}, ..., limit, page, total, total_pages }
          const {
            limit: rawLimit,
            page: rawPage,
            total: rawTotal,
            total_pages: rawTotalPages,
            ...rest
          } = raw as Record<string, any>;

          limit = rawLimit ?? limit;
          page = rawPage ?? page;
          total = rawTotal ?? total;
          total_pages = rawTotalPages ?? total_pages;

          list = Object.values(rest).filter(
            (item: any) =>
              item &&
              typeof item === "object" &&
              !("limit" in item) &&
              !("page" in item) &&
              !("total" in item) &&
              !("total_pages" in item)
          );
        }

        this.data = {
          code: response.code ?? 200,
          data: {
            data: list,
            limit,
            page,
            total,
            total_pages,
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
