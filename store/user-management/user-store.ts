import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";

import { toast } from "vue3-toastify";
import { defineStore } from "pinia";
import type { UserType } from "~/types/user-type";
import {
  deleteUser,
  getUsers,
  postUser,
  putUser,
  type PayloadUserType,
} from "~/services/user-managements/user-services";

export const useUserStore = defineStore("user", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    data: {} as ResponseApi<UserType>,
    dataDetail: {} as ResponseApiDetail<UserType>,
    selectedData: {} as UserType,
  }),
  actions: {
    setSelectedData(data: UserType) {
      this.selectedData = data;
    },
    async getDataUser(
      params: QueryParams & { search?: string; status?: string }
    ) {
      this.loadingList = true;
      try {
        const response: any = await getUsers(params);
        const raw = response.data ?? {};

        let list: UserType[] = [];
        let limit = params.limit;
        let page = params.page;
        let total = 0;
        let total_pages = 1;

        if (Array.isArray(raw.data)) {
          list = raw.data;
          limit = raw.limit ?? limit;
          page = raw.page ?? page;
          total = raw.total ?? total;
          total_pages = raw.total_pages ?? total_pages;
        } else if (Array.isArray(raw.list)) {
          const pagination = raw.pagination ?? {};
          list = raw.list;
          limit =
            pagination.page_size ??
            pagination.limit ??
            limit;
          page = pagination.page ?? page;
          total = pagination.total_count ?? total;
          total_pages = pagination.total_pages ?? total_pages;
        } else if (Array.isArray(raw)) {
          list = raw;
        } else if (raw && typeof raw === "object") {
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
        toast.error("Failed get data user", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingList = false;
      }
    },

    async createDataUser(body: PayloadUserType) {
      this.loadingWrite = true;
      try {
        await postUser(body);
        toast.success("Success create data user");
        return true;
      } catch (error) {
        toast.error("Failed create data user", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async updateDataUser(body: PayloadUserType & { id: string }) {
      this.loadingWrite = true;
      try {
        await putUser(body);
        toast.success("Success update data user");
        return true;
      } catch (error) {
        toast.error("Failed update data user", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async deleteDataUser({ id }: { id: string }) {
      this.loadingWrite = true;
      try {
        await deleteUser({ id });
        toast.success("Success delete data user");
        return true;
      } catch (error) {
        toast.error("Failed delete data user", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },
  },
});
