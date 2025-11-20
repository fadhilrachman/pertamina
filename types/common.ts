export interface QueryParams extends Record<number, number> {
  page: number;
  limit: number;
}
export interface PaginationData<T> {
  data: T[];
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}
export interface ResponseApi<T> {
  code: number;
  data: PaginationData<T>;
  error: string;
  message: string;
  success: boolean;
}

export interface ResponseApiDetail<T> {
  code: number;
  data: T;
  error: string;
  message: string;
  success: boolean;
}
