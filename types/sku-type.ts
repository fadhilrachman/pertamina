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
  category?: string;
  max_stock?: string;
  min_stock?: string;
  beginning_inventory_by_warehouse?: {
    facility_id: string;
    beginning_inventory: string | number;
  }[];
}
