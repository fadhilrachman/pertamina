import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export interface PayloadUserType {
  name: string;
  email: string;
  password: string;
  role: string;
}

export async function getUsers(
  params: QueryParams & { search?: string; status?: string }
) {
  const queryParams: Record<string, string> = {
    page: String(params.page),
    page_size: String(params.limit),
  };

  if (params.search) {
    queryParams.search_value = params.search;
    queryParams.search_columns = "name,email";
  }

  return await api.get("/api/v1/users", { queryParams });
}

export async function postUser(payload: PayloadUserType) {
  return await api.post("/api/v1/users", {
    body: payload,
  });
}

export async function putUser(
  payload: PayloadUserType & { id: string }
) {
  return await api.put(`/api/v1/users/${payload.id}`, {
    body: payload,
  });
}

export async function deleteUser(params: { id: string }) {
  return await api.delete(`/api/v1/users/${params.id}`);
}
