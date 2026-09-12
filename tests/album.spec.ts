import { test, expect, request } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { emptyProfile, profileSchema } from "../src/lib/profile";
import type { Album, Profile } from "../src/lib/profile";

test("shared persistence, validation, ownership, recovery, and version conflicts", async () => {
  const legacy = profileSchema.parse({
    name: "Legacy Profile",
    color: "pine",
    avatar: "headphones",
    answers: { pronouns: "they/them", role: "Makes music" },
  });
  expect(legacy.answers.source).toBe("");
  expect(legacy.answers.conversation).toBe("");
  expect("pronouns" in legacy.answers).toBeFalsy();

  const owner = await request.newContext({ baseURL: "http://127.0.0.1:3100" });
  const stranger = await request.newContext({ baseURL: "http://127.0.0.1:3100" });
  const input = { ...emptyProfile(), name: "API-Test Person" };
  expect((await owner.post("/api/profiles", { data: emptyProfile() })).status()).toBe(400);
  expect((await owner.post("/api/profiles", { data: { ...input, answers: { ...input.answers, songUrl: "javascript:alert(1)" } } })).status()).toBe(400);
  expect((await owner.post("/api/profiles", { data: { ...input, answers: { ...input.answers, motivation: "a".repeat(801) } } })).status()).toBe(400);
  expect((await owner.post("/api/profiles", { data: "x".repeat(25000), headers: { "Content-Type": "application/json" } })).status()).toBe(413);
  expect((await owner.post("/api/profiles", { data: "{oops", headers: { "Content-Type": "application/json" } })).status()).toBe(400);
  expect((await owner.post("/api/profiles", { data: input, headers: { Origin: "https://another-site.example" } })).status()).toBe(403);

  const response = await owner.post("/api/profiles", { data: input });
  expect(response.status()).toBe(201);
  const { profile, recoveryCode } = await response.json() as { profile: Profile; recoveryCode: string };
  expect(recoveryCode).toHaveLength(43);
  expect(response.headers()["set-cookie"]).toContain("HttpOnly");
  const otherView = await stranger.get("/api/profiles");
  const album = await otherView.json() as Album;
  expect(album.profiles.some(p => p.id === profile.id)).toBeTruthy();
  expect(album.myProfileId).toBeNull();
  expect(album.recoveryCode).toBeNull();
  expect(await otherView.text()).not.toContain(recoveryCode);
  expect((await stranger.put(`/api/profiles/${profile.id}`, { data: { profile: input, version: profile.updatedAt } })).status()).toBe(403);
  expect((await stranger.delete(`/api/profiles/${profile.id}`)).status()).toBe(403);
  expect((await owner.post("/api/profiles", { data: input })).status()).toBe(409);

  expect((await owner.put(`/api/profiles/${profile.id}`, { data: { profile: { ...input, name: "Updated Name" }, version: profile.updatedAt } })).status()).toBe(200);
  expect((await owner.put(`/api/profiles/${profile.id}`, { data: { profile: input, version: profile.updatedAt } })).status()).toBe(409);
  const secondDevice = await request.newContext({ baseURL: "http://127.0.0.1:3100" });
  expect((await secondDevice.post("/api/session", { data: { action: "recover", code: recoveryCode } })).status()).toBe(200);
  const recovered = await (await secondDevice.get("/api/profiles")).json() as Album;
  expect(recovered.myProfileId).toBe(profile.id);
  expect(recovered.profiles.find(p => p.id === profile.id)?.name).toBe("Updated Name");
  expect((await secondDevice.delete(`/api/profiles/${profile.id}`)).status()).toBe(200);
  expect((await (await owner.get("/api/profiles")).json() as Album).profiles.some(p => p.id === profile.id)).toBeFalsy();
  await owner.dispose(); await stranger.dispose(); await secondDevice.dispose();
});

