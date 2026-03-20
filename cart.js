'use strict';

/* ================================================================
   cart.js — TradeHub Supply V3 장바구니 페이지
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

const VAT_RATE = 0.1;

/* ── 상태 ── */
const state = {
  checkedIds: new Set(),   // 선택된 cart-item data-id 값
  items: new Map(),        // id → { price, qty, el }
  expandedIds: new Set(),
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

/* ────────────────────────────────────────
   렌더 함수
   ──────────────────────────────────────── */
function render() {
  renderSummary();
  renderDeleteSelectedBtn();
  renderCheckAllState();
  state.items.forEach((_, id) => renderItemExpanded(id));
  renderSearchLayer();
  renderHotWidget();
  renderQuickMenu();
}

/** 금액 요약 업데이트 */
function renderSummary() {
  const selectedCount = state.checkedIds.size;
  let subtotal = 0;

  state.checkedIds.forEach((id) => {
    const item = state.items.get(id);
    if (item) subtotal += item.price * item.qty;
  });

  const total = Math.round(subtotal * (1 + VAT_RATE));

  const selectedCountEl = document.getElementById('selectedCountDisplay');
  const subtotalEl      = document.getElementById('subtotalDisplay');
  const totalEl         = document.getElementById('totalDisplay');
  const orderBtn        = document.getElementById('orderBtn');

  if (selectedCountEl) selectedCountEl.textContent = `${selectedCount}개`;
  if (subtotalEl)      subtotalEl.textContent       = fmt(subtotal);
  if (totalEl)         totalEl.textContent           = fmt(total);
  if (orderBtn)        orderBtn.disabled             = selectedCount === 0;
}

/** 선택 삭제 버튼 활성 상태 */
function renderDeleteSelectedBtn() {
  const btn = document.getElementById('deleteSelectedBtn');
  if (btn) btn.disabled = state.checkedIds.size === 0;
}

/** 전체 선택 체크박스 indeterminate / checked 상태 */
function renderCheckAllState() {
  const checkAll = document.getElementById('checkAll');
  if (!checkAll) return;

  const total    = state.items.size;
  const checked  = state.checkedIds.size;

  if (checked === 0) {
    checkAll.checked       = false;
    checkAll.indeterminate = false;
  } else if (checked === total) {
    checkAll.checked       = true;
    checkAll.indeterminate = false;
  } else {
    checkAll.checked       = false;
    checkAll.indeterminate = true;
  }
}

/** 아이템 행의 checked 스타일 동기화 */
function renderItemChecked(id) {
  const item = state.items.get(id);
  if (!item) return;
  item.el.classList.toggle('is-checked', state.checkedIds.has(id));
}

/** 아이템의 합계 금액 업데이트 */
function renderItemTotal(id) {
  const item = state.items.get(id);
  if (!item) return;
  const totalEl = item.el.querySelector('.cart-item__total-price');
  if (totalEl) totalEl.textContent = fmt(item.price * item.qty);
}

/** 수량 마이너스 버튼 활성/비활성 */
function renderQtyMinus(id) {
  const item = state.items.get(id);
  if (!item) return;
  const minusBtn = item.el.querySelector('.cart-qty-minus');
  const input    = item.el.querySelector('.cart-qty-input');
  if (!minusBtn || !input) return;
  const min      = Number(input?.min) || 1;
  if (minusBtn) minusBtn.disabled = item.qty <= min;
}

function renderItemExpanded(id) {
  const item = state.items.get(id);
  if (!item) return;
  const isExpanded = state.expandedIds.has(id);
  const toggleBtn = item.el.querySelector('.cart-item__toggle');
  const optionsEl = item.el.querySelector('.cart-item__options');

  item.el.classList.toggle('is-expanded', isExpanded);
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', String(isExpanded));
    toggleBtn.setAttribute('aria-label', isExpanded ? '상품 옵션 닫기' : '상품 옵션 열기');
  }
  if (optionsEl) {
    optionsEl.setAttribute('aria-hidden', String(!isExpanded));
  }
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

/** 장바구니 헤더 카운트 업데이트 */
function renderTotalCount() {
  const el = document.getElementById('totalCountDisplay');
  if (el) el.textContent = state.items.size;

  // 사이드바 뱃지도 동기화
  const badge = document.querySelector('.nav-group__badge');
  if (badge) badge.textContent = state.items.size;

  // GNB 장바구니 뱃지
  const cartBadge = document.querySelector('.gh__cart-badge');
  if (cartBadge) cartBadge.textContent = state.items.size;
}

/* ────────────────────────────────────────
   이벤트 바인딩
   ──────────────────────────────────────── */
function bindEvents() {
  bindAccordion();
  bindCheckAll();
  bindCartList();
  bindDeleteSelected();
  bindDeleteAll();
  bindCta();
  bindCatAllToggle();
  bindHeaderSearch();
  bindHotWidget();
  bindQuickMenu();
}

/** 사이드바 아코디언 */
function bindAccordion() {
  document.querySelectorAll('.nav-group__toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group   = btn.closest('.nav-group');
      const isOpen  = group.classList.contains('is-open');
      group.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/** 전체 선택 체크박스 */
function bindCheckAll() {
  const checkAll = document.getElementById('checkAll');
  if (!checkAll) return;

  checkAll.addEventListener('change', () => {
    if (checkAll.checked) {
      state.items.forEach((_, id) => state.checkedIds.add(id));
    } else {
      state.checkedIds.clear();
    }

    // 개별 체크박스 UI 동기화
    document.querySelectorAll('.cart-check-item').forEach((cb) => {
      cb.checked = checkAll.checked;
    });

    state.items.forEach((_, id) => renderItemChecked(id));
    render();
  });
}

/** 장바구니 리스트 이벤트 (이벤트 위임) */
function bindCartList() {
  const list = document.getElementById('cartList');
  if (!list) return;

  list.addEventListener('change', (e) => {
    // 개별 체크박스
    const cb = e.target.closest('.cart-check-item');
    if (!cb) return;

    const itemEl = cb.closest('.cart-item');
    if (!itemEl) return;
    const id = itemEl.dataset.id;

    if (cb.checked) {
      state.checkedIds.add(id);
    } else {
      state.checkedIds.delete(id);
    }
    renderItemChecked(id);
    render();
  });

  list.addEventListener('click', (e) => {
    // 수량 + 버튼
    const plusBtn = e.target.closest('.cart-qty-plus');
    if (plusBtn) {
      const itemEl = plusBtn.closest('.cart-item');
      const id     = itemEl?.dataset.id;
      const item   = state.items.get(id);
      if (!item) return;

      item.qty += 1;
      const input = itemEl.querySelector('.cart-qty-input');
      if (input) input.value = item.qty;
      renderQtyMinus(id);
      renderItemTotal(id);
      if (state.checkedIds.has(id)) renderSummary();
      return;
    }

    // 수량 - 버튼
    const minusBtn = e.target.closest('.cart-qty-minus');
    if (minusBtn) {
      const itemEl = minusBtn.closest('.cart-item');
      const id     = itemEl?.dataset.id;
      const item   = state.items.get(id);
      if (!item) return;

      const input = itemEl.querySelector('.cart-qty-input');
      const min   = Number(input?.min) || 1;
      if (item.qty <= min) return;

      item.qty -= 1;
      if (input) input.value = item.qty;
      renderQtyMinus(id);
      renderItemTotal(id);
      if (state.checkedIds.has(id)) renderSummary();
      return;
    }

    const toggleBtn = e.target.closest('.cart-item__toggle');
    if (toggleBtn) {
      const itemEl = toggleBtn.closest('.cart-item');
      const id     = itemEl?.dataset.id;
      if (!id) return;

      if (state.expandedIds.has(id)) {
        state.expandedIds.delete(id);
      } else {
        state.expandedIds.add(id);
      }
      renderItemExpanded(id);
      return;
    }

    // 단건 삭제 버튼
    const delBtn = e.target.closest('.cart-item__del');
    if (delBtn) {
      const itemEl = delBtn.closest('.cart-item');
      const id     = itemEl?.dataset.id;
      deleteItem(id, itemEl);
      return;
    }
  });

  // 수량 직접 입력
  list.addEventListener('input', (e) => {
    const input = e.target.closest('.cart-qty-input');
    if (!input) return;

    const itemEl = input.closest('.cart-item');
    const id     = itemEl?.dataset.id;
    const item   = state.items.get(id);
    if (!item) return;

    const min   = Number(input.min) || 1;
    const raw   = parseInt(input.value, 10);
    item.qty    = Number.isNaN(raw) || raw < min ? min : raw;
    input.value = item.qty;

    renderQtyMinus(id);
    renderItemTotal(id);
    if (state.checkedIds.has(id)) renderSummary();
  });
}

/** 선택 삭제 */
function bindDeleteSelected() {
  document.getElementById('deleteSelectedBtn')?.addEventListener('click', () => {
    if (state.checkedIds.size === 0) return;

    const ids = Array.from(state.checkedIds);
    ids.forEach((id) => {
      const item = state.items.get(id);
      if (item) deleteItem(id, item.el, true);
    });

    showToast(`${ids.length}개 상품을 삭제했습니다.`);
  });
}

/** 전체 삭제 */
function bindDeleteAll() {
  document.getElementById('deleteAllBtn')?.addEventListener('click', () => {
    const total = state.items.size;
    if (total === 0) return;

    const ids = Array.from(state.items.keys());
    ids.forEach((id) => {
      const item = state.items.get(id);
      if (item) deleteItem(id, item.el, true);
    });

    showToast('전체 상품을 삭제했습니다.');
  });
}

/** CTA 버튼 */
function bindCta() {
  document.getElementById('orderBtn')?.addEventListener('click', () => {
    if (state.checkedIds.size === 0) return;
    const ids = Array.from(state.checkedIds).join(',');
    window.location.href = `/order/new?cartIds=${ids}`;
  });

  document.getElementById('quoteBtn')?.addEventListener('click', () => {
    const ids = Array.from(state.checkedIds).join(',') || Array.from(state.items.keys()).join(',');
    window.location.href = `/quote/new?cartIds=${ids}`;
  });
}

/** 전체 카테고리 드롭다운 */
function bindCatAllToggle() {
  const catAll = document.getElementById('v3CatAll');
  const btn    = catAll?.querySelector('.cat-all__btn');
  const panel  = document.getElementById('v3CatPanel');
  if (!btn || !panel) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isOpen));
    panel.setAttribute('aria-hidden', String(isOpen));
    catAll.classList.toggle('is-open', !isOpen);
  });

  document.addEventListener('click', (e) => {
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
   아이템 삭제
   ──────────────────────────────────────── */
function deleteItem(id, el, silent = false) {
  if (!id || !el) return;

  state.checkedIds.delete(id);
  state.expandedIds.delete(id);
  state.items.delete(id);

  // 체크박스 UI 동기화
  const cb = el.querySelector('.cart-check-item');
  if (cb) cb.checked = false;

  // DOM에서 제거 (애니메이션)
  el.style.transition = 'opacity 0.2s, transform 0.2s';
  el.style.opacity    = '0';
  el.style.transform  = 'translateX(20px)';
  setTimeout(() => {
    el.remove();
    renderTotalCount();
    render();

    // 비어있으면 푸터만 숨김
    const list = document.getElementById('cartList');
    if (list && list.children.length === 0) {
      const footer = document.querySelector('.cart-footer');
      if (footer) footer.style.display = 'none';
    }
  }, 200);

  if (!silent) showToast('상품을 삭제했습니다.');
}

/* ────────────────────────────────────────
   유틸리티
   ──────────────────────────────────────── */
function fmt(num) {
  return '₩' + Number(num).toLocaleString('ko-KR');
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

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('cartToast');
  if (!toast) return;
  toast.querySelector('.cart-toast__msg').textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
}

/* ────────────────────────────────────────
   초기화
   ──────────────────────────────────────── */
function init() {
  // 모든 아이템을 state.items 에 등록
  document.querySelectorAll('#cartList .cart-item').forEach((el) => {
    const id    = el.dataset.id;
    const price = Number(el.dataset.price) || 0;
    const input = el.querySelector('.cart-qty-input');
    const qty   = Number(el.dataset.qty) || Number(input?.value) || 1;

    if (id) {
      state.items.set(id, { price, qty, el });
    }
  });

  // 초기 수량 마이너스 버튼 상태
  state.items.forEach((item, id) => renderQtyMinus(id));

  bindEvents();
  render();
  startHotRotation();
}

document.addEventListener('DOMContentLoaded', init);
