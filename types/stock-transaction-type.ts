export interface PayloadStockTransactionType {
  lines?: Lines[];
  note?: string;
  reference_no?: string;
  reference_type?: string;
  trx_date?: string;
  trx_type?: string;
}

interface Lines {
  facility_id?: string;
  note?: string;
  qty?: 0;
  sku_id?: string;
  uom?: string;
}
