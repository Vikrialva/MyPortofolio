'use strict';

(function () {
  var state = { site: null, projects: [] };
  var grid = null;

  function lang() {
    return typeof window.getLang === 'function' ? window.getLang() : 'en';
  }

  function imgUrl(p) {
    return p ? '/' + String(p).replace(/^\//, '') : '';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function safeUrl(u) {
    var s = String(u == null ? '' : u).trim();
    if (/^(https?:)?\/\//i.test(s) || s.charAt(0) === '/' || s.charAt(0) === '#') return esc(s);
    return '#';
  }

  function applyMeta() {
    var s = (state.site && state.site.en) || {};
    if (s.title) document.title = s.title;
    if (s.description) {
      var m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute('content', s.description);
    }
    if (s.keywords) {
      var k = document.querySelector('meta[name="keywords"]');
      if (!k) {
        k = document.createElement('meta');
        k.setAttribute('name', 'keywords');
        document.head.appendChild(k);
      }
      k.setAttribute('content', s.keywords);
    }
    var email = s['contact.email'];
    if (email) {
      var link = document.getElementById('contact-email-link');
      if (link) link.setAttribute('href', 'mailto:' + email);
      var label = document.getElementById('contact-email-text');
      if (label) label.textContent = email;
    }
  }

  function tagChip(t, primary) {
    return (
      '<span class="text-xs ' +
      (primary
        ? 'bg-orange-50 dark:bg-zinc-800 text-accent border border-orange-200 dark:border-zinc-700'
        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400') +
      ' px-3 py-1 rounded-full">' +
      esc(t) +
      '</span>'
    );
  }

  function projectCard(p, i) {
    var l = lang();
    var loc = (p.locales && p.locales[l]) || (p.locales && p.locales.en) || {};
    var title = esc(loc.title || p.slug);
    var desc = esc(loc.desc || '');
    var tags = Array.isArray(loc.tags) ? loc.tags : [];
    var gallery = (p.images && p.images.length ? p.images : p.cover ? [p.cover] : []).map(imgUrl);
    var link = p.repo_url || p.live_url || 'projects.html';
    var isExternal = /^https?:/i.test(String(link));

    var cover = gallery[0]
      ? '<img src="' + esc(gallery[0]) + '" alt="' + title + '" loading="lazy">'
      : '<div class="w-full h-full grid place-items-center text-xs text-zinc-400">No image</div>';

    var counter = gallery.length
      ? '<span class="absolute top-3 right-3 text-xs bg-black/60 text-white px-2.5 py-1 rounded-full">1 / ' + gallery.length + '</span>'
      : '';

    var galleryAttr = gallery.length
      ? ' data-gallery="' + gallery.map(esc).join('|') + '"'
      : '';

    var tagsHtml = tags.length
      ? tags
          .map(function (t, ti) {
            return tagChip(t, ti === 0);
          })
          .join('')
      : '';

    var sub = loc.subtitle
      ? '<p class="text-xs text-zinc-400 mb-1">' + esc(loc.subtitle) + '</p>'
      : '';

    var actions = '';
    if (p.repo_url) {
      actions +=
        '<a href="' + safeUrl(p.repo_url) + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-white">' +
        '<svg class="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>' +
        '<span>View on GitHub →</span></a>';
    }
    if (p.live_url) {
      actions +=
        '<a href="' + safeUrl(p.live_url) + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-white ml-4">' +
        '<span>Live demo →</span></a>';
    }
    if (!actions) {
      actions =
        '<a href="projects.html" class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-white">' +
        '<span>Detail →</span></a>';
    }

    return (
      '<article class="card-h reveal d' +
      ((i % 4) + 1) +
      ' group rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-accent">' +
      (gallery.length
        ? '<div class="pf w-full h-36 cursor-zoom-in" role="button" tabindex="0" aria-label="Open ' +
          title +
          ' gallery"' +
          galleryAttr +
          '>' +
          cover +
          counter +
          '</div>'
        : '<div class="pf w-full h-36">' + cover + '</div>') +
      '<div class="p-6">' +
      (tagsHtml ? '<div class="flex flex-wrap gap-2 mb-3">' + tagsHtml + '</div>' : '') +
      '<a href="' + safeUrl(link) + '"' +
      (isExternal ? ' target="_blank" rel="noopener noreferrer"' : '') +
      '>' +
      '<h3 class="font-display font-bold text-xl text-zinc-900 dark:text-white mb-1">' + title + '</h3>' +
      '</a>' +
      sub +
      '<p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">' + desc + '</p>' +
      '<div>' + actions + '</div>' +
      '</div>' +
      '</article>'
    );
  }

  function renderProjects() {
    if (!grid) return;
    var list = state.projects.slice();
    if (grid.dataset.all === 'true') {
      // no filtering
    } else {
      list = list.filter(function (p) {
        return p.featured;
      });
    }
    if (!list.length) {
      grid.innerHTML =
        '<p class="col-span-full text-sm text-zinc-500 text-center py-10">Belum ada project untuk ditampilkan.</p>';
      return;
    }
    grid.innerHTML = list.map(projectCard).join('');
  }

  function render() {
    if (window.__mergeI18n && state.site) {
      window.__mergeI18n(state.site.en, state.site.id);
    }
    if (typeof window.__applyI18n === 'function') window.__applyI18n();
    applyMeta();
    renderProjects();
  }

  function boot() {
    grid = document.getElementById('work-grid');
    fetch('/api/content')
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        state.site = data.site;
        state.projects = data.projects || [];
        render();
      })
      .catch(function () {
        render();
      });

    document.addEventListener('langchange', render);
    if (window.__applyI18n) window.__applyI18n();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.PortfolioContent = {
    refresh: function () {
      return fetch('/api/content')
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          state.site = data.site;
          state.projects = data.projects || [];
          render();
        });
    },
    get: function () {
      return state;
    }
  };
})();
