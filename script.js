/* ═══════════════════════════════════════════════════════════════════════════
   THARAGAI S PORTFOLIO — script.js
   Vanilla JS — All animations, interactions, particle system
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════ THEME TOGGLE (LIGHT / DARK) ═════════════════════════*/
/* Runs immediately (not gated behind the loader) so the toggle is usable right away. */
(function initThemeToggle() {
  const root = document.documentElement;

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    });
  }

  function toggleTheme() {
    applyTheme(currentTheme() === 'light' ? 'dark' : 'light');
  }

  function wireButtons() {
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      if (btn.dataset.themeWired) return;
      btn.dataset.themeWired = 'true';
      btn.addEventListener('click', toggleTheme);
    });
    // Reflect whatever theme was already applied by the pre-paint inline script
    applyTheme(currentTheme());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireButtons);
  } else {
    wireButtons();
  }
})();

/* ══════════════════════ LOADER ══════════════════════════════════════════════*/
(function initLoader() {
  const loader     = document.getElementById('loader');
  const bar        = loader.querySelector('.loader-bar');
  const pct        = loader.querySelector('.loader-percent');
  const loaderName = loader.querySelector('.loader-name');

  // Animate loader name letter by letter
  const name = 'THARAGAI S';
  loaderName.textContent = '';
  let ni = 0;
  const nameInterval = setInterval(() => {
    if (ni < name.length) {
      loaderName.textContent += name[ni++];
    } else clearInterval(nameInterval);
  }, 60);

  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.random() * 12 + 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.6s ease';
        setTimeout(() => {
          loader.style.display = 'none';
          document.body.style.overflow = 'auto';
          initAll();
        }, 600);
      }, 300);
    }
    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';
  }, 60);

  document.body.style.overflow = 'hidden';
})();

/* ══════════════════════ INIT ALL ════════════════════════════════════════════*/
function initAll() {
  initParticleCanvas();
  initCursor();
  initNavbar();
  initScrollProgress();
  initTypingEffect();
  initRevealAnimations();
  initTiltCards();
  initMagneticButtons();
  initCounters();
  initSkillBars();
  initContactForm();
  initBackToTop();
  initMobileMenu();
  initParallax();
  initCertModal();
}

