import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export async function postStockOut(payload: { name: string; email: string }) {
  return await api.post("/api/v1/StockOut", { body: payload });
}

export async function getStockOut(params: QueryParams) {
  return await api.get("/api/v1/StockOut", { queryParams: params });
}
export async function getStockOutDetail(params: { id: string }) {
  return await api.get(`/api/v1/StockOut/${params.id}`);
}

export async function putStockOut(params: QueryParams & { id: string }) {
  return await api.put(`/api/v1/StockOut/${params.id}`, {
    queryParams: params,
  });
}

export async function deleteStockOut(params: { id: string }) {
  return await api.put(`/api/v1/StockOut/${params.id}`);
}
