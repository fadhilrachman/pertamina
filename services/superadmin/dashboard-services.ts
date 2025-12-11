import { api } from "~/services/api";

export interface SuperadminDashboardParams {
  date_from?: string;
  date_to?: string;
  company_id?: string;
}

export async function getSuperadminDashboard(
  params: SuperadminDashboardParams
) {
  const queryParams: Record<string, string> = {};

  if (params.date_from) {
    queryParams.date_from = params.date_from;
  }

  if (params.date_to) {
    queryParams.date_to = params.date_to;
  }

  if (params.company_id) {
    queryParams.company_id = params.company_id;
  }

  return await api.get("/api/v1/superadmin/dashboard", {
    queryParams,
  });
}

