'use strict';

/* ================================================================
   product-list.js — TradeHub Supply V3 상품 목록 페이지
   화면 데모용 UI 상태만 관리
   ================================================================ */

const HEADER_POPULAR_TERMS = [
  { keyword: 'A4 복사용지', trend: 'up', count: 2 },
  { keyword: '기업 텀블러', trend: 'same', count: 0 },
  { keyword: '택배 박스', trend: 'up', count: 1 },
  { keyword: '손 소독제', trend: 'down', count: 1 },
  { keyword: '회의용 의자', trend: 'same', count: 0 },
  { keyword: '캡슐 커피머신', trend: 'up', count: 3 },
  { keyword: '포스트잇', trend: 'down', count: 2 },
  { keyword: '물티슈', trend: 'same', count: 0 },
  { keyword: '쇼핑백', trend: 'up', count: 1 },
  { keyword: '명함 케이스', trend: 'down', count: 1 },
];

const state = {
  view: 'grid',
  sort: 'popular', // 'popular' | 'recommended' | 'latest' | 'price_asc' | 'price_desc'
  filters: {
    category: '',
    priceMin: 0,
    priceMax: 0,
  },
  isFilterOpen: false,
  wishlist: new Set(),
  search: {
    open: false,
    showAllPopular: false,
    recentTerms: ['복사용지', '텀블러', '택배 박스', '손 소독제'],
    popularTerms: HEADER_POPULAR_TERMS,
  },
  hot: {
    currentIndex: 9,
    open: false,
    timer: null,
    DELAY: 5000,
  },
  showTopButton: false,
};

function render() {
  renderViewToggle();
  renderActiveFilters();
  renderWishlistIcons();
  renderSearchLayer();
  renderHotWidget();
  renderQuickMenu();
}

function renderViewToggle() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.dataset.view = state.view;

  document.querySelectorAll('.pl-view-btn').forEach((btn) => {
    const isActive = btn.dataset.view === state.view;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

function renderActiveFilters() {
  const container = document.getElementById('activeFilters');
  if (!container) return;

  const tags = [];

  if (state.filters.category) {
    tags.push({
      key: 'category',
      value: state.filters.category,
      label: getCategoryLabel(state.filters.category),
    });
  }

  if (state.filters.priceMin || state.filters.priceMax) {
    const min = state.filters.priceMin ? formatPrice(state.filters.priceMin) : '0';
    const max = state.filters.priceMax ? formatPrice(state.filters.priceMax) : '∞';
    tags.push({
      key: 'price',
      value: 'range',
      label: `₩${min} ~ ₩${max}`,
    });
  }

  container.innerHTML = tags.map((tag) => `
    <span class="pl-filter-tag" role="listitem" data-key="${tag.key}" data-value="${tag.value}">
      ${tag.label}
      <button type="button" aria-label="${tag.label} 필터 제거" data-key="${tag.key}" data-value="${tag.value}">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </span>
  `).join('');

  container.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFilter(btn.dataset.key);
    });
  });
}

function renderWishlistIcons() {
  document.querySelectorAll('.pl-card__wish-btn').forEach((btn) => {
    const id = btn.dataset.id;
    const isWished = state.wishlist.has(id);
    const icon = btn.querySelector('i');

    if (icon) {
      icon.className = isWished ? 'fas fa-heart' : 'far fa-heart';
      icon.style.color = isWished ? 'var(--p-red)' : '';
    }

    btn.setAttribute('aria-label', isWished ? '관심 상품 해제' : '관심 상품 등록');
  });
}

function renderQuickMenu() {
  const topBtn = document.getElementById('quickTopBtn');
  if (!topBtn) return;
  topBtn.classList.toggle('is-visible', state.showTopButton);
}

