export interface StockOnHandType {
  id: string;
  sku_code: string;
  sku_name: string;
  warehouse: string;
  unit: string;
  on_hand_qty: number;
  reserved_qty: number;
  available_qty: number;
  last_transaction_at: string;
}

