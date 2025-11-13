import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export async function postDashboard(payload: { name: string; email: string }) {
  return await api.post("/api/v1/dashboard", { body: payload });
}

export async function getDashboard(params: QueryParams) {
  return await api.get("/api/v1/dashboard", { queryParams: params });
}
export async function getDashboardDetail(params: { id: string }) {
  return await api.get(`/api/v1/dashboard/${params.id}`);
}

export async function putDashboard(params: QueryParams & { id: string }) {
  return await api.put(`/api/v1/dashboard/${params.id}`, {
    queryParams: params,
  });
}

export async function deleteDashboard(params: { id: string }) {
  return await api.put(`/api/v1/dashboard/${params.id}`);
}
