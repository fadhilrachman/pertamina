import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export async function getSuperadminStockOnHand(
  params: QueryParams & {
    company_id?: string;
    facility_id?: string;
    sku_id?: string;
    status?: string;
  }
) {
  const queryParams: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };

  if (params.company_id) {
    queryParams.company_id = params.company_id;
  }

  if (params.facility_id) {
    queryParams.facility_id = params.facility_id;
  }

  if (params.sku_id) {
    queryParams.sku_id = params.sku_id;
  }

  if (params.status) {
    queryParams.status = params.status;
  }

  return await api.get("/api/v1/superadmin/stock-on-hand", {
    queryParams,
  });
}

export async function downloadSuperadminStockOnHand(
  params: QueryParams & {
    company_id?: string;
    facility_id?: string;
    sku_id?: string;
    status?: string;
  }
) {
  const queryParams: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };

  if (params.company_id) {
    queryParams.company_id = params.company_id;
  }

  if (params.facility_id) {
    queryParams.facility_id = params.facility_id;
  }

  if (params.sku_id) {
    queryParams.sku_id = params.sku_id;
  }

  if (params.status) {
    queryParams.status = params.status;
  }

  return (await api.get("/api/v1/superadmin/stock-on-hand/download", {
    queryParams,
    isByte: true,
  })) as Blob;
}
