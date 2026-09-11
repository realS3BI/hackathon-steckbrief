import { NextRequest } from "next/server";
import { z } from "zod";
import { store } from "@/lib/server/store";
import { body, cookie, handle, HttpError, json, limit, matches, OWNER_COOKIE, requireSameOrigin, requireTeam, TEAM_COOKIE, teamSession } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handle(async () => {
    requireSameOrigin(req);
    limit(req, "login", 15);
    const parsed = z.discriminatedUnion("action", [z.object({ action: z.literal("unlock"), password: z.string().max(500) }), z.object({ action: z.literal("recover"), code: z.string().trim().max(100) })]).safeParse(await body(req));
    if (!parsed.success) throw new HttpError(400, "Please check your input.");
    const res = json({ ok: true });
    if (parsed.data.action === "unlock") {
      if (process.env.TEAM_PASSWORD && !matches(parsed.data.password, process.env.TEAM_PASSWORD)) throw new HttpError(401, "The team password is incorrect.");
      cookie(req, res, TEAM_COOKIE, teamSession());
    } else {
      requireTeam(req);
      if (!store.owned(parsed.data.code)) throw new HttpError(401, "This edit code does not belong to a profile.");
      cookie(req, res, OWNER_COOKIE, parsed.data.code, 60 * 60 * 24 * 365);
    }
    return res;
  });
}

export async function DELETE(req: NextRequest) {
  return handle(() => {
    requireSameOrigin(req);
    const res = json({ ok: true });
    cookie(req, res, TEAM_COOKIE, "", 0);
    cookie(req, res, OWNER_COOKIE, "", 0);
    return res;
  });
}
