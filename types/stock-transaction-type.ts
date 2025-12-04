export interface PayloadStockTransactionType {
  lines?: Lines[];
  note?: string;
  endpoint?: string;
  reference_no?: string;
  reference_type?: string;
  purpose?: string;
  destination?: string;
  trx_date?: string;
  trx_type?: string;
  vehicle_id?: string;
  vehicle_text?: string;

  uom?: string; // TEMPORARY
}

interface Lines {
  facility_sku_id?: string;
  note?: string;
  qty?: number;
  sku_id?: string;
  uom?: string;
}

export interface StockTransactionType {
  created_at: string;
  created_by: string;
  endpoint: string;
  id: string;
  lines: {
    facility_id: string;
    facility_name: string;
    id: string;
    note: string;
    qty: number;
    sku_code: string;
    sku_id: string;
    sku_name: string;
    uom: string;
  }[];
  note: string;
  purpose: string;
  reference_no: string;
  reference_type: string;
  trx_date: string;
  trx_no: string;
  trx_type: string;
  vehicle_id: string;
  vehicle_info: {
    capacity: number;
    id: string;
    license_plate: string;
    type: string;
    vehicle_id: string;
  };
}
