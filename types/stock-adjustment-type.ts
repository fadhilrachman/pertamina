export interface AdjustmentUser {
  id?: string;
  name?: string;
  email?: string;
}

export interface AdjustmentFacility {
  id?: string;
  name?: string;
}

export interface AdjustmentFacilitySku {
  facility_sku_id?: string;
  sku_id?: string;
  name?: string;
}

export interface StockAdjustmentItem {
  adjustment?: number;
  created_by?: AdjustmentUser;
  facility?: AdjustmentFacility;
  facility_sku?: AdjustmentFacilitySku;
  note?: string;
  stock_after?: number;
  stock_before?: number;
  transaction_id?: string;
  trx_date?: string;
  trx_type?: string;
}
