import { cookies } from "next/headers";
import { json } from "../../../marketing/server";
import { sessionCookie } from "../../../marketing/session";

export async function POST() {
  (await cookies()).delete(sessionCookie);
  return json(200, { ok: true });
}
