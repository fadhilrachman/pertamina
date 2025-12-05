import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";
import type { CompanyType } from "~/types/company-type";

export async function postCompany(payload: CompanyType) {
  return await api.post("/api/v1/companies", { body: payload });
}

export async function getCompany(
  params: QueryParams & { search?: string; status?: string }
) {
  const queryParams: Record<string, string> = {
    page: String(params.page),
    page_size: String(params.limit),
  };

  if (params.search) {
    queryParams.search_value = params.search;
  }

  if (params.status) {
    queryParams.status = params.status;
  }

  return await api.get("/api/v1/companies", { queryParams });
}

export async function putCompany(payload: CompanyType & { id: string }) {
  return await api.put(`/api/v1/companies/${payload.id}`, { body: payload });
}

export async function deleteCompany(params: { id: string }) {
  return await api.delete(`/api/v1/companies/${params.id}`);
}
