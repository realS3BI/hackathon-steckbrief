import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { profileSchema } from "@/lib/profile";
import { store } from "@/lib/server/store";
import { body, cookie, handle, HttpError, json, limit, OWNER_COOKIE, requireSameOrigin, requireTeam } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(() => {
    requireTeam(req);
    const token = req.cookies.get(OWNER_COOKIE)?.value;
    const mine = store.owned(token);
    return json({ profiles: store.list(), myProfileId: mine?.id || null, recoveryCode: mine ? token : null, protected: Boolean(process.env.TEAM_PASSWORD) });
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    requireSameOrigin(req);
    requireTeam(req);
    limit(req, "create", 20);
    if (store.owned(req.cookies.get(OWNER_COOKIE)?.value)) throw new HttpError(409, "You already have a profile. You can edit it instead.");
    const parsed = profileSchema.safeParse(await body(req));
    if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);
    const token = randomBytes(32).toString("base64url");
    const profile = store.create(parsed.data, token);
    const res = json({ profile, recoveryCode: token }, 201);
    cookie(req, res, OWNER_COOKIE, token, 60 * 60 * 24 * 365);
    return res;
  });
}
