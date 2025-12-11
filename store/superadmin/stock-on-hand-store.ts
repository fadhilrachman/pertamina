import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";
import type { StockOnHandType } from "~/types/stock-on-hand-type";
import { getSuperadminStockOnHand } from "~/services/superadmin/stock-on-hand-services";

export const useSuperadminStockOnHandStore = defineStore(
  "superadminStockOnHand",
  {
    state: () => ({
      loadingList: false,
      loadingWrite: false,
      loadingDetail: false,
      listParams: null as
        | (QueryParams & {
            company_id?: string;
            facility_id?: string;
            sku_id?: string;
          })
        | null,
      data: {} as ResponseApi<StockOnHandType>,
      dataDetail: {} as ResponseApiDetail<StockOnHandType>,
      selectedData: {} as StockOnHandType,
    }),
    actions: {
      setSelectedData(data: StockOnHandType) {
        this.selectedData = data;
      },

      async getDataStockOnHand(
        params: QueryParams & {
          company_id?: string;
          facility_id?: string;
          sku_id?: string;
        }
      ) {
        this.loadingList = true;
        this.listParams = params;

        try {
          const response: any = await getSuperadminStockOnHand(params);
          const raw = response.data ?? {};

          let list: StockOnHandType[] = [];
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
            limit = pagination.page_size ?? pagination.limit ?? limit;
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
          toast.error("Failed get data stock on hand ", {
            toastClassName: "toastify-error",
          });
          throw error;
        } finally {
          this.loadingList = false;
        }
      },

      async refetchDataStockOnHand() {
        if (!this.listParams) return;
        await this.getDataStockOnHand(this.listParams);
      },
    },
  }
);
