export interface CompanyType {
  id?: string;
  name: string;
  pic_name: string;
  address: string;
  email: string;
  owner_email?: string;
  password?: string;
  logo?: string | File | null;
  created_at?: string;
  updated_at?: string;
  status?: string;
}
