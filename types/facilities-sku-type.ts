export interface FacilitiesSkuType {
  created_at: string;
  facility_id: string;
  id: string;
  high_stock_threshold?: number;
  low_stock_threshold: number;
  sku_code: string;
  sku_id: string;
  sku_name: string;
  status: string;
  description?: string;
  updated_at: string;
}

export interface PayloadFacilitiesSkuType {
  low_stock_threshold: number | "";
  high_stock_threshold: number | "";
  sku_id: string;
  facility_id?: string;
  description?: string;
  status?: string;
}
