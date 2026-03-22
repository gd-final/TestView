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

const HEADER_NOTIFY_ITEMS = [
  {
    type: '주문',
    time: '방금 전',
    title: '주문번호 TH-240320-0184가 접수되었습니다.',
    desc: '결제 확인 후 출고 일정이 확정되면 다시 안내드립니다.',
  },
  {
    type: '배송',
    time: '12분 전',
    title: '택배 박스 대(400×300×200) 상품이 출고 준비 중입니다.',
    desc: '송장 등록이 완료되면 배송조회에서 바로 확인할 수 있습니다.',
  },
  {
    type: '문의',
    time: '1시간 전',
    title: '1:1 문의에 대한 답변이 등록되었습니다.',
    desc: '판촉물 인쇄 옵션 관련 문의에 담당자가 답변을 남겼습니다.',
  },
  {
    type: '회원',
    time: '오늘',
    title: '법인 회원 전용 3월 공급가 업데이트가 적용되었습니다.',
    desc: '사무용품과 포장/배송 카테고리 일부 상품의 회원가가 조정되었습니다.',
  },
];

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
        { label: '수세미', url: '/category/cleaning/hygiene/sponge' },
        { label: '행주', url: '/category/cleaning/hygiene/cloth' },
        { label: '분리수거봉투', url: '/category/cleaning/hygiene/bag' },
      ]},
      { major: '청소장비', icon: 'fas fa-spray-can-sparkles', url: '/category/cleaning/equipment', items: [
        { label: '무선 청소기', url: '/category/cleaning/equipment/vacuum' },
        { label: '살균 분무기', url: '/category/cleaning/equipment/sprayer' },
        { label: '업소용 청소기', url: '/category/cleaning/equipment/pro' },
        { label: '카트/보관함', url: '/category/cleaning/equipment/cart' },
      ]},
    ],
  },
};

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
  notify: {
    open: false,
    items: HEADER_NOTIFY_ITEMS,
  },
  catDropdown: {
    open: false,
    activeKey: 'all',
    activeGroupIndex: 0,
    activeSubIndex: 0,
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
  renderCatMega();
  renderSearchLayer();
  renderHotWidget();
  renderNotifyModal();
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

function renderCatMega() {
  const panel = document.getElementById('v3CatMega');
  const tree = document.getElementById('v3CatMegaTree');
  if (!panel || !tree) return;

  const data = CATEGORY_TREE[state.catDropdown.activeKey] || CATEGORY_TREE.all;
  const activeGroup = data.groups[state.catDropdown.activeGroupIndex] || data.groups[0];

  panel.classList.toggle('is-open', state.catDropdown.open);
  panel.setAttribute('aria-hidden', String(!state.catDropdown.open));

  document.querySelectorAll('.cat-trigger').forEach((trigger) => {
    const isActive = state.catDropdown.open && trigger.dataset.catKey === state.catDropdown.activeKey;
    trigger.classList.toggle('is-open', isActive);
    trigger.setAttribute('aria-expanded', String(isActive));
  });

  if (!state.catDropdown.open) {
    tree.innerHTML = '';
    return;
  }

  tree.innerHTML = `
    <div class="cat-tree-root">
      <a href="${escapeAttr(data.url)}" class="cat-tree-root__link">${escapeHtml(data.title)}</a>
    </div>
    <div class="cat-tree-rows">
      <div class="cat-tree-browser">
        <div class="cat-tree-majors">
          ${data.groups.map((group, idx) => `
            <a href="${escapeAttr(group.url)}" class="cat-tree-row__major ${idx === state.catDropdown.activeGroupIndex ? 'is-active' : ''}" data-cat-group="${idx}">
              <i class="${escapeAttr(group.icon)}" aria-hidden="true"></i>
              <span>${escapeHtml(group.major)}</span>
            </a>
          `).join('')}
        </div>
        <section class="cat-tree-detail">
          <div class="cat-tree-row__subs">
            ${activeGroup.items.map((item, idx) => `
              <a href="${escapeAttr(item.url)}" class="cat-tree-row__sub ${idx === state.catDropdown.activeSubIndex ? 'is-active' : ''}" data-cat-sub="${idx}">
                ${escapeHtml(item.label)}
              </a>
            `).join('')}
          </div>
        </section>
      </div>
    </div>
  `;
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
  bindQuoteModal();
  bindCarousel();
  bindGallery();
  bindCategoryDropdown();
  bindHeaderSearch();
  bindHotWidget();
  bindNotifyModal();
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
  document.getElementById('quoteWriteBtn')?.addEventListener('click', (event) => {
    event.preventDefault();
    openQuoteModal();
  });
}

function openQuoteModal() {
  const modal = document.getElementById('quoteModal');
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeQuoteModal() {
  const modal = document.getElementById('quoteModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

function bindQuoteModal() {
  const modal = document.getElementById('quoteModal');
  if (!modal) return;

  const closeBtn = document.getElementById('quoteModalCloseBtn');
  const dialog = modal.querySelector('.pd-quote-modal__dialog');
  const dateEl = document.getElementById('quoteEstimateDate');
  const useDateInput = document.getElementById('quoteUseDate');

  if (dateEl) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    dateEl.textContent = `${year}년 ${month}월 ${day}일`;
  }

  if (useDateInput) {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayValue = `${now.getFullYear()}-${month}-${day}`;
    useDateInput.min = todayValue;
    if (!useDateInput.value) useDateInput.value = todayValue;

    useDateInput.addEventListener('focus', () => {
      if (typeof useDateInput.showPicker === 'function') {
        useDateInput.showPicker();
      }
    });
  }

  closeBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    closeQuoteModal();
  });

  dialog?.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  modal.addEventListener('click', (event) => {
    if (event.target.classList.contains('pd-quote-modal__backdrop')) {
      closeQuoteModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeQuoteModal();
    }
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

function bindCategoryDropdown() {
  const megaPanel = document.getElementById('v3CatMega');
  const nav = document.getElementById('v3CatNav');
  if (!megaPanel || !nav) return;

  const openCatMega = (key) => {
    state.catDropdown.open = true;
    state.catDropdown.activeKey = key || 'all';
    state.catDropdown.activeGroupIndex = 0;
    state.catDropdown.activeSubIndex = 0;
    renderCatMega();
  };

  const closeCatMega = () => {
    if (!state.catDropdown.open) return;
    state.catDropdown.open = false;
    renderCatMega();
  };

  document.querySelectorAll('.cat-trigger').forEach((trigger) => {
    trigger.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) openCatMega(trigger.dataset.catKey);
    });
    trigger.addEventListener('focus', () => {
      openCatMega(trigger.dataset.catKey);
    });
  });

  megaPanel.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  megaPanel.addEventListener('mouseover', (event) => {
    const major = event.target.closest('[data-cat-group]');
    if (major && window.innerWidth > 768) {
      state.catDropdown.activeGroupIndex = Number(major.dataset.catGroup) || 0;
      state.catDropdown.activeSubIndex = 0;
      renderCatMega();
      return;
    }

    const sub = event.target.closest('[data-cat-sub]');
    if (sub && window.innerWidth > 768) {
      state.catDropdown.activeSubIndex = Number(sub.dataset.catSub) || 0;
      renderCatMega();
    }
  });

  megaPanel.addEventListener('focusin', (event) => {
    const major = event.target.closest('[data-cat-group]');
    if (major) {
      state.catDropdown.activeGroupIndex = Number(major.dataset.catGroup) || 0;
      state.catDropdown.activeSubIndex = 0;
      renderCatMega();
      return;
    }

    const sub = event.target.closest('[data-cat-sub]');
    if (sub) {
      state.catDropdown.activeSubIndex = Number(sub.dataset.catSub) || 0;
      renderCatMega();
    }
  });

  document.addEventListener('mousemove', (event) => {
    if (window.innerWidth <= 768 || !state.catDropdown.open) return;
    const megaInner = document.querySelector('.cat-mega__inner');
    if (!megaInner) return;

    const navRect = nav.getBoundingClientRect();
    const megaRect = megaInner.getBoundingClientRect();
    const bufferLeft = 42;
    const bufferRight = 28;
    const bufferY = 20;

    const inNavZone =
      event.clientX >= navRect.left - bufferLeft &&
      event.clientX <= navRect.right + bufferRight &&
      event.clientY >= navRect.top - bufferY &&
      event.clientY <= navRect.bottom + bufferY;

    const inMegaZone =
      event.clientX >= megaRect.left - bufferLeft &&
      event.clientX <= megaRect.right + bufferRight &&
      event.clientY >= megaRect.top - bufferY &&
      event.clientY <= megaRect.bottom + bufferY;

    if (!inNavZone && !inMegaZone) closeCatMega();
  });

  document.addEventListener('click', (event) => {
    if (nav.contains(event.target) || megaPanel.contains(event.target)) return;
    closeCatMega();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCatMega();
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

function bindNotifyModal() {
  const notifyBtn = document.getElementById('ghNotifyBtn');
  const notifyModal = document.getElementById('ghNotifyModal');
  if (!notifyBtn || !notifyModal) return;

  notifyBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    state.notify.open = !state.notify.open;
    renderNotifyModal();
  });

  notifyModal.addEventListener('click', (event) => {
    if (event.target.closest('.gh-notify-modal__dialog')) {
      event.stopPropagation();
    }

    if (event.target.closest('#ghNotifyCloseBtn') || event.target.classList.contains('gh-notify-modal__backdrop')) {
      state.notify.open = false;
      renderNotifyModal();
    }
  });

  document.addEventListener('click', () => {
    if (state.notify.open) {
      state.notify.open = false;
      renderNotifyModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.notify.open) {
      state.notify.open = false;
      renderNotifyModal();
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
