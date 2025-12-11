import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";
import type { RoleType } from "~/types/role-types";

export async function getRoles(
  params: QueryParams & { search?: string }
) {
  const queryParams: Record<string, string> = {
    page: String(params.page),
    page_size: String(params.limit),
  };

  if (params.search) {
    queryParams.search_value = params.search;
  }

  return await api.get("/api/v1/roles", { queryParams });
}

// The following write operations are defined but not used,
// as /api/v1/roles is read-only in the current backend contract.
export async function postRole(payload: RoleType) {
  return await api.post("/api/v1/roles", { body: payload });
}

export async function putRole(payload: RoleType & { id: string }) {
  return await api.put(`/api/v1/roles/${payload.id}`, { body: payload });
}

export async function deleteRole(params: { id: string }) {
  return await api.delete(`/api/v1/roles/${params.id}`);
}
