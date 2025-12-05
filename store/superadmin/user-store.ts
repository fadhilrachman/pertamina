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
    setSelectedData(data: UserType) {
      this.selectedData = data;
    },

    async getDataUsers(params: QueryParams & { search?: string }) {
      this.loadingList = true;
      this.listParams = params;

      try {
        const response: any = await getSuperadminUsers(params);
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
        toast.error("Failed get data users (superadmin)", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingList = false;
      }
    },

    async refetchDataUsers() {
      if (!this.listParams) return;
      await this.getDataUsers(this.listParams);
    },

    async createUser(body: any) {
      this.loadingWrite = true;
      try {
        await postSuperadminUser(body);
        toast.success("Success create user");
        return true;
      } catch (error) {
        toast.error("Failed create user", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async updateUser(body: any) {
      this.loadingWrite = true;
      try {
        await putSuperadminUser(body);
        toast.success("Success update user");
        return true;
      } catch (error) {
        toast.error("Failed update user", {
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

