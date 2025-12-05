import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";
import type { CompanyType } from "~/types/company-type";

export async function getSuperadminCompanies(
  params: QueryParams & { search?: string }
) {
  const queryParams: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };

  if (params.search) {
    queryParams.search = params.search;
  }

  return await api.get("/api/v1/superadmin/companies", { queryParams });
}

export async function postSuperadminCompany(payload: CompanyType) {
  return await api.post("/api/v1/superadmin/companies", { body: payload });
}

export async function putSuperadminCompany(payload: CompanyType & { id: string }) {
  return await api.put(`/api/v1/superadmin/companies/${payload.id}`, {
    body: payload,
  });
}

export async function deleteSuperadminCompany(params: { id: string }) {
  return await api.delete(`/api/v1/superadmin/companies/${params.id}`);
}

