import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";
import type { PayloadVehicleType } from "~/types/vehicle-type";

export async function postVehicles(payload: PayloadVehicleType) {
  return await api.post("/api/v1/vehicles", { body: payload });
}

export async function getVehiclesByFacility(
  params: QueryParams & { facility_id: string }
) {
  return await api.get(`/api/v1/facilities/${params.facility_id}/vehicles`, {
    queryParams: params,
  });
}
export async function getVehicles(
  params: QueryParams & { search?: string; type?: "Truck" | "Van" | "Pickup" }
) {
  return await api.get("/api/v1/vehicles", { queryParams: params });
}
export async function getVehiclesDetail(params: { id: string }) {
  return await api.get(`/api/v1/vehicles/${params.id}`);
}

export async function putVehicles(body: PayloadVehicleType & { id: string }) {
  return await api.put(`/api/v1/vehicles/${body.id}`, {
    body,
  });
}

export async function deleteVehicles(params: { id: string }) {
  return await api.delete(`/api/v1/vehicles/${params.id}`);
}
