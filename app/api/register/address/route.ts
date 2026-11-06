import { badRequest, callApi, reply } from "@/lib/api";

export async function GET(request: Request) {
  const prefix = new URL(request.url).searchParams.get("prefix") ?? "";
  if (!/^[a-z0-9]{1,30}$/.test(prefix)) return badRequest("Use only lowercase letters and numbers.");
  return reply(await callApi(request, "GET", `/v1/contractor/address?prefix=${encodeURIComponent(prefix)}`));
}
