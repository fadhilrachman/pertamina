import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export type AdjustmentQueryParams = QueryParams & {
  facility_id?: string;
  facility_sku_id?: string;
  company_id?: string;
  sku_id?: string;
};

export async function getStockAdjustments(params: AdjustmentQueryParams) {
  const queryParams: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };

  if (params.facility_id) {
    queryParams.facility_id = String(params.facility_id);
  }

  if (params.facility_sku_id) {
    queryParams.facility_sku_id = String(params.facility_sku_id);
  }

  if (params.sku_id) {
    queryParams.sku_id = String(params.sku_id);
  }

  return await api.get("/api/v1/stock/adjustments", {
    queryParams,
  });
}

export async function getSuperadminStockAdjustments(
  params: AdjustmentQueryParams
) {
  const queryParams: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };

  if (params.company_id) {
    queryParams.company_id = String(params.company_id);
  }

  if (params.facility_id) {
    queryParams.facility_id = String(params.facility_id);
  }

  if (params.facility_sku_id) {
    queryParams.facility_sku_id = String(params.facility_sku_id);
  }

  if (params.sku_id) {
    queryParams.sku_id = String(params.sku_id);
  }

  return await api.get("/api/v1/superadmin/stock/adjustments", {
    queryParams,
  });
}
