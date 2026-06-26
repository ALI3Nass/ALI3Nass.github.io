/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO SCRIPTS
   1. Dots Canvas (hero background)
   2. Custom Cursor
   3. Scroll Reveal (staggered fade-up)
   4. Parallax (hero content + section labels)
   5. Nav scroll effect
   6. Hamburger / mobile menu
   7. Smooth anchor scroll
   8. Hero entrance
   9. Accordion
   10. Card tilt on mouse move
═══════════════════════════════════════════════════════════════ */

/* ── 1. DOTS CANVAS ─────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('dotsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const DOT_SPACING = 36;
  const DOT_RADIUS  = 1.4;
  let   mouse       = { x: -9999, y: -9999 };
  let   dots        = [];

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    buildDots();
  }

  function buildDots() {
    dots = [];
    const cols = Math.ceil(canvas.width  / DOT_SPACING) + 1;
    const rows = Math.ceil(canvas.height / DOT_SPACING) + 1;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        dots.push({ x: c * DOT_SPACING, y: r * DOT_SPACING });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const INFLUENCE = 140;
    for (const dot of dots) {
      const dx   = dot.x - mouse.x;
      const dy   = dot.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const prox = Math.max(0, 1 - dist / INFLUENCE);
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_RADIUS + prox * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(37,99,235,${0.15 + prox * 0.65})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  // sync canvas mouse with global cursor position
  window._cursorX = -9999;
  window._cursorY = -9999;
  window.addEventListener('mousemove', e => {
    window._cursorX = e.clientX;
    window._cursorY = e.clientY;
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top + window.scrollY - rect.top;
  });

  // recalculate mouse relative to canvas on scroll too
  window.addEventListener('scroll', () => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = window._cursorX - rect.left;
    mouse.y = window._cursorY - rect.top;
  }, { passive: true });

  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  window.addEventListener('resize', resize);
  resize();
  draw();
})();


/* ── 2. CUSTOM CURSOR ───────────────────────────────────────── */
(function () {
  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after { cursor: none !important; }

    .c-cursor {
      position: fixed;
      top: 0; left: 0;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: multiply;
      will-change: transform;
    }
    .c-cursor__dot {
      width: 8px; height: 8px;
      background: #2563EB;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width .15s, height .15s, background .15s;
    }
    .c-cursor__ring {
      width: 36px; height: 36px;
      border: 1.5px solid rgba(37,99,235,.5);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width .3s cubic-bezier(.16,1,.3,1),
                  height .3s cubic-bezier(.16,1,.3,1),
                  border-color .3s, opacity .3s;
    }
    body.cursor-hover .c-cursor__dot  { width: 12px; height: 12px; background: #1D4ED8; }
    body.cursor-hover .c-cursor__ring { width: 52px; height: 52px; border-color: rgba(37,99,235,.35); }
    body.cursor-click .c-cursor__ring { width: 24px; height: 24px; border-color: rgba(37,99,235,.9); }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement('div');
  wrap.className = 'c-cursor';
  wrap.innerHTML = '<div class="c-cursor__dot"></div><div class="c-cursor__ring"></div>';
  document.body.appendChild(wrap);

  const dot  = wrap.querySelector('.c-cursor__dot');
  const ring = wrap.querySelector('.c-cursor__ring');

  let mx = -100, my = -100;   // actual mouse
  let rx = -100, ry = -100;   // ring (lagged)

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  // dot follows instantly, ring lags (lerp)
  (function loop() {
    dot.style.transform  = `translate(${mx - 4}px, ${my - 4}px)`;
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(loop);
  })();

  // hover state on interactive elements
  const hoverEls = 'a, button, .project-card, .pill, .stat-card, .award-card, .accordion__trigger';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) document.body.classList.remove('cursor-hover');
  });
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));
})();


/* ── 3. SCROLL REVEAL ───────────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // stagger siblings
  const parents = new Map();
  els.forEach(el => {
    const key = el.parentElement;
    if (!parents.has(key)) parents.set(key, []);
    parents.get(key).push(el);
  });
  parents.forEach(group => {
    group.forEach((el, i) => {
      const base = parseFloat(getComputedStyle(el).transitionDelay) || 0;
      el.style.transitionDelay = (base + i * 0.075) + 's';
    });
  });

  els.forEach(el => observer.observe(el));
})();


/* ── 4. PARALLAX ────────────────────────────────────────────── */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const heroContent  = document.querySelector('.hero__content');
  const heroHint     = document.querySelector('.hero__scroll-hint');
  const sectionLabels = document.querySelectorAll('.section-label');

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;

      // hero content drifts up gently as you scroll
      if (heroContent) {
        heroContent.style.transform = `translateY(${sy * 0.28}px)`;
        heroContent.style.opacity   = Math.max(0, 1 - sy / 500);
      }
      if (heroHint) {
        heroHint.style.transform = `translateX(-50%) translateY(${sy * 0.15}px)`;
        heroHint.style.opacity   = Math.max(0, 1 - sy / 200);
      }

      // section labels drift slightly on scroll for depth
      sectionLabels.forEach(label => {
        const rect   = label.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        label.style.transform = `translateY(${center * -0.04}px)`;
      });

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ── 5. NAV SCROLL EFFECT ───────────────────────────────────── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ── 6. HAMBURGER / MOBILE MENU ─────────────────────────────── */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });
})();


/* ── 7. SMOOTH ANCHOR SCROLL ────────────────────────────────── */
(function () {
  const NAV_HEIGHT = 64;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT, behavior: 'smooth' });
    });
  });
})();


/* ── 8. HERO ENTRANCE ───────────────────────────────────────── */
(function () {
  window.addEventListener('load', () => {
    document.querySelectorAll('.hero .reveal').forEach(el => {
      el.classList.add('visible');
    });
  });
})();


/* ── 9. ACCORDION ───────────────────────────────────────────── */
(function () {
  document.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const panel  = trigger.nextElementSibling;
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.accordion__trigger').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
        t.nextElementSibling.classList.remove('open');
      });
      if (!isOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.classList.add('open');
      }
    });
  });
})();


/* ── 10. CARD TILT ──────────────────────────────────────────── */
(function () {
  if (window.matchMedia('(hover: none)').matches) return;

  const TILT_MAX = 6; // degrees

  document.querySelectorAll('.project-card, .stat-card, .award-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = -dy * TILT_MAX;
      const rotY   =  dx * TILT_MAX;
      card.style.transform    = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      card.style.transition   = 'transform .1s ease, box-shadow .1s ease';
      card.style.boxShadow    = `${-rotY * 1.5}px ${rotX * 1.5}px 24px rgba(37,99,235,.15)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1), box-shadow .5s ease';
      card.style.boxShadow  = '';
    });
  });
})();
