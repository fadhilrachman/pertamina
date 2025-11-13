import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export async function postTransactions(payload: {
  name: string;
  email: string;
}) {
  return await api.post("/api/v1/transactions", { body: payload });
}

export async function getTransactions(params: QueryParams) {
  return await api.get("/api/v1/transactions", { queryParams: params });
}
export async function getTransactionsDetail(params: { id: string }) {
  return await api.get(`/api/v1/transactions/${params.id}`);
}

export async function putTransactions(params: QueryParams & { id: string }) {
  return await api.put(`/api/v1/transactions/${params.id}`, {
    queryParams: params,
  });
}

export async function deleteTransactions(params: { id: string }) {
  return await api.put(`/api/v1/transactions/${params.id}`);
}
