import { store } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  try { return Response.json({ ok: store.healthy() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ ok: false }, { status: 503 }); }
}
