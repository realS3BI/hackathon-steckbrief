import { NextRequest } from "next/server";
import { z } from "zod";
import { profileSchema } from "@/lib/profile";
import { store } from "@/lib/server/store";
import { body, cookie, handle, HttpError, json, OWNER_COOKIE, requireSameOrigin, requireTeam } from "@/lib/server/http";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/profiles/[id]">) {
  return handle(async () => {
    requireSameOrigin(req);
    requireTeam(req);
    const { id } = await ctx.params;
    const token = req.cookies.get(OWNER_COOKIE)?.value;
    if (!token || store.owned(token)?.id !== id) throw new HttpError(403, "You can only edit your own profile.");
    const parsed = z.object({ profile: profileSchema, version: z.string().min(1) }).safeParse(await body(req));
    if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);
    if (!store.update(id, parsed.data.profile, token, parsed.data.version)) throw new HttpError(409, "This profile changed in another tab. Your draft is safe. Close the form and reload the page before editing again.");
    return json({ profile: store.owned(token) });
  });
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/profiles/[id]">) {
  return handle(async () => {
    requireSameOrigin(req);
    requireTeam(req);
    const { id } = await ctx.params;
    const token = req.cookies.get(OWNER_COOKIE)?.value;
    if (!token || !store.delete(id, token)) throw new HttpError(403, "You can only delete your own profile.");
    const res = json({ ok: true });
    cookie(req, res, OWNER_COOKIE, "", 0);
    return res;
  });
}
