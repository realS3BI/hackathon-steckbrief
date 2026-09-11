import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "./store";

export const OWNER_COOKIE = "huette-owner";
export const TEAM_COOKIE = "huette-team";
const SESSION_AGE = 60 * 60 * 24 * 30;

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}

export function matches(a: string, b: string) {
  return timingSafeEqual(Buffer.from(hash(a)), Buffer.from(hash(b)));
}

export function teamSession() {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_AGE);
  return `${expires}.${createHmac("sha256", process.env.TEAM_PASSWORD || "").update(expires).digest("hex")}`;
}

export function requireTeam(req: NextRequest) {
  const password = process.env.TEAM_PASSWORD;
  if (!password) return;
  const value = req.cookies.get(TEAM_COOKIE)?.value || "";
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < Date.now() / 1000 || !matches(signature, createHmac("sha256", password).update(expires).digest("hex"))) {
    throw new HttpError(401, "Please enter the team password.");
  }
}

export function requireSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host")?.split(",")[0].trim() || req.headers.get("host");
  if (req.headers.get("sec-fetch-site") === "cross-site") throw new HttpError(403, "This request came from another website.");
  if (origin) {
    try { if (new URL(origin).host === host) return; } catch { /* Invalid origins are rejected below. */ }
    throw new HttpError(403, "This request came from another website.");
  }
}

export function cookie(req: NextRequest, res: NextResponse, name: string, value: string, maxAge = SESSION_AGE) {
  res.cookies.set(name, value, { httpOnly: true, sameSite: "lax", secure: req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https", path: "/", maxAge });
}

export async function body(req: NextRequest): Promise<unknown> {
  if (!req.headers.get("content-type")?.startsWith("application/json")) throw new HttpError(415, "Please send JSON.");
  if (Number(req.headers.get("content-length") || 0) > 24000) throw new HttpError(413, "The profile is too long.");
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, "The request is empty.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 24000) { await reader.cancel(); throw new HttpError(413, "The profile is too long."); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new HttpError(400, "The request contains invalid data."); }
}

const attempts = new Map<string, { count: number; reset: number }>();
export function limit(req: NextRequest, category: string, maximum = 30) {
  const now = Date.now();
  for (const [key, value] of attempts) if (value.reset < now) attempts.delete(key);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const key = `${category}:${ip}`;
  const entry = attempts.get(key) || { count: 0, reset: now + 60000 };
  entry.count++;
  attempts.set(key, entry);
  if (entry.count > maximum) throw new HttpError(429, "Too many attempts. Wait a minute and try again.");
}

export async function handle(fn: () => Promise<NextResponse> | NextResponse) {
  try { return await fn(); }
  catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    console.error("Request failed", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Saving or loading is unavailable right now. Please try again." }, 500);
  }
}
