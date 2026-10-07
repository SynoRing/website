import { cookies } from "next/headers";
import { json } from "../../../(tools)/marketing/server";
import { sessionCookie } from "../../../(tools)/marketing/session";

export async function POST() {
  (await cookies()).delete(sessionCookie);
  return json(200, { ok: true });
}
