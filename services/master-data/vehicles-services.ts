import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export async function postVehicles(payload: { name: string; email: string }) {
  return await api.post("/api/v1/vehicles", { body: payload });
}

export async function getVehicles(params: QueryParams) {
  return await api.get("/api/v1/vehicles", { queryParams: params });
}
export async function getVehiclesDetail(params: { id: string }) {
  return await api.get(`/api/v1/vehicles/${params.id}`);
}

export async function putVehicles(params: QueryParams & { id: string }) {
  return await api.put(`/api/v1/vehicles/${params.id}`, {
    queryParams: params,
  });
}

export async function deleteVehicles(params: { id: string }) {
  return await api.put(`/api/v1/vehicles/${params.id}`);
}
