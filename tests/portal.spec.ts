import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { MUSIC_EVENT_PATH, MUSIC_PATH, PROFILE_PATH, YEAR_PATH } from "../src/lib/routes";

test("browse the archive, year, event, creator, and team through the new hierarchy", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Made together. Collected here." })).toBeVisible();
  await expect(page).toHaveURL("http://127.0.0.1:3100/");
  await page.screenshot({ path: testInfo.outputPath("archive-desktop.png"), fullPage: true });
  const archiveAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(archiveAxe.violations.map(v => ({ rule: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);

  await page.getByRole("navigation", { name: "Browse by year" }).getByRole("link", { name: "2026" }).click();
  await expect(page).toHaveURL(new RegExp(`${YEAR_PATH}$`));
  await expect(page.getByRole("heading", { name: "2026", exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("year-desktop.png"), fullPage: true });
  await page.getByRole("link", { name: "Explore Music & AI" }).click();
  await expect(page).toHaveURL(new RegExp(`${MUSIC_EVENT_PATH}$`));
  await expect(page.getByRole("heading", { name: "Music & AI Made at the hackathon." })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("event-desktop.png"), fullPage: true });
  const eventAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(eventAxe.violations.map(v => ({ rule: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);

  await page.getByRole("link", { name: "Try making music" }).click();
  await expect(page).toHaveURL(new RegExp(`${MUSIC_PATH}$`));
  await expect(page.getByRole("heading", { name: "How fast does music move?" })).toBeVisible();
  await page.getByRole("navigation", { name: "Page location" }).getByRole("link", { name: "Music & AI", exact: true }).click();
  await page.getByRole("link", { name: "Meet the team", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${PROFILE_PATH}$`));
  await expect(page.getByRole("heading", { name: "The people behind the idea." })).toBeVisible();
  await page.getByRole("navigation", { name: "Page location" }).getByRole("link", { name: "All hackathons" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3100/");
  expect(errors).toEqual([]);
});

test("landing pages support a narrow screen, system dark mode, and keyboard navigation", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:3101", viewport: { width: 390, height: 844 }, colorScheme: "dark", reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const [path, name] of [["/", "archive"], [YEAR_PATH, "year"], [MUSIC_EVENT_PATH, "event"]]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveClass(/dark/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map(v => ({ rule: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`${name}-mobile-dark.png`), fullPage: true });
    await page.setViewportSize({ width: 320, height: 760 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
  }
  const teamLink = page.getByRole("link", { name: "Meet the team", exact: true });
  await teamLink.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Team password", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Summit Sounds, event home" }).click();
  await expect(page).toHaveURL(new RegExp(`${MUSIC_EVENT_PATH}$`));
  await context.close();
});
