/* ============================================================
   MICHAEL — portfolio interactions
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== PRELOADER ===== */
(() => {
  const preloader = document.getElementById('preloader');
  const count = document.getElementById('preloaderCount');
  let progress = 0;

  const tick = () => {
    progress += Math.random() * 22 + 8;
    if (progress >= 100) {
      progress = 100;
      count.textContent = '100%';
      setTimeout(() => preloader.classList.add('done'), 250);
      return;
    }
    count.textContent = Math.floor(progress) + '%';
    setTimeout(tick, 90);
  };

  if (prefersReducedMotion) {
    preloader.classList.add('done');
  } else {
    tick();
  }
})();

/* ===== LANGUAGE SWITCH (CZ / EN) ===== */
(() => {
  const switcher = document.getElementById('langSwitch');
  const buttons = switcher.querySelectorAll('button');

  const setLang = (lang) => {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-cs]').forEach((el) => {
      const text = el.dataset[lang];
      if (text) el.textContent = text;
    });
    document.querySelectorAll('[data-cs-ph]').forEach((el) => {
      const ph = el.dataset[lang + 'Ph'];
      if (ph) el.placeholder = ph;
    });
    buttons.forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
    try { localStorage.setItem('lang', lang); } catch (e) { /* private mode */ }
  };

  buttons.forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) { /* private mode */ }
  if (saved === 'en') setLang('en');
})();

/* ===== CUSTOM CURSOR ===== */
(() => {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!matchMedia('(hover: hover)').matches || prefersReducedMotion) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  const loop = () => {
    rx += (mx - rx) * 0.32;
    ry += (my - ry) * 0.32;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();

  document.querySelectorAll('a, button, .work-card').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });
})();

/* ===== NAV SCROLL STATE ===== */
(() => {
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ===== SCROLLSPY — active pill follows the section ===== */
(() => {
  const links = document.querySelectorAll('#navLinks a');
  const sections = ['top', 'work', 'services', 'about', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((a) => a.classList.toggle('active', a.dataset.section === id));
  };

  const onScroll = () => {
    const pos = window.scrollY + window.innerHeight * 0.35;
    let current = 'top';
    sections.forEach((s) => {
      if (s.offsetTop <= pos) current = s.id;
    });
    setActive(current);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ===== MOBILE MENU ===== */
(() => {
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  const toggle = () => {
    burger.classList.toggle('open');
    menu.classList.toggle('open');
  };
  burger.addEventListener('click', toggle);
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', toggle));
})();

/* ===== SERVICES ACCORDION ===== */
(() => {
  const services = document.querySelectorAll('.service');
  const close = (s) => {
    s.classList.remove('open');
    s.querySelector('.service-head').setAttribute('aria-expanded', 'false');
    s.querySelector('.service-body').style.maxHeight = '';
  };
  services.forEach((service) => {
    const head = service.querySelector('.service-head');
    const body = service.querySelector('.service-body');
    head.addEventListener('click', () => {
      const isOpen = service.classList.contains('open');
      services.forEach(close);
      if (!isOpen) {
        service.classList.add('open');
        head.setAttribute('aria-expanded', 'true');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
})();

/* ===== SCROLL REVEAL ===== */
(() => {
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el) => io.observe(el));
})();

/* ===== STAT COUNTERS — re-animate on every scroll into view ===== */
(() => {
  const stats = document.querySelectorAll('.stat-num');
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 2000;
    const start = performance.now();
    el.dataset.running = start;
    const step = (now) => {
      if (el.dataset.running !== String(start)) return;
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (prefersReducedMotion) {
    stats.forEach((el) => { el.textContent = el.dataset.count; });
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
      } else {
        delete entry.target.dataset.running;
        entry.target.textContent = '0';
      }
    });
  }, { threshold: 0.5 });
  stats.forEach((el) => io.observe(el));
})();

/* ===== 3D TILT ON WORK CARDS ===== */
(() => {
  if (!matchMedia('(hover: hover)').matches || prefersReducedMotion) return;
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${py * -7}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateY(0)';
    });
  });
})();

/* ===== MAGNETIC BUTTONS ===== */
(() => {
  if (!matchMedia('(hover: hover)').matches || prefersReducedMotion) return;
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
})();

/* ===== BACKGROUND VIDEO ===== */
(() => {
  const video = document.querySelector('.bg-video');
  if (!video) return;
  if (prefersReducedMotion) {
    video.pause();
    return;
  }
  const tryPlay = () => video.play().catch(() => {});
  tryPlay();
  document.addEventListener('click', tryPlay, { once: true });
})();
