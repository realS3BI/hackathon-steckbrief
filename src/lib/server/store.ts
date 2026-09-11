import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { profileSchema, type Profile, type ProfileInput } from "@/lib/profile";

let database: DatabaseSync | undefined;

function db() {
  if (database) return database;
  const path = resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH || "data/huettentoene.sqlite");
  mkdirSync(dirname(path), { recursive: true });
  database = new DatabaseSync(path);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      owner_hash TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  return database;
}

export function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

type Row = { id: string; content: string; created_at: string; updated_at: string };
function profile(row: Row): Profile {
  const content = profileSchema.parse(JSON.parse(row.content));
  return { ...content, id: row.id, createdAt: row.created_at, updatedAt: row.updated_at };
}

export const store = {
  list(): Profile[] {
    return (db().prepare("SELECT id, content, created_at, updated_at FROM profiles ORDER BY created_at, id").all() as Row[]).map(profile);
  },
  owned(token: string | undefined): Profile | null {
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
    const row = db().prepare("SELECT id, content, created_at, updated_at FROM profiles WHERE owner_hash = ?").get(hash(token)) as Row | undefined;
    return row ? profile(row) : null;
  },
  create(input: ProfileInput, token: string): Profile {
    const id = randomUUID();
    const now = new Date().toISOString();
    db().prepare("INSERT INTO profiles (id, owner_hash, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").run(id, hash(token), JSON.stringify(input), now, now);
    return { ...input, id, createdAt: now, updatedAt: now };
  },
  update(id: string, input: ProfileInput, token: string, version: string): boolean {
    const now = new Date().toISOString();
    const result = db().prepare("UPDATE profiles SET content = ?, updated_at = ? WHERE id = ? AND owner_hash = ? AND updated_at = ?").run(JSON.stringify(input), now, id, hash(token), version);
    return Number(result.changes) === 1;
  },
  delete(id: string, token: string): boolean {
    return Number(db().prepare("DELETE FROM profiles WHERE id = ? AND owner_hash = ?").run(id, hash(token)).changes) === 1;
  },
  healthy(): boolean {
    return Boolean(db().prepare("SELECT 1 AS ok").get());
  },
};
