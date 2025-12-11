export interface SuperadminCompanyTransactionSummary {
  company_id: string;
  company_name: string;
  total_adjust: number;
  total_in: number;
  total_in_qty: number;
  total_out: number;
  total_out_qty: number;
}

export interface SuperadminDailyTransactionByCompany {
  company_id: string;
  company_name: string;
  count: number;
  /** YYYY-MM-DD */
  date: string;
}

export interface SuperadminDashboardType {
  total_companies: number;
  total_users: number;
  company_transactions: SuperadminCompanyTransactionSummary[];
  daily_transactions: SuperadminDailyTransactionByCompany[];
}

