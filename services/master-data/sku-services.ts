import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";
import type { PayloadSKUType } from "~/types/sku-type";

export async function postSku(payload: PayloadSKUType) {
  return await api.post("/api/v1/skus", { body: payload });
}

export async function getSku(params: QueryParams) {
  return await api.get("/api/v1/skus", { queryParams: params });
}
export async function getSkuDetail(params: { id: string }) {
  return await api.get(`/api/v1/skus/${params.id}`);
}

export async function putSku(payload: PayloadSKUType & { id: string }) {
  return await api.put(`/api/v1/skus/${payload.id}`, { body: payload });
}

export async function deleteSku(params: { id: string }) {
  return await api.delete(`/api/v1/skus/${params.id}`);
}
