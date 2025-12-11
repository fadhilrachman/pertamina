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