function renderSearchLayer() {
  const layer = document.getElementById('ghSearchLayer');
  const recentList = document.getElementById('ghRecentList');
  const recentEmpty = document.getElementById('ghRecentEmpty');
  const popularList = document.getElementById('ghPopularList');
  const popularToggleBtn = document.getElementById('ghPopularToggleBtn');
  if (!layer || !recentList || !recentEmpty || !popularList || !popularToggleBtn) return;

  layer.classList.toggle('is-open', state.search.open);
  layer.setAttribute('aria-hidden', String(!state.search.open));

  recentList.innerHTML = state.search.recentTerms.map((term) => `
    <li class="gh-search-layer__recent-item">
      <button type="button" class="gh-search-layer__term-btn" data-search-term="${escapeAttr(term)}">${escapeHtml(term)}</button>
      <button type="button" class="gh-search-layer__delete" data-delete-term="${escapeAttr(term)}" aria-label="${escapeAttr(term)} 삭제">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </li>
  `).join('');
  recentEmpty.hidden = state.search.recentTerms.length > 0;

  const visiblePopular = state.search.popularTerms.slice(0, state.search.showAllPopular ? 10 : 5);
  popularList.innerHTML = visiblePopular.map((term, idx) => `
    <li class="gh-search-layer__popular-item">
      <button type="button" class="gh-search-layer__popular-btn" data-search-term="${escapeAttr(term.keyword)}">
        <span class="gh-search-layer__rank">${idx + 1}</span>
        <span class="gh-search-layer__keyword">${escapeHtml(term.keyword)}</span>
        <span class="gh-search-layer__trend gh-search-layer__trend--${escapeAttr(term.trend)}">${renderTrendMarkup(term)}</span>
      </button>
    </li>
  `).join('');
  popularToggleBtn.textContent = state.search.showAllPopular ? '접기' : '더보기';
  popularToggleBtn.setAttribute('aria-expanded', String(state.search.showAllPopular));
}

function renderHotWidget() {
  const widget = document.getElementById('ghHotWidget');
  const panel = document.getElementById('ghHotPanel');
  const triggerBtn = document.getElementById('ghHotTriggerBtn');
  const current = document.getElementById('ghHotCurrent');
  const list = document.getElementById('ghHotList');
  if (!widget || !panel || !triggerBtn || !current || !list) return;

  const term = state.search.popularTerms[state.hot.currentIndex];
  const rankEl = current.querySelector('.gh-hot__rank');
  const keywordEl = current.querySelector('.gh-hot__keyword');

  if (term && rankEl && keywordEl) {
    rankEl.textContent = `${state.hot.currentIndex + 1}위`;
    keywordEl.textContent = term.keyword;
  }

  widget.classList.toggle('is-open', state.hot.open);
  panel.setAttribute('aria-hidden', String(!state.hot.open));
  triggerBtn.setAttribute('aria-expanded', String(state.hot.open));

  list.innerHTML = state.search.popularTerms.map((item, idx) => `
    <li class="gh-hot__list-item">
      <button type="button" class="gh-hot__list-btn" data-hot-term="${escapeAttr(item.keyword)}">
        <span class="gh-hot__list-rank">${idx + 1}위</span>
        <span class="gh-hot__list-keyword">${escapeHtml(item.keyword)}</span>
      </button>
    </li>
  `).join('');
}

function bindEvents() {
  bindViewToggle();
  bindSort();
  bindCategoryFilter();
  bindPriceRange();
  bindFilterReset();
  bindFilterMobile();
  bindCardActions();
  bindCatAllToggle();
  bindPagination();
  bindHeaderSearch();
  bindHotWidget();
  bindQuickMenu();
}

function bindViewToggle() {
  document.querySelectorAll('.pl-view-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view;
      renderViewToggle();
    });
  });
}

function bindSort() {
  const select = document.getElementById('sortSelect');
  if (!select) return;

  select.addEventListener('change', () => {
    state.sort = select.value;
  });
}

function bindCategoryFilter() {
  document.querySelectorAll('input[name="category"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      state.filters.category = radio.value;
      renderActiveFilters();
    });
  });
}

