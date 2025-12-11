import { api } from "~/services/api";

export async function importSkuFacilitySku(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return await api.post("/api/v1/import/sku-facility-sku", {
    body: formData,
  });
}

export async function importStockAdjustment(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return await api.post("/api/v1/import/stock-adjustment", {
    body: formData,
  });
}
