import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";
import type { PayloadStockTransactionType } from "~/types/stock-transaction-type";

export async function postStockTransactions(
  payload: PayloadStockTransactionType
) {
  return await api.post("/api/v1/stock/transactions", { body: payload });
}

// export async function getTransactions(params: QueryParams) {
//   return await api.get("/api/v1/transactions", { queryParams: params });
// }
// export async function getTransactionsDetail(params: { id: string }) {
//   return await api.get(`/api/v1/transactions/${params.id}`);
// }

// export async function deleteTransactions(params: { id: string }) {
//   return await api.put(`/api/v1/transactions/${params.id}`);
// }
