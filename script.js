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
    document.querySelectorAll('[data-cs-html]').forEach((el) => {
      const html = el.dataset[lang + 'Html'];
      if (html) el.innerHTML = html;
    });
    document.querySelectorAll('[data-cs]').forEach((el) => {
      const text = el.dataset[lang];
      if (text) el.textContent = text;
    });
    document.querySelectorAll('[data-cs-ph]').forEach((el) => {
      const ph = el.dataset[lang + 'Ph'];
      if (ph) el.placeholder = ph;
    });
    document.querySelectorAll('[data-cs-label]').forEach((el) => {
      const label = el.dataset[lang + 'Label'];
      if (label) el.setAttribute('aria-label', label);
    });
    buttons.forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
    try { localStorage.setItem('lang', lang); } catch (e) { /* private mode */ }
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  };

  buttons.forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) { /* private mode */ }
  setLang(saved === 'en' ? 'en' : 'cs');
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

/* ===== MARQUEE LOOP ===== */
(() => {
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  const baseItems = Array.from(track.children).map((item) => item.cloneNode(true));
  const fillTrack = () => {
    const sequence = baseItems.map((item) => item.cloneNode(true));
    track.replaceChildren(...sequence.map((item) => item.cloneNode(true)));
    const viewportWidth = window.visualViewport?.width || window.innerWidth;
    const targetWidth = viewportWidth * 4;
    let guard = 0;
    while (track.scrollWidth < targetWidth && guard < 16) {
      const nextItems = baseItems.map((item) => item.cloneNode(true));
      nextItems.forEach((item) => {
        sequence.push(item);
        track.appendChild(item.cloneNode(true));
      });
      guard += 1;
    }
    track.replaceChildren(
      ...sequence.map((item) => item.cloneNode(true)),
      ...sequence.map((item) => item.cloneNode(true))
    );
  };

  fillTrack();
  window.addEventListener('resize', fillTrack, { passive: true });
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

/* ===== VIEW COUNTERS — count up on scroll into view ===== */
/* ===== CONTACT FORM REVEAL ===== */
(() => {
  const trigger = document.getElementById('contactOpen');
  const form = document.getElementById('contactForm');
  const closeButtons = document.querySelectorAll('[data-close-contact]');
  if (!trigger || !form) return;

  const closeForm = () => {
    form.classList.remove('open');
    form.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('form-open');
    trigger.focus();
  };

  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', () => {
    form.classList.add('open');
    form.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('form-open');
    window.setTimeout(() => form.querySelector('input[name="name"]')?.focus(), 220);
  });
  closeButtons.forEach((button) => button.addEventListener('click', closeForm));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && form.classList.contains('open')) closeForm();
  });
})();

(() => {
  const views = document.querySelectorAll('.views-num[data-count]');
  const format = (value, isDecimal) => (isDecimal ? value.toFixed(1) : String(Math.round(value)));
  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    const isDecimal = el.dataset.count.includes('.');
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    el.dataset.running = start;
    const step = (now) => {
      if (el.dataset.running !== String(start)) return;
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(target * eased, isDecimal) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (prefersReducedMotion) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
      } else {
        delete entry.target.dataset.running;
        entry.target.textContent = format(0, entry.target.dataset.count.includes('.')) + (entry.target.dataset.suffix || '');
      }
    });
  }, { threshold: 0.4 });
  views.forEach((el) => io.observe(el));
})();

/* ===== REEL PREVIEWS — play on hover ===== */
(() => {
  const soundCopy = {
    cs: { on: 'Se zvukem', off: 'Bez zvuku', onLabel: 'Vypnout zvuk', offLabel: 'Zapnout zvuk' },
    en: { on: 'Sound on', off: 'Muted', onLabel: 'Mute sound', offLabel: 'Play with sound' }
  };
  const currentLang = () => (document.documentElement.lang === 'en' ? 'en' : 'cs');
  const setSoundButton = (button, isMuted) => {
    const copy = soundCopy[currentLang()];
    button.textContent = isMuted ? copy.off : copy.on;
    button.setAttribute('aria-label', isMuted ? copy.offLabel : copy.onLabel);
  };

  window.addEventListener('langchange', () => {
    document.querySelectorAll('.thumb-video').forEach((video) => {
      const button = video.closest('.work-card').querySelector('.sound-toggle');
      if (button) setSoundButton(button, video.muted);
    });
  });

  document.querySelectorAll('.thumb-video').forEach((video) => {
    const card = video.closest('.work-card');
    const soundToggle = document.createElement('button');
    soundToggle.type = 'button';
    soundToggle.className = 'sound-toggle';
    setSoundButton(soundToggle, true);
    video.insertAdjacentElement('afterend', soundToggle);

    const stopOtherVideos = () => {
      document.querySelectorAll('.thumb-video').forEach((other) => {
        if (other === video) return;
        const otherCard = other.closest('.work-card');
        const otherToggle = otherCard.querySelector('.sound-toggle');
        other.pause();
        other.controls = false;
        other.muted = true;
        otherCard.classList.remove('video-active');
        if (otherToggle) {
          setSoundButton(otherToggle, true);
        }
      });
    };

    const playWithSound = () => {
      stopOtherVideos();
      card.classList.add('video-active');
      video.controls = true;
      video.muted = false;
      video.play().catch(() => {});
      setSoundButton(soundToggle, false);
    };

    card.addEventListener('mouseenter', () => {
      if (card.classList.contains('video-active')) return;
      video.muted = true;
      video.play().catch(() => {});
    });
    card.addEventListener('mouseleave', () => {
      if (card.classList.contains('video-active')) return;
      video.pause();
      video.currentTime = 0;
    });
    card.addEventListener('click', (event) => {
      if (event.target === soundToggle) return;
      if (card.classList.contains('video-active')) return;
      playWithSound();
    });
    video.addEventListener('click', (event) => {
      if (!card.classList.contains('video-active')) return;
      event.stopPropagation();
    });
    soundToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!card.classList.contains('video-active')) {
        playWithSound();
        return;
      }
      video.muted = !video.muted;
      setSoundButton(soundToggle, video.muted);
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

/* ===== SMOOTH WHEEL SCROLL ===== */
(() => {
  if (prefersReducedMotion || !matchMedia('(hover: hover)').matches) return;

  let targetY = window.scrollY;
  let currentY = window.scrollY;
  let rafId = null;
  let isAnimating = false;

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  const clamp = (value) => Math.max(0, Math.min(value, maxScroll()));

  const step = () => {
    isAnimating = true;
    currentY += (targetY - currentY) * 0.32;
    if (Math.abs(targetY - currentY) < 0.35) {
      currentY = targetY;
      rafId = null;
      isAnimating = false;
    } else {
      rafId = requestAnimationFrame(step);
    }
    window.scrollTo(0, currentY);
  };

  window.addEventListener('wheel', (event) => {
    if (event.ctrlKey) return;
    event.preventDefault();
    targetY = clamp(targetY + event.deltaY * 0.75);
    if (!rafId) {
      currentY = window.scrollY;
      rafId = requestAnimationFrame(step);
    }
  }, { passive: false });

  window.addEventListener('scroll', () => {
    if (isAnimating) return;
    targetY = window.scrollY;
    currentY = window.scrollY;
  }, { passive: true });

  window.addEventListener('keydown', () => {
    targetY = window.scrollY;
    currentY = window.scrollY;
  });
})();
