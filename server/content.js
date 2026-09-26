'use strict';

const { documents, projects } = require('./db');

const SITE_EN = {
  name: 'Vikri Alva Pratama',
  title: 'Vikri Alva Pratama - Freelance Full Stack Developer',
  description:
    'Vikri Alva Pratama - Freelance Full Stack Developer. I build complete web applications from database to deployment: fast, scalable and maintainable.',
  keywords: 'freelance developer, full stack developer, Laravel, React, PHP, Tailwind, portfolio',
  'nav.services': 'Services',
  'nav.work': 'Work',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.hire': 'Hire me',
  'hero.avail': 'Available for work',
  'hero.hi': "Hi, I'm <span class=\"text-accent\">Vikri Alva Pratama</span>",
  'hero.tagline':
    'Freelance <strong class="font-medium text-zinc-700 dark:text-zinc-300">Full Stack Developer</strong>. I design, build and ship complete web applications — from database schema to pixel-perfect interface. Fast, scalable, maintainable.',
  'hero.cta1': 'View my work',
  'hero.cta2': 'Get in touch',
  'hero.badge': '3+ Yrs Exp',
  'svc.eyebrow': 'What I do',
  'svc.title': 'Services',
  'svc1.t': 'Frontend Development',
  'svc1.d':
    'Modern, responsive interfaces with React and JavaScript, styled with Tailwind CSS. Pixel-perfect, accessible and blazing fast — with clean, well-tested code.',
  'svc2.t': 'Backend & APIs',
  'svc2.d':
    'Robust APIs and web applications built with PHP and Laravel. Authentication, background jobs, payment integration and solid database design with MySQL.',
  'svc3.t': 'DevOps & Deployment',
  'svc3.d':
    'Ship with confidence: Docker containers, CI/CD pipelines, cloud deployment (Vercel, AWS) plus monitoring, logging and automated testing baked in from day one.',
  'work.eyebrow': 'Portfolio',
  'work.title': 'Selected work',
  'work.all': 'All projects →',
  'about.eyebrow': 'About me',
  'about.title': 'A bit about<br>who I am',
  'about.p1':
    "I'm Vikri Alva Pratama, a freelance full stack developer based in Paris with 5 years of experience building web applications for startups, agencies, and scale-ups across Europe. I own products end to end — from database schema and API design all the way to polished user interfaces.",
  'about.p2':
    "I believe great software is invisible — it just works, at any scale. My code is typed, tested and built to last. When I'm not coding, you'll find me hiking or hunting for a good espresso.",
  'about.stack': 'Stack & tools',
  'ct.eyebrow': 'Get in touch',
  'ct.title': "Let's work<br>together",
  'ct.p':
    "I'm open to full-stack missions, short or long-term. New product build, API development, performance rescue, or an extra pair of hands on your team — let's talk.",
  'form.name': 'Name',
  'form.email': 'Email',
  'form.subject': 'Subject',
  'form.message': 'Message',
  'form.send': 'Send message →',
  'ph.name': 'Jane Smith',
  'ph.email': 'jane@company.com',
  'ph.subject': 'Project inquiry',
  'ph.message': 'Tell me about your project...',
  'contact.email': 'vikrialvapratama28@gmail.com',
  'foot.rights': 'All rights reserved.',
  'foot.dev': 'Developed by',
  'foot.dist': 'Distributed by',
  'foot.built': 'Built with'
};

