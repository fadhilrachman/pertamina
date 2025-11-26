export interface StockOnHandType {
  facility_id: string;
  facility_name: string;
  low_stock_threshold: number;
  on_hand_qty: number;
  sku_code: string;
  sku_id: string;
  sku_name: string;
  status: "available" | "low" | "out_of_stock";
  updated_at: string;
}
