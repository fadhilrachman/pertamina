export interface CompanyType {
  id?: string;
  name: string;
  pic_name: string;
  address: string;
  email: string;
  password: string;
  logo?: File | string | null;
  created_at?: string;
  updated_at?: string;
  status?: string;
}
