'use strict';

const SCHEMA = {
  hero: {
    title: 'Hero Section',
    hint: 'Teks utama yang dilihat pengunjung pertama kali. Field HTML menerima tag seperti <span> dan <strong>.',
    fields: [
      { k: 'hero.avail', l: 'Label availability', t: 'text' },
      { k: 'hero.hi', l: 'Judul Hero', t: 'html' },
      { k: 'hero.tagline', l: 'Tagline Hero', t: 'html' },
      { k: 'hero.cta1', l: 'Teks tombol utama', t: 'text' },
      { k: 'hero.cta2', l: 'Teks tombol kedua', t: 'text' },
      { k: 'hero.badge', l: 'Badge foto', t: 'text' }
    ]
  },
  services: {
    title: 'Layanan',
    fields: [
      { k: 'svc.eyebrow', l: 'Eyebrow', t: 'text' },
      { k: 'svc.title', l: 'Judul section', t: 'text' },
      { k: 'svc1.t', l: 'Layanan 1 — judul', t: 'text' },
      { k: 'svc1.d', l: 'Layanan 1 — deskripsi', t: 'area' },
      { k: 'svc2.t', l: 'Layanan 2 — judul', t: 'text' },
      { k: 'svc2.d', l: 'Layanan 2 — deskripsi', t: 'area' },
      { k: 'svc3.t', l: 'Layanan 3 — judul', t: 'text' },
      { k: 'svc3.d', l: 'Layanan 3 — deskripsi', t: 'area' }
    ]
  },
  work: {
    title: 'Section Work',
    hint: 'Judul bagian "Selected work" di homepage. Daftar project diatur di tab Projects.',
    fields: [
      { k: 'work.eyebrow', l: 'Eyebrow', t: 'text' },
      { k: 'work.title', l: 'Judul section', t: 'text' },
      { k: 'work.all', l: 'Teks link "Semua proyek"', t: 'text' }
    ]
  },
  about: {
    title: 'About',
    fields: [
      { k: 'about.eyebrow', l: 'Eyebrow', t: 'text' },
      { k: 'about.title', l: 'Judul section', t: 'html' },
      { k: 'about.p1', l: 'Paragraf 1', t: 'area' },
      { k: 'about.p2', l: 'Paragraf 2', t: 'area' },
      { k: 'about.stack', l: 'Judul daftar skill', t: 'text' }
    ]
  },
  cta: {
    title: 'Kontak / CTA',
    fields: [
      { k: 'ct.eyebrow', l: 'Eyebrow', t: 'text' },
      { k: 'ct.title', l: 'Judul', t: 'html' },
      { k: 'ct.p', l: 'Deskripsi', t: 'area' },
      { k: 'contact.email', l: 'Email kontak', t: 'text' },
      { k: 'form.name', l: 'Label nama', t: 'text' },
      { k: 'form.email', l: 'Label email', t: 'text' },
      { k: 'form.subject', l: 'Label subjek', t: 'text' },
      { k: 'form.message', l: 'Label pesan', t: 'text' },
      { k: 'form.send', l: 'Teks tombol kirim', t: 'text' },
      { k: 'ph.name', l: 'Placeholder nama', t: 'text' },
      { k: 'ph.email', l: 'Placeholder email', t: 'text' },
      { k: 'ph.subject', l: 'Placeholder subjek', t: 'text' },
      { k: 'ph.message', l: 'Placeholder pesan', t: 'text' }
    ]
  },
  contact: {
    title: 'Navigasi & Footer',
    fields: [
      { k: 'nav.services', l: 'Nav — Layanan', t: 'text' },
      { k: 'nav.work', l: 'Nav — Karya', t: 'text' },
      { k: 'nav.about', l: 'Nav — Tentang', t: 'text' },
      { k: 'nav.contact', l: 'Nav — Kontak', t: 'text' },
      { k: 'nav.hire', l: 'Nav — Rekrut saya', t: 'text' },
      { k: 'foot.rights', l: 'Footer — hak cipta', t: 'text' },
      { k: 'foot.dev', l: 'Footer — dikembangkan oleh', t: 'text' },
      { k: 'foot.dist', l: 'Footer — didistribusikan oleh', t: 'text' },
      { k: 'foot.built', l: 'Footer — dibangun dengan', t: 'text' }
    ]
  },
  seo: {
    title: 'SEO & Metadata',
    hint: 'Dipakai untuk <title> dan <meta> di semua halaman.',
    fields: [
      { k: 'name', l: 'Nama', t: 'text' },
      { k: 'title', l: 'Title tag', t: 'text' },
      { k: 'description', l: 'Meta description', t: 'area' },
      { k: 'keywords', l: 'Keywords', t: 'text' }
    ]
  }
};

