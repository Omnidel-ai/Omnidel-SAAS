import { badRequest, callApi, readBody, reply } from "@/lib/api";
import { TICKET_COOKIE } from "@/lib/register";

/** Registers, pays (demo) and creates the instance. The ticket comes from the cookie, not the page. */
export async function POST(request: Request) {
  const body = await readBody(request);
  if (body === null) return badRequest("Send the registration as JSON.");
  const jar = request.headers.get("cookie") ?? "";
  const match = jar.split(/;\s*/).find((c) => c.startsWith(`${TICKET_COOKIE}=`));
  const ticket = match ? decodeURIComponent(match.slice(TICKET_COOKIE.length + 1)) : "";
  if (!ticket) return Response.json({ error: { code: "AUTH.TOKEN_INVALID", message: "Your number check has expired. Please verify your number again." } }, { status: 401 });
  const result = await callApi(request, "POST", "/v1/contractor/register", { ...body, registrationTicket: ticket, payment: { method: "demo" } });
  const response = reply(result);
  if (result.ok) response.headers.append("set-cookie", `${TICKET_COOKIE}=; Path=/api/register; HttpOnly; SameSite=Lax; Max-Age=0`);
  return response;
}
