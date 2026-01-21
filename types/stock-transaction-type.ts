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
  attachments?: File[];
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
  attachments?: StockTransactionAttachment[];
  lines: {
    sku: {
      sku_id: string;
      facility_sku_id: string;
      sku_code: string;
      sku_name: string;
      unit: string;
    };
    quantity: number;
    warehouse: {
      id: string;
      name: string;
    };
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

export interface StockTransactionAttachment {
  created_at?: string;
  created_by?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  id: string;
  storage_path?: string;
  storage_url?: string;
}
