import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

// export async function postOnHandStock(payload: {
//   name: string;
//   email: string;
// }) {
//   return await api.post("/api/v1/stock/on-hand", { body: payload });
// }

export async function getStockOnHand(params: QueryParams) {
  return await api.get("/api/v1/stock/on-hand", { queryParams: params });
}
// export async function getOnHandStockDetail(params: { id: string }) {
//   return await api.get(`/api/v1/stock/on-hand/${params.id}`);
// }

// export async function deleteOnHandStock(params: { id: string }) {
//   return await api.put(`/api/v1/stock/on-hand/${params.id}`);
// }

export async function downloadStockOnHand(params: {
  facility_id?: string;
  sku_id?: string;
  status?: string;
}) {
  const queryParams: Record<string, string> = {};

  if (params.facility_id) {
    queryParams.facility_id = params.facility_id;
  }

  if (params.sku_id) {
    queryParams.sku_id = params.sku_id;
  }

  if (params.status) {
    queryParams.status = params.status;
  }

  return (await api.get("/api/v1/stock/on-hand/download", {
    queryParams,
    isByte: true,
  })) as Blob;
}
