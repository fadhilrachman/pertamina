import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";

import { toast } from "vue3-toastify";
import { DATA_SKU } from "../../dummy.json";
import { defineStore } from "pinia";
import type { RoleType } from "~/types/role-types";
import { postRole } from "~/services/user-managements/role-services";

export const useRoleStore = defineStore("role", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    data: {} as ResponseApi<RoleType>,
    dataDetail: {} as ResponseApiDetail<RoleType>,
    selectedData: {} as RoleType,
  }),
  actions: {
    setSelectedData(data: RoleType) {
      this.selectedData = data;
    },
    async getDataRole(
      params: QueryParams & { search?: string; status?: string }
    ) {
      this.loadingList = true;
      try {
        // const { data } = await getRole(params);  // API_UNCOMMENT
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
        toast.error("Failed get data role", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingList = false;
      }
    },

    async createDataRole(body: any) {
      this.loadingWrite = true;
      try {
        await postRole(body); // API_UNCOMMENT
        toast.success("Success create data role");
        return true;
      } catch (error) {
        toast.error("Failed create data role", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async updateDataRole(body: any) {
      this.loadingWrite = true;
      try {
        // await putRole(body); // API_UNCOMMENT
        toast.success("Success update data role");
        return true;
      } catch (error) {
        toast.error("Failed update data role", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    async deleteDataRole({ id }: { id: string }) {
      this.loadingWrite = true;
      try {
        // await deleteRole({ id }); // API_UNCOMMENT
        toast.success("Success delete data role");
        return true;
      } catch (error) {
        toast.error("Failed delete data role", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },
  },
});
