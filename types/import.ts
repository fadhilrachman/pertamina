export interface ImportRowReport {
  code?: string;
  reason?: string;
  row_number?: number;
  status?: string;
}

export interface ImportResult {
  errors?: string[];
  failed_rows?: number;
  row_reports?: ImportRowReport[];
  success_detail?: string;
  success_rows?: number;
  total_rows?: number;
}

export interface ImportResponse {
  code?: number;
  data?: ImportResult;
  error?: unknown;
  message?: string;
  success?: boolean;
}