function bindPriceRange() {
  document.querySelectorAll('.pl-filter__price-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pl-filter__price-btn').forEach((item) => {
        item.classList.remove('is-active');
      });
      btn.classList.add('is-active');

      state.filters.priceMin = Number(btn.dataset.min) || 0;
      state.filters.priceMax = Number(btn.dataset.max) || 0;

      const minInput = document.getElementById('priceMin');
      const maxInput = document.getElementById('priceMax');
      if (minInput) minInput.value = state.filters.priceMin || '';
      if (maxInput) maxInput.value = state.filters.priceMax || '';

      renderActiveFilters();
    });
  });

  const minInput = document.getElementById('priceMin');
  const maxInput = document.getElementById('priceMax');
  const syncRange = debounce(() => {
    state.filters.priceMin = Number(minInput?.value) || 0;
    state.filters.priceMax = Number(maxInput?.value) || 0;

    document.querySelectorAll('.pl-filter__price-btn').forEach((btn) => {
      btn.classList.remove('is-active');
    });

    renderActiveFilters();
  }, 250);

  minInput?.addEventListener('input', syncRange);
  maxInput?.addEventListener('input', syncRange);
}

function bindFilterReset() {
  const btn = document.getElementById('filterResetBtn');
  if (!btn) return;

  btn.addEventListener('click', resetFilters);
}

function bindFilterMobile() {
  if (!document.getElementById('filterToggleBtn')) {
    const toolbar = document.querySelector('.pl-toolbar__left');
    if (toolbar) {
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'filterToggleBtn';
      toggleBtn.type = 'button';
      toggleBtn.className = 'btn-ghost';
      toggleBtn.style.cssText = 'display:none; gap:6px; align-items:center;';
      toggleBtn.innerHTML = '<i class="fas fa-sliders-h" aria-hidden="true"></i> 필터';
      toggleBtn.setAttribute('aria-expanded', 'false');
      toolbar.prepend(toggleBtn);

      const mq = window.matchMedia('(max-width: 768px)');
      const applyMq = (event) => {
        toggleBtn.style.display = event.matches ? 'inline-flex' : 'none';
      };

      mq.addEventListener('change', applyMq);
      applyMq(mq);
    }
  }

  document.addEventListener('click', (event) => {
    const toggleBtn = document.getElementById('filterToggleBtn');
    const filter = document.querySelector('.pl-filter');
    const overlay = document.getElementById('filterOverlay');
    if (!filter || !overlay) return;

    if (event.target === toggleBtn || toggleBtn?.contains(event.target)) {
      openFilter(filter, overlay, toggleBtn);
      return;
    }

    if (event.target === overlay || event.target.id === 'filterApplyBtn' || event.target.closest('#filterApplyBtn')) {
      closeFilter(filter, overlay, toggleBtn);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !state.isFilterOpen) return;

    const filter = document.querySelector('.pl-filter');
    const overlay = document.getElementById('filterOverlay');
    const toggleBtn = document.getElementById('filterToggleBtn');
    closeFilter(filter, overlay, toggleBtn);
  });
}

function openFilter(filter, overlay, button) {
  state.isFilterOpen = true;
  filter.classList.add('is-open');
  overlay.classList.add('is-visible');
  overlay.setAttribute('aria-hidden', 'false');
  button?.setAttribute('aria-expanded', 'true');
}

function closeFilter(filter, overlay, button) {
  state.isFilterOpen = false;
  filter.classList.remove('is-open');
  overlay.classList.remove('is-visible');
  overlay.setAttribute('aria-hidden', 'true');
  button?.setAttribute('aria-expanded', 'false');
}

function bindCardActions() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.addEventListener('click', (event) => {
    const cartBtn = event.target.closest('.pl-card__cart-btn');
    if (cartBtn) {
      showToast('장바구니에 담았습니다.');
      updateCartBadge();
      return;
    }

    const wishBtn = event.target.closest('.pl-card__wish-btn');
    if (wishBtn) {
      const id = wishBtn.dataset.id;
      if (state.wishlist.has(id)) {
        state.wishlist.delete(id);
      } else {
        state.wishlist.add(id);
      }
      renderWishlistIcons();
      return;
    }

    const orderBtn = event.target.closest('.pl-card__order-btn');
    if (orderBtn) {
      showToast('주문·견적 기능은 준비 중입니다.');
    }
  });
}

