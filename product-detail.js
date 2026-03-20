'use strict';

/* ================================================================
   product-detail.js — TradeHub Supply V3 상품 상세 페이지
   패턴: state → render → bindEvents → init
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

/* ── 상품 단가 정보 (서버 사이드에서 주입하거나 data-* 속성으로 전달) ── */
const DEFAULT_PRICE_TIERS = [
  { min: 1,   max: 9,   basePrice: 23800 },
  { min: 10,  max: 49,  basePrice: 22500 },
  { min: 50,  max: 99,  basePrice: 21300 },
  { min: 100, max: Infinity, basePrice: 20000 },
];
const PRINT_SURCHARGE = { none: 0, '1color': 500, '4color': 1200 };
const VAT_RATE = 0.1;

/* ── 상태 ── */
const state = {
  qty:          1,
  printOption:  'none',
  isWished:     false,
  carouselIndex: 0,
  carouselVisible: 4,    // 한 번에 보이는 카드 수
  carouselTotal:   0,
  galleryIndex:    0,
  priceTiers:      DEFAULT_PRICE_TIERS,
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
  showTopButton:   false,
};

/* ────────────────────────────────────────
   렌더 함수
   ──────────────────────────────────────── */
function render() {
  renderPriceCalc();
  renderQtyButtons();
  renderActivePriceTier();
  renderWishBtn();
  renderCarouselNav();
  renderSearchLayer();
  renderHotWidget();
  renderQuickMenu();
}

/** 단가 계산 렌더 */
function renderPriceCalc() {
  const tier      = getCurrentTier();
  const surcharge = PRINT_SURCHARGE[state.printOption] || 0;
  const unitPrice = tier.basePrice + surcharge;
  const subtotal  = unitPrice * state.qty;
  const total     = Math.round(subtotal * (1 + VAT_RATE));

  const unitEl    = document.getElementById('unitPriceDisplay');
  const subEl     = document.getElementById('subtotalDisplay');
  const totalEl   = document.getElementById('totalDisplay');
  const heroPriceEl = document.getElementById('heroMemberPrice');

  if (unitEl)  unitEl.innerHTML  = `${fmt(unitPrice)} <small>/박스</small>`;
  if (subEl)   subEl.textContent  = fmt(subtotal);
  if (totalEl) totalEl.textContent = fmt(total);
  if (heroPriceEl) heroPriceEl.textContent = fmt(unitPrice);
}

/** 수량 +/- 버튼 활성/비활성 */
function renderQtyButtons() {
  const minusBtn = document.getElementById('qtyMinus');
  const input    = document.getElementById('qtyInput');
  const min      = Number(input?.min) || 1;
  if (minusBtn) minusBtn.disabled = state.qty <= min;
}

/** 현재 수량에 해당하는 단가 행 강조 */
function renderActivePriceTier() {
  document.querySelectorAll('.pd-price-table tbody tr').forEach((row) => {
    const tier = parsePriceTierRow(row);
    if (!tier) return;
    const isActive = isQtyInTier(state.qty, tier);
    row.classList.toggle('is-active', isActive);
  });
}

