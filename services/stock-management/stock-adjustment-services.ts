import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export async function postStockAdjusment(payload: {
  name: string;
  email: string;
}) {
  return await api.post("/api/v1/StockAdjusment", { body: payload });
}

export async function getStockAdjusment(params: QueryParams) {
  return await api.get("/api/v1/StockAdjusment", { queryParams: params });
}
export async function getStockAdjusmentDetail(params: { id: string }) {
  return await api.get(`/api/v1/StockAdjusment/${params.id}`);
}

export async function putStockAdjusment(params: QueryParams & { id: string }) {
  return await api.put(`/api/v1/StockAdjusment/${params.id}`, {
    queryParams: params,
  });
}

export async function deleteStockAdjusment(params: { id: string }) {
  return await api.put(`/api/v1/StockAdjusment/${params.id}`);
}