function bindCatAllToggle() {
  const catAll = document.getElementById('v3CatAll');
  const button = catAll?.querySelector('.cat-all__btn');
  const panel = document.getElementById('v3CatPanel');
  if (!button || !panel) return;

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    panel.setAttribute('aria-hidden', String(isOpen));
    catAll.classList.toggle('is-open', !isOpen);
  });

  document.addEventListener('click', (event) => {
    if (catAll.contains(event.target)) return;
    button.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    catAll.classList.remove('is-open');
  });
}

function bindPagination() {
  const pagination = document.querySelector('.pl-pagination');
  if (!pagination) return;

  const pageButtons = Array.from(
    pagination.querySelectorAll('.pl-pagination__pages .pl-page-btn')
  );
  const prevBtn = pagination.querySelector('.pl-page-btn[aria-label="이전 페이지"]');
  const nextBtn = pagination.querySelector('.pl-page-btn[aria-label="다음 페이지"]');
  if (!pageButtons.length) return;

  const setActivePage = (activeIndex) => {
    pageButtons.forEach((btn, index) => {
      const isActive = index === activeIndex;
      btn.classList.toggle('is-active', isActive);

      if (isActive) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    if (prevBtn) prevBtn.disabled = activeIndex === 0;
    if (nextBtn) nextBtn.disabled = activeIndex === pageButtons.length - 1;
  };

  let activeIndex = pageButtons.findIndex((btn) => btn.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;
  setActivePage(activeIndex);

  pageButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      activeIndex = index;
      setActivePage(activeIndex);
    });
  });

  prevBtn?.addEventListener('click', () => {
    if (activeIndex === 0) return;
    activeIndex -= 1;
    setActivePage(activeIndex);
  });

  nextBtn?.addEventListener('click', () => {
    if (activeIndex >= pageButtons.length - 1) return;
    activeIndex += 1;
    setActivePage(activeIndex);
  });
}

function bindQuickMenu() {
  const topBtn = document.getElementById('quickTopBtn');
  if (!topBtn) return;

  const syncQuickMenu = () => {
    state.showTopButton = window.scrollY > 360;
    renderQuickMenu();
  };

  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', syncQuickMenu, { passive: true });
  syncQuickMenu();
}

function bindHeaderSearch() {
  const searchForm = document.querySelector('.gh__search');
  const searchInput = document.querySelector('.gh__search-input');
  const searchSelect = document.querySelector('.gh__search-select');

  const openSearchLayer = () => {
    state.search.open = true;
    renderSearchLayer();
  };
  const closeSearchLayer = () => {
    state.search.open = false;
    renderSearchLayer();
  };

  searchInput?.addEventListener('focus', openSearchLayer);
  searchInput?.addEventListener('click', openSearchLayer);
  searchSelect?.addEventListener('focus', openSearchLayer);
  searchSelect?.addEventListener('click', openSearchLayer);

  searchForm?.addEventListener('submit', (event) => {
    const keyword = searchInput?.value.trim() || '';
    if (!keyword) return;
    event.preventDefault();
    addRecentSearch(keyword);
    openSearchLayer();
  });

  searchForm?.addEventListener('click', (event) => {
    event.stopPropagation();

    const deleteBtn = event.target.closest('[data-delete-term]');
    if (deleteBtn) {
      state.search.recentTerms = state.search.recentTerms.filter((term) => term !== deleteBtn.dataset.deleteTerm);
      renderSearchLayer();
      return;
    }

    const termBtn = event.target.closest('[data-search-term]');
    if (termBtn) {
      const keyword = termBtn.dataset.searchTerm || '';
      if (searchInput) searchInput.value = keyword;
      addRecentSearch(keyword);
      return;
    }

    if (event.target.closest('#ghRecentClearBtn')) {
      state.search.recentTerms = [];
      renderSearchLayer();
      return;
    }

    if (event.target.closest('#ghPopularToggleBtn')) {
      state.search.showAllPopular = !state.search.showAllPopular;
      renderSearchLayer();
    }
  });

  document.addEventListener('click', () => {
    if (state.search.open) closeSearchLayer();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.search.open) closeSearchLayer();
  });
}

