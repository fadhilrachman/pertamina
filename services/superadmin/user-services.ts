import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export interface SuperadminCreateUserPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  is_superadmin?: boolean;
  company_id?: string;
}

export interface SuperadminUpdateUserPayload {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  is_superadmin?: boolean;
  company_id?: string;
}

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

export async function postSuperadminUser(payload: SuperadminCreateUserPayload) {
  return await api.post("/api/v1/superadmin/users", { body: payload });
}

export async function putSuperadminUser(
  payload: SuperadminUpdateUserPayload & { id: string }
) {
  return await api.put(`/api/v1/superadmin/users/${payload.id}`, {
    body: payload,
  });
}

export async function getSuperadminUserDetail(params: { id: string }) {
  return await api.get(`/api/v1/superadmin/users/${params.id}`);
}

export async function deleteSuperadminUser(params: { id: string }) {
  return await api.delete(`/api/v1/superadmin/users/${params.id}`);
}
