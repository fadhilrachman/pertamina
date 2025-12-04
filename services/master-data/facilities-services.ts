import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";
import type { PayloadFacilitiesType } from "~/types/facilities-type";

export async function postFacilities({
  address,
  code,
  name,
  status,
  capacity,
  city,
}: PayloadFacilitiesType) {
  return await api.post("/api/v1/facilities", {
    body: {
      address,
      code,
      name,
      status,
      capacity: Number(capacity),
      city,
    },
  });
}

export async function getFacilities(params: QueryParams) {
  return await api.get("/api/v1/facilities", { queryParams: params });
}
export async function getFacilitiesDetail(params: { id: string }) {
  return await api.get(`/api/v1/facilities/${params.id}`);
}

export async function putFacilities({
  address,
  code,
  id,
  name,
  status,
  capacity,
  city,
}: PayloadFacilitiesType & { id: string }) {
  return await api.put(`/api/v1/facilities/${id}`, {
    body: {
      address,
      code,
      id,
      name,
      status,
      capacity: Number(capacity),
      city,
    },
  });
}
export async function getDetailFacilities({ id }: { id: string }) {
  return await api.get(`/api/v1/facilities/${id}`);
}

export async function deleteFacilities(params: { id: string }) {
  return await api.delete(`/api/v1/facilities/${params.id}`);
}
