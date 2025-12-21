import { api } from "~/services/api";
import type { ImportResponse } from "~/types/import";

export async function importSkuFacilitySku(
  file: File
): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return await api.post("/api/v1/import/sku-facility-sku", {
    body: formData,
  });
}

export async function importStockAdjustment(
  file: File
): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return await api.post("/api/v1/import/stock-adjustment", {
    body: formData,
  });
}
