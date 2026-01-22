import { api } from "~/services/api";
import type { QueryParams, ResponseApiDetail } from "~/types/common";
import type {
  PayloadStockTransactionType,
  StockTransactionAttachment,
} from "~/types/stock-transaction-type";

export async function postStockTransactions(
  payload: PayloadStockTransactionType,
  { uuid }: { uuid: string }
) {
  const { attachments: _attachments, ...body } = payload;

  return await api.post("/api/v1/stock/transactions", {
    body,
    headers: {
      "X-Idempotency-Key": uuid,
    },
  });
}

export async function uploadStockTransactionAttachments(params: {
  id: string;
  files: File[];
}) {
  const formData = new FormData();

  params.files.forEach((file) => {
    if (file) {
      formData.append("files", file);
    }
  });

  return await api.post(`/api/v1/stock/transactions/${params.id}/attachments`, {
    body: formData,
  });
}

export async function getStockTransactionAttachments(params: { id: string }) {
  return (await api.get(
    `/api/v1/stock/transactions/${params.id}/attachments`
  )) as ResponseApiDetail<StockTransactionAttachment[]>;
}

export async function getTransactions(
  params: QueryParams & {
    facility_id?: string;
    sku_id?: string;
    trx_type?: string;
  }
) {
  return await api.get("/api/v1/stock/transactions", { queryParams: params });
}
// export async function getTransactionsDetail(params: { id: string }) {
//   return await api.get(`/api/v1/transactions/${params.id}`);
// }

// export async function deleteTransactions(params: { id: string }) {
//   return await api.put(`/api/v1/transactions/${params.id}`);
// }