/* ══════════════════════ PARTICLE CANVAS ════════════════════════════════════*/
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -1000, y: -1000 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r  = Math.random() * 1.5 + 0.3;
      this.alpha = Math.random() * 0.3 + 0.05;
      this.hue = Math.random() > 0.6 ? '192' : '270'; // cyan or purple
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        this.x += dx / dist * 0.5;
        this.y += dy / dist * 0.5;
      }
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 90%, 70%, ${this.alpha})`;
      ctx.fill();
    }
  }

  const COUNT = Math.min(120, Math.floor(W * H / 10000));
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  // Connection lines
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(34,211,238,${0.05 * (1 - d/120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  let rafId;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    rafId = requestAnimationFrame(loop);
  }
  loop();

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
}

/* ══════════════════════ CUSTOM CURSOR ══════════════════════════════════════*/
function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  }, { passive: true });

  // Ring follows with lag
  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const hoverEls = document.querySelectorAll('a, button, .tilt-card, input, textarea, select');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });
}

/* ══════════════════════ NAVBAR ══════════════════════════════════════════════*/
function initNavbar() {
  const navbar = document.getElementById('navbar');
  let lastY = 0, hidden = false;

  const handleScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 50);
    // Hide on fast scroll down, show on scroll up
    if (y > lastY + 5 && y > 200 && !hidden) {
      navbar.style.transform = 'translateY(-120%)';
      hidden = true;
    } else if (y < lastY - 5 && hidden) {
      navbar.style.transform = 'translateY(0)';
      hidden = false;
    }
    lastY = y;
  };

  navbar.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Active section highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => {
          l.style.color = l.getAttribute('href') === '#' + entry.target.id
            ? 'var(--cyan)'
            : '';
        });
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(s => observer.observe(s));

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.getElementById('mobile-menu').classList.remove('open');
      }
    });
  });
}

/* ══════════════════════ MOBILE MENU ═════════════════════════════════════════*/
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu   = document.getElementById('mobile-menu');

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.innerHTML = open ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });
}

/* ══════════════════════ SCROLL PROGRESS ════════════════════════════════════*/
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });
}

/* ══════════════════════ TYPING EFFECT ══════════════════════════════════════*/
function initTypingEffect() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const phrases = [
    'AI Enthusiast',
    'Frontend Developer',
    'Future Machine Learning Engineer',
    'Problem Solver'
  ];
  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const phrase = phrases[pi];
    el.textContent = deleting
      ? phrase.substring(0, ci--)
      : phrase.substring(0, ci++);

    let delay = deleting ? 60 : 100;

    if (!deleting && ci > phrase.length) {
      delay = 1800;
      deleting = true;
    } else if (deleting && ci < 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      ci = 0;
      delay = 400;
    }
    setTimeout(tick, delay);
  }
  tick();
}

/* ══════════════════════ REVEAL ANIMATIONS ══════════════════════════════════*/
function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Respect animation-delay from inline style
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => {
    // Apply any inline animation-delay as transition-delay
    const delay = el.style.animationDelay || el.dataset.delay || '0s';
    el.style.transitionDelay = delay;
    observer.observe(el);
  });
}

/* ══════════════════════ 3D TILT CARDS ══════════════════════════════════════*/
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const cx  = r.left + r.width  / 2;
      const cy  = r.top  + r.height / 2;
      const dx  = (e.clientX - cx) / (r.width  / 2);
      const dy  = (e.clientY - cy) / (r.height / 2);
      const rx  = -dy * 10;
      const ry  = dx  * 10;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    });
  });
}

/* ══════════════════════ MAGNETIC BUTTONS ════════════════════════════════════*/
function initMagneticButtons() {
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ══════════════════════ COUNTERS ════════════════════════════════════════════*/
function initCounters() {
  const counters = document.querySelectorAll('.counter');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const start  = Date.now();
        const dur    = 1500;
        const tick   = () => {
          const elapsed = Date.now() - start;
          const p       = Math.min(elapsed / dur, 1);
          const ease    = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(ease * target);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        };
        tick();
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ══════════════════════ SKILL BARS ══════════════════════════════════════════*/
function initSkillBars() {
  const items = document.querySelectorAll('.skill-bar-item');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const pct = entry.target.dataset.pct;
        const bar = entry.target.querySelector('.skill-bar');
        if (bar) {
          setTimeout(() => { bar.style.width = pct + '%'; }, 150);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  items.forEach(i => observer.observe(i));
}

/* ══════════════════════ PARALLAX ════════════════════════════════════════════*/
function initParallax() {
  const orbs      = document.querySelectorAll('.orb');
  const heroIcons = document.querySelectorAll('.floating-icon');

  document.addEventListener('mousemove', e => {
    const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;

    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 12;
      orb.style.transform = `translate(${mx * depth}px, ${my * depth}px)`;
    });

    heroIcons.forEach((icon, i) => {
      const depth = (i % 3 + 1) * 6;
      const base  = icon.style.animation;
      icon.style.transform = `translate(${mx * depth}px, ${my * depth}px)`;
    });
  }, { passive: true });
}

/* ══════════════════════ CONTACT FORM (Formspree) ════════════════════════════*/
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const btn     = document.getElementById('send-btn');
  const success = document.getElementById('form-success');
  const error   = document.getElementById('form-error');
  if (!form || !btn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    error.classList.add('hidden');
    error.style.display = '';

    // Animate button
    const originalHTML = '<i class="fas fa-paper-plane group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i> Send Message';
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
    btn.disabled  = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        btn.innerHTML = '<i class="fas fa-check mr-2"></i> Sent!';
        btn.style.background = 'linear-gradient(135deg, #4ade80, #22d3ee)';
        success.classList.remove('hidden');
        success.style.display = 'flex';
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      btn.innerHTML = '<i class="fas fa-times mr-2"></i> Failed';
      error.classList.remove('hidden');
      error.style.display = 'flex';
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      btn.disabled  = false;
      success.classList.add('hidden');
      success.style.display = '';
      error.classList.add('hidden');
      error.style.display = '';
    }, 3500);
  });
}

/* ══════════════════════ CERTIFICATE LIGHTBOX MODAL ══════════════════════════*/
function initCertModal() {
  const modal   = document.getElementById('cert-modal');
  const img     = document.getElementById('cert-modal-img');
  const caption = document.getElementById('cert-modal-caption');
  const closeBtn = document.getElementById('cert-modal-close');
  if (!modal || !img) return;

  let lastFocused = null;

  window.openCertModal = function (src, title) {
    lastFocused = document.activeElement;
    img.src = src;
    img.alt = title + ' — full certificate image';
    caption.textContent = title;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  window.closeCertModal = function () {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
    img.src = '';
    if (lastFocused) lastFocused.focus();
  };

  closeBtn.addEventListener('click', window.closeCertModal);

  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.classList.contains('cert-modal-backdrop')) {
      window.closeCertModal();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      window.closeCertModal();
    }
  });

  // Keyboard support (Enter/Space) for the certificate cards
  document.querySelectorAll('.cert-card[role="button"]').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

/* ══════════════════════ BACK TO TOP ═════════════════════════════════════════*/
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════ HERO NAME 3D PARALLAX ON SCROLL ════════════════════*/
window.addEventListener('scroll', () => {
  const hero    = document.getElementById('hero');
  const content = document.getElementById('hero-content');
  if (!hero || !content) return;
  const scrolled = window.scrollY;
  const rate     = scrolled * 0.4;
  content.style.transform = `translateY(${rate}px)`;
  content.style.opacity   = Math.max(0, 1 - scrolled / 600);
}, { passive: true });