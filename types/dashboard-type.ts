export interface StockDistributionType {
  total_qty: number;
  warehouses: {
    facility_id: string;
    facility_name: string;
    low_stock_count: number;
    percentage: number;
    total_qty: number;
    total_skus: number;
  }[];
}

export interface DashboarOverViewType {
  active_warehouses: number;
  low_stock_alerts: number;
  low_stock_count: number;
  out_of_stock_count: number;
  throughput_overview: {
    adjustment_qty: number;
    inbound_qty: number;
    outbound_qty: number;
    today_adjustment: number;
    today_inbound: number;
    today_outbound: number;
  };
  today_adjustment_count: number;
  today_inbound_count: number;
  today_outbound_count: number;
  total_facilities: number;
  total_on_hand_quantity: number;
  total_skus: number;
  total_stock_value: number;
}

export interface TopMovingSkuType {
  category: string;
  net_movement: number;
  on_hand_qty: number;
  sku_code: string;
  sku_name: string;
  total_in_qty: number;
  total_out_qty: number;
  trx_count: number;
}
