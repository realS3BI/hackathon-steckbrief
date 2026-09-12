import { expect, test } from "@playwright/test";
import { MUSIC_EVENT_PATH, MUSIC_PATH, PROFILE_PATH } from "../src/lib/routes";

test("bookmarks from the previous folder structure keep their destination and query", async ({ request }) => {
  for (const [source, destination] of [
    ["/music-ai-2026", MUSIC_EVENT_PATH],
    ["/music-ai-2026/profile", PROFILE_PATH],
    ["/music-ai-2026/knowledge-and-create", MUSIC_PATH],
    ["/music-ai-2026/profile?from=invite", `${PROFILE_PATH}?from=invite`],
  ]) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(destination);
  }
});

test("the old profile domain redirects to the team album without affecting other hosts", async ({ request }) => {
  const destination = `https://hackathon.schlossers.at${PROFILE_PATH}`;
  for (const path of ["/", PROFILE_PATH, "/music-ai-2026/profile", "/old/bookmark"]) {
    const response = await request.get(path, {
      headers: { Host: "profile.schlossers.at" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(destination);
  }

  const query = await request.get("/?from=team", {
    headers: { Host: "PROFILE.SCHLOSSERS.AT:3000" },
    maxRedirects: 0,
  });
  expect(query.status()).toBe(308);
  expect(query.headers().location).toBe(`${destination}?from=team`);

  for (const host of ["hackathon.schlossers.at", "localhost:3100", "profileXschlossersXat"]) {
    const response = await request.get(PROFILE_PATH, { headers: { Host: host }, maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(response.headers().location).toBeUndefined();
  }
  const music = await request.get(MUSIC_PATH, { headers: { Host: "hackathon.schlossers.at" }, maxRedirects: 0 });
  expect(music.status()).toBe(200);
  expect((await request.get("/api/health", { maxRedirects: 0 })).status()).toBe(200);
});
