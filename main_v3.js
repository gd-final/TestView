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
    perPage:  8,         // 페이지당 카드 수
    total:    0,         // 전체 카드 수 (DOM에서 읽음)
  },
  catDropdown: {
    open: false,
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

  /* ── 외부 클릭 시 드롭다운 닫기 ── */
  document.addEventListener('click', () => {
    if (state.catDropdown.open) dispatch(ACTION.CAT_CLOSE);
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

  /* 자동재생 시작 */
  if (state.banner.isPlaying) resetBannerTimer();
}

document.addEventListener('DOMContentLoaded', init);
