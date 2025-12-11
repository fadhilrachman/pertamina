import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";
import type { StockTransactionType } from "~/types/stock-transaction-type";
import { getSuperadminTransactions } from "~/services/superadmin/transactions-services";

export const useSuperadminTransactionsStore = defineStore(
  "superadminTransactions",
  {
    state: () => ({
      loadingList: false,
      loadingWrite: false,
      loadingDetail: false,
      listParams: null as
        | (QueryParams & {
            company_id?: string;
            facility_id?: string;
            trx_type?: string;
            date_from?: string;
            date_to?: string;
          })
        | null,
      data: {} as ResponseApi<StockTransactionType>,
      dataDetail: {} as ResponseApiDetail<StockTransactionType>,
      selectedData: {} as StockTransactionType,
      selectedLineIndex: 0 as number,
    }),
    actions: {
      setSelectedData(data: StockTransactionType) {
        this.selectedData = data;
      },
      setSelectedLineIndex(index: number) {
        this.selectedLineIndex = index;
      },

      async getDataTransactions(
        params: QueryParams & {
          company_id?: string;
          facility_id?: string;
          trx_type?: string;
          date_from?: string;
          date_to?: string;
        }
      ) {
        this.loadingList = true;
        this.listParams = params;

        try {
          const response: any = await getSuperadminTransactions(params);
          const raw = response.data ?? {};

          let list: StockTransactionType[] = [];
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

          const totalIn = (raw as any).total_in ?? 0;
          const totalOut = (raw as any).total_out ?? 0;

          this.data = {
            code: response.code ?? 200,
            data: {
              data: list,
              limit,
              page,
              total,
              total_pages,
              // @ts-expect-error: extra aggregate fields from backend
              total_in: totalIn,
              // @ts-expect-error: extra aggregate fields from backend
              total_out: totalOut,
            },
            error: response.error ?? "",
            message: response.message ?? "",
            success: response.success ?? true,
          };
        } catch (error) {
          toast.error("Failed get data transactions ", {
            toastClassName: "toastify-error",
          });
          throw error;
        } finally {
          this.loadingList = false;
        }
      },

      async refetchDataTransactions() {
        if (!this.listParams) return;
        await this.getDataTransactions(this.listParams);
      },
    },
  }
);