const SITE_ID = {
  'nav.services': 'Layanan',
  'nav.work': 'Karya',
  'nav.about': 'Tentang',
  'nav.contact': 'Kontak',
  'nav.hire': 'Rekrut saya',
  'hero.avail': 'Terbuka untuk kerja',
  'hero.hi': 'Hai, saya <span class="text-accent">Vikri Alva Pratama</span>',
  'hero.tagline':
    'Freelancer <strong class="font-medium text-zinc-700 dark:text-zinc-300">Full Stack Developer</strong>. Saya merancang, membangun, dan meluncurkan aplikasi web lengkap — dari skema database hingga antarmuka yang rapi. Cepat, scalable, mudah dirawat.',
  'hero.cta1': 'Lihat karya saya',
  'hero.cta2': 'Hubungi saya',
  'hero.badge': '3+ Thn Pengalaman',
  'svc.eyebrow': 'Apa yang saya kerjakan',
  'svc.title': 'Layanan',
  'svc1.t': 'Pengembangan Frontend',
  'svc1.d':
    'Antarmuka modern dan responsif dengan React dan JavaScript, distyling dengan Tailwind CSS. Presisi piksel, aksesibel, dan sangat cepat — dengan kode yang bersih dan teruji dengan baik.',
  'svc2.t': 'Backend & API',
  'svc2.d':
    'API dan aplikasi web yang tangguh dibangun dengan PHP dan Laravel. Autentikasi, background jobs, integrasi pembayaran, dan desain database yang solid dengan MySQL.',
  'svc3.t': 'DevOps & Deployment',
  'svc3.d':
    'Rilis dengan percaya diri: container Docker, pipeline CI/CD, deployment cloud (Vercel, AWS) plus monitoring, logging, dan automated testing sejak hari pertama.',
  'work.eyebrow': 'Portofolio',
  'work.title': 'Karya terpilih',
  'work.all': 'Semua proyek →',
  'about.eyebrow': 'Tentang saya',
  'about.title': 'Sekilas<br>tentang saya',
  'about.p1':
    'Saya Vikri Alva Pratama, full stack developer freelance yang berbasis di Paris dengan pengalaman 5 tahun membangun aplikasi web untuk startup, agensi, dan scale-up di seluruh Eropa. Saya menggarap produk dari ujung ke ujung — dari skema database dan desain API hingga antarmuka yang mulus.',
  'about.p2':
    'Saya percaya software yang hebat itu tak terlihat — dia bekerja, di skala berapa pun. Kode saya ter-typing, teruji, dan dibangun untuk tahan lama. Saat tidak coding, saya suka hiking atau berburu espresso yang enak.',
  'about.stack': 'Stack & alat',
  'ct.eyebrow': 'Hubungi saya',
  'ct.title': 'Mari bekerja<br>sama',
  'ct.p':
    'Saya terbuka untuk misi full-stack, jangka pendek maupun panjang. Bangun produk baru, pengembangan API, perbaikan performa, atau tambahan tenaga di tim Anda — mari bicara.',
  'form.name': 'Nama',
  'form.email': 'Email',
  'form.subject': 'Subjek',
  'form.message': 'Pesan',
  'form.send': 'Kirim pesan →',
  'ph.name': 'Nama Anda',
  'ph.email': 'email@perusahaan.com',
  'ph.subject': 'Pertanyaan proyek',
  'ph.message': 'Ceritakan tentang proyek Anda...',
  'contact.email': 'vikrialvapratama28@gmail.com',
  'foot.rights': 'Hak cipta dilindungi.',
  'foot.dev': 'Dikembangkan oleh',
  'foot.dist': 'Didistribusikan oleh',
  'foot.built': 'Dibangun dengan'
};

function fillMissing(docName, defaults) {
  const doc = documents.get(docName);
  if (!doc) {
    documents.upsert(docName, defaults.en, defaults.id);
    return;
  }
  const en = { ...doc.en };
  const id = { ...doc.id };
  let changed = false;
  for (const [k, v] of Object.entries(defaults.en)) {
    if (en[k] === undefined) {
      en[k] = v;
      changed = true;
    }
  }
  for (const [k, v] of Object.entries(defaults.id)) {
    if (id[k] === undefined) {
      id[k] = v;
      changed = true;
    }
  }
  if (changed) documents.upsert(docName, en, id);
}

function seedProjects() {
  if (projects.all().length > 0) return;

  projects.create({
    locales: {
      en: {
        title: 'Web Sekolah',
        subtitle: 'School Information System',
        desc: 'Complete school website: profile, news & announcements, photo gallery and contact — built with Laravel and MySQL on a responsive Tailwind UI. Click the cover to browse the screenshots.',
        category: 'Sekolah',
        tags: ['Sekolah', 'Laravel', 'MySQL']
      },
      id: {
        title: 'Web Sekolah',
        subtitle: 'Sistem Informasi Sekolah',
        desc: 'Website sekolah lengkap: profil, berita & pengumuman, galeri foto, dan kontak — dibangun dengan Laravel dan MySQL dengan UI responsif Tailwind. Klik sampul untuk melihat screenshot.',
        category: 'Sekolah',
        tags: ['Sekolah', 'Laravel', 'MySQL']
      }
    },
    cover: 'websekolah/websekolah-1.png',
    repo_url: 'https://github.com/prayogi762/projek_smea',
    featured: true,
    published: true,
    sort_order: 0,
    images: [
      'websekolah/websekolah-1.png',
      'websekolah/websekolah-2.jpg',
      'websekolah/websekolah-3.jpg',
      'websekolah/websekolah-4.jpg'
    ]
  });

  projects.create({
    locales: {
      en: {
        title: 'Website ERP',
        subtitle: 'Enterprise Resource Planning',
        desc: 'Web-based ERP application: inventory, purchasing and sales modules, accounting reports, and role-based user management — built with Laravel and MySQL. Click the cover to browse the screenshots.',
        category: 'ERP',
        tags: ['ERP', 'Laravel', 'MySQL']
      },
      id: {
        title: 'Website ERP',
        subtitle: 'Enterprise Resource Planning',
        desc: 'Aplikasi ERP berbasis web: modul inventori, pembelian dan penjualan, laporan keuangan, serta manajemen pengguna berbasis peran — dibangun dengan Laravel dan MySQL. Klik sampul untuk melihat screenshot.',
        category: 'ERP',
        tags: ['ERP', 'Laravel', 'MySQL']
      }
    },
    cover: 'website_erp/website-erp-1.png',
    featured: true,
    published: true,
    sort_order: 1,
    images: [
      'website_erp/website-erp-1.png',
      'website_erp/website_erp-2.jpg',
      'website_erp/website-erp-3.jpg',
      'website_erp/website-erp-4.jpg',
      'website_erp/website-erp-5.jpg'
    ]
  });
}

function initialDocuments() {
  fillMissing('site', { en: SITE_EN, id: SITE_ID });
}

module.exports = { initialDocuments, seedProjects, SITE_EN, SITE_ID };
