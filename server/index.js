'use strict';

const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { documents, projects, users } = require('./db');
const { scryptHash, scryptVerify, ensureAdminUser, requireAuth } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;
const COOKIE_NAME = 'session';

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ADMIN_DIR = path.join(__dirname, '..', 'admin');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
    const ts = Date.now().toString(36);
    cb(null, `${base || 'image'}-${ts}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image uploads allowed'));
      return;
    }
    cb(null, true);
  }
});

app.use(async (req, res, next) => {
  const sid = req.cookies[COOKIE_NAME];
  if (sid) {
    try {
      const raw = Buffer.from(sid, 'base64url');
      const [uidStr, expStr, sig] = raw.toString().split('|');
      if (uidStr && expStr && sig) {
        const uid = Number(uidStr);
        const exp = Number(expStr);
        if (uid > 0 && exp > Date.now()) {
          const h = require('node:crypto')
            .createHmac('sha256', process.env.SESSION_SECRET || 'dev_secret')
            .update(`${uid}|${exp}`)
            .digest('base64url');
          if (h === sig) {
            req.user = { id: uid };
          }
        }
      }
    } catch {}
  }
  next();
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const u = users.getByUsername(username);
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await scryptVerify(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const exp = Date.now() + 7 * 24 * 3600 * 1000;
  const sig = require('node:crypto')
    .createHmac('sha256', process.env.SESSION_SECRET || 'dev_secret')
    .update(`${u.id}|${exp}`)
    .digest('base64url');
  const sid = Buffer.from(`${u.id}|${exp}|${sig}`).toString('base64url');
  res.cookie(COOKIE_NAME, sid, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: exp - Date.now()
  });
  res.json({ ok: true, user: { id: u.id, username: u.username } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ user: req.user || null });
});

app.get('/api/content', (req, res) => {
  const site = documents.get('site') || { en: {}, id: {} };
  const allProjects = projects.all({ includeUnpublished: false });
  res.json({ site, projects: allProjects });
});

app.get('/api/admin/content', requireAuth, (req, res) => {
  const site = documents.get('site') || { en: {}, id: {} };
  res.json({ site });
});

app.put('/api/admin/content', requireAuth, (req, res) => {
  const { site } = req.body || {};
  if (!site || typeof site !== 'object') return res.status(400).json({ error: 'Invalid' });
  documents.upsert('site', site.en || {}, site.id || {});
  res.json({ site: documents.get('site') });
});

app.get('/api/admin/projects', requireAuth, (req, res) => {
  res.json({ projects: projects.all({ includeUnpublished: true }) });
});

app.post('/api/admin/projects', requireAuth, (req, res) => {
  const created = projects.create(req.body || {});
  res.status(201).json({ project: created });
});

app.put('/api/admin/projects/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const updated = projects.update(id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ project: updated });
});

app.delete('/api/admin/projects/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!projects.remove(id)) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

app.post('/api/admin/projects/reorder', requireAuth, (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Invalid' });
  projects.reorder(ids);
  res.json({ ok: true });
});

app.post('/api/admin/upload', requireAuth, upload.array('images', 10), (req, res) => {
  const files = (req.files || []).map((f) => `uploads/${f.filename}`);
  res.json({ files });
});

app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/admin', express.static(ADMIN_DIR));
app.use(express.static(PUBLIC_DIR));

async function init() {
  await ensureAdminUser();
  const { initialDocuments, seedProjects } = require('./content');
  initialDocuments();
  seedProjects();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

init();
