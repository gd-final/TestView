/**
 * header.js
 * 의미:
 * - header fragment 동작(카테고리 드롭다운, 검색 레이어, 인기검색어, 알림 모달)을 제어합니다.
 *
 * 경로 메모:
 * - 폴더 구조를 바꾸면 아래 HTML 스크립트 경로를 함께 수정해야 합니다.
 *   <script src="js/header.js"></script>
 */
'use strict';

(() => {
  if (window.__goodeeHeaderInitialized) return;
  window.__goodeeHeaderInitialized = true;

  const hasHeaderUI = document.querySelector('.gh') || document.querySelector('.cat-strip');
  if (!hasHeaderUI) return;

  const state = {
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
      ],
    },
  };

  /*
   * 라우팅 경로 수정 메모:
   * - 아래 CATEGORY_TREE의 url 값들은 사이트 라우트 경로입니다.
   * - /category prefix 또는 상세 경로 규칙이 바뀌면 이 블록의 url 값을 함께 수정하세요.
   */
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
        { major: '디지털/가전', icon: 'fas fa-laptop', url: '/category/digital', items: [
          { label: '사무기기', url: '/category/digital/office-device' },
          { label: '주변기기', url: '/category/digital/accessory' },
          { label: '생활가전', url: '/category/digital/home-device' },
          { label: '충전/전원', url: '/category/digital/power' },
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
      ],
    },
  };

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

  function renderCatDropdown() {
    const panel = document.getElementById('v3CatMega');
    const tree = document.getElementById('v3CatMegaTree');
    if (!panel || !tree) return;

    const data = CATEGORY_TREE[state.catDropdown.activeKey] || CATEGORY_TREE.all;
    const groups = Array.isArray(data.groups) ? data.groups : [];
    const safeGroupIdx = clamp(state.catDropdown.activeGroupIndex, 0, Math.max(groups.length - 1, 0));
    state.catDropdown.activeGroupIndex = safeGroupIdx;

    const activeGroup = groups[safeGroupIdx] || { items: [] };
    const activeItems = Array.isArray(activeGroup.items) ? activeGroup.items : [];
    const safeSubIdx = clamp(state.catDropdown.activeSubIndex, 0, Math.max(activeItems.length - 1, 0));
    state.catDropdown.activeSubIndex = safeSubIdx;

    panel.classList.toggle('is-open', state.catDropdown.open);
    panel.setAttribute('aria-hidden', String(!state.catDropdown.open));

    document.querySelectorAll('.cat-trigger').forEach((trigger) => {
      const isActive = state.catDropdown.open && trigger.dataset.catKey === state.catDropdown.activeKey;
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
          ${groups.map((group, idx) => `
            <a
              href="${escapeAttr(group.url)}"
              class="cat-tree-row__major ${idx === state.catDropdown.activeGroupIndex ? 'is-active' : ''}"
              data-cat-group="${idx}"
            >
              <i class="${escapeAttr(group.icon || 'fas fa-folder')}" aria-hidden="true"></i>
              <span>${escapeHtml(group.major)}</span>
            </a>
          `).join('')}
        </div>
        <section class="cat-tree-detail">
          <div class="cat-tree-row__subs">
            ${activeItems.map((item, idx) => `
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

  function setCategoryOpen(open) {
    state.catDropdown.open = open;
    renderCatDropdown();
  }

  function openCategory(key) {
    state.catDropdown.open = true;
    state.catDropdown.activeKey = key || 'all';
    state.catDropdown.activeGroupIndex = 0;
    state.catDropdown.activeSubIndex = 0;
    renderCatDropdown();
  }

  function closeCategory() {
    state.catDropdown.open = false;
    renderCatDropdown();
  }

  function setSearchOpen(open) {
    state.search.open = open;
    renderSearchLayer();
  }

  function setHotOpen(open) {
    state.hot.open = open;
    renderHotWidget();
  }

  function setNotifyOpen(open) {
    state.notify.open = open;
    renderNotifyModal();
  }

  function addRecentSearch(keyword) {
    const normalized = String(keyword || '').trim();
    if (!normalized) return;
    state.search.recentTerms = [
      normalized,
      ...state.search.recentTerms.filter((term) => term !== normalized),
    ].slice(0, 8);
    renderSearchLayer();
  }

  function bindCategoryEvents() {
    const megaPanel = document.getElementById('v3CatMega');
    const catStrip = document.querySelector('.cat-strip');

    document.querySelectorAll('.cat-trigger').forEach((trigger) => {
      trigger.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) {
          openCategory(trigger.dataset.catKey || 'all');
        }
      });

      trigger.addEventListener('focus', () => {
        openCategory(trigger.dataset.catKey || 'all');
      });

      trigger.addEventListener('click', (e) => {
        const key = trigger.dataset.catKey || 'all';
        if (window.innerWidth <= 768 && state.catDropdown.open && state.catDropdown.activeKey === key) {
          e.preventDefault();
          closeCategory();
          return;
        }

        if (window.innerWidth <= 768 || trigger.classList.contains('cat-trigger')) {
          e.preventDefault();
          openCategory(key);
        }
      });
    });

    megaPanel?.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    megaPanel?.addEventListener('mouseover', (e) => {
      const major = e.target.closest('[data-cat-group]');
      if (major && window.innerWidth > 768) {
        state.catDropdown.activeGroupIndex = Number(major.dataset.catGroup) || 0;
        state.catDropdown.activeSubIndex = 0;
        renderCatDropdown();
      }

      const sub = e.target.closest('[data-cat-sub]');
      if (sub && window.innerWidth > 768) {
        state.catDropdown.activeSubIndex = Number(sub.dataset.catSub) || 0;
        renderCatDropdown();
      }
    });

    megaPanel?.addEventListener('focusin', (e) => {
      const major = e.target.closest('[data-cat-group]');
      if (major) {
        state.catDropdown.activeGroupIndex = Number(major.dataset.catGroup) || 0;
        state.catDropdown.activeSubIndex = 0;
        renderCatDropdown();
      }

      const sub = e.target.closest('[data-cat-sub]');
      if (sub) {
        state.catDropdown.activeSubIndex = Number(sub.dataset.catSub) || 0;
        renderCatDropdown();
      }
    });

    catStrip?.addEventListener('click', (e) => e.stopPropagation());
  }

  function bindSearchEvents() {
    const searchForm = document.querySelector('.gh__search');
    const searchInput = document.querySelector('.gh__search-input');
    const searchSelect = document.querySelector('.gh__search-select');

    searchInput?.addEventListener('focus', () => setSearchOpen(true));
    searchInput?.addEventListener('click', () => setSearchOpen(true));
    searchSelect?.addEventListener('focus', () => setSearchOpen(true));
    searchSelect?.addEventListener('click', () => setSearchOpen(true));

    searchForm?.addEventListener('submit', (e) => {
      const keyword = searchInput?.value.trim() || '';
      if (!keyword) return;
      e.preventDefault();
      addRecentSearch(keyword);
      setSearchOpen(true);
    });

    searchForm?.addEventListener('click', (e) => {
      e.stopPropagation();

      const deleteBtn = e.target.closest('[data-delete-term]');
      if (deleteBtn) {
        state.search.recentTerms = state.search.recentTerms.filter((term) => term !== deleteBtn.dataset.deleteTerm);
        renderSearchLayer();
        return;
      }

      const termBtn = e.target.closest('[data-search-term]');
      if (termBtn) {
        const selected = termBtn.dataset.searchTerm || '';
        if (searchInput) searchInput.value = selected;
        addRecentSearch(selected);
        return;
      }

      if (e.target.closest('#ghRecentClearBtn')) {
        state.search.recentTerms = [];
        renderSearchLayer();
        return;
      }

      if (e.target.closest('#ghPopularToggleBtn')) {
        state.search.showAllPopular = !state.search.showAllPopular;
        renderSearchLayer();
      }
    });
  }

  function bindHotEvents() {
    const hotWidget = document.getElementById('ghHotWidget');
    const searchInput = document.querySelector('.gh__search-input');

    hotWidget?.addEventListener('click', (e) => {
      e.stopPropagation();

      if (e.target.closest('#ghHotCloseBtn')) {
        setHotOpen(false);
        return;
      }

      if (e.target.closest('#ghHotTriggerBtn')) {
        setHotOpen(!state.hot.open);
        return;
      }

      const termBtn = e.target.closest('[data-hot-term]');
      if (termBtn) {
        const term = termBtn.dataset.hotTerm || '';
        if (searchInput) searchInput.value = term;
        addRecentSearch(term);
        setHotOpen(false);
      }
    });

    clearInterval(state.hot.timer);
    state.hot.timer = setInterval(() => {
      state.hot.currentIndex = state.hot.currentIndex <= 0
        ? state.search.popularTerms.length - 1
        : state.hot.currentIndex - 1;
      renderHotWidget();
    }, state.hot.DELAY);
  }

  function bindNotifyEvents() {
    const notifyBtn = document.getElementById('ghNotifyBtn');
    const notifyModal = document.getElementById('ghNotifyModal');

    notifyBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setNotifyOpen(!state.notify.open);
    });

    notifyModal?.addEventListener('click', (e) => {
      if (e.target.closest('#ghNotifyCloseBtn') || e.target.classList.contains('gh-notify-modal__backdrop')) {
        setNotifyOpen(false);
        return;
      }

      if (e.target.closest('.gh-notify-modal__dialog')) {
        e.stopPropagation();
      }
    });
  }

  function bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.cat-strip') && !e.target.closest('#v3CatMega') && state.catDropdown.open) {
        closeCategory();
      }

      if (!e.target.closest('.gh__search') && state.search.open) {
        setSearchOpen(false);
      }

      if (!e.target.closest('#ghHotWidget') && state.hot.open) {
        setHotOpen(false);
      }

      if (!e.target.closest('#ghNotifyBtn') && !e.target.closest('#ghNotifyModal') && state.notify.open) {
        setNotifyOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (state.catDropdown.open) closeCategory();
      if (state.search.open) setSearchOpen(false);
      if (state.hot.open) setHotOpen(false);
      if (state.notify.open) setNotifyOpen(false);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768 && state.catDropdown.open) {
        setCategoryOpen(false);
      }
    });
  }

  function initHeader() {
    renderCatDropdown();
    renderSearchLayer();
    renderHotWidget();
    renderNotifyModal();

    bindCategoryEvents();
    bindSearchEvents();
    bindHotEvents();
    bindNotifyEvents();
    bindGlobalEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader, { once: true });
  } else {
    initHeader();
  }
})();


