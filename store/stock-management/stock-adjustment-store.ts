import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import type { PaginationData, QueryParams, ResponseApi } from "~/types/common";
import type { StockAdjustmentItem } from "~/types/stock-adjustment-type";
import {
  getStockAdjustments,
  getSuperadminStockAdjustments,
  type AdjustmentQueryParams,
} from "~/services/stock-management/stock-adjustment-services";

type FetchOptions = {
  superadmin?: boolean;
};

function normalizeAdjustmentResponse(
  response: any,
  params: QueryParams
): PaginationData<StockAdjustmentItem> {
  const fallback: PaginationData<StockAdjustmentItem> = {
    data: [],
    limit: params.limit,
    page: params.page,
    total: 0,
    total_pages: 1,
  };

  const candidates = [
    response?.data ?? response,
    response?.data?.data,
    response?.data?.list,
    response,
  ];

  const tryParse = (
    source: any
  ): PaginationData<StockAdjustmentItem> | null => {
    if (!source) return null;

    if (Array.isArray(source.data)) {
      return {
        data: source.data,
        limit: source.limit ?? fallback.limit,
        page: source.page ?? fallback.page,
        total: source.total ?? fallback.total,
        total_pages: source.total_pages ?? fallback.total_pages,
      };
    }

    if (source.pagination && Array.isArray(source.list)) {
      const pagination = source.pagination;
      return {
        data: source.list,
        limit:
          pagination.page_size ??
          pagination.limit ??
          source.limit ??
          fallback.limit,
        page: pagination.page ?? source.page ?? fallback.page,
        total: pagination.total_count ?? source.total ?? fallback.total,
        total_pages:
          pagination.total_pages ?? source.total_pages ?? fallback.total_pages,
      };
    }

    if (Array.isArray(source.list)) {
      return {
        data: source.list,
        limit: source.limit ?? fallback.limit,
        page: source.page ?? fallback.page,
        total: source.total ?? fallback.total,
        total_pages: source.total_pages ?? fallback.total_pages,
      };
    }

    if (Array.isArray(source)) {
      return {
        data: source,
        limit: fallback.limit,
        page: fallback.page,
        total: fallback.total,
        total_pages: fallback.total_pages,
      };
    }

    return null;
  };

  for (const candidate of candidates) {
    const parsed = tryParse(candidate);
    if (parsed) return parsed;
  }

  return fallback;
}

export const useStockAdjustmentStore = defineStore("stockAdjustment", {
  state: () => ({
    loadingList: false,
    data: {} as ResponseApi<StockAdjustmentItem>,
  }),
  actions: {
    async getAdjustments(
      params: AdjustmentQueryParams,
      options?: FetchOptions
    ) {
      this.loadingList = true;

      try {
        const response = options?.superadmin
          ? await getSuperadminStockAdjustments(params)
          : await getStockAdjustments(params);

        const normalized = normalizeAdjustmentResponse(response, params);

        this.data = {
          code: response?.code ?? 200,
          data: normalized,
          error: response?.error ?? "",
          message: response?.message ?? "",
          success: response?.success ?? true,
        };
      } catch (error: any) {
        toast.error(
          error?.message || "Failed get stock adjustment history data",
          {
            toastClassName: "toastify-error",
          }
        );
        throw error;
      } finally {
        this.loadingList = false;
      }
    },
  },
});
