export interface FacilitiesSkuType {
  created_at: string;
  facility_id: string;
  id: string;
  low_stock_threshold: number;
  sku_code: string;
  sku_id: string;
  sku_name: string;
  status: string;
  updated_at: string;
}

export interface PayloadFacilitiesSkuType {
  low_stock_threshold: number | "";
  sku_id: string;
  facilities_id?: string;
}
