import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";
import type { UserType } from "~/types/user-type";
import {
  deleteSuperadminUser,
  getSuperadminUsers,
  postSuperadminUser,
  putSuperadminUser,
  getSuperadminUserDetail,
  type SuperadminCreateUserPayload,
  type SuperadminUpdateUserPayload,
} from "~/services/superadmin/user-services";

export const useSuperadminUserStore = defineStore("superadminUser", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    listParams: null as (QueryParams & { search?: string }) | null,
    data: {} as ResponseApi<UserType>,
    dataDetail: {} as ResponseApiDetail<UserType>,
    selectedData: {} as UserType,
  }),
  actions: {
    getErrorMessage(error: any) {
      if (error?.data?.message) return error.data.message;
      if (error?.response?.data?.message) return error.response.data.message;
      if (typeof error?.message === "string") return error.message;
      return "Something went wrong";
    },
    setSelectedData(data: UserType) {
      this.selectedData = data;
    },

    async getDataUsers(params: QueryParams & { search?: string }) {
      this.loadingList = true;
      this.listParams = params;

      try {
        const response: any = await getSuperadminUsers(params);

        const raw = response.data ?? {};

        let rawList: any[] = [];
        let limit = params.limit;
        let page = params.page;
        let total = 0;
        let total_pages = 1;

        if (Array.isArray(raw.data)) {
          // Shape: { data: [...], limit, page, total, total_pages }
          rawList = raw.data;
          limit = raw.limit ?? limit;
          page = raw.page ?? page;
          total = raw.total ?? total;
          total_pages = raw.total_pages ?? total_pages;
        } else if (Array.isArray(raw.list)) {
          // Shape: { list: [...], pagination: {...} }
          const pagination = raw.pagination ?? {};
          rawList = raw.list;
          limit = pagination.page_size ?? pagination.limit ?? limit;
          page = pagination.page ?? page;
          total = pagination.total_count ?? total;
          total_pages = pagination.total_pages ?? total_pages;
        } else if (Array.isArray(raw)) {
          // Shape: data is directly an array
          rawList = raw;
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

          rawList = Object.values(rest).filter(
            (item: any) =>
              item &&
              typeof item === "object" &&
              !("limit" in item) &&
              !("page" in item) &&
              !("total" in item) &&
              !("total_pages" in item)
          );
        }

        const list: UserType[] = rawList.map((item: any) => {
          const firstName = item.first_name ?? "";
          const lastName = item.last_name ?? "";
          const fullName = `${firstName} ${lastName}`.trim();
          const companies =
            item.companies && Array.isArray(item.companies)
              ? item.companies
              : [];
          const company_ids = companies
            .map(
              (company: any) => company?.company_id ?? company?.id ?? undefined
            )
            .filter(Boolean);

          return {
            id: item.id ?? "",
            name: fullName || (item.email ?? ""),
            email: item.email ?? "",
            role: item.is_superadmin ? "Superadmin" : "User",
            status: item.status ?? "",
            created_at: item.created_at ?? "",
            first_name: firstName || undefined,
            last_name: lastName || undefined,
            is_superadmin: item.is_superadmin ?? undefined,
            companies,
            company_ids,
          };
        });

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
        toast.error("Failed get data users ", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingList = false;
      }
    },

    async getUserDetail({ id }: { id: string }) {
      this.loadingDetail = true;
      try {
        const response: any = await getSuperadminUserDetail({ id });
        const raw = response?.data ?? response ?? {};
        const detail = raw?.data ?? raw ?? {};

        const companies =
          detail.companies && Array.isArray(detail.companies)
            ? detail.companies
            : [];
        const company_ids = companies
          .map(
            (company: any) => company?.company_id ?? company?.id ?? undefined
          )
          .filter(Boolean);

        const data: UserType = {
          id: detail.id ?? "",
          name: `${detail.first_name ?? ""} ${detail.last_name ?? ""}`.trim(),
          email: detail.email ?? "",
          role: detail.is_superadmin ? "Superadmin" : "User",
          status: detail.status ?? "",
          created_at: detail.created_at ?? "",
          first_name: detail.first_name ?? undefined,
          last_name: detail.last_name ?? undefined,
          is_superadmin: detail.is_superadmin ?? undefined,
          companies,
          company_ids,
        };

        this.dataDetail = {
          code: response.code ?? 200,
          success: response.success ?? true,
          message: response.message ?? "",
          data,
          error: response.error ?? "",
        };

        this.selectedData = data;
        return data;
      } catch (error) {
        toast.error("Failed get user detail ", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingDetail = false;
      }
    },

    async refetchDataUsers() {
      if (!this.listParams) return;
      await this.getDataUsers(this.listParams);
    },

    async createUser(body: SuperadminCreateUserPayload) {
      this.loadingWrite = true;
      try {
        await postSuperadminUser(body);
        toast.success("Success create user");
        return true;
      } catch (error) {
        toast.error(this.getErrorMessage(error), {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async updateUser(body: SuperadminUpdateUserPayload & { id: string }) {
      this.loadingWrite = true;
      try {
        await putSuperadminUser(body);
        toast.success("Success update user");
        return true;
      } catch (error) {
        toast.error(this.getErrorMessage(error), {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async deleteUser({ id }: { id: string }) {
      this.loadingWrite = true;
      try {
        await deleteSuperadminUser({ id });
        toast.success("Success delete user");
        return true;
      } catch (error) {
        toast.error("Failed delete user", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },
  },
});
