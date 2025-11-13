import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export async function postStockIn(payload: { name: string; email: string }) {
  return await api.post("/api/v1/StockIn", { body: payload });
}

export async function getStockIn(params: QueryParams) {
  return await api.get("/api/v1/StockIn", { queryParams: params });
}
export async function getStockInDetail(params: { id: string }) {
  return await api.get(`/api/v1/StockIn/${params.id}`);
}

export async function putStockIn(params: QueryParams & { id: string }) {
  return await api.put(`/api/v1/StockIn/${params.id}`, {
    queryParams: params,
  });
}

export async function deleteStockIn(params: { id: string }) {
  return await api.put(`/api/v1/StockIn/${params.id}`);
}
