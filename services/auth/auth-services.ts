import { api } from "~/services/api";
import type { SessionResponseType } from "~/types/user-type";

export async function postRegister(payload: any) {
  return await api.post("/api/v1/auth/register", { body: payload });
}

export async function getSessionProfile() {
  const response = await api.get("/api/v1/auth/session");
  return response as SessionResponseType;
}
