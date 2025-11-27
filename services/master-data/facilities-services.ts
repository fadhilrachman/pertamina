import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";
import type { PayloadFacilitiesType } from "~/types/facilities-type";

export async function postFacilities(payload: PayloadFacilitiesType) {
  return await api.post("/api/v1/facilities", { body: payload });
}

export async function getFacilities(params: QueryParams) {
  return await api.get("/api/v1/facilities", { queryParams: params });
}
export async function getFacilitiesDetail(params: { id: string }) {
  return await api.get(`/api/v1/facilities/${params.id}`);
}

export async function putFacilities(
  body: PayloadFacilitiesType & { id: string }
) {
  return await api.put(`/api/v1/facilities/${body.id}`, {
    body: body,
  });
}

export async function deleteFacilities(params: { id: string }) {
  return await api.delete(`/api/v1/facilities/${params.id}`);
}
