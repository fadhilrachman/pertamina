import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";
import type { CompanyType } from "~/types/company-type";

export interface SuperadminCompanyPayload {
  address: string;
  email: string;
  logo?: string | null;
  name: string;
  owner_email: string;
  pic_name: string;
}

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

export async function postSuperadminCompany(payload: SuperadminCompanyPayload) {
  return await api.post("/api/v1/superadmin/companies", { body: payload });
}

export async function putSuperadminCompany(
  payload: SuperadminCompanyPayload & { id: string }
) {
  return await api.put(`/api/v1/superadmin/companies/${payload.id}`, {
    body: payload,
  });
}

export async function deleteSuperadminCompany(params: { id: string }) {
  return await api.delete(`/api/v1/superadmin/companies/${params.id}`);
}