function bindHotWidget() {
  const hotWidget = document.getElementById('ghHotWidget');
  const searchInput = document.querySelector('.gh__search-input');
  if (!hotWidget) return;

  hotWidget.addEventListener('click', (event) => {
    event.stopPropagation();

    const closeBtn = event.target.closest('#ghHotCloseBtn');
    if (closeBtn) {
      state.hot.open = false;
      renderHotWidget();
      return;
    }

    const triggerBtn = event.target.closest('#ghHotTriggerBtn');
    if (triggerBtn) {
      state.hot.open = !state.hot.open;
      renderHotWidget();
      return;
    }

    const termBtn = event.target.closest('[data-hot-term]');
    if (termBtn) {
      const keyword = termBtn.dataset.hotTerm || '';
      if (searchInput) searchInput.value = keyword;
      addRecentSearch(keyword);
      state.hot.open = false;
      renderHotWidget();
    }
  });

  document.addEventListener('click', () => {
    if (state.hot.open) {
      state.hot.open = false;
      renderHotWidget();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.hot.open) {
      state.hot.open = false;
      renderHotWidget();
    }
  });
}

function removeFilter(key) {
  if (key === 'category') {
    state.filters.category = '';
    const radio = document.querySelector('input[name="category"][value=""]');
    if (radio) radio.checked = true;
  }

  if (key === 'price') {
    state.filters.priceMin = 0;
    state.filters.priceMax = 0;

    const minInput = document.getElementById('priceMin');
    const maxInput = document.getElementById('priceMax');
    if (minInput) minInput.value = '';
    if (maxInput) maxInput.value = '';

    document.querySelectorAll('.pl-filter__price-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.min === '0' && btn.dataset.max === '0');
    });
  }

  renderActiveFilters();
}

function resetFilters() {
  state.filters = {
    category: '',
    priceMin: 0,
    priceMax: 0,
  };

  document.querySelectorAll('input[name="category"]').forEach((radio) => {
    radio.checked = radio.value === '';
  });

  document.querySelectorAll('.pl-filter__price-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.min === '0' && btn.dataset.max === '0');
  });

  const minInput = document.getElementById('priceMin');
  const maxInput = document.getElementById('priceMax');
  if (minInput) minInput.value = '';
  if (maxInput) maxInput.value = '';

  renderActiveFilters();
}

function updateCartBadge() {
  const badge = document.querySelector('.gh__cart-badge');
  if (!badge) return;

  const current = parseInt(badge.textContent, 10) || 0;
  badge.textContent = current + 1;
}

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('cartToast');
  if (!toast) return;

  toast.querySelector('.pl-toast__msg').textContent = message;
  toast.classList.add('is-visible');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3000);
}

function getCategoryLabel(code) {
  const map = {
    office: '사무용품',
    daily: '생활용품',
    kitchen: '주방용품',
    digital: '디지털/가전',
    package: '포장/배송',
    promo: '판촉물',
    season: '시즌상품',
    cleaning: '청소/위생',
  };

  return map[code] || code;
}

function formatPrice(num) {
  return Number(num).toLocaleString('ko-KR');
}

function debounce(fn, delay) {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function addRecentSearch(keyword) {
  const value = String(keyword || '').trim();
  if (!value) return;
  state.search.recentTerms = [
    value,
    ...state.search.recentTerms.filter((term) => term !== value),
  ].slice(0, 8);
  renderSearchLayer();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function renderTrendMarkup(term) {
  if (term.trend === 'up') return `▲ ${term.count}`;
  if (term.trend === 'down') return `▼ ${term.count}`;
  return '-';
}

function startHotRotation() {
  clearInterval(state.hot.timer);
  state.hot.timer = setInterval(() => {
    state.hot.currentIndex = state.hot.currentIndex <= 0
      ? state.search.popularTerms.length - 1
      : state.hot.currentIndex - 1;
    renderHotWidget();
  }, state.hot.DELAY);
}

function init() {
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.value = state.sort;

  bindEvents();
  render();
  startHotRotation();
}

document.addEventListener('DOMContentLoaded', init);
