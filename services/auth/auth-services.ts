import { api } from "~/services/api";

export async function postRegister(payload: any) {
  return await api.post("/api/v1/auth/register", { body: payload });
}
