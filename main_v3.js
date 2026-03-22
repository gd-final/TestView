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
  bestCatalog: {
    page: 0,
    perPage: 5,
    total: 0,
  },
  wishlist: new Set(),
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
  notify: {
    open: false,
    items: [
      {
        type: '주문',
        icon: 'fas fa-file-invoice',
        time: '방금 전',
        title: '주문번호 TH-240320-0184가 접수되었습니다.',
        desc: '결제 확인 후 출고 일정이 확정되면 다시 안내드립니다.',
      },
      {
        type: '배송',
        icon: 'fas fa-shipping-fast',
        time: '12분 전',
        title: '택배 박스 대(400×300×200) 상품이 출고 준비 중입니다.',
        desc: '송장 등록이 완료되면 배송조회에서 바로 확인할 수 있습니다.',
      },
      {
        type: '문의',
        icon: 'fas fa-comment-dots',
        time: '1시간 전',
        title: '1:1 문의에 대한 답변이 등록되었습니다.',
        desc: '판촉물 인쇄 옵션 관련 문의에 담당자가 답변을 남겼습니다.',
      },
      {
        type: '회원',
        icon: 'fas fa-bell',
        time: '오늘',
        title: '법인 회원 전용 3월 공급가 업데이트가 적용되었습니다.',
        desc: '사무용품과 포장/배송 카테고리 일부 상품의 회원가가 조정되었습니다.',
      },
    ],
  },
  chat: {
    open: false,
    tab: 'home',
    threadOpen: false,
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
  BEST_CATALOG_NEXT: 'BEST_CATALOG_NEXT',
  BEST_CATALOG_PREV: 'BEST_CATALOG_PREV',
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
  NOTIFY_TOGGLE: 'NOTIFY_TOGGLE',
  NOTIFY_CLOSE: 'NOTIFY_CLOSE',
  CHAT_OPEN: 'CHAT_OPEN',
  CHAT_CLOSE: 'CHAT_CLOSE',
  CHAT_SET_TAB: 'CHAT_SET_TAB',
  CHAT_OPEN_THREAD: 'CHAT_OPEN_THREAD',
  CHAT_CLOSE_THREAD: 'CHAT_CLOSE_THREAD',
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
      moveCatalogPage(state.catalog, 1);
      renderCatalog();
      break;
    }
    case ACTION.CATALOG_PREV:
      moveCatalogPage(state.catalog, -1);
      renderCatalog();
      break;

    case ACTION.BEST_CATALOG_NEXT:
      moveCatalogPage(state.bestCatalog, 1);
      renderCatalog();
      break;

    case ACTION.BEST_CATALOG_PREV:
      moveCatalogPage(state.bestCatalog, -1);
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

    case ACTION.NOTIFY_TOGGLE:
      state.notify.open = !state.notify.open;
      renderNotifyModal();
      break;

    case ACTION.NOTIFY_CLOSE:
      state.notify.open = false;
      renderNotifyModal();
      break;

    case ACTION.CHAT_OPEN:
      state.chat.open = true;
      state.chat.tab = payload === 'conversation' ? 'conversation' : 'home';
      state.chat.threadOpen = false;
      renderChatModal();
      break;

    case ACTION.CHAT_CLOSE:
      state.chat.open = false;
      state.chat.tab = 'home';
      state.chat.threadOpen = false;
      renderChatModal();
      break;

    case ACTION.CHAT_SET_TAB:
      state.chat.tab = payload === 'conversation' ? 'conversation' : 'home';
      if (state.chat.tab !== 'conversation') state.chat.threadOpen = false;
      renderChatModal();
      break;

    case ACTION.CHAT_OPEN_THREAD:
      state.chat.tab = 'conversation';
      state.chat.threadOpen = true;
      renderChatModal();
      break;

    case ACTION.CHAT_CLOSE_THREAD:
      state.chat.tab = 'conversation';
      state.chat.threadOpen = false;
      renderChatModal();
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

  document.querySelectorAll('.promo-tab').forEach((tab) => {
    const isActive = Number(tab.dataset.idx) === idx;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  document.querySelectorAll('.promo-pane').forEach((pane, i) => {
    pane.classList.toggle('is-active', i === idx);
  });

  resetProgressBar();
}
/**
 * 카탈로그 페이지 렌더
 * V3: data-page 속성 기반으로 카드 show/hide
 */
const CATALOG_DOM_IDS = {
  recommend: {
    gridId: 'v3CatalogGrid',
    prevId: 'v3CatPrev',
    nextId: 'v3CatNext',
    pageInfoId: 'v3PageInfo',
  },
  best: {
    gridId: 'v3BestCatalogGrid',
    prevId: 'v3BestPrev',
    nextId: 'v3BestNext',
    pageInfoId: 'v3BestPageInfo',
  },
};

function moveCatalogPage(catalogState, step) {
  const maxPage = Math.max(Math.ceil(catalogState.total / catalogState.perPage) - 1, 0);
  catalogState.page = clamp(catalogState.page + step, 0, maxPage);
}

function renderCatalogSection(catalogState, domIds) {
  const { page, perPage } = catalogState;
  const grid = document.getElementById(domIds.gridId);
  if (!grid) return;

  const cards = grid.querySelectorAll('.cg-card');
  cards.forEach((card) => {
    const cardPage = Math.floor(Number(card.dataset.page || 0));
    card.style.display = cardPage === page ? '' : 'none';
  });

  const totalPages = Math.max(1, Math.ceil(catalogState.total / perPage));
  const infoEl = document.getElementById(domIds.pageInfoId);
  if (infoEl) infoEl.textContent = `${page + 1} / ${totalPages}`;

  const prevBtn = document.getElementById(domIds.prevId);
  const nextBtn = document.getElementById(domIds.nextId);
  if (prevBtn) prevBtn.disabled = page <= 0;
  if (nextBtn) nextBtn.disabled = page >= totalPages - 1;
}

function renderCatalog() {
  renderCatalogSection(state.bestCatalog, CATALOG_DOM_IDS.best);
  renderCatalogSection(state.catalog, CATALOG_DOM_IDS.recommend);
}

/**
 * 카테고리 드롭다운 렌더
 */
function resolveCatalogWishId(card, index) {
  const explicitId = card.dataset.id || card.dataset.productId;
  if (explicitId) return explicitId;

  const productLink = card.querySelector('.cg-card__link')?.getAttribute('href') || '';
  const linkMatch = productLink.match(/\/product\/([^/?#]+)/);
  if (linkMatch?.[1]) return linkMatch[1];

  return `catalog-${index + 1}`;
}

function ensureCatalogWishlistButtons() {
  const cards = document.querySelectorAll('#v3CatalogGrid .cg-card, #v3BestCatalogGrid .cg-card');
  cards.forEach((card, index) => {
    const foot = card.querySelector('.cg-card__foot');
    if (!foot) return;

    let cartBtn = foot.querySelector('.cg-card__cart-btn');
    if (!cartBtn) {
      cartBtn = foot.querySelector('.cg-btn--ghost:not(.cg-card__wish-btn)');
      if (cartBtn) cartBtn.classList.add('cg-card__cart-btn');
    }
    if (!cartBtn) return;

    if (!cartBtn.hasAttribute('type')) {
      cartBtn.type = 'button';
    }

    let wishBtn = foot.querySelector('.cg-card__wish-btn');
    if (!wishBtn) {
      wishBtn = document.createElement('button');
      wishBtn.type = 'button';
      wishBtn.className = 'cg-btn cg-btn--ghost cg-card__wish-btn';
      wishBtn.innerHTML = '<i class="far fa-heart" aria-hidden="true"></i>';
      foot.insertBefore(wishBtn, cartBtn);
    }

    wishBtn.dataset.id = resolveCatalogWishId(card, index);
    wishBtn.setAttribute('aria-label', '관심 상품 등록');
  });

  renderCatalogWishlistIcons();
}

function renderCatalogWishlistIcons() {
  document.querySelectorAll('.cg-card__wish-btn').forEach((btn) => {
    const id = btn.dataset.id;
    const isWished = state.wishlist.has(id);
    const icon = btn.querySelector('i');

    if (icon) {
      icon.className = isWished ? 'fas fa-heart' : 'far fa-heart';
      icon.style.color = isWished ? 'var(--p-red)' : '';
    }

    btn.classList.toggle('is-active', isWished);
    btn.setAttribute('aria-label', isWished ? '관심 상품 해제' : '관심 상품 등록');
  });
}

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
      <div class="cat-tree-root__quick" aria-label="메인 상품 바로가기">
        <a href="#v3BestCatalogGrid" class="cat-tree-root__quick-item">BEST 100</a>
        <a href="#v3CatalogGrid" class="cat-tree-root__quick-item">추천 상품</a>
      </div>
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

function renderNotifyModal() {
  const modal = document.getElementById('ghNotifyModal');
  const list = document.getElementById('ghNotifyList');
  const trigger = document.getElementById('ghNotifyBtn');
  if (!modal || !list || !trigger) return;

  modal.classList.toggle('is-open', state.notify.open);
  modal.setAttribute('aria-hidden', String(!state.notify.open));
  trigger.setAttribute('aria-expanded', String(state.notify.open));

  list.innerHTML = state.notify.items.map((item) => `
    <article class="gh-notify-item">
      <div class="gh-notify-item__body">
        <div class="gh-notify-item__top">
          <span class="gh-notify-item__badge">${escapeHtml(item.type)}</span>
          <span class="gh-notify-item__time">${escapeHtml(item.time)}</span>
        </div>
        <p class="gh-notify-item__title">${escapeHtml(item.title)}</p>
        <p class="gh-notify-item__desc">${escapeHtml(item.desc)}</p>
      </div>
    </article>
  `).join('');
}

function renderChatModal() {
  const modal = document.getElementById('quickChatModal');
  const trigger = document.getElementById('quickChatBtn');
  const homeView = document.getElementById('quickChatHomeView');
  const conversationView = document.getElementById('quickChatConversationView');
  const conversationEmpty = document.getElementById('quickChatConversationEmpty');
  const threadView = document.getElementById('quickChatThreadView');
  if (!modal || !trigger || !homeView || !conversationView || !conversationEmpty || !threadView) return;

  const isConversation = state.chat.tab === 'conversation';
  modal.classList.toggle('is-open', state.chat.open);
  modal.setAttribute('aria-hidden', String(!state.chat.open));
  trigger.setAttribute('aria-expanded', String(state.chat.open));

  homeView.classList.toggle('is-active', !isConversation);
  conversationView.classList.toggle('is-active', isConversation);
  conversationEmpty.classList.toggle('is-active', isConversation && !state.chat.threadOpen);
  threadView.classList.toggle('is-active', isConversation && state.chat.threadOpen);

  modal.querySelectorAll('[data-chat-tab]').forEach((tabBtn) => {
    const isActive = tabBtn.dataset.chatTab === state.chat.tab;
    tabBtn.classList.toggle('is-active', isActive);
    tabBtn.setAttribute('aria-pressed', String(isActive));
  });
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
  document.getElementById('v3BestPrev')?.addEventListener('click', () => {
    dispatch(ACTION.BEST_CATALOG_PREV);
  });
  document.getElementById('v3BestNext')?.addEventListener('click', () => {
    dispatch(ACTION.BEST_CATALOG_NEXT);
  });

  ['v3CatalogGrid', 'v3BestCatalogGrid'].forEach((gridId) => {
    const catalogGrid = document.getElementById(gridId);
    catalogGrid?.addEventListener('click', (e) => {
      const wishBtn = e.target.closest('.cg-card__wish-btn');
      if (!wishBtn) return;

      const id = wishBtn.dataset.id;
      if (!id) return;

      if (state.wishlist.has(id)) {
        state.wishlist.delete(id);
      } else {
        state.wishlist.add(id);
      }
      renderCatalogWishlistIcons();
    });
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

  const notifyBtn = document.getElementById('ghNotifyBtn');
  const notifyModal = document.getElementById('ghNotifyModal');
  const chatBtn = document.getElementById('quickChatBtn');
  const chatModal = document.getElementById('quickChatModal');
  notifyBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(ACTION.NOTIFY_TOGGLE);
  });

  notifyModal?.addEventListener('click', (e) => {
    if (e.target.closest('#ghNotifyCloseBtn') || e.target.classList.contains('gh-notify-modal__backdrop')) {
      dispatch(ACTION.NOTIFY_CLOSE);
      return;
    }

    if (e.target.closest('.gh-notify-modal__dialog')) {
      e.stopPropagation();
    }
  });

  chatBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(ACTION.CHAT_OPEN);
  });

  chatModal?.addEventListener('click', (e) => {
    if (e.target.closest('.quick-chat-modal__dialog')) {
      e.stopPropagation();
    }

    if (e.target.closest('#quickChatCloseBtn') || e.target.classList.contains('quick-chat-modal__backdrop')) {
      dispatch(ACTION.CHAT_CLOSE);
      return;
    }

    const startBtn = e.target.closest('#quickChatStartBtn');
    if (startBtn) {
      dispatch(ACTION.CHAT_SET_TAB, 'conversation');
      return;
    }

    const newInquiryBtn = e.target.closest('#quickChatNewInquiryBtn');
    if (newInquiryBtn) {
      dispatch(ACTION.CHAT_OPEN_THREAD);
      return;
    }

    const backBtn = e.target.closest('#quickChatBackBtn');
    if (backBtn) {
      dispatch(ACTION.CHAT_CLOSE_THREAD);
      return;
    }

    const tabBtn = e.target.closest('[data-chat-tab]');
    if (tabBtn) {
      dispatch(ACTION.CHAT_SET_TAB, tabBtn.dataset.chatTab);
      return;
    }
  });

  /* ── 외부 클릭 시 드롭다운 닫기 ── */
  document.addEventListener('click', () => {
    if (state.catDropdown.open) dispatch(ACTION.CAT_CLOSE);
    if (state.search.open) dispatch(ACTION.SEARCH_CLOSE);
    if (state.hot.open) dispatch(ACTION.HOT_CLOSE);
    if (state.notify.open) dispatch(ACTION.NOTIFY_CLOSE);
    if (state.chat.open) dispatch(ACTION.CHAT_CLOSE);
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
    if (e.key === 'Escape' && state.notify.open) {
      dispatch(ACTION.NOTIFY_CLOSE);
    }
    if (e.key === 'Escape' && state.chat.open) {
      dispatch(ACTION.CHAT_CLOSE);
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

function injectBestCatalogSection() {
  const recommendSection = document.querySelector('.catalog-section');
  if (!recommendSection || document.getElementById(CATALOG_DOM_IDS.best.gridId)) return;

  const bestSection = recommendSection.cloneNode(true);
  bestSection.classList.add('catalog-section--best100');
  const bestTitle = bestSection.querySelector('.catalog-title');
  if (bestTitle) bestTitle.textContent = 'BEST 100';

  const bestControls = bestSection.querySelector('.catalog-header__controls');
  if (bestControls) bestControls.setAttribute('aria-label', 'BEST 100 페이지 이동');

  const bestSub = bestSection.querySelector('.catalog-sub');
  if (bestSub) bestSub.textContent = '지금 가장 많이 찾는 인기 상품을 모아봤어요';

  const bestPrev = bestSection.querySelector(`#${CATALOG_DOM_IDS.recommend.prevId}`);
  if (bestPrev) {
    bestPrev.id = CATALOG_DOM_IDS.best.prevId;
    bestPrev.disabled = true;
  }

  const bestNext = bestSection.querySelector(`#${CATALOG_DOM_IDS.recommend.nextId}`);
  if (bestNext) {
    bestNext.id = CATALOG_DOM_IDS.best.nextId;
    bestNext.disabled = true;
  }

  const bestPageInfo = bestSection.querySelector(`#${CATALOG_DOM_IDS.recommend.pageInfoId}`);
  if (bestPageInfo) {
    bestPageInfo.id = CATALOG_DOM_IDS.best.pageInfoId;
    bestPageInfo.textContent = '1 / 1';
  }

  const bestGrid = bestSection.querySelector(`#${CATALOG_DOM_IDS.recommend.gridId}`);
  if (bestGrid) bestGrid.id = CATALOG_DOM_IDS.best.gridId;

  recommendSection.parentNode?.insertBefore(bestSection, recommendSection);
}

function initCatalogPages(catalogState, domIds) {
  const grid = document.getElementById(domIds.gridId);
  if (!grid) {
    catalogState.total = 0;
    catalogState.page = 0;
    return;
  }

  const cards = grid.querySelectorAll('.cg-card');
  catalogState.total = cards.length;
  cards.forEach((card, i) => {
    card.dataset.page = Math.floor(i / catalogState.perPage);
  });

  const maxPage = Math.max(Math.ceil(catalogState.total / catalogState.perPage) - 1, 0);
  catalogState.page = clamp(catalogState.page, 0, maxPage);
}


/* ==============================================
   초기화
   V3 특징: 모든 상태를 먼저 계산 후 일괄 렌더
   ============================================== */
function init() {
  injectBestCatalogSection();
  initCatalogPages(state.bestCatalog, CATALOG_DOM_IDS.best);
  /* 카탈로그 카드 수 계산 */
  initCatalogPages(state.catalog, CATALOG_DOM_IDS.recommend);

  /* 카드에 data-page 자동 할당 */

  /* 이벤트 바인딩 */
  ensureCatalogWishlistButtons();
  bindEvents();

  /* 초기 렌더 */
  renderBanner();
  renderCatalog();
  renderCatDropdown();
  renderSearchLayer();
  renderHotWidget();
  renderNotifyModal();
  renderChatModal();
  renderQuickMenu();

  /* 자동재생 시작 */
  if (state.banner.isPlaying) resetBannerTimer();
  startHotRotation();
}

document.addEventListener('DOMContentLoaded', init);
