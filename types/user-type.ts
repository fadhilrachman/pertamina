export interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  role_id?: string;
  is_superadmin?: boolean;
  company_name?: string;
  companies?: Array<{
    company_id?: string;
    company_name?: string;
    is_default?: boolean;
    role_id?: string;
    role_name?: string;
    id?: string;
    name?: string;
  }>;
  company_id?: string;
}

export interface SessionRoleType {
  id: string;
  name: string;
  permissions: string[] | null;
}

export interface SessionProfileType {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
  email?: string;
  role: SessionRoleType;
}

export interface SessionResponseType {
  code: number;
  success: boolean;
  message: string;
  data: SessionProfileType;
  error: unknown;
}
