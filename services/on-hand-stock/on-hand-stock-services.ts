import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export async function postOnHandStock(payload: {
  name: string;
  email: string;
}) {
  return await api.post("/api/v1/OnHandStock", { body: payload });
}

export async function getOnHandStock(params: QueryParams) {
  return await api.get("/api/v1/OnHandStock", { queryParams: params });
}
export async function getOnHandStockDetail(params: { id: string }) {
  return await api.get(`/api/v1/OnHandStock/${params.id}`);
}

export async function putOnHandStock(params: QueryParams & { id: string }) {
  return await api.put(`/api/v1/OnHandStock/${params.id}`, {
    queryParams: params,
  });
}

export async function deleteOnHandStock(params: { id: string }) {
  return await api.put(`/api/v1/OnHandStock/${params.id}`);
}
