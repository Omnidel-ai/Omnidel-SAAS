/**
 * The site's one door to the OmniDEL platform API. Used only by the route
 * handlers under app/api/register — the browser never calls the API itself.
 *
 * Envelope (same as the platform's other apps): success is `{ item }`, a
 * failure is `{ error: { code, message } }`.
 */
export interface ApiError {
  code: string;
  message: string;
}

export type ApiResult<T> = { ok: true; status: number; item: T } | { ok: false; status: number; error: ApiError };

export function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || null;
}

export async function callApi<T = unknown>(request: Request, method: "GET" | "POST", path: string, body?: unknown): Promise<ApiResult<T>> {
  const base = process.env.OMNIDEL_API_URL;
  const secret = process.env.OMNIDEL_WEBSITE_APP_SECRET;
  if (!base || !secret) return { ok: false, status: 503, error: { code: "SERVER.UNAVAILABLE", message: "Sign-up is not available right now. Please try again shortly." } };
  const headers: Record<string, string> = { accept: "application/json", "x-app-id": "website", "x-app-secret": secret };
  const ip = clientIp(request);
  if (ip) headers["x-client-ip"] = ip;
  if (body !== undefined) headers["content-type"] = "application/json";
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store",
      // Creating an instance can take about a minute.
      signal: AbortSignal.timeout(120_000),
    });
    const json = (await res.json().catch(() => null)) as { item?: unknown; data?: unknown; error?: Partial<ApiError> } | null;
    if (res.ok && json) return { ok: true, status: res.status, item: (json.item ?? json.data ?? json) as T };
    return { ok: false, status: res.status, error: { code: json?.error?.code ?? "SERVER.ERROR", message: json?.error?.message ?? "Something went wrong. Please try again." } };
  } catch {
    return { ok: false, status: 502, error: { code: "SERVER.UNAVAILABLE", message: "We could not reach OmniDEL. Please try again." } };
  }
}

/** The JSON a route handler sends back: `{ item }` or `{ error }`, never cached. */
export function reply<T>(result: ApiResult<T>, item: unknown = result.ok ? result.item : undefined): Response {
  const headers = { "cache-control": "no-store" };
  return result.ok ? Response.json({ item }, { status: 200, headers }) : Response.json({ error: result.error }, { status: result.status, headers });
}

export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const body = await request.json().catch(() => null);
  return body !== null && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
}

export const badRequest = (message: string): Response => Response.json({ error: { code: "VALIDATION.FAILED", message } }, { status: 400 });
