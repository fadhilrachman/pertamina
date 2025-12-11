import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";

export async function getSuperadminTransactions(
  params: QueryParams & {
    company_id?: string;
    facility_id?: string;
    trx_type?: string;
    date_from?: string;
    date_to?: string;
  }
) {
  const queryParams: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };

  if (params.company_id) {
    queryParams.company_id = params.company_id;
  }

  if (params.facility_id) {
    queryParams.facility_id = params.facility_id;
  }

  if (params.trx_type) {
    queryParams.trx_type = params.trx_type;
  }

  if (params.date_from) {
    queryParams.date_from = params.date_from;
  }

  if (params.date_to) {
    queryParams.date_to = params.date_to;
  }

  return await api.get("/api/v1/superadmin/transactions", {
    queryParams,
  });
}

