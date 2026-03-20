/**
 * main_v3.js
 * BtoB 쇼핑몰 메인페이지 V3 스크립트
 *
 * ─── V1/V2 대비 JS 패턴 차이 ───────────────────────
 *  V1: IIFE 모듈 패턴   (즉시실행함수 + 클로저)
 *  V2: Class 기반 패턴  (new BannerController() 등)
 *  V3: 순수 함수 + 공유 상태 객체 패턴
 *       → state 객체에 전체 앱 상태 집중 관리
 *       → dispatch(action) 로 상태 변경
 *       → render() 로 DOM 반영
 * ──────────────────────────────────────────────────
 */

'use strict';

/* ==============================================
   앱 상태 (단일 상태 객체)
   ============================================== */
const state = {
  banner: {
    current:   0,        // 현재 활성 탭 인덱스
    total:     3,        // 전체 배너 수
    isPlaying: true,     // 자동재생 여부
    timer:     null,     // setInterval 핸들
    DELAY:     4800,     // 자동재생 간격(ms)
    PROGRESS:  0,        // 진행 바 width %
    progTimer: null,     // 진행 바 타이머
  },
  catalog: {
    page:     0,         // 현재 페이지
    perPage:  5,         // 페이지당 카드 수
    total:    0,         // 전체 카드 수 (DOM에서 읽음)
  },
  catDropdown: {
    open: false,
  },
  search: {
    open: false,
    showAllPopular: false,
    recentTerms: ['복사용지', '텀블러', '택배 박스', '손 소독제'],
    popularTerms: [
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
    ],
  },
  hot: {
    currentIndex: 9,
    open: false,
    timer: null,
    DELAY: 5000,
  },
  quickMenu: {
    showTop: false,
  },
};


/* ==============================================
   액션 상수
   ============================================== */
const ACTION = {
  BANNER_GOTO:    'BANNER_GOTO',
  BANNER_NEXT:    'BANNER_NEXT',
  BANNER_PREV:    'BANNER_PREV',
  BANNER_TOGGLE:  'BANNER_TOGGLE',
  CATALOG_NEXT:   'CATALOG_NEXT',
  CATALOG_PREV:   'CATALOG_PREV',
  CAT_TOGGLE:     'CAT_TOGGLE',
  CAT_CLOSE:      'CAT_CLOSE',
  SEARCH_OPEN:    'SEARCH_OPEN',
  SEARCH_CLOSE:   'SEARCH_CLOSE',
  SEARCH_TOGGLE_POPULAR: 'SEARCH_TOGGLE_POPULAR',
  SEARCH_REMOVE_RECENT: 'SEARCH_REMOVE_RECENT',
  SEARCH_CLEAR_RECENT: 'SEARCH_CLEAR_RECENT',
  SEARCH_ADD_RECENT: 'SEARCH_ADD_RECENT',
  HOT_NEXT: 'HOT_NEXT',
  HOT_TOGGLE: 'HOT_TOGGLE',
  HOT_CLOSE: 'HOT_CLOSE',
};


/* ==============================================
   디스패처 (상태 변경 + 렌더 트리거)
   ============================================== */
