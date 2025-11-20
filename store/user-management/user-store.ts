import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";

import { toast } from "vue3-toastify";
import { defineStore } from "pinia";
import { DATA_USERS } from "../../dummy.json";
import type { UserType } from "~/types/user-type";

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
        this.data = {
          data: {
            data: DATA_USERS,
            limit: params.limit,
            page: params.page,
            total: DATA_USERS.length,
            total_pages: 1,
          },
          code: 200,
          error: "",
          message: "Success",
          success: true,
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

    async createDataUser(body: any) {
      this.loadingWrite = true;
      try {
        // TODO: integrate with create user API
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

    async updateDataUser(body: any) {
      this.loadingWrite = true;
      try {
        // TODO: integrate with update user API
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
        // TODO: integrate with delete user API
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

