(() => {
  const nav = document.getElementById('nav');
  const mobileBar = document.getElementById('mobile-bar');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY > 80;
        nav.classList.toggle('scrolled', scrolled);
        if (mobileBar) mobileBar.classList.toggle('visible', scrolled);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = nav.offsetHeight + 24;
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat-value').forEach((el) => {
            const target = parseFloat(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const hasDecimal = String(target).includes('.');
            const duration = 1400;
            const start = performance.now();

            const animate = (now) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = target * eased;
              el.textContent = (hasDecimal ? current.toFixed(hasDecimal ? String(target).split('.')[1].length : 0) : Math.round(current)) + suffix;
              if (progress < 1) requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
          });
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  const statsGrid = document.querySelector('.stats-grid');
  if (statsGrid) statsObserver.observe(statsGrid);

  // Meta Pixel: track leads on external booking links
  const trackLead = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead');
    }
  };

  document
    .querySelectorAll('a[href*="tidycal.com/isaurasantos/twnya-session"]')
    .forEach((link) => {
      link.addEventListener('click', trackLead);
    });

  // Photo gallery slider
  const slider = document.querySelector('.photo-slider');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.photo-slide'));
    const prev = document.querySelector('.photo-nav-prev');
    const next = document.querySelector('.photo-nav-next');
    const dots = Array.from(document.querySelectorAll('.photo-dot'));
    let index = 0;

    const setActive = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        slide.classList.toggle('is-active', idx === index);
      });
      dots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === index);
      });
    };

    prev?.addEventListener('click', () => setActive(index - 1));
    next?.addEventListener('click', () => setActive(index + 1));
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => setActive(idx));
    });
  }

  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach((other) => {
        other.classList.remove('open');
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Cookies banner
  const cookiesBanner = document.getElementById('cookies-banner');
  const cookiesAccept = document.getElementById('cookies-accept');
  const COOKIES_KEY = 'twnya_cookies_accepted_v1';

  if (cookiesBanner && cookiesAccept) {
    const hasConsent = window.localStorage.getItem(COOKIES_KEY) === 'true';
    if (!hasConsent) {
      requestAnimationFrame(() => {
        cookiesBanner.classList.add('is-visible');
      });
    }

    cookiesAccept.addEventListener('click', () => {
      window.localStorage.setItem(COOKIES_KEY, 'true');
      cookiesBanner.classList.remove('is-visible');
    });
  }
})();