const state = {
  site: { en: {}, id: {} },
  projects: [],
  tab: 'projects',
  draft: null,
  cover: '',
  images: []
};

const $ = (id) => document.getElementById(id);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};
const imgUrl = (p) => (p ? '/' + String(p).replace(/^\//, '') : '');
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: opts.body && !(opts.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {},
    ...opts
  });
  if (res.status === 401) {
    showLogin();
    throw new Error('unauthorized');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function toast(msg, kind = 'ok') {
  const t = $('toast');
  t.className =
    'fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-lg text-sm font-medium ' +
    (kind === 'ok'
      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
      : 'bg-red-600 text-white');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.add('hidden'), 2600);
}

/* ═══ AUTH ═══ */
function showLogin() {
  $('login').classList.remove('hidden');
  $('app').classList.add('hidden');
}
function showApp() {
  $('login').classList.add('hidden');
  $('app').classList.remove('hidden');
  document.querySelector('.tab[data-tab="' + state.tab + '"]')?.click();
}

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('l-err').classList.add('hidden');
  try {
    await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: $('l-user').value.trim(), password: $('l-pass').value })
    });
    await loadAll();
    showApp();
    toast('Berhasil login');
  } catch (err) {
    $('l-err').textContent = err.message === 'unauthorized' ? 'Username atau password salah.' : err.message;
    $('l-err').classList.remove('hidden');
  }
});

$('logout').addEventListener('click', async () => {
  await api('/api/auth/logout', { method: 'POST' });
  location.reload();
});

/* ═══ TABS ═══ */
document.querySelectorAll('.tab').forEach((btn) =>
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.tab = btn.dataset.tab;
    renderTab();
  })
);

/* ═══ SITE CONTENT ═══ */
function renderTab() {
  const panel = $('panel');
  panel.innerHTML = '';
  if (state.tab === 'projects') renderProjects(panel);
  else renderSite(panel, SCHEMA[state.tab]);
  $('savebar').classList.toggle('hidden', state.tab === 'projects');
}

function renderSite(panel, group) {
  const card = el('div', 'card space-y-6');
  card.appendChild(
    el('div', '', `<h2 class="font-semibold text-lg">${esc(group.title)}</h2>` +
      (group.hint ? `<p class="text-sm text-zinc-500 mt-1">${esc(group.hint)}</p>` : ''))
  );

  for (const f of group.fields) {
    const wrap = el('div', '');
    const label = el('div', 'mb-3 flex items-baseline gap-2 flex-wrap');
    label.appendChild(el('span', 'text-sm font-medium', esc(f.l)));
    label.appendChild(el('code', 'text-xs text-zinc-400', esc(f.k)));
    if (f.t === 'html') label.appendChild(el('span', 'text-xs bg-orange-50 dark:bg-zinc-800 text-accent border border-orange-200 dark:border-zinc-700 px-2 py-0.5 rounded', 'HTML'));
    wrap.appendChild(label);

    const grid = el('div', 'grid md:grid-cols-2 gap-4');
    for (const lang of ['en', 'id']) {
      const box = el('div', '');
      box.appendChild(el('div', 'text-xs font-semibold text-zinc-400 mb-1.5 uppercase', lang === 'en' ? 'English' : 'Indonesia'));
      const input =
        f.t === 'area'
          ? el('textarea')
          : el('input');
      if (f.t === 'area') input.rows = 3;
      input.className = 'inp';
      input.value = state.site[lang]?.[f.k] ?? '';
      input.dataset.key = f.k;
      input.dataset.lang = lang;
      input.addEventListener('input', () => {
        state.draft[lang][f.k] = input.value;
        markDirty();
      });
      box.appendChild(input);
      grid.appendChild(box);
    }
    wrap.appendChild(grid);
    card.appendChild(wrap);
  }
  panel.appendChild(card);
}

function markDirty() {
  $('save-status').textContent = 'Ada perubahan yang belum disimpan.';
}

$('save-btn').addEventListener('click', async () => {
  $('save-btn').disabled = true;
  $('save-status').textContent = 'Menyimpan...';
  try {
    const res = await api('/api/admin/content', {
      method: 'PUT',
      body: JSON.stringify({ site: state.draft })
    });
    state.site = res.site;
    state.draft = structuredClone(res.site);
    $('save-status').textContent = 'Tersimpan ' + new Date().toLocaleTimeString('id-ID');
    toast('Konten website tersimpan');
  } catch (e) {
    $('save-status').textContent = 'Gagal menyimpan: ' + e.message;
  }
  $('save-btn').disabled = false;
});

$('save-reset').addEventListener('click', () => {
  state.draft = structuredClone(state.site);
  renderTab();
  $('save-status').textContent = 'Perubahan dibatalkan.';
});

