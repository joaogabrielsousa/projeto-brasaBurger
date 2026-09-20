(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1. Header: sticky + estado ao rolar
  ------------------------------------------------------------------ */
  const header = document.getElementById('header');
  const SCROLL_THRESHOLD = 40;

  function updateHeaderState() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  /* ------------------------------------------------------------------
     2. Menu mobile
  ------------------------------------------------------------------ */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Abrir menu');
    mobileMenu.classList.remove('is-open');
  }

  function toggleMobileMenu() {
    const isOpen = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileMenu();
    } else {
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      hamburgerBtn.setAttribute('aria-label', 'Fechar menu');
      mobileMenu.classList.add('is-open');
    }
  }

  hamburgerBtn.addEventListener('click', toggleMobileMenu);

  // Fecha o menu mobile ao clicar em qualquer link dele
  mobileMenu.querySelectorAll('.mobile-menu__link').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ------------------------------------------------------------------
     3. Smooth scroll para links internos (respeitando header fixo)
  ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const headerHeight = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;

      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  });

  /* ------------------------------------------------------------------
     4. Animações de entrada (IntersectionObserver)
  ------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------------
     5. Contadores das estatísticas
  ------------------------------------------------------------------ */
  const statNumbers = document.querySelectorAll('.stat__number');

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const isDecimal = target % 1 !== 0;
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    if (prefersReducedMotion) {
      el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
    } else {
      requestAnimationFrame(step);
    }
  }

  if (statNumbers.length && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    statNumbers.forEach((el) => statsObserver.observe(el));
  }

  /* ------------------------------------------------------------------
     6. Carrinho demonstrativo
  ------------------------------------------------------------------ */
  const cartBadge = document.getElementById('cart-badge');
  const toast = document.getElementById('toast');
  let cartCount = 0;
  let toastTimeout = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2200);
  }

  document.querySelectorAll('.menu-card__add').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.menu-card');
      const name = card ? card.dataset.name : 'Item';

      cartCount += 1;
      cartBadge.textContent = String(cartCount);
      cartBadge.classList.add('is-visible');

      // Reinicia a animação de "bump" do badge
      cartBadge.classList.remove('bump');
      void cartBadge.offsetWidth; // força reflow
      cartBadge.classList.add('bump');

      // Feedback visual no próprio botão
      button.classList.remove('is-added');
      void button.offsetWidth;
      button.classList.add('is-added');

      showToast(name + ' adicionado ao carrinho');
    });
  });

  const cartBtn = document.getElementById('cart-btn');
  cartBtn.addEventListener('click', () => {
    if (cartCount === 0) {
      showToast('Seu carrinho está vazio');
    } else {
      showToast('Você tem ' + cartCount + ' item(ns) no carrinho');
    }
  });

  /* ------------------------------------------------------------------
     7. Botão "voltar ao topo"
  ------------------------------------------------------------------ */
  const backToTopBtn = document.getElementById('back-to-top');

  function updateBackToTop() {
    if (window.scrollY > 600) {
      backToTopBtn.classList.add('is-visible');
    } else {
      backToTopBtn.classList.remove('is-visible');
    }
  }
  updateBackToTop();
  window.addEventListener('scroll', updateBackToTop, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ------------------------------------------------------------------
     8. Parallax sutil no Hero (desativado com prefers-reduced-motion)
  ------------------------------------------------------------------ */
  const heroPlate = document.querySelector('.hero__plate');
  const heroEmber = document.querySelector('.hero__ember');

  if (heroPlate && !prefersReducedMotion) {
    let ticking = false;

    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const heroHeight = document.querySelector('.hero').offsetHeight;
          if (scrollY < heroHeight) {
            const offset = scrollY * 0.12;
            heroPlate.style.transform = 'translateY(' + offset + 'px)';
            if (heroEmber) heroEmber.style.transform = 'translate(-50%, ' + offset * 0.4 + 'px)';
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }
})();
