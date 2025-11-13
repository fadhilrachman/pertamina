import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export async function postSku(payload: { name: string; email: string }) {
  return await api.post("/api/v1/sku", { body: payload });
}

export async function getSku(params: QueryParams) {
  return await api.get("/api/v1/sku", { queryParams: params });
}
export async function getSkuDetail(params: { id: string }) {
  return await api.get(`/api/v1/sku/${params.id}`);
}

export async function putSku(params: QueryParams & { id: string }) {
  return await api.put(`/api/v1/sku/${params.id}`, { queryParams: params });
}

export async function deleteSku(params: { id: string }) {
  return await api.put(`/api/v1/sku/${params.id}`);
}