function dispatch(action, payload) {
  switch (action) {

    case ACTION.BANNER_GOTO:
      state.banner.current = clamp(payload, 0, state.banner.total - 1);
      renderBanner();
      if (state.banner.isPlaying) resetBannerTimer();
      break;

    case ACTION.BANNER_NEXT:
      state.banner.current = (state.banner.current + 1) % state.banner.total;
      renderBanner();
      if (state.banner.isPlaying) resetBannerTimer();
      break;

    case ACTION.BANNER_PREV:
      state.banner.current =
        (state.banner.current - 1 + state.banner.total) % state.banner.total;
      renderBanner();
      if (state.banner.isPlaying) resetBannerTimer();
      break;

    case ACTION.BANNER_TOGGLE:
      state.banner.isPlaying = !state.banner.isPlaying;
      state.banner.isPlaying ? resetBannerTimer() : clearBannerTimer();
      break;

    case ACTION.CATALOG_NEXT: {
      const maxPage = Math.ceil(state.catalog.total / state.catalog.perPage) - 1;
      state.catalog.page = Math.min(state.catalog.page + 1, maxPage);
      renderCatalog();
      break;
    }
    case ACTION.CATALOG_PREV:
      state.catalog.page = Math.max(state.catalog.page - 1, 0);
      renderCatalog();
      break;

    case ACTION.CAT_TOGGLE:
      state.catDropdown.open = !state.catDropdown.open;
      renderCatDropdown();
      break;

    case ACTION.CAT_CLOSE:
      state.catDropdown.open = false;
      renderCatDropdown();
      break;

    case ACTION.SEARCH_OPEN:
      state.search.open = true;
      renderSearchLayer();
      break;

    case ACTION.SEARCH_CLOSE:
      state.search.open = false;
      renderSearchLayer();
      break;

    case ACTION.SEARCH_TOGGLE_POPULAR:
      state.search.showAllPopular = !state.search.showAllPopular;
      renderSearchLayer();
      break;

    case ACTION.SEARCH_REMOVE_RECENT:
      state.search.recentTerms = state.search.recentTerms.filter((term) => term !== payload);
      renderSearchLayer();
      break;

    case ACTION.SEARCH_CLEAR_RECENT:
      state.search.recentTerms = [];
      renderSearchLayer();
      break;

    case ACTION.SEARCH_ADD_RECENT: {
      const keyword = String(payload || '').trim();
      if (!keyword) return;
      state.search.recentTerms = [
        keyword,
        ...state.search.recentTerms.filter((term) => term !== keyword),
      ].slice(0, 8);
      renderSearchLayer();
      break;
    }

    case ACTION.HOT_NEXT:
      state.hot.currentIndex = state.hot.currentIndex <= 0
        ? state.search.popularTerms.length - 1
        : state.hot.currentIndex - 1;
      renderHotWidget();
      break;

    case ACTION.HOT_TOGGLE:
      state.hot.open = !state.hot.open;
      renderHotWidget();
      break;

    case ACTION.HOT_CLOSE:
      state.hot.open = false;
      renderHotWidget();
      break;
  }
}


/* ==============================================
   렌더 함수들 (상태 → DOM 반영)
   ============================================== */

/**
 * 배너 렌더
 * V3 특징: data-idx 속성으로 탭과 패널을 연결
 */
