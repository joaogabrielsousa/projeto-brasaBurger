(function () {
  'use strict';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hamburger
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu   = document.getElementById('mobile-menu');
  function closeMobileMenu() {
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Abrir menu');
    mobileMenu.classList.remove('is-open');
  }
  hamburgerBtn.addEventListener('click', () => {
    const open = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    if (open) { closeMobileMenu(); }
    else {
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      hamburgerBtn.setAttribute('aria-label', 'Fechar menu');
      mobileMenu.classList.add('is-open');
    }
  });
  mobileMenu.querySelectorAll('.mobile-menu__link').forEach(l => l.addEventListener('click', closeMobileMenu));

  // Filtros
  const filterBtns = document.querySelectorAll('.filter-btn');
  const sections   = document.querySelectorAll('.category-section');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.dataset.filter;
      sections.forEach(sec => {
        if (filter === 'all' || sec.dataset.category === filter) sec.removeAttribute('hidden');
        else sec.setAttribute('hidden', '');
      });
    });
  });

  // Quantidade nos cards
  document.querySelectorAll('.product-card').forEach(card => {
    const display = card.querySelector('.qty-value');
    const dec     = card.querySelector('[data-action="decrease"]');
    const inc     = card.querySelector('[data-action="increase"]');
    let qty = 1;
    inc.addEventListener('click', () => { qty = Math.min(qty + 1, 99); display.textContent = qty; });
    dec.addEventListener('click', () => { qty = Math.max(qty - 1, 1);  display.textContent = qty; });
  });

  // Favoritos
  document.querySelectorAll('.product-card__fav').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('is-fav');
      const name = btn.closest('.product-card').dataset.name;
      showToast(btn.classList.contains('is-fav') ? ('Adicionado aos favoritos: ' + name) : (name + ' removido dos favoritos'));
    });
  });

  // Carrinho
  const cartBadge       = document.getElementById('cart-badge');
  const cartOpenBtn     = document.getElementById('cart-open-btn');
  const cartCloseBtn    = document.getElementById('cart-close-btn');
  const cartOverlay     = document.getElementById('cart-overlay');
  const cartDrawer      = document.getElementById('cart-drawer');
  const cartDrawerCount = document.getElementById('cart-drawer-count');
  const cartItemsList   = document.getElementById('cart-items-list');
  const cartEmpty       = document.getElementById('cart-empty');
  const cartFooter      = document.getElementById('cart-drawer-footer');
  const cartSubtotal    = document.getElementById('cart-subtotal');
  const cartTotalEl     = document.getElementById('cart-total');
  const cartClearBtn    = document.getElementById('cart-clear-btn');
  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
  const DELIVERY = 5.00;
  let cart = [];

  function fmt(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }

  function openCart() {
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
    cartOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    cartCloseBtn.focus();
  }
  function closeCart() {
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    cartOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  cartOpenBtn.addEventListener('click', openCart);
  cartCloseBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  function updateBadge() {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    cartBadge.textContent = String(total);
    cartDrawerCount.textContent = String(total);
    if (total > 0) {
      cartBadge.classList.add('is-visible');
      cartBadge.classList.remove('bump');
      void cartBadge.offsetWidth;
      cartBadge.classList.add('bump');
    } else { cartBadge.classList.remove('is-visible'); }
  }

  function updateSummary() {
    const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
    cartSubtotal.textContent = fmt(sub);
    cartTotalEl.textContent  = fmt(sub > 0 ? sub + DELIVERY : 0);
  }

  function renderCart() {
    cartItemsList.innerHTML = '';
    if (cart.length === 0) {
      cartEmpty.style.display  = '';
      cartFooter.style.display = 'none';
      return;
    }
    cartEmpty.style.display  = 'none';
    cartFooter.style.display = '';

    cart.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML =
        '<img class="cart-item__img" src="' + item.img + '" alt="' + item.name + '" loading="lazy">' +
        '<div class="cart-item__info">' +
          '<div class="cart-item__name">' + item.name + '</div>' +
          '<div class="cart-item__price">' + fmt(item.price) + '</div>' +
        '</div>' +
        '<div class="cart-item__controls">' +
          '<button class="cart-item__qty-btn" data-ci="dec" aria-label="Diminuir ' + item.name + '">&#8722;</button>' +
          '<span class="cart-item__qty-val" aria-live="polite">' + item.qty + '</span>' +
          '<button class="cart-item__qty-btn" data-ci="inc" aria-label="Aumentar ' + item.name + '">+</button>' +
          '<button class="cart-item__remove" aria-label="Remover ' + item.name + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>';

      el.querySelector('[data-ci="inc"]').addEventListener('click', () => {
        item.qty = Math.min(item.qty + 1, 99);
        renderCart(); updateBadge(); updateSummary();
      });
      el.querySelector('[data-ci="dec"]').addEventListener('click', () => {
        item.qty--;
        if (item.qty <= 0) cart = cart.filter(i => i !== item);
        renderCart(); updateBadge(); updateSummary();
      });
      el.querySelector('.cart-item__remove').addEventListener('click', () => {
        cart = cart.filter(i => i !== item);
        renderCart(); updateBadge(); updateSummary();
        showToast(item.name + ' removido do carrinho');
      });
      cartItemsList.appendChild(el);
    });
    updateSummary();
  }

  // Adicionar ao carrinho
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card  = btn.closest('.product-card');
      const id    = card.dataset.id;
      const name  = card.dataset.name;
      const price = parseFloat(card.dataset.price);
      const img   = card.dataset.img;
      const qty   = parseInt(card.querySelector('.qty-value').textContent, 10);
      const exist = cart.find(i => i.id === id);
      if (exist) { exist.qty += qty; }
      else { cart.push({ id, name, price, qty, img }); }

      card.querySelector('.qty-value').textContent = '1';
      btn.classList.remove('is-added');
      void btn.offsetWidth;
      btn.classList.add('is-added');

      renderCart(); updateBadge();
      showToast(name + ' adicionado ao carrinho!');
    });
  });

  cartClearBtn.addEventListener('click', () => {
    cart = []; renderCart(); updateBadge(); updateSummary();
    showToast('Carrinho limpo');
  });

  cartCheckoutBtn.addEventListener('click', () => {
    showToast('Pedido realizado! Entraremos em contato em breve.');
    cart = []; renderCart(); updateBadge(); updateSummary(); closeCart();
  });

  // Toast
  const toast = document.getElementById('toast');
  let toastTimeout = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 2400);
  }

  // Voltar ao topo
  const backBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => backBtn.classList.toggle('is-visible', window.scrollY > 500), { passive: true });
  backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));

  renderCart();
})();
