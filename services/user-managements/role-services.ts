import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";
import type { RoleType } from "~/types/role-types";

export async function postRole(payload: RoleType) {
  return await api.post("/api/v1/roles", { body: payload });
}

export async function getRole(params: QueryParams) {
  return await api.get("/api/v1/roles", { queryParams: params });
}

export async function putRole(payload: RoleType & { id: string }) {
  return await api.put(`/api/v1/roles/${payload.id}`, { body: payload });
}

export async function deleteRole(params: { id: string }) {
  return await api.delete(`/api/v1/roles/${params.id}`);
}
