import { callApi, reply } from "@/lib/api";

export async function GET(request: Request) {
  return reply(await callApi(request, "GET", "/v1/contractor/catalog"));
}
