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
          limit =
            pagination.page_size ??
            pagination.limit ??
            limit;
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

    async createUser(body: SuperadminCreateUserPayload) {
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

    async updateUser(body: SuperadminUpdateUserPayload & { id: string }) {
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
