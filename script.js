"use strict";

/* Every block is guarded, so this one file is safe to load on index, products and order pages. */

// ---------- Menu ----------
(() => {
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  const set = open => {
    nav.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  btn.addEventListener('click', () => set(nav.hidden));
  nav.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('click', e => {
    if (!nav.hidden && !e.target.closest('.site-head')) set(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !nav.hidden) { set(false); btn.focus(); }
  });
})();


// ---------- Cart badge (reads a saved list; stays 0 until your order page writes to it) ----------
(() => {
  const badge = document.querySelector('.cart-count');
  if (!badge) return;
  try {
    const cart = JSON.parse(localStorage.getItem('rodiat-cart') || '[]');
    badge.textContent = Array.isArray(cart) ? cart.length : 0;
  } catch (_) { /* storage blocked: keep 0 */ }
})();


// ---------- Wishlist hearts ----------
(() => {
  const hearts = [...document.querySelectorAll('.new-arrivals .row button[data-id]')];
  if (!hearts.length) return;

  let saved = [];
  try { saved = JSON.parse(localStorage.getItem('rodiat-wishlist') || '[]'); } catch (_) {}

  hearts.forEach(b => {
    b.setAttribute('aria-pressed', String(saved.includes(b.dataset.id)));
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      saved = on ? [...new Set([...saved, b.dataset.id])] : saved.filter(id => id !== b.dataset.id);
      try { localStorage.setItem('rodiat-wishlist', JSON.stringify(saved)); } catch (_) {}
    });
  });
})();


// ---------- Customer photo fan ----------
(() => {
  const stage = document.getElementById('stage');
  if (!stage) return;

  const slides = [...stage.querySelectorAll('.slide')];
  const dotsEl = document.getElementById('dots');
  const prev   = document.querySelector('.nav.prev');
  const next   = document.querySelector('.nav.next');
  if (!slides.length || !dotsEl || !prev || !next) return;

  let cur = Math.floor(slides.length / 2);

  slides.forEach(() => dotsEl.appendChild(document.createElement('i')));
  const dots = [...dotsEl.children];

  // phones show only the cards next to the centre one, so nothing is cut off at the screen edge
  const mq = window.matchMedia('(max-width: 767px)');

  function render() {
    const reach = mq.matches ? 1 : 2;
    slides.forEach((s, i) => {
      const o = i - cur;
      const a = Math.abs(o);
      s.style.setProperty('--o', Math.max(-3, Math.min(3, o)));
      s.style.setProperty('--a', Math.min(a, 3));
      s.dataset.active = a === 0;
      s.classList.toggle('hidden', a > reach);
      s.setAttribute('aria-hidden', a !== 0);
    });
    dots.forEach((d, i) => d.classList.toggle('on', i === cur));
    prev.disabled = cur === 0;
    next.disabled = cur === slides.length - 1;
  }

  const go = n => { cur = Math.max(0, Math.min(slides.length - 1, n)); render(); };

  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', () => go(cur + 1));
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  go(cur - 1);
    if (e.key === 'ArrowRight') go(cur + 1);
  });
  mq.addEventListener('change', render);

  // swipe / drag
  let startX = 0, dx = 0, down = false, moved = false;
  stage.addEventListener('pointerdown', e => {
    down = true; moved = false; startX = e.clientX; dx = 0;
    stage.classList.add('dragging');
  });
  stage.addEventListener('pointermove', e => {
    if (!down) return;
    dx = e.clientX - startX;
    if (Math.abs(dx) > 8) moved = true;
  });
  const end = () => {
    if (!down) return;
    down = false; stage.classList.remove('dragging');
    if (dx < -40) go(cur + 1);
    else if (dx > 40) go(cur - 1);
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('pointerleave', end);

  slides.forEach((s, i) => s.addEventListener('click', () => { if (!moved) go(i); }));

  render();
})();


// ---------- Hide images that haven't been added yet (gallery + reviews) ----------
document.querySelectorAll('.slide img, .review .card img').forEach(img => {
  const hide = () => { img.style.visibility = 'hidden'; };
  img.addEventListener('error', hide);
  if (img.complete && img.naturalWidth === 0 && img.currentSrc) hide();
});


// ---------- Reviews arrows ----------
(() => {
  const track = document.querySelector('.review .track');
  if (!track) return;
  const nextBtn = document.querySelector('.review .next');
  const prevBtn = document.querySelector('.review .prev');
  if (nextBtn) nextBtn.addEventListener('click', () => track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }));
  if (prevBtn) prevBtn.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }));
})();
