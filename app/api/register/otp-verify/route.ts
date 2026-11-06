import { badRequest, callApi, readBody } from "@/lib/api";
import { TICKET_COOKIE } from "@/lib/register";

/** Verifies the code, then keeps the registration ticket in an httpOnly cookie — the browser never sees it. */
export async function POST(request: Request) {
  const body = await readBody(request);
  const phone = typeof body?.phone === "string" ? body.phone : "";
  const code = typeof body?.code === "string" ? body.code : "";
  if (!/^[6-9]\d{9}$/.test(phone)) return badRequest("Enter a 10-digit Indian mobile number.");
  if (!/^\d{6}$/.test(code)) return badRequest("Enter the 6-digit code.");
  const result = await callApi<{ registrationTicket: string; expiresIn: number }>(request, "POST", "/v1/contractor/auth/otp/verify", { phone, code });
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status, headers: { "cache-control": "no-store" } });
  const response = Response.json({ item: { verified: true } }, { headers: { "cache-control": "no-store" } });
  const maxAge = Math.max(60, Math.floor(result.item.expiresIn || 900));
  response.headers.append("set-cookie", `${TICKET_COOKIE}=${encodeURIComponent(result.item.registrationTicket)}; Path=/api/register; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  return response;
}