test("team password gates every data path and logout revokes the session", async ({ browser }) => {
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:3101" });
  const page = await context.newPage();
  await page.goto("/2026/music-ai/profile");
  await expect(page.getByLabel("Team password", { exact: true })).toBeVisible();
  const input = { ...emptyProfile(), name: "Private Test" };
  expect((await context.request.get("/api/profiles")).status()).toBe(401);
  expect((await context.request.post("/api/profiles", { data: input })).status()).toBe(401);
  expect((await context.request.put("/api/profiles/anything", { data: {} })).status()).toBe(401);
  expect((await context.request.delete("/api/profiles/anything")).status()).toBe(401);
  expect((await context.request.post("/api/session", { data: { action: "recover", code: "none" } })).status()).toBe(401);
  await page.getByLabel("Team password", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Open team album" }).click();
  await expect(page.getByText("The team password is incorrect.")).toBeVisible();
  await page.getByLabel("Team password", { exact: true }).fill("test-huette-password");
  await page.getByRole("button", { name: "Open team album" }).click();
  await expect(page.getByRole("heading", { name: "The people behind the idea." })).toBeVisible();
  expect((await context.request.post("/api/profiles", { data: input })).status()).toBe(201);
  await page.reload();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByLabel("Team password", { exact: true })).toBeVisible();
  expect((await context.request.get("/api/profiles")).status()).toBe(401);
  await context.close();
});

