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
    activeKey: 'all',
    activeGroupIndex: 0,
    activeSubIndex: 0,
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

const CATEGORY_TREE = {
  all: {
    title: '전체 카테고리',
    url: '/category',
    groups: [
      { major: '사무용품', icon: 'fas fa-pencil-alt', url: '/category/office', items: [
        { label: '복사용지', url: '/category/office/paper' },
        { label: '필기구', url: '/category/office/pen' },
        { label: '파일/바인더', url: '/category/office/file' },
        { label: '회의용품', url: '/category/office/meeting' },
      ]},
      { major: '생활용품', icon: 'fas fa-home', url: '/category/daily', items: [
        { label: '위생용품', url: '/category/daily/hygiene' },
        { label: '탕비실 용품', url: '/category/daily/pantry' },
        { label: '휴지/물티슈', url: '/category/daily/tissue' },
        { label: '정리수납', url: '/category/daily/storage' },
      ]},
      { major: '주방용품', icon: 'fas fa-utensils', url: '/category/kitchen', items: [
        { label: '컵/텀블러', url: '/category/kitchen/cup' },
        { label: '보관용기', url: '/category/kitchen/container' },
        { label: '조리도구', url: '/category/kitchen/tool' },
        { label: '식기류', url: '/category/kitchen/tableware' },
      ]},
      { major: '포장/배송', icon: 'fas fa-box', url: '/category/package', items: [
        { label: '택배 박스', url: '/category/package/box' },
        { label: '완충재', url: '/category/package/cushion' },
        { label: '테이프/라벨', url: '/category/package/label' },
        { label: '쇼핑백', url: '/category/package/bag' },
      ]},
    ],
  },
  office: {
    title: '사무용품',
    url: '/category/office',
    groups: [
      { major: '복사용지', icon: 'fas fa-copy', url: '/category/office/paper', items: [
        { label: 'A4 복사용지', url: '/category/office/paper/a4' },
        { label: '컬러용지', url: '/category/office/paper/color' },
        { label: '라벨지', url: '/category/office/paper/label' },
        { label: '봉투/서식지', url: '/category/office/paper/form' },
      ]},
      { major: '필기구', icon: 'fas fa-pen', url: '/category/office/pen', items: [
        { label: '볼펜', url: '/category/office/pen/ball' },
        { label: '형광펜', url: '/category/office/pen/highlight' },
        { label: '네임펜', url: '/category/office/pen/name' },
        { label: '샤프/연필', url: '/category/office/pen/pencil' },
      ]},
      { major: '정리/보관', icon: 'fas fa-folder-open', url: '/category/office/file', items: [
        { label: '클리어파일', url: '/category/office/file/clear' },
        { label: '바인더', url: '/category/office/file/binder' },
        { label: '문서보관함', url: '/category/office/file/storage' },
        { label: '데스크 정리함', url: '/category/office/file/desk' },
      ]},
      { major: '회의용품', icon: 'fas fa-chalkboard', url: '/category/office/meeting', items: [
        { label: '화이트보드', url: '/category/office/meeting/board' },
        { label: '포인터', url: '/category/office/meeting/pointer' },
        { label: '명찰/케이스', url: '/category/office/meeting/namecard' },
        { label: '메모지', url: '/category/office/meeting/memo' },
      ]},
    ],
  },
  daily: {
    title: '생활용품',
    url: '/category/daily',
    groups: [
      { major: '위생관리', icon: 'fas fa-pump-soap', url: '/category/daily/hygiene', items: [
        { label: '손 소독제', url: '/category/daily/hygiene/sanitizer' },
        { label: '핸드워시', url: '/category/daily/hygiene/handwash' },
        { label: '마스크', url: '/category/daily/hygiene/mask' },
        { label: '장갑', url: '/category/daily/hygiene/glove' },
      ]},
      { major: '탕비실', icon: 'fas fa-mug-hot', url: '/category/daily/pantry', items: [
        { label: '커피/차', url: '/category/daily/pantry/coffee' },
        { label: '컵/빨대', url: '/category/daily/pantry/cup' },
        { label: '정수기 소모품', url: '/category/daily/pantry/water' },
        { label: '간식류', url: '/category/daily/pantry/snack' },
      ]},
      { major: '휴지/물티슈', icon: 'fas fa-box-tissue', url: '/category/daily/tissue', items: [
        { label: '점보롤', url: '/category/daily/tissue/jumbo' },
        { label: '미용티슈', url: '/category/daily/tissue/facial' },
        { label: '물티슈', url: '/category/daily/tissue/wet' },
        { label: '키친타월', url: '/category/daily/tissue/kitchen' },
      ]},
      { major: '정리수납', icon: 'fas fa-box-open', url: '/category/daily/storage', items: [
        { label: '사물함 정리', url: '/category/daily/storage/locker' },
        { label: '문서함', url: '/category/daily/storage/document' },
        { label: '다용도 바스켓', url: '/category/daily/storage/basket' },
        { label: '행거/후크', url: '/category/daily/storage/hook' },
      ]},
    ],
  },
  kitchen: {
    title: '주방용품',
    url: '/category/kitchen',
    groups: [
      { major: '컵/보틀', icon: 'fas fa-wine-glass', url: '/category/kitchen/cup', items: [
        { label: '텀블러', url: '/category/kitchen/cup/tumbler' },
        { label: '머그컵', url: '/category/kitchen/cup/mug' },
        { label: '종이컵', url: '/category/kitchen/cup/paper' },
        { label: '물병', url: '/category/kitchen/cup/bottle' },
      ]},
      { major: '보관용기', icon: 'fas fa-box-open', url: '/category/kitchen/container', items: [
        { label: '도시락 용기', url: '/category/kitchen/container/lunch' },
        { label: '밀폐용기', url: '/category/kitchen/container/airtight' },
        { label: '반찬용기', url: '/category/kitchen/container/side' },
        { label: '테이크아웃 용기', url: '/category/kitchen/container/takeout' },
      ]},
      { major: '조리도구', icon: 'fas fa-kitchen-set', url: '/category/kitchen/tool', items: [
        { label: '집게/가위', url: '/category/kitchen/tool/tongs' },
        { label: '도마/칼', url: '/category/kitchen/tool/knife' },
        { label: '국자/뒤집개', url: '/category/kitchen/tool/spatula' },
        { label: '계량도구', url: '/category/kitchen/tool/measure' },
      ]},
      { major: '식기류', icon: 'fas fa-bowl-food', url: '/category/kitchen/tableware', items: [
        { label: '접시', url: '/category/kitchen/tableware/plate' },
        { label: '수저/포크', url: '/category/kitchen/tableware/cutlery' },
        { label: '쟁반', url: '/category/kitchen/tableware/tray' },
        { label: '일회용 식기', url: '/category/kitchen/tableware/disposable' },
      ]},
    ],
  },
  digital: {
    title: '디지털/가전',
    url: '/category/digital',
    groups: [
      { major: '사무기기', icon: 'fas fa-print', url: '/category/digital/office-device', items: [
        { label: '프린터', url: '/category/digital/office-device/printer' },
        { label: '라벨프린터', url: '/category/digital/office-device/label' },
        { label: '문서세단기', url: '/category/digital/office-device/shredder' },
        { label: '코팅기', url: '/category/digital/office-device/laminator' },
      ]},
      { major: '주변기기', icon: 'fas fa-keyboard', url: '/category/digital/accessory', items: [
        { label: '키보드', url: '/category/digital/accessory/keyboard' },
        { label: '마우스', url: '/category/digital/accessory/mouse' },
        { label: '허브/케이블', url: '/category/digital/accessory/cable' },
        { label: '거치대', url: '/category/digital/accessory/stand' },
      ]},
      { major: '생활가전', icon: 'fas fa-fan', url: '/category/digital/home-device', items: [
        { label: '가습기', url: '/category/digital/home-device/humidifier' },
        { label: '공기청정기', url: '/category/digital/home-device/air' },
        { label: '청소기', url: '/category/digital/home-device/cleaner' },
        { label: '소형 냉장고', url: '/category/digital/home-device/fridge' },
      ]},
      { major: '충전/전원', icon: 'fas fa-bolt', url: '/category/digital/power', items: [
        { label: '멀티탭', url: '/category/digital/power/tab' },
        { label: '충전기', url: '/category/digital/power/charger' },
        { label: '보조배터리', url: '/category/digital/power/battery' },
        { label: '건전지', url: '/category/digital/power/cell' },
      ]},
    ],
  },
  package: {
    title: '포장/배송',
    url: '/category/package',
    groups: [
      { major: '박스', icon: 'fas fa-box', url: '/category/package/box', items: [
        { label: '택배 박스', url: '/category/package/box/courier' },
        { label: '이사 박스', url: '/category/package/box/moving' },
        { label: '조립식 박스', url: '/category/package/box/folding' },
        { label: '칼라 박스', url: '/category/package/box/color' },
      ]},
      { major: '완충재', icon: 'fas fa-cloud', url: '/category/package/cushion', items: [
        { label: '에어캡', url: '/category/package/cushion/aircap' },
        { label: '종이 완충재', url: '/category/package/cushion/paper' },
        { label: '폼 완충재', url: '/category/package/cushion/foam' },
        { label: '보냉 포장재', url: '/category/package/cushion/cold' },
      ]},
      { major: '테이프/라벨', icon: 'fas fa-tags', url: '/category/package/label', items: [
        { label: '박스테이프', url: '/category/package/label/tape' },
        { label: '주의 스티커', url: '/category/package/label/warning' },
        { label: '송장 라벨', url: '/category/package/label/invoice' },
        { label: '봉인씰', url: '/category/package/label/seal' },
      ]},
      { major: '쇼핑백/봉투', icon: 'fas fa-bag-shopping', url: '/category/package/bag', items: [
        { label: '쇼핑백', url: '/category/package/bag/shopping' },
        { label: '택배봉투', url: '/category/package/bag/mailer' },
        { label: '비닐봉투', url: '/category/package/bag/plastic' },
        { label: '지퍼백', url: '/category/package/bag/zipper' },
      ]},
    ],
  },
  promo: {
    title: '판촉물',
    url: '/category/promo',
    groups: [
      { major: '사무 판촉', icon: 'fas fa-pen-ruler', url: '/category/promo/office', items: [
        { label: '볼펜', url: '/category/promo/office/pen' },
        { label: '메모패드', url: '/category/promo/office/memo' },
        { label: '캘린더', url: '/category/promo/office/calendar' },
        { label: '명함 케이스', url: '/category/promo/office/cardcase' },
      ]},
      { major: '생활 판촉', icon: 'fas fa-gift', url: '/category/promo/life', items: [
        { label: '텀블러', url: '/category/promo/life/tumbler' },
        { label: '에코백', url: '/category/promo/life/ecobag' },
        { label: '우산', url: '/category/promo/life/umbrella' },
        { label: '수건', url: '/category/promo/life/towel' },
      ]},
      { major: '행사용품', icon: 'fas fa-flag', url: '/category/promo/event', items: [
        { label: '배너', url: '/category/promo/event/banner' },
        { label: '현수막', url: '/category/promo/event/sign' },
        { label: '네임택', url: '/category/promo/event/name-tag' },
        { label: '기념품 세트', url: '/category/promo/event/giftset' },
      ]},
      { major: '맞춤제작', icon: 'fas fa-wand-magic-sparkles', url: '/category/promo/custom', items: [
        { label: '실크인쇄', url: '/category/promo/custom/silk' },
        { label: '레이저 각인', url: '/category/promo/custom/laser' },
        { label: '박스 패키지', url: '/category/promo/custom/package' },
        { label: '단체 주문', url: '/category/promo/custom/bulk' },
      ]},
    ],
  },
  season: {
    title: '시즌상품',
    url: '/category/season',
    groups: [
      { major: '여름 시즌', icon: 'fas fa-sun', url: '/category/season/summer', items: [
        { label: '쿨링용품', url: '/category/season/summer/cooling' },
        { label: '휴대용 선풍기', url: '/category/season/summer/fan' },
        { label: '아이스팩', url: '/category/season/summer/ice' },
        { label: '여름 판촉세트', url: '/category/season/summer/promo' },
      ]},
      { major: '겨울 시즌', icon: 'fas fa-snowflake', url: '/category/season/winter', items: [
        { label: '핫팩', url: '/category/season/winter/hotpack' },
        { label: '담요', url: '/category/season/winter/blanket' },
        { label: '가습기', url: '/category/season/winter/humidifier' },
        { label: '연말 선물세트', url: '/category/season/winter/gift' },
      ]},
      { major: '명절/행사', icon: 'fas fa-calendar-check', url: '/category/season/event', items: [
        { label: '설 선물세트', url: '/category/season/event/newyear' },
        { label: '추석 선물세트', url: '/category/season/event/chuseok' },
        { label: '창립기념품', url: '/category/season/event/anniversary' },
        { label: '행사 패키지', url: '/category/season/event/package' },
      ]},
      { major: '위생 캠페인', icon: 'fas fa-shield-heart', url: '/category/season/hygiene', items: [
        { label: '방역 키트', url: '/category/season/hygiene/kit' },
        { label: '손 세정세트', url: '/category/season/hygiene/hand' },
        { label: '마스크 세트', url: '/category/season/hygiene/mask' },
        { label: '안전 포스터', url: '/category/season/hygiene/poster' },
      ]},
    ],
  },
  cleaning: {
    title: '청소/위생',
    url: '/category/cleaning',
    groups: [
      { major: '청소도구', icon: 'fas fa-broom', url: '/category/cleaning/tool', items: [
        { label: '빗자루/쓰레받기', url: '/category/cleaning/tool/broom' },
        { label: '밀대', url: '/category/cleaning/tool/mop' },
        { label: '청소포', url: '/category/cleaning/tool/wipe' },
        { label: '먼지떨이', url: '/category/cleaning/tool/duster' },
      ]},
      { major: '세정제', icon: 'fas fa-pump-soap', url: '/category/cleaning/detergent', items: [
        { label: '다목적 세정제', url: '/category/cleaning/detergent/all' },
        { label: '주방 세정제', url: '/category/cleaning/detergent/kitchen' },
        { label: '화장실 세정제', url: '/category/cleaning/detergent/bath' },
        { label: '유리 세정제', url: '/category/cleaning/detergent/glass' },
      ]},
      { major: '위생 소모품', icon: 'fas fa-hands-bubbles', url: '/category/cleaning/hygiene', items: [
        { label: '고무장갑', url: '/category/cleaning/hygiene/glove' },
        { label: '위생백', url: '/category/cleaning/hygiene/bag' },
        { label: '수세미', url: '/category/cleaning/hygiene/sponge' },
        { label: '행주', url: '/category/cleaning/hygiene/cloth' },
      ]},
      { major: '폐기물 관리', icon: 'fas fa-trash-can', url: '/category/cleaning/waste', items: [
        { label: '종량제 봉투', url: '/category/cleaning/waste/bag' },
        { label: '분리수거함', url: '/category/cleaning/waste/bin' },
        { label: '배출 스티커', url: '/category/cleaning/waste/sticker' },
        { label: '대형 폐기물 용품', url: '/category/cleaning/waste/large' },
      ]},
    ],
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
  CAT_OPEN:       'CAT_OPEN',
  CAT_SET_GROUP:  'CAT_SET_GROUP',
  CAT_SET_SUB:    'CAT_SET_SUB',
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

    case ACTION.CAT_OPEN:
      state.catDropdown.open = true;
      state.catDropdown.activeKey = payload || 'all';
      state.catDropdown.activeGroupIndex = 0;
      state.catDropdown.activeSubIndex = 0;
      renderCatDropdown();
      break;

    case ACTION.CAT_SET_GROUP:
      state.catDropdown.activeGroupIndex = Number(payload) || 0;
      state.catDropdown.activeSubIndex = 0;
      renderCatDropdown();
      break;

    case ACTION.CAT_SET_SUB:
      state.catDropdown.activeSubIndex = Number(payload) || 0;
      renderCatDropdown();
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
  const panel = document.getElementById('v3CatMega');
  const tree = document.getElementById('v3CatMegaTree');
  if (!panel || !tree) return;

  const data = CATEGORY_TREE.all;
  const { open } = state.catDropdown;
  const activeGroup = data.groups[state.catDropdown.activeGroupIndex] || data.groups[0];

  panel.classList.toggle('is-open', open);
  panel.setAttribute('aria-hidden', String(!open));

  document.querySelectorAll('.cat-trigger').forEach((trigger) => {
    const isActive = open && trigger.dataset.catKey === state.catDropdown.activeKey;
    trigger.classList.toggle('is-open', isActive);
    trigger.setAttribute('aria-expanded', String(isActive));
  });

  tree.innerHTML = `
    <div class="cat-tree-root">
      <a href="${escapeAttr(data.url)}" class="cat-tree-root__link">
        <span class="cat-tree-root__label">${escapeHtml(data.title)}</span>
      </a>
    </div>
    <div class="cat-tree-browser">
      <div class="cat-tree-majors">
        ${data.groups.map((group, idx) => `
          <a
            href="${escapeAttr(group.url)}"
            class="cat-tree-row__major ${idx === state.catDropdown.activeGroupIndex ? 'is-active' : ''}"
            data-cat-group="${idx}"
          >
            <i class="${escapeAttr(group.icon)}" aria-hidden="true"></i>
            <span>${escapeHtml(group.major)}</span>
          </a>
        `).join('')}
      </div>
      <section class="cat-tree-detail">
        <div class="cat-tree-row__subs">
          ${activeGroup.items.map((item, idx) => `
            <a href="${escapeAttr(item.url)}" class="cat-tree-row__sub ${idx === state.catDropdown.activeSubIndex ? 'is-active' : ''}" data-cat-sub="${idx}">${escapeHtml(item.label)}</a>
          `).join('')}
        </div>
      </section>
    </div>
  `;
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

  const catStrip = document.querySelector('.cat-strip');
  const megaPanel = document.getElementById('v3CatMega');

  document.querySelectorAll('.cat-trigger').forEach((trigger) => {
    trigger.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) {
        dispatch(ACTION.CAT_OPEN, trigger.dataset.catKey);
      }
    });
    trigger.addEventListener('focus', () => {
      dispatch(ACTION.CAT_OPEN, trigger.dataset.catKey);
    });
  });

  document.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768 || !state.catDropdown.open) return;
    const nav = document.getElementById('v3CatNav');
    const mega = document.querySelector('.cat-mega__inner');
    if (!nav || !mega) return;

    const navRect = nav.getBoundingClientRect();
    const megaRect = mega.getBoundingClientRect();
    const bufferLeft = 42;
    const bufferRight = 28;
    const bufferY = 20;

    const inNavZone =
      e.clientX >= navRect.left - bufferLeft &&
      e.clientX <= navRect.right + bufferRight &&
      e.clientY >= navRect.top - bufferY &&
      e.clientY <= navRect.bottom + bufferY;

    const inMegaZone =
      e.clientX >= megaRect.left - bufferLeft &&
      e.clientX <= megaRect.right + bufferRight &&
      e.clientY >= megaRect.top - bufferY &&
      e.clientY <= megaRect.bottom + bufferY;

    if (!inNavZone && !inMegaZone) {
      dispatch(ACTION.CAT_CLOSE);
    }
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
  megaPanel?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  megaPanel?.addEventListener('mouseover', (e) => {
    const major = e.target.closest('[data-cat-group]');
    if (!major || window.innerWidth <= 768) return;
    dispatch(ACTION.CAT_SET_GROUP, major.dataset.catGroup);
  });

  megaPanel?.addEventListener('focusin', (e) => {
    const major = e.target.closest('[data-cat-group]');
    if (!major) return;
    dispatch(ACTION.CAT_SET_GROUP, major.dataset.catGroup);
  });

  megaPanel?.addEventListener('mouseover', (e) => {
    const sub = e.target.closest('[data-cat-sub]');
    if (!sub || window.innerWidth <= 768) return;
    dispatch(ACTION.CAT_SET_SUB, sub.dataset.catSub);
  });

  megaPanel?.addEventListener('focusin', (e) => {
    const sub = e.target.closest('[data-cat-sub]');
    if (!sub) return;
    dispatch(ACTION.CAT_SET_SUB, sub.dataset.catSub);
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
