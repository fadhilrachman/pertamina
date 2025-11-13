export interface QueryParams extends Record<string, string> {
  page: string;
  per_page: string;
}

export interface ResponseApi<T> {
  count: number;
  result: T[];
  total_pages: number;
}
