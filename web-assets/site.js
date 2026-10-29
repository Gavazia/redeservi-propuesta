'use strict';

const reducedMotion = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

function animateNumber(el, target, prefix = '', suffix = '', duration = 700) {
  if (!el) return;
  if (reducedMotion()) {
    el.textContent = prefix + target + suffix;
    return;
  }
  const start = performance.now();
  const step = now => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);
    el.textContent = prefix + current + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// 1. Scroll progress bar, active nav & reveal choreography
const progressBar = document.getElementById('scroll-progress');
if (progressBar && !reducedMotion()) {
  let ticking = false;
  const updateScroll = () => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const ratio = Math.min(Math.max(window.scrollY / max, 0), 1);
    progressBar.style.transform = `scaleX(${ratio})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, {passive: true});
}

if ('IntersectionObserver' in window) {
  if (!reducedMotion()) document.documentElement.classList.add('js-ready');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        entry.target.querySelectorAll('[data-count]').forEach(counter => {
          if (!counter.dataset.counted) {
            counter.dataset.counted = 'true';
            animateNumber(counter, Number(counter.dataset.count), '', '', 750);
          }
        });
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold: 0.14});
  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  const navLinks = document.querySelectorAll('[data-nav-sec]');
  if (navLinks.length) {
    const secObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(a => a.classList.toggle('is-current', a.dataset.navSec === id));
        }
      });
    }, {rootMargin: '-30% 0px -55% 0px'});
    ['contenido-mensual', 'investigacion', 'versiones', 'acompanamiento', 'panel'].forEach(id => {
      const sec = document.getElementById(id);
      if (sec) secObserver.observe(sec);
    });
  }
}

// 2. Research Gallery Carousel & In-Page Lightbox Modal
document.querySelectorAll('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  const gallery = document.getElementById('research-gallery');
  if (gallery) gallery.scrollBy({left: Number(button.dataset.gallery) * gallery.clientWidth * 0.85, behavior: reducedMotion() ? 'instant' : 'smooth'});
}));

const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

if (lightboxModal && lightboxImg) {
  document.querySelectorAll('[data-lightbox]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const img = link.querySelector('img');
      lightboxImg.src = (img && img.currentSrc) || link.href;
      if (lightboxCaption) lightboxCaption.textContent = link.dataset.lightbox || 'Investigación Redeservi';
      lightboxModal.hidden = false;
    });
  });
  document.querySelectorAll('[data-close-lightbox]').forEach(btn => {
    btn.addEventListener('click', () => { lightboxModal.hidden = true; });
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !lightboxModal.hidden) lightboxModal.hidden = true;
  });
}

// 3. Section 03 — Motion Graphic Studio + Frank Original Video
const variants = {
  hook: {
    kicker: 'DIRECCIÓN DE EDICIÓN · OPCIÓN 01',
    badge: 'Retención primeros 3 s',
    title: 'Abrir con una pregunta y el mejor plano.',
    description: 'Presentamos primero la duda del viajero con un titular limpio en pantalla y un plano atractivo de París; enseguida entra tu explicación. Así quien desliza en redes entiende en dos segundos por qué quedarse.',
    times: ['00:00 – 00:03', '00:03 – 00:18', 'Cierre claro'],
    beats: ['Pregunta + Plano París', 'Tu explicación cercana', 'Invitación a consultar'],
    imgs: ['https://i.imgur.com/r777lOv.jpeg', 'https://i.imgur.com/VEMhMF5.jpeg', 'https://i.imgur.com/6HQ9SBb.jpeg'],
    sceneIndex: 0
  },
  rhythm: {
    kicker: 'DIRECCIÓN DE EDICIÓN · OPCIÓN 02',
    badge: 'Dinamismo visual + B-roll',
    title: 'Mostrar primero la experiencia, acompañar con tu voz.',
    description: 'Mantenemos tu explicación como hilo conductor mientras intercalamos planos reales del lugar, la mesa y el recorrido en París. El vídeo gana ritmo visual sin perder cercanía.',
    times: ['Plano inicial', 'Ritmo B-roll', 'Identidad'],
    beats: ['Imagen del lugar', 'Tu voz + detalles', 'Cierre con marca'],
    imgs: ['https://i.imgur.com/CJPhpvg.jpeg', 'https://i.imgur.com/3bbZiC2.jpeg', 'https://i.imgur.com/6HQ9SBb.jpeg'],
    sceneIndex: 1
  },
  system: {
    kicker: 'SISTEMA MENSUAL · 8 + 2 + 4 = 14 PIEZAS',
    badge: 'Máximo provecho de tu tiempo',
    title: 'De una sesión de grabación a todo un mes de presencia.',
    description: 'Con lo que grabamos juntos producimos 8 vídeos originales, creamos 2 versiones adicionales cambiando el gancho o el montaje, y diseñamos 4 posts gráficos para explicar tus servicios.',
    times: ['Base mensual', 'Nuevos ángulos', 'Soporte visual'],
    beats: ['8 vídeos originales', '+2 versiones nuevas', '+4 posts gráficos'],
    imgs: ['https://i.imgur.com/VEMhMF5.jpeg', 'https://i.imgur.com/r777lOv.jpeg', 'https://i.imgur.com/6HQ9SBb.jpeg'],
    sceneIndex: 3
  }
};

const motionScenes = [
  {
    stepBadge: 'ESCENA 01 / 04 · EL GANCHO',
    hookTag: 'GANCHO VISUAL · 0–3 S',
    hookText: '¿Dónde vivir París como un local?',
    label: 'CAPA 01 · RETENCIÓN INICIAL',
    num: '8',
    cardTitle: 'vídeos originales al mes',
    detail: 'Guion, grabación contigo y titular de impacto en los primeros 3 s',
    subHtml: '<span>«</span>Te muestro un rincón auténtico de <em>París</em> con Redeservi…<span>»</span>',
    stepCardIdx: 0,
    fullTime: 1,
    standaloneTime: 0
  },
  {
    stepBadge: 'ESCENA 02 / 04 · EL RITMO',
    hookTag: 'MONTAJE DINÁMICO · B-ROLL',
    hookText: 'Tu voz + planos reales del lugar',
    label: 'CAPA 02 · APROVECHAR LO GRABADO',
    num: '+2',
    cardTitle: 'versiones adicionales',
    detail: 'Nuevo inicio u orden de escenas para llegar a más viajeros',
    subHtml: '<span>«</span>Intercalamos tu explicación con la <em>experiencia real</em>…<span>»</span>',
    stepCardIdx: 1,
    fullTime: 35,
    standaloneTime: 3
  },
  {
    stepBadge: 'ESCENA 03 / 04 · LA EXPERIENCIA',
    hookTag: 'SUBTÍTULOS DE MARCA · CLARIDAD',
    hookText: 'Se entiende incluso sin activar el audio',
    label: 'CAPA 03 · DISEÑO COMPLEMENTARIO',
    num: '+4',
    cardTitle: 'posts gráficos de soporte',
    detail: 'Rutas, traslados CDG / Orly y excursiones explicadas al detalle',
    subHtml: '<span>«</span>Cada pieza refuerza la confianza en <em>Redeservi París</em>…<span>»</span>',
    stepCardIdx: 1,
    fullTime: 58,
    standaloneTime: 6
  },
  {
    stepBadge: 'ESCENA 04 / 04 · EL SISTEMA COMPLETO',
    hookTag: 'PROPUESTA MENSUAL · 375 € / MES',
    hookText: 'Producción + Acompañamiento + Panel',
    label: 'SISTEMA COMPLETO · ANVAZIA × REDESERVI',
    num: '14',
    cardTitle: 'piezas cada mes · 375 €',
    detail: '8 originales + 2 versiones + 4 posts · Grabación y revisión incluidas',
    subHtml: '<span>«</span>Revisamos juntos qué piezas generan más <em>consultas y reservas</em>.<span>»</span>',
    stepCardIdx: 2,
    fullTime: 76,
    standaloneTime: 9
  }
];

const motionStage = document.querySelector('.motion-card');
const frankVideo = document.getElementById('frank-video');
let motionTimers = [];

function applyMotionScene(index) {
  const scene = motionScenes[index] || motionScenes[0];
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('mg-step-badge', scene.stepBadge);
  setText('mg-hook-tag', scene.hookTag);
  setText('mg-hook-text', scene.hookText);
  setText('motion-label', scene.label);
  setText('motion-number', scene.num);
  setText('mg-card-title', scene.cardTitle);
  setText('motion-detail', scene.detail);

  const subEl = document.getElementById('mg-sub-line');
  if (subEl) subEl.innerHTML = scene.subHtml;

  document.querySelectorAll('.mg-scene-thumb').forEach((btn, idx) => {
    btn.classList.toggle('is-active', idx === index);
  });
  document.querySelectorAll('[data-clip]').forEach((clip, idx) => {
    clip.classList.toggle('is-lit', idx === index);
  });
  [0, 1, 2].forEach(i => {
    const stepCard = document.getElementById(`step-card-${i}`);
    if (stepCard) stepCard.classList.toggle('is-highlighted', i === scene.stepCardIdx);
  });

  const phoneScreen = document.getElementById('mg-phone-screen');
  if (phoneScreen) {
    phoneScreen.dataset.activeSlide = String(index);
  }
  const cutPill = document.getElementById('mg-cut-pill');
  if (cutPill) {
    cutPill.textContent = `CORTE DINÁMICO · ESCENA 0${index + 1}`;
  }

  if (!reducedMotion()) {
    const floating = document.getElementById('mg-floating-card');
    if (floating) {
      floating.classList.remove('pulse');
      void floating.offsetWidth;
      floating.classList.add('pulse');
    }
    const hookBadge = document.getElementById('mg-hook-badge');
    if (hookBadge) {
      hookBadge.classList.remove('pop');
      void hookBadge.offsetWidth;
      hookBadge.classList.add('pop');
    }
  }

  const progress = document.getElementById('mg-progress-bar');
  if (progress && !motionStage?.classList.contains('is-playing')) {
    progress.style.transform = `scaleX(${(index + 1) / 4})`;
  }
}

document.querySelectorAll('[data-variant]').forEach(button => button.addEventListener('click', () => {
  const v = variants[button.dataset.variant];
  if (!v) return;
  const stage = document.getElementById('variant-stage');
  if (stage && !reducedMotion()) {
    stage.classList.remove('stage-swap');
    void stage.offsetWidth;
    stage.classList.add('stage-swap');
  }
  const map = {
    'variant-kicker': v.kicker,
    'variant-time-badge': v.badge,
    'variant-title': v.title,
    'variant-description': v.description,
    'beat-time-1': v.times[0],
    'beat-time-2': v.times[1],
    'beat-time-3': v.times[2],
    'beat-one': v.beats[0],
    'beat-two': v.beats[1],
    'beat-three': v.beats[2]
  };
  for (const [id, value] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }
  ['beat-img-1', 'beat-img-2', 'beat-img-3'].forEach((id, idx) => {
    const img = document.getElementById(id);
    if (img && v.imgs[idx]) img.src = v.imgs[idx];
  });
  document.querySelectorAll('[data-variant]').forEach(item => {
    const selected = item === button;
    item.classList.toggle('selected', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  applyMotionScene(v.sceneIndex);
}));

document.querySelectorAll('.mg-scene-thumb').forEach(btn => {
  btn.addEventListener('click', () => {
    motionTimers.forEach(clearTimeout);
    motionTimers = [];
    if (motionStage) motionStage.classList.remove('is-playing');
    applyMotionScene(Number(btn.dataset.scene || 0));
  });
});

document.querySelectorAll('[data-step-scene]').forEach(card => {
  card.addEventListener('click', () => {
    motionTimers.forEach(clearTimeout);
    motionTimers = [];
    if (motionStage) motionStage.classList.remove('is-playing');
    applyMotionScene(Number(card.dataset.stepScene || 0));
  });
});

if (motionStage) {
  const playMotion = () => {
    motionTimers.forEach(clearTimeout);
    motionTimers = [];
    motionStage.classList.remove('is-playing');
    if (reducedMotion()) {
      applyMotionScene(3);
      return;
    }
    applyMotionScene(0);
    void motionStage.offsetWidth;
    motionStage.classList.add('is-playing');
    const playBtn = document.getElementById('motion-play');
    if (playBtn) playBtn.textContent = 'Motion activo · 12 s ↻';
    for (let i = 1; i < 4; i++) {
      motionTimers.push(setTimeout(() => applyMotionScene(i), i * 3000));
    }
    motionTimers.push(setTimeout(() => {
      motionStage.classList.remove('is-playing');
      if (playBtn) playBtn.textContent = 'Repetir animación · 12 s ↻';
    }, 12000));
  };

  const playBtn = document.getElementById('motion-play');
  if (playBtn) playBtn.addEventListener('click', playMotion);

  const soundBtn = document.getElementById('video-sound-toggle');
  if (soundBtn && frankVideo) {
    soundBtn.addEventListener('click', () => {
      frankVideo.muted = !frankVideo.muted;
      const active = !frankVideo.muted;
      soundBtn.setAttribute('aria-pressed', String(active));
      soundBtn.textContent = active ? 'Voz de Frank: activa 🔊' : 'Escuchar voz de Frank 🔇';
      if (active) frankVideo.play().catch(() => {});
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        playMotion();
        observer.disconnect();
      }
    }, {threshold: 0.35});
    observer.observe(motionStage);
  }
}

// 4. Section 04 — Continuous 4-Phase Value Cycle Animation
const cycleNodes = document.querySelectorAll('[data-cycle]');
if (cycleNodes.length && !reducedMotion()) {
  let activeCycle = 0;
  const setCycle = idx => {
    activeCycle = idx;
    cycleNodes.forEach((node, i) => node.classList.toggle('is-pulse', i === idx));
    document.querySelectorAll('[data-pillar]').forEach(pillar => {
      pillar.classList.toggle('is-cycle-focus', Number(pillar.dataset.pillar) === idx);
    });
  };
  let cycleInterval = setInterval(() => setCycle((activeCycle + 1) % 4), 2800);
  cycleNodes.forEach((node, idx) => {
    node.addEventListener('mouseenter', () => { clearInterval(cycleInterval); setCycle(idx); });
    node.addEventListener('click', () => { clearInterval(cycleInterval); setCycle(idx); });
  });
}

// 5. Section 05 / Dashboard Demo — Animated Charts, Funnel, KPIs & Piece Selector
const samples = {
  month: {
    label: 'Mes de ejemplo',
    queries: [4, 6, 5, 9],
    bookings: [1, 2, 2, 3],
    labels: ['Sem. 1', 'Sem. 2', 'Sem. 3', 'Sem. 4'],
    pieces: 14,
    content: '8 originales + 2 versiones + 4 gráficos',
    growth: [32, 18, 21],
    barsPct: [78, 52, 64],
    highlight: 6,
    highlightTitle: 'Cómo organizar tu llegada a París sin estrés',
    rate: '33%',
    ringOffset: 71,
    reach: 3420,
    visits: 186,
    funnelWidths: ['100%', '68%', '44%', '26%'],
    waveArea: 'M35,95 C105,65 145,55 165,65 C215,78 245,75 280,72 C320,50 350,30 370,22 L370,145 L35,145 Z',
    waveLine: 'M35,95 C105,65 145,55 165,65 C215,78 245,75 280,72 C320,50 350,30 370,22'
  },
  week: {
    label: 'Semana de ejemplo',
    queries: [1, 2, 1, 2],
    bookings: [0, 1, 0, 1],
    labels: ['Lun–Mar', 'Mié–Jue', 'Vie', 'Sáb–Dom'],
    pieces: 3,
    content: 'Muestra ficticia semanal · No es un calendario acordado',
    growth: [8, 4, 5],
    barsPct: [48, 30, 38],
    highlight: 2,
    highlightTitle: 'Traslado privado desde CDG hasta tu hotel',
    rate: '33%',
    ringOffset: 71,
    reach: 840,
    visits: 46,
    funnelWidths: ['82%', '52%', '32%', '18%'],
    waveArea: 'M35,112 C105,82 145,75 165,78 C215,96 245,102 280,98 C320,84 350,74 370,70 L370,145 L35,145 Z',
    waveLine: 'M35,112 C105,82 145,75 165,78 C215,96 245,102 280,98 C320,84 350,74 370,70'
  }
};

const highlightPieces = [
  {
    tag: 'GANCHO PREGUNTA · VÍDEO ORIGINAL',
    title: 'Cómo organizar tu llegada a París sin estrés',
    desc: 'Ejemplo ficticio de pieza que convierte reproducciones en mensajes directos',
    count: 6,
    img: 'https://i.imgur.com/VEMhMF5.jpeg'
  },
  {
    tag: 'VERSIÓN ADICIONAL · RITMO RÁPIDO',
    title: '3 detalles para tu traslado privado desde CDG u Orly',
    desc: 'Mismo rodaje con nuevo inicio en los primeros 3 segundos para captar otro público',
    count: 4,
    img: 'https://i.imgur.com/r777lOv.jpeg'
  }
];

let activePeriod = 'month';

function updateDashboard(period, animate = false) {
  activePeriod = period;
  const data = samples[period];
  if (!data) return;
  const total = values => values.reduce((sum, value) => sum + value, 0);
  const totalQueries = total(data.queries);
  const totalBookings = total(data.bookings);

  const setOrAnimate = (id, num, prefix = '', suffix = '') => {
    const el = document.getElementById(id);
    if (!el) return;
    if (animate && !reducedMotion()) {
      animateNumber(el, num, prefix, suffix, 650);
    } else {
      el.textContent = prefix + num + suffix;
    }
  };

  setOrAnimate('consultations', totalQueries);
  setOrAnimate('reservations', totalBookings);
  setOrAnimate('content-count', data.pieces);
  setOrAnimate('highlight-count', data.highlight);
  setOrAnimate('instagram-growth', data.growth[0], '+');
  setOrAnimate('facebook-growth', data.growth[1], '+');
  setOrAnimate('tiktok-growth', data.growth[2], '+');
  setOrAnimate('funnel-reach', data.reach);
  setOrAnimate('funnel-visits', data.visits);
  setOrAnimate('funnel-queries', totalQueries);
  setOrAnimate('funnel-bookings', totalBookings);

  const textMap = {
    'content-label': data.content,
    'period-label': data.label,
    'highlight-title': data.highlightTitle,
    'reservations-ring-label': data.rate,
    'reservations-rate': `${data.rate} de consultas · Simulado`
  };
  for (const [id, value] of Object.entries(textMap)) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  const ring = document.getElementById('reservations-ring');
  if (ring) {
    if (animate && !reducedMotion()) {
      ring.setAttribute('stroke-dashoffset', '106.8');
      requestAnimationFrame(() => requestAnimationFrame(() => ring.setAttribute('stroke-dashoffset', String(data.ringOffset))));
    } else {
      ring.setAttribute('stroke-dashoffset', String(data.ringOffset));
    }
  }

  const waveArea = document.getElementById('chart-wave-area');
  const waveLine = document.getElementById('chart-wave-line');
  if (waveArea) waveArea.setAttribute('d', data.waveArea);
  if (waveLine) {
    waveLine.setAttribute('d', data.waveLine);
    if (animate && !reducedMotion()) {
      waveLine.classList.remove('wave-stroke-anim');
      void waveLine.offsetWidth;
      waveLine.classList.add('wave-stroke-anim');
    }
  }

  ['ig-bar', 'fb-bar', 'tt-bar'].forEach((id, idx) => {
    const bar = document.getElementById(id);
    if (bar) {
      if (animate && !reducedMotion()) {
        bar.style.width = '12%';
        requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = data.barsPct[idx] + '%'; }));
      } else {
        bar.style.width = data.barsPct[idx] + '%';
      }
    }
  });

  data.funnelWidths.forEach((w, idx) => {
    const fBar = document.getElementById(`funnel-bar-${idx + 1}`);
    if (fBar) {
      if (animate && !reducedMotion()) {
        fBar.style.width = '10%';
        requestAnimationFrame(() => requestAnimationFrame(() => { fBar.style.width = w; }));
      } else {
        fBar.style.width = w;
      }
    }
  });

  const chart = document.getElementById('bar-chart');
  if (chart) {
    chart.replaceChildren();
    chart.setAttribute('aria-label', `${data.label}, datos simulados: ${totalQueries} consultas y ${totalBookings} reservas.`);
    const max = Math.max(...data.queries, 1);
    data.labels.forEach((label, index) => {
      const group = document.createElement('div');
      group.className = 'bar-group';
      [data.queries[index], data.bookings[index]].forEach((count, type) => {
        const bar = document.createElement('div');
        bar.className = 'bar' + (type ? ' reservation' : '');
        bar.style.height = `${(count / max) * 78}%`;
        bar.setAttribute('aria-label', `${label}: ${count} ${type ? 'reservas' : 'consultas'} simuladas`);
        const value = document.createElement('b');
        value.textContent = count;
        bar.append(value);
        group.append(bar);
      });
      const caption = document.createElement('span');
      caption.textContent = label;
      group.append(caption);
      chart.append(group);
    });
  }

  document.querySelectorAll('[data-period]').forEach(button => {
    const selected = button.dataset.period === period;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

if (document.getElementById('bar-chart')) {
  updateDashboard('month', false);
  document.querySelectorAll('[data-period]').forEach(button => {
    button.addEventListener('click', () => updateDashboard(button.dataset.period, true));
  });
  const replayBtn = document.getElementById('dash-animate-btn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => updateDashboard(activePeriod, true));
  }

  document.querySelectorAll('[data-hl-piece]').forEach(btn => {
    btn.addEventListener('click', () => {
      const piece = highlightPieces[Number(btn.dataset.hlPiece || 0)];
      if (!piece) return;
      document.querySelectorAll('[data-hl-piece]').forEach(b => b.classList.toggle('is-selected', b === btn));
      const spotlight = document.getElementById('highlight-spotlight');
      if (spotlight && !reducedMotion()) {
        spotlight.classList.remove('hl-pop');
        void spotlight.offsetWidth;
        spotlight.classList.add('hl-pop');
      }
      const tag = document.getElementById('highlight-tag');
      if (tag) tag.textContent = piece.tag;
      const title = document.getElementById('highlight-title');
      if (title) title.textContent = piece.title;
      const desc = document.getElementById('highlight-desc');
      if (desc) desc.textContent = piece.desc;
      animateNumber(document.getElementById('highlight-count'), piece.count, '', '', 500);
    });
  });

  if ('IntersectionObserver' in window && !reducedMotion()) {
    const dashRoot = document.getElementById('dashboard-values');
    if (dashRoot) {
      const dashObs = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
          updateDashboard(activePeriod, true);
          dashObs.disconnect();
        }
      }, {threshold: 0.25});
      dashObs.observe(dashRoot);
    }
  }
}

document.querySelectorAll('video').forEach(video => video.addEventListener('error', () => {
  const fallback = document.createElement('p');
  fallback.className = 'caption';
  fallback.textContent = 'Vista previa de vídeo en modo estático. Las tomas superiores muestran las escenas originales de Frank.';
  video.after(fallback);
}));