/** 찜 버튼 아이콘 상태 */
function renderWishBtn() {
  const btn  = document.getElementById('wishBtn');
  if (!btn) return;
  const icon = btn.querySelector('i');
  btn.classList.toggle('is-wished', state.isWished);
  btn.setAttribute('aria-pressed', String(state.isWished));
  btn.setAttribute('aria-label', state.isWished ? '관심 상품 해제' : '관심 상품 등록');
  if (icon) icon.className = state.isWished ? 'fas fa-heart' : 'far fa-heart';
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

/** 캐러셀 이전/다음 버튼 활성 상태 */
function renderCarouselNav() {
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  if (!prevBtn || !nextBtn) return;
  prevBtn.disabled = state.carouselIndex === 0;
  nextBtn.disabled = state.carouselIndex >= state.carouselTotal - state.carouselVisible;
}

/* ────────────────────────────────────────
   이벤트 바인딩
   ──────────────────────────────────────── */
function bindEvents() {
  bindQty();
  bindPrintOption();
  bindWish();
  bindCta();
  bindCarousel();
  bindGallery();
  bindCatAllToggle();
  bindHeaderSearch();
  bindHotWidget();
  bindQuickMenu();
}

/** 수량 조절 */
function bindQty() {
  const minusBtn = document.getElementById('qtyMinus');
  const plusBtn  = document.getElementById('qtyPlus');
  const input    = document.getElementById('qtyInput');
  if (!input) return;

  const min = Number(input.min) || 1;

  minusBtn?.addEventListener('click', () => {
    if (state.qty > min) {
      state.qty -= 1;
      input.value = state.qty;
      render();
    }
  });

  plusBtn?.addEventListener('click', () => {
    state.qty += 1;
    input.value = state.qty;
    render();
  });

  input.addEventListener('change', () => {
    syncQty(input, min);
    render();
  });

  input.addEventListener('input', () => {
    syncQty(input, min);
    render();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp')   { state.qty += 1; input.value = state.qty; render(); }
    if (e.key === 'ArrowDown') { if (state.qty > min) { state.qty -= 1; input.value = state.qty; render(); } }
  });
}

/** 인쇄 옵션 */
function bindPrintOption() {
  const select = document.getElementById('printOptionSelect');
  if (!select) return;

  select.addEventListener('change', () => {
    state.printOption = select.value;
    renderPriceCalc();
  });
}

/** 찜 토글 */
function bindWish() {
  const btn = document.getElementById('wishBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    state.isWished = !state.isWished;
    renderWishBtn();
    if (state.isWished) {
      showToast('관심 상품에 추가했습니다.', false);
    }
  });
}

/** CTA 버튼 */
function bindCta() {
  // 장바구니 담기
  document.getElementById('addCartBtn')?.addEventListener('click', () => {
    updateCartBadge();
    showToast('장바구니에 담았습니다.', true);
  });

  // 견적서 작성
  document.getElementById('quoteWriteBtn')?.addEventListener('click', () => {
    const productId = document.getElementById('wishBtn')?.dataset.id || '';
    window.location.href = `/quote?productId=${productId}&qty=${state.qty}&print=${state.printOption}`;
  });
}

/** 유사 상품 캐러셀 */
function bindCarousel() {
  const track    = document.getElementById('carouselTrack');
  const prevBtn  = document.getElementById('carouselPrev');
  const nextBtn  = document.getElementById('carouselNext');
  if (!track) return;

  const cards = track.querySelectorAll('.pd-rel-card');
  state.carouselTotal = cards.length;

  // 뷰포트 너비에 따라 가시 카드 수 결정
  const updateVisible = () => {
    const w = window.innerWidth;
    if (w <= 480) {
      state.carouselVisible = 1;
    } else if (w <= 768) {
      state.carouselVisible = 2;
    } else {
      state.carouselVisible = 4;
    }
    // 인덱스 범위 보정
    const maxIdx = Math.max(0, state.carouselTotal - state.carouselVisible);
    if (state.carouselIndex > maxIdx) state.carouselIndex = maxIdx;
    slideCarousel(track);
    renderCarouselNav();
  };

  prevBtn?.addEventListener('click', () => {
    if (state.carouselIndex > 0) {
      state.carouselIndex -= 1;
      slideCarousel(track);
      renderCarouselNav();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (state.carouselIndex < state.carouselTotal - state.carouselVisible) {
      state.carouselIndex += 1;
      slideCarousel(track);
      renderCarouselNav();
    }
  });

  // 터치 스와이프
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) nextBtn?.click();
    else          prevBtn?.click();
  });

  // 초기 및 리사이즈
  updateVisible();
  window.addEventListener('resize', debounce(updateVisible, 200));
}

function slideCarousel(track) {
  const cards  = track.querySelectorAll('.pd-rel-card');
  if (!cards.length) return;

  // 카드 너비 + gap(16px) 기준으로 이동
  const cardWidth = cards[0].offsetWidth + 16;
  track.style.transform = `translateX(-${state.carouselIndex * cardWidth}px)`;
}

/** 갤러리 썸네일 */
function bindGallery() {
  document.querySelectorAll('.pd-gallery__thumb-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
      state.galleryIndex = index;
      document.querySelectorAll('.pd-gallery__thumb-btn').forEach((b, i) => {
        b.classList.toggle('is-active', i === index);
      });
      // 실제 이미지 교체 로직 (서버 연동 시 구현)
      // const main = document.getElementById('galleryMain');
      // main.querySelector('img')?.setAttribute('src', imageUrls[index]);
    });
  });
}

