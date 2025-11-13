import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export async function postFacilities(payload: { name: string; email: string }) {
  return await api.post("/api/v1/facilities", { body: payload });
}

export async function getFacilities(params: QueryParams) {
  return await api.get("/api/v1/facilities", { queryParams: params });
}
export async function getFacilitiesDetail(params: { id: string }) {
  return await api.get(`/api/v1/facilities/${params.id}`);
}

export async function putFacilities(params: QueryParams & { id: string }) {
  return await api.put(`/api/v1/facilities/${params.id}`, {
    queryParams: params,
  });
}

export async function deleteFacilities(params: { id: string }) {
  return await api.put(`/api/v1/facilities/${params.id}`);
}
