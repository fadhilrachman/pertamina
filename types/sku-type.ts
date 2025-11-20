export interface SKUType {
  id: string;
  sku_code: string;
  name: string;
  unit: string;
  status: string;
  description: string;
  created_at: string;
  deleted_at: string | null;
  updated_at?: string | null;
}

export interface PayloadSKUType {
  sku_code: string;
  name: string;
  unit: string;
  status: string;
  description: string;
}