test("fill, save, find, edit, present, and print profiles on desktop and mobile", async ({ page, browser }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/2026/music-ai/profile");
  await expect(page.getByRole("button", { name: "This is me", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Choose color theme" }).click();
  await expect(page.getByRole("menuitemradio", { name: "System" })).toHaveAttribute("data-state", "checked");
  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Choose color theme" }).click();
  await page.getByRole("menuitemradio", { name: "System" }).click();
  await page.screenshot({ path: testInfo.outputPath("desktop-empty.png"), fullPage: true });
  const initialAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(initialAxe.violations.map(v => ({ rule: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  await page.getByRole("button", { name: "This is me", exact: true }).click();
  await expect(page.locator(".color-picker [data-slot='toggle-group-item']")).toHaveCount(9);
  await expect(page.locator(".avatar-picker [data-slot='toggle-group-item']")).toHaveCount(12);
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByText("Please enter your name.")).toBeVisible();
  await page.getByLabel("What is your name?").fill("Alex Test");
  await page.getByLabel("Where are you originally from?").fill("Salzburg");
  await page.getByLabel("Where do you live now?").fill("Vienna");
  await page.getByLabel("What else do you do?").fill("Builds ideas and software");
  await page.getByLabel("What do you bring to the team?").fill("Python, curiosity, and a good ear");
  await page.getByRole("button", { name: "Continue later" }).click();
  await page.reload();
  await page.getByRole("button", { name: "This is me", exact: true }).click();
  await expect(page.getByLabel("What is your name?")).toHaveValue("Alex Test");
  await page.getByRole("tab", { name: "2 Music" }).click();
  await page.getByLabel("Which song describes you right now?").fill("Here Comes the Sun · The Beatles");
  await page.getByLabel("Add a link to your song").fill("https://example.com/song");
  await page.getByRole("tab", { name: "3 Challenge" }).click();
  await page.getByLabel("Why did you choose this challenge?").fill("Music connects people, and no one should need perfect motor control to join in.");
  await page.getByLabel("How did you hear about the hackathon?").fill("A colleague sent me the challenge list.");
  await page.getByLabel("Which barrier to making music would you remove?").fill("An instrument should adapt to the person using it.");
  await page.getByRole("tab", { name: "4 Fun" }).click();
  await page.getByLabel("What is your completely unnecessary superpower?").fill("I recognize songs from the first drum hit.");
  await page.getByLabel("Have you had a great conversation with anyone yet? If so, what was it about?").fill("Yes, about designing instruments around different bodies.");
  await page.getByLabel("What is your motto for this weekend?").fill("Listen first. Then build together.");
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByLabel("Personal edit code")).toBeVisible();
  const code = await page.getByLabel("Personal edit code").inputValue();
  expect(code).toHaveLength(43);
  await page.getByRole("button", { name: "Close", exact: true }).click();

  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await otherPage.goto("http://127.0.0.1:3100/2026/music-ai/profile");
  await expect(otherPage.getByRole("heading", { name: "Alex Test", exact: true })).toBeVisible();
  const fixtures = [];
  for (const person of [{ name: "Mika Demo", color: "berry", avatar: "guitar", role: "Music education and curious questions", song: "Aruarian Dance · Nujabes", motto: "Good ideas do not need sheet music." }, { name: "Noa Demo", color: "sky", avatar: "waveform", role: "Design for people", song: "Everything in Its Right Place · Radiohead", motto: "Fewer barriers. More music." }]) {
    const member = await request.newContext({ baseURL: "http://127.0.0.1:3100" });
    const response = await member.post("/api/profiles", { data: { ...emptyProfile(), name: person.name, color: person.color, avatar: person.avatar, answers: { ...emptyProfile().answers, role: person.role, song: person.song, motto: person.motto, home: "Vienna" } } });
    fixtures.push({ member, id: (await response.json()).profile.id });
  }
  await page.reload();
  await expect(page.locator(".profile-card")).toHaveCount(3);
  await page.screenshot({ path: testInfo.outputPath("desktop-team.png"), fullPage: true });
  await page.getByLabel("Search team").fill("Python");
  await expect(page.locator(".profile-card")).toHaveCount(1);
  await page.getByLabel("Search team").fill("no-such-result");
  await expect(page.getByRole("button", { name: "Clear search" })).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await page.getByRole("button", { name: "View Alex Test's profile" }).click();
  await expect(page.getByRole("dialog").getByText("An instrument should adapt to the person using it.", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog").getByText("Yes, about designing instruments around different bodies.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("What is your name?").fill("Alex Updated");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Alex Updated", exact: true })).toBeVisible();
  const closeToast = page.getByRole("button", { name: "Close notification" });
  if (await closeToast.isVisible()) await closeToast.click();

  await page.getByRole("button", { name: "Presentation view", exact: true }).click();
  await expect(page.getByRole("heading", { name: "This is us.", exact: true })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".presentation-dialog .profile-slide h2")).toHaveText("Alex Updated");
  await page.screenshot({ path: testInfo.outputPath("presentation.png") });
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".print-sheets")).toBeVisible();
  const pdf = await page.pdf({ path: testInfo.outputPath("team-slides.pdf"), preferCSSPageSize: true, printBackground: true });
  expect(pdf.toString("latin1").match(/\/Type \/Page\b/g)?.length).toBe(3);
  const ownerContext = page.context();
  await page.close();
  const mobilePage = await ownerContext.newPage();
  mobilePage.on("pageerror", error => errors.push(error.message));
  await mobilePage.setViewportSize({ width: 390, height: 844 });
  await mobilePage.goto("/2026/music-ai/profile");
  await mobilePage.screenshot({ path: testInfo.outputPath("mobile-team.png"), fullPage: true });
  expect(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await mobilePage.getByRole("button", { name: "My profile", exact: true }).click();
  await expect(mobilePage.getByRole("dialog")).toBeVisible();
  await mobilePage.waitForTimeout(150);
  await mobilePage.screenshot({ path: testInfo.outputPath("mobile-form.png") });
  const formAxe = await new AxeBuilder({ page: mobilePage }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(formAxe.violations.map(v => ({ rule: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  await mobilePage.getByRole("button", { name: "Continue later" }).click();
  await mobilePage.getByRole("button", { name: "View Alex Updated's profile" }).click();
  await mobilePage.getByRole("button", { name: "Delete profile", exact: true }).click();
  await mobilePage.getByRole("alertdialog").getByRole("button", { name: "Delete profile", exact: true }).click();
  await expect(mobilePage.locator(".profile-card")).toHaveCount(2);
  expect(errors).toEqual([]);
  for (const fixture of fixtures) { await fixture.member.delete(`/api/profiles/${fixture.id}`); await fixture.member.dispose(); }
  await other.close();
});