function renderBanner() {
  const idx = state.banner.current;

  // 탭 활성화
  document.querySelectorAll('.promo-tab').forEach((tab) => {
    const isActive = Number(tab.dataset.idx) === idx;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  // 패널 활성화
  document.querySelectorAll('.promo-pane').forEach((pane, i) => {
    pane.classList.toggle('is-active', i === idx);
  });

  // 진행 바 리셋
  resetProgressBar();
}

/**
 * 카탈로그 페이지 렌더
 * V3: data-page 속성 기반으로 카드 show/hide
 */
function renderCatalog() {
  const { page, perPage } = state.catalog;
  const cards = document.querySelectorAll('.cg-card');

  cards.forEach((card) => {
    const cardPage = Math.floor(Number(card.dataset.page || 0));
    card.style.display = cardPage === page ? '' : 'none';
  });

  // 페이지 정보 업데이트
  const total     = Math.ceil(state.catalog.total / perPage);
  const infoEl    = document.getElementById('v3PageInfo');
  if (infoEl) infoEl.textContent = `${page + 1} / ${Math.max(1, total)}`;

  // 버튼 비활성화
  const prevBtn = document.getElementById('v3CatPrev');
  const nextBtn = document.getElementById('v3CatNext');
  if (prevBtn) prevBtn.disabled = page <= 0;
  if (nextBtn) nextBtn.disabled = page >= total - 1;
}

/**
 * 카테고리 드롭다운 렌더
 */
function renderCatDropdown() {
  const panel = document.getElementById('v3CatPanel');
  const btn   = document.querySelector('.cat-all__btn');
  if (!panel || !btn) return;

  const { open } = state.catDropdown;
  panel.classList.toggle('is-open', open);
  panel.setAttribute('aria-hidden', String(!open));
  btn.setAttribute('aria-expanded', String(open));
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
        <span class="gh-search-layer__trend gh-search-layer__trend--${escapeAttr(term.trend)}">
          ${renderTrendMarkup(term)}
        </span>
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

function renderQuickMenu() {
  const topBtn = document.getElementById('quickTopBtn');
  if (!topBtn) return;
  topBtn.classList.toggle('is-visible', state.quickMenu.showTop);
}


/* ==============================================
   배너 자동재생
   ============================================== */

/** 자동재생 타이머 리셋 */
function resetBannerTimer() {
  clearBannerTimer();
  state.banner.timer = setInterval(
    () => dispatch(ACTION.BANNER_NEXT),
    state.banner.DELAY
  );
  startProgressBar();
}

/** 자동재생 타이머 정지 */
function clearBannerTimer() {
  clearInterval(state.banner.timer);
  clearInterval(state.banner.progTimer);
  state.banner.timer = null;
  state.banner.progTimer = null;
}

/**
 * 진행 바 애니메이션
 * CSS transition 대신 JS setInterval로 구현 (V1/V2와 다른 방식)
 */
function startProgressBar() {
  const fillEl = document.getElementById('v3ProgressFill');
  if (!fillEl) return;

  let progress = 0;
  fillEl.style.width = '0%';

  const TICK = 50;
  const STEP = (TICK / state.banner.DELAY) * 100;

  clearInterval(state.banner.progTimer);
  state.banner.progTimer = setInterval(() => {
    progress = Math.min(progress + STEP, 100);
    fillEl.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(state.banner.progTimer);
      fillEl.style.width = '0%';
    }
  }, TICK);
}

function resetProgressBar() {
  const fillEl = document.getElementById('v3ProgressFill');
  if (fillEl) fillEl.style.width = '0%';
  clearInterval(state.banner.progTimer);
  if (state.banner.isPlaying) startProgressBar();
}


/* ==============================================
   유틸리티
   ============================================== */

/**
 * 숫자 범위 클램프
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
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
    dispatch(ACTION.HOT_NEXT);
  }, state.hot.DELAY);
}


/* ==============================================
   이벤트 바인딩
   ============================================== */
function bindEvents() {

  /* ── 배너 탭 클릭 ── */
  document.getElementById('v3PromoTabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.promo-tab');
    if (!tab) return;
    dispatch(ACTION.BANNER_GOTO, Number(tab.dataset.idx));
  });

  /* ── 배너 prev/next ── */
  document.getElementById('v3BannerPrev')?.addEventListener('click', () => {
    dispatch(ACTION.BANNER_PREV);
  });
  document.getElementById('v3BannerNext')?.addEventListener('click', () => {
    dispatch(ACTION.BANNER_NEXT);
  });

  /* ── 카탈로그 prev/next ── */
  document.getElementById('v3CatPrev')?.addEventListener('click', () => {
    dispatch(ACTION.CATALOG_PREV);
  });
  document.getElementById('v3CatNext')?.addEventListener('click', () => {
    dispatch(ACTION.CATALOG_NEXT);
  });

  /* ── 카테고리 드롭다운 토글 ── */
  document.querySelector('.cat-all__btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    dispatch(ACTION.CAT_TOGGLE);
  });

  const searchForm = document.querySelector('.gh__search');
  const searchInput = document.querySelector('.gh__search-input');
  const searchSelect = document.querySelector('.gh__search-select');

  searchInput?.addEventListener('focus', () => {
    dispatch(ACTION.SEARCH_OPEN);
  });
  searchInput?.addEventListener('click', () => {
    dispatch(ACTION.SEARCH_OPEN);
  });
  searchSelect?.addEventListener('focus', () => {
    dispatch(ACTION.SEARCH_OPEN);
  });
  searchSelect?.addEventListener('click', () => {
    dispatch(ACTION.SEARCH_OPEN);
  });

  searchForm?.addEventListener('submit', (e) => {
    const keyword = searchInput?.value.trim() || '';
    if (!keyword) return;
    e.preventDefault();
    dispatch(ACTION.SEARCH_ADD_RECENT, keyword);
    dispatch(ACTION.SEARCH_OPEN);
  });

  searchForm?.addEventListener('click', (e) => {
    e.stopPropagation();

    const deleteBtn = e.target.closest('[data-delete-term]');
    if (deleteBtn) {
      dispatch(ACTION.SEARCH_REMOVE_RECENT, deleteBtn.dataset.deleteTerm);
      return;
    }

    const termBtn = e.target.closest('[data-search-term]');
    if (termBtn) {
      if (searchInput) searchInput.value = termBtn.dataset.searchTerm || '';
      dispatch(ACTION.SEARCH_ADD_RECENT, termBtn.dataset.searchTerm);
      return;
    }

    if (e.target.closest('#ghRecentClearBtn')) {
      dispatch(ACTION.SEARCH_CLEAR_RECENT);
      return;
    }

    if (e.target.closest('#ghPopularToggleBtn')) {
      dispatch(ACTION.SEARCH_TOGGLE_POPULAR);
    }
  });

  const hotWidget = document.getElementById('ghHotWidget');
  hotWidget?.addEventListener('click', (e) => {
    e.stopPropagation();

    const closeBtn = e.target.closest('#ghHotCloseBtn');
    if (closeBtn) {
      dispatch(ACTION.HOT_CLOSE);
      return;
    }

    const triggerBtn = e.target.closest('#ghHotTriggerBtn');
    if (triggerBtn) {
      dispatch(ACTION.HOT_TOGGLE);
      return;
    }

    const termBtn = e.target.closest('[data-hot-term]');
    if (termBtn) {
      const searchKeyword = termBtn.dataset.hotTerm || '';
      if (searchInput) searchInput.value = searchKeyword;
      dispatch(ACTION.SEARCH_ADD_RECENT, searchKeyword);
      dispatch(ACTION.HOT_CLOSE);
    }
  });

  /* ── 외부 클릭 시 드롭다운 닫기 ── */
  document.addEventListener('click', () => {
    if (state.catDropdown.open) dispatch(ACTION.CAT_CLOSE);
    if (state.search.open) dispatch(ACTION.SEARCH_CLOSE);
    if (state.hot.open) dispatch(ACTION.HOT_CLOSE);
  });

  /* ── 드롭다운 내부 클릭 버블링 차단 ── */
  document.getElementById('v3CatPanel')?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  /* ── 키보드: ESC ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.catDropdown.open) {
      dispatch(ACTION.CAT_CLOSE);
    }
    if (e.key === 'Escape' && state.search.open) {
      dispatch(ACTION.SEARCH_CLOSE);
    }
    if (e.key === 'Escape' && state.hot.open) {
      dispatch(ACTION.HOT_CLOSE);
    }
  });

  /* ── 배너 터치 스와이프 ── */
  const promoEl = document.querySelector('.promo-panes');
  if (promoEl) {
    let startX = 0;
    promoEl.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    promoEl.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 40) return;
      dispatch(diff > 0 ? ACTION.BANNER_NEXT : ACTION.BANNER_PREV);
    }, { passive: true });
  }

  bindQuickMenu();
}

function bindQuickMenu() {
  const topBtn = document.getElementById('quickTopBtn');
  if (!topBtn) return;

  const syncQuickMenu = () => {
    state.quickMenu.showTop = window.scrollY > 360;
    renderQuickMenu();
  };

  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', syncQuickMenu, { passive: true });
  syncQuickMenu();
}


/* ==============================================
   초기화
   V3 특징: 모든 상태를 먼저 계산 후 일괄 렌더
   ============================================== */
function init() {
  /* 카탈로그 카드 수 계산 */
  const allCards = document.querySelectorAll('.cg-card');
  state.catalog.total = allCards.length;

  /* 카드에 data-page 자동 할당 */
  allCards.forEach((card, i) => {
    card.dataset.page = Math.floor(i / state.catalog.perPage);
  });

  /* 이벤트 바인딩 */
  bindEvents();

  /* 초기 렌더 */
  renderBanner();
  renderCatalog();
  renderCatDropdown();
  renderSearchLayer();
  renderHotWidget();
  renderQuickMenu();

  /* 자동재생 시작 */
  if (state.banner.isPlaying) resetBannerTimer();
  startHotRotation();
}

document.addEventListener('DOMContentLoaded', init);
