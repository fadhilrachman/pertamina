import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export async function getSuperadminFacilities(
  params: QueryParams & { company_id?: string; search?: string }
) {
  const queryParams: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };

  if (params.company_id) {
    queryParams.company_id = params.company_id;
  }

  if (params.search) {
    queryParams.search = params.search;
  }

  return await api.get("/api/v1/superadmin/facilities", {
    queryParams,
  });
}

export async function getSuperadminFacilityDetail(params: { id: string }) {
  return await api.get(`/api/v1/superadmin/facilities/${params.id}`);
}
