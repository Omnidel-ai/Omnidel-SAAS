import { badRequest, callApi, readBody, reply } from "@/lib/api";

export async function POST(request: Request) {
  const body = await readBody(request);
  const phone = typeof body?.phone === "string" ? body.phone : "";
  if (!/^[6-9]\d{9}$/.test(phone)) return badRequest("Enter a 10-digit Indian mobile number.");
  return reply(await callApi(request, "POST", "/v1/contractor/auth/otp/request", { phone }));
}
