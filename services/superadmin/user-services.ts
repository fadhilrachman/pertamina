import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";
import type { UserType } from "~/types/user-type";

export async function getSuperadminUsers(
  params: QueryParams & { search?: string }
) {
  const queryParams: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };

  if (params.search) {
    queryParams.search = params.search;
  }

  return await api.get("/api/v1/superadmin/users", { queryParams });
}

export async function postSuperadminUser(payload: UserType) {
  return await api.post("/api/v1/superadmin/users", { body: payload });
}

export async function putSuperadminUser(payload: UserType & { id: string }) {
  return await api.put(`/api/v1/superadmin/users/${payload.id}`, {
    body: payload,
  });
}

export async function deleteSuperadminUser(params: { id: string }) {
  return await api.delete(`/api/v1/superadmin/users/${params.id}`);
}

