import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";
import type { CompanyType } from "~/types/company-type";

export async function postCompany(payload: CompanyType) {
  return await api.post("/api/v1/companies", { body: payload });
}

export async function getCompany(params: QueryParams) {
  return await api.get("/api/v1/companies", { queryParams: params });
}

export async function putCompany(payload: CompanyType & { id: string }) {
  return await api.put(`/api/v1/companies/${payload.id}`, { body: payload });
}

export async function deleteCompany(params: { id: string }) {
  return await api.delete(`/api/v1/companies/${params.id}`);
}
