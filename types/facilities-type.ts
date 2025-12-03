export interface FacilitiesType {
  address: string;
  code: string;
  company_id: string;
  created_at: string;
  id: string;
  name: string;
  city?: string;
  capacity?: string;
  status: string;
}

export interface PayloadFacilitiesType {
  address: string;
  code: string;
  name: string;
  city?: string;
  capacity?: string;
  status: string;
}
