export interface StockOnHandType {
  facility_id: string;
  facility_sku_id: string;
  facility_name: string;
  warehouse: string;
  low_stock_threshold: number;
  unit_of_measure?: string;
  on_hand_qty: number;
  sku_code: string;
  sku_id: string;
  sku_name: string;
  status: "available" | "low" | "out_of_stock";
  updated_at: string;
}