/* ═══ PROJECTS ═══ */
function renderProjects(panel) {
  const head = el('div', 'flex items-center justify-between gap-4 flex-wrap');
  head.appendChild(
    el('div', '', `<h2 class="font-semibold text-lg">Projects <span class="text-sm font-normal text-zinc-500">(${state.projects.length})</span></h2>`)
  );
  const add = el('button', 'px-4 py-2.5 rounded-lg bg-accent hover:bg-orange-600 text-white text-sm font-medium', '+ Tambah Project');
  add.addEventListener('click', () => openProject(null));
  head.appendChild(add);
  panel.appendChild(head);

  if (!state.projects.length) {
    panel.appendChild(el('div', 'card text-sm text-zinc-500 text-center py-10', 'Belum ada project. Klik "Tambah Project" untuk membuat.'));
    return;
  }

  state.projects.forEach((p, i) => {
    const card = el('div', 'card flex flex-col sm:flex-row gap-4');
    const prev = el('div', 'w-full sm:w-40 h-24 sm:h-20 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800 grid place-items-center');
    if (p.cover) prev.innerHTML = `<img src="${esc(imgUrl(p.cover))}" alt="" class="w-full h-full object-cover">`;
    else prev.appendChild(el('span', 'text-xs text-zinc-400', 'No image'));
    card.appendChild(prev);

    const body = el('div', 'flex-1 min-w-0');
    const badges = [
      p.published ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700',
      p.featured ? 'bg-orange-50 dark:bg-zinc-800 text-accent border-orange-200 dark:border-zinc-700' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
    ];
    const badgeHtml =
      `<span class="text-xs border px-2 py-0.5 rounded-full ${badges[0]}">${p.published ? 'Published' : 'Draft'}</span>` +
      (p.featured ? `<span class="text-xs border px-2 py-0.5 rounded-full ${badges[1]}">Featured</span>` : '');
    body.appendChild(
      el('h3', 'font-semibold truncate',
        esc(p.locales.en?.title || p.locales.id?.title || '(tanpa judul)') + ' ' + badgeHtml)
    );
    body.appendChild(el('p', 'text-sm text-zinc-500 line-clamp-2 mt-0.5', esc(p.locales.en?.desc || '')));
    body.appendChild(el('p', 'text-xs text-zinc-400 mt-1', `slug: ${esc(p.slug)} · ${p.images.length} gambar`));
    card.appendChild(body);

    const actions = el('div', 'flex sm:flex-col gap-2 shrink-0');
    const mk = (label, cls, fn) => {
      const b = el('button', 'text-xs px-3 py-2 rounded-lg border ' + cls, label);
      b.addEventListener('click', fn);
      return b;
    };
    actions.appendChild(mk('Edit', 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800', () => openProject(p)));
    if (i > 0) actions.appendChild(mk('↑', 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800', () => move(i, -1)));
    if (i < state.projects.length - 1) actions.appendChild(mk('↓', 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800', () => move(i, 1)));
    actions.appendChild(mk('Hapus', 'border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950', removeProject.bind(null, p)));
    card.appendChild(actions);

    panel.appendChild(card);
  });
}

async function move(i, dir) {
  const list = state.projects;
  [list[i], list[i + dir]] = [list[i + dir], list[i]];
  await api('/api/admin/projects/reorder', { method: 'POST', body: JSON.stringify({ ids: list.map((p) => p.id) }) });
  await loadProjects();
}

async function removeProject(p) {
  if (!confirm(`Hapus project "${p.locales.en?.title || p.slug}"? Tindakan ini tidak bisa dibatalkan.`)) return;
  await api('/api/admin/projects/' + p.id, { method: 'DELETE' });
  await loadProjects();
  toast('Project dihapus');
}

/* ═══ PROJECT MODAL ═══ */
function openProject(p) {
  $('m-id').value = p?.id ?? '';
  $('m-title').textContent = p ? 'Edit Project' : 'Tambah Project';
  $('m-err').classList.add('hidden');
  $('m-title-en').value = p?.locales.en?.title ?? '';
  $('m-title-id').value = p?.locales.id?.title ?? '';
  $('m-sub-en').value = p?.locales.en?.subtitle ?? '';
  $('m-sub-id').value = p?.locales.id?.subtitle ?? '';
  $('m-desc-en').value = p?.locales.en?.desc ?? '';
  $('m-desc-id').value = p?.locales.id?.desc ?? '';
  $('m-cat-en').value = p?.locales.en?.category ?? '';
  $('m-cat-id').value = p?.locales.id?.category ?? '';
  $('m-tags').value = (p?.locales.en?.tags ?? p?.locales.id?.tags ?? []).join(', ');
  $('m-repo').value = p?.repo_url ?? '';
  $('m-live').value = p?.live_url ?? '';
  $('m-order').value = p?.sort_order ?? state.projects.length;
  $('m-featured').checked = !!p?.featured;
  $('m-published').checked = p ? !!p.published : true;
  $('m-cover-file').value = '';
  $('m-gallery-file').value = '';

  state.cover = p?.cover || '';
  state.images = [...(p?.images || [])];

  renderCover();
  renderGallery();
  $('modal').classList.remove('hidden');
}

$('m-cover-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const [path] = await uploadFiles([file]);
  state.cover = path;
  renderCover();
});

$('m-cover-clear').addEventListener('click', () => {
  state.cover = '';
  renderCover();
});

$('m-gallery-file').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  if (!files.length) return;
  const paths = await uploadFiles(files);
  state.images.push(...paths);
  renderGallery();
});

function renderCover() {
  const box = $('m-cover-prev');
  box.innerHTML = state.cover
    ? `<img src="${esc(imgUrl(state.cover))}" class="w-full h-full object-cover">`
    : '<span class="text-xs text-zinc-400">No image</span>';
  $('m-cover-clear').classList.toggle('hidden', !state.cover);
}

function renderGallery() {
  const box = $('m-gallery');
  box.innerHTML = '';
  state.images.forEach((path, i) => {
    const cell = el('div', 'relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 group');
    cell.draggable = true;
    cell.innerHTML = `<img src="${esc(imgUrl(path))}" alt="" class="w-full h-full object-cover">`;
    const del = el('button', 'absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-md bg-black/60 text-white text-xs hover:bg-red-600', '&times;');
    del.addEventListener('click', () => { state.images.splice(i, 1); renderGallery(); });
    cell.appendChild(del);
    cell.addEventListener('dragstart', () => { cell.dataset.idx = i; });
    cell.addEventListener('dragover', (e) => e.preventDefault());
    cell.addEventListener('drop', () => {
      const from = Number(cell.dataset.idx);
      if (Number.isNaN(from) || from === i) return;
      const [moved] = state.images.splice(from, 1);
      state.images.splice(i, 0, moved);
      renderGallery();
    });
    box.appendChild(cell);
  });
}

async function uploadFiles(files) {
  const fd = new FormData();
  files.forEach((f) => fd.append('images', f));
  try {
    const res = await api('/api/admin/upload', { method: 'POST', body: fd });
    return res.files;
  } catch (e) {
    toast(e.message, 'err');
    return [];
  }
}

$('m-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errBox = $('m-err');
  errBox.classList.add('hidden');

  const titleEn = $('m-title-en').value.trim();
  const titleId = $('m-title-id').value.trim();
  if (!titleEn && !titleId) {
    errBox.textContent = 'Judul minimal salah satu bahasa harus diisi.';
    errBox.classList.remove('hidden');
    return;
  }

  const tags = $('m-tags').value.split(',').map((s) => s.trim()).filter(Boolean);
  const payload = {
    locales: {
      en: { title: titleEn, subtitle: $('m-sub-en').value.trim(), desc: $('m-desc-en').value.trim(), category: $('m-cat-en').value.trim(), tags },
      id: { title: titleId, subtitle: $('m-sub-id').value.trim(), desc: $('m-desc-id').value.trim(), category: $('m-cat-id').value.trim(), tags }
    },
    cover: state.cover,
    images: state.images,
    repo_url: $('m-repo').value.trim() || null,
    live_url: $('m-live').value.trim() || null,
    sort_order: Number($('m-order').value) || 0,
    featured: $('m-featured').checked,
    published: $('m-published').checked
  };

  const id = $('m-id').value;
  try {
    if (id) await api('/api/admin/projects/' + id, { method: 'PUT', body: JSON.stringify(payload) });
    else await api('/api/admin/projects', { method: 'POST', body: JSON.stringify(payload) });
    $('modal').classList.add('hidden');
    await loadProjects();
    toast(id ? 'Project diperbarui' : 'Project ditambahkan');
  } catch (e) {
    errBox.textContent = e.message;
    errBox.classList.remove('hidden');
  }
});

$('modal').addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) $('modal').classList.add('hidden');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') $('modal').classList.add('hidden');
});

/* ═══ BOOT ═══ */
async function loadProjects() {
  const res = await api('/api/admin/projects');
  state.projects = res.projects;
  renderTab();
}

async function loadAll() {
  const res = await api('/api/admin/content');
  state.site = res.site;
  state.draft = structuredClone(res.site);
  await loadProjects();
}

async function boot() {
  const me = await api('/api/auth/me').catch(() => ({ user: null }));
  if (!me.user) return showLogin();
  await loadAll();
  showApp();
}

boot();