/** 전체 카테고리 드롭다운 */
function bindCatAllToggle() {
  const catAll = document.getElementById('v3CatAll');
  const btn    = catAll?.querySelector('.cat-all__btn');
  const panel  = document.getElementById('v3CatPanel');
  if (!btn || !panel) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isOpen));
    panel.setAttribute('aria-hidden', String(isOpen));
    catAll.classList.toggle('is-open', !isOpen);
  });

  document.addEventListener('click', e => {
    if (!catAll.contains(e.target)) {
      btn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      catAll.classList.remove('is-open');
    }
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

/* ────────────────────────────────────────
   유틸리티
   ──────────────────────────────────────── */

/** 현재 수량에 해당하는 단가 구간 반환 */
function getCurrentTier() {
  return state.priceTiers.find((tier) => isQtyInTier(state.qty, tier))
    || state.priceTiers[state.priceTiers.length - 1]
    || DEFAULT_PRICE_TIERS[DEFAULT_PRICE_TIERS.length - 1];
}

/** 금액 포맷 (₩ + 천단위 콤마) */
function fmt(num) {
  return '₩' + Number(num).toLocaleString('ko-KR');
}

/** 장바구니 뱃지 +1 */
function updateCartBadge() {
  const badge = document.querySelector('.gh__cart-badge');
  if (!badge) return;
  badge.textContent = (parseInt(badge.textContent, 10) || 0) + 1;
}

/** 토스트 메시지 */
let toastTimer = null;
function showToast(msg, showLink) {
  const toast   = document.getElementById('pdToast');
  if (!toast) return;
  toast.querySelector('.pd-toast__msg').textContent = msg;
  const link = toast.querySelector('.pd-toast__link');
  if (link) link.style.display = showLink ? '' : 'none';
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
}

/** 디바운스 */
function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
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

function syncQty(input, min) {
  const rawValue = Number.parseInt(input.value, 10);
  const safeValue = Number.isNaN(rawValue) || rawValue < min ? min : rawValue;
  state.qty = safeValue;
  input.value = safeValue;
}

function isQtyInTier(qty, tier) {
  return qty >= tier.min && qty <= tier.max;
}

function parsePriceTierRow(row) {
  const cells = row.querySelectorAll('td');
  if (cells.length < 2) return null;

  const rangeText = cells[0].textContent?.trim() || '';
  const priceText = cells[1].textContent?.trim() || '';
  const range = parseQtyRange(rangeText);
  const price = parsePrice(priceText);

  if (!range || !price) return null;
  return { ...range, basePrice: price };
}

function parseQtyRange(text) {
  const normalized = text.replace(/\s+/g, '');
  const numbers = normalized.match(/\d+/g)?.map(Number) || [];
  if (!numbers.length) return null;

  if (normalized.includes('이상')) {
    return { min: numbers[0], max: Infinity };
  }

  if (numbers.length >= 2) {
    return { min: numbers[0], max: numbers[1] };
  }

  return { min: numbers[0], max: numbers[0] };
}

function parsePrice(text) {
  const numeric = Number((text || '').replace(/[^\d]/g, ''));
  return numeric || 0;
}

function getPriceTiersFromDom() {
  const rows = Array.from(document.querySelectorAll('.pd-price-table tbody tr'));
  const parsed = rows
    .map(parsePriceTierRow)
    .filter(Boolean)
    .filter((tier, index, list) => (
      list.findIndex((candidate) => candidate.min === tier.min && candidate.max === tier.max) === index
    ))
    .sort((a, b) => a.min - b.min);

  return parsed.length ? parsed : DEFAULT_PRICE_TIERS;
}

/* ────────────────────────────────────────
   초기화
   ──────────────────────────────────────── */
function init() {
  // 초기 수량을 input 기본값과 동기화
  const qtyInput = document.getElementById('qtyInput');
  if (qtyInput) state.qty = Number(qtyInput.value) || 1;

  const printOptionSelect = document.getElementById('printOptionSelect');
  if (printOptionSelect) state.printOption = printOptionSelect.value;
  state.priceTiers = getPriceTiersFromDom();

  bindEvents();
  render();
  startHotRotation();
}

document.addEventListener('DOMContentLoaded', init);
