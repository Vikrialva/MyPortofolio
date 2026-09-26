'use strict';

const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = process.env.DB_FILE || path.join(DATA_DIR, 'app.db');

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_FILE);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS documents (
    name       TEXT PRIMARY KEY,
    en         TEXT NOT NULL DEFAULT '{}',
    id         TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    slug       TEXT NOT NULL UNIQUE,
    en         TEXT NOT NULL DEFAULT '{}',
    id_locale  TEXT NOT NULL DEFAULT '{}',
    cover      TEXT,
    repo_url   TEXT,
    live_url   TEXT,
    featured   INTEGER NOT NULL DEFAULT 0,
    published  INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS project_images (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    path       TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images(project_id, sort_order);
  CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(published, sort_order);
`);

function parseJson(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function hydrateDocument(row) {
  if (!row) return null;
  return {
    name: row.name,
    en: parseJson(row.en, {}),
    id: parseJson(row.id, {}),
    updated_at: row.updated_at
  };
}

const documents = {
  all() {
    return db.prepare('SELECT name, en, id, updated_at FROM documents').all().map(hydrateDocument);
  },
  get(name) {
    return hydrateDocument(
      db.prepare('SELECT name, en, id, updated_at FROM documents WHERE name = ?').get(name)
    );
  },
  upsert(name, en, id) {
    db.prepare(
      `INSERT INTO documents (name, en, id, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(name) DO UPDATE SET
         en = excluded.en,
         id = excluded.id,
         updated_at = datetime('now')`
    ).run(name, JSON.stringify(en ?? {}), JSON.stringify(id ?? {}));
    return documents.get(name);
  },
  names() {
    return db.prepare('SELECT name FROM documents').all().map((r) => r.name);
  }
};

const projects = {
  all({ includeUnpublished = true } = {}) {
    const where = includeUnpublished ? '' : 'WHERE published = 1';
    return db
      .prepare(`SELECT * FROM projects ${where} ORDER BY sort_order ASC, id ASC`)
      .all()
      .map(hydrateProject);
  },
  get(id) {
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    return row ? hydrateProject(row) : null;
  },
  getBySlug(slug) {
    const row = db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug);
    return row ? hydrateProject(row) : null;
  },
  create(data) {
    const slug = uniqueSlug(data.slug || data.locales?.en?.title || 'project');
    const info = db
      .prepare(
        `INSERT INTO projects (slug, en, id_locale, cover, repo_url, live_url, featured, published, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        slug,
        JSON.stringify(data.locales?.en ?? {}),
        JSON.stringify(data.locales?.id ?? {}),
        data.cover ?? null,
        data.repo_url ?? null,
        data.live_url ?? null,
        data.featured ? 1 : 0,
        data.published === false ? 0 : 1,
        Number(data.sort_order) || 0
      );
    replaceImages(Number(info.lastInsertRowid), data.images);
    return projects.get(Number(info.lastInsertRowid));
  },
  update(id, data) {
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!existing) return null;

    const slug =
      data.slug && data.slug !== existing.slug ? uniqueSlug(data.slug, id) : existing.slug;

    db.prepare(
      `UPDATE projects SET
         slug = ?, en = ?, id_locale = ?, cover = ?, repo_url = ?, live_url = ?,
         featured = ?, published = ?, sort_order = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      slug,
      JSON.stringify(data.locales?.en ?? parseJson(existing.en, {})),
      JSON.stringify(data.locales?.id ?? parseJson(existing.id_locale, {})),
      data.cover === undefined ? existing.cover : data.cover,
      data.repo_url === undefined ? existing.repo_url : data.repo_url,
      data.live_url === undefined ? existing.live_url : data.live_url,
      data.featured === undefined ? existing.featured : data.featured ? 1 : 0,
      data.published === undefined ? existing.published : data.published ? 1 : 0,
      data.sort_order === undefined ? existing.sort_order : Number(data.sort_order) || 0,
      id
    );
    if (Array.isArray(data.images)) replaceImages(id, data.images);
    return projects.get(id);
  },
  remove(id) {
    return db.prepare('DELETE FROM projects WHERE id = ?').run(id).changes > 0;
  },
  reorder(ids) {
    const stmt = db.prepare('UPDATE projects SET sort_order = ? WHERE id = ?');
    ids.forEach((id, index) => stmt.run(index, id));
  }
};

function hydrateProject(row) {
  const images = db
    .prepare('SELECT path FROM project_images WHERE project_id = ? ORDER BY sort_order ASC, id ASC')
    .all(row.id)
    .map((r) => r.path);
  return {
    id: row.id,
    slug: row.slug,
    locales: {
      en: parseJson(row.en, {}),
      id: parseJson(row.id_locale, {})
    },
    cover: row.cover,
    repo_url: row.repo_url,
    live_url: row.live_url,
    featured: !!row.featured,
    published: !!row.published,
    sort_order: row.sort_order,
    images,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function replaceImages(projectId, images) {
  db.prepare('DELETE FROM project_images WHERE project_id = ?').run(projectId);
  const stmt = db.prepare('INSERT INTO project_images (project_id, path, sort_order) VALUES (?, ?, ?)');
  images.filter(Boolean).forEach((p, i) => stmt.run(projectId, p, i));
}

function uniqueSlug(base, ignoreId = null) {
  const slugify = (s) =>
    String(s)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'project';
  const root = slugify(base);
  let candidate = root;
  let n = 2;
  while (true) {
    const row = db.prepare('SELECT id FROM projects WHERE slug = ?').get(candidate);
    if (!row || row.id === ignoreId) return candidate;
    candidate = `${root}-${n++}`;
  }
}

const users = {
  getByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },
  create(username, passwordHash) {
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(
      username,
      passwordHash
    );
  },
  updatePassword(id, passwordHash) {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
  },
  count() {
    return db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  }
};

module.exports = { db, documents, projects, users, DB_FILE };
