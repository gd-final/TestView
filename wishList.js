'use strict';

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
      {
        major: '사무용품',
        icon: 'fas fa-pencil-alt',
        url: '/category/office',
        items: [
          { label: '복사용지', url: '/category/office/paper' },
          { label: '필기구', url: '/category/office/pen' },
          { label: '파일/바인더', url: '/category/office/file' },
          { label: '회의용품', url: '/category/office/meeting' },
        ],
      },
      {
        major: '생활용품',
        icon: 'fas fa-home',
        url: '/category/daily',
        items: [
          { label: '위생용품', url: '/category/daily/hygiene' },
          { label: '탕비실 용품', url: '/category/daily/pantry' },
          { label: '휴지/물티슈', url: '/category/daily/tissue' },
          { label: '정리수납', url: '/category/daily/storage' },
        ],
      },
      {
        major: '주방용품',
        icon: 'fas fa-utensils',
        url: '/category/kitchen',
        items: [
          { label: '컵/텀블러', url: '/category/kitchen/cup' },
          { label: '보관용기', url: '/category/kitchen/container' },
          { label: '조리도구', url: '/category/kitchen/tool' },
          { label: '식기류', url: '/category/kitchen/tableware' },
        ],
      },
      {
        major: '포장/배송',
        icon: 'fas fa-box',
        url: '/category/package',
        items: [
          { label: '택배 박스', url: '/category/package/box' },
          { label: '완충재', url: '/category/package/cushion' },
          { label: '테이프/라벨', url: '/category/package/label' },
          { label: '쇼핑백', url: '/category/package/bag' },
        ],
      },
    ],
  },
};

const state = {
  wishItems: new Map(),
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
  showTopButton: false,
};

function render() {
  renderWishlist();
  renderCatDropdown();
  renderSearchLayer();
  renderHotWidget();
  renderNotifyModal();
  renderQuickMenu();
}

function renderWishlist() {
  const count = state.wishItems.size;
  const clearBtn = document.getElementById('wishClearBtn');
  const totalCount = document.getElementById('wishTotalCount');
  const statusText = document.getElementById('wishStatusText');

  if (totalCount) totalCount.textContent = String(count);
  if (statusText) {
    statusText.textContent = count > 0
      ? `현재 ${count}개 상품이 저장되어 있습니다.`
      : '저장된 찜 상품이 없습니다.';
  }
  if (clearBtn) clearBtn.disabled = count === 0;
}

function renderCatDropdown() {
  const panel = document.getElementById('v3CatMega');
  const tree = document.getElementById('v3CatMegaTree');
  if (!panel || !tree) return;

  const data = CATEGORY_TREE.all;
  const activeGroup = data.groups[state.catDropdown.activeGroupIndex] || data.groups[0];

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
    </div>
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

function renderQuickMenu() {
  const topBtn = document.getElementById('quickTopBtn');
  if (!topBtn) return;
  topBtn.classList.toggle('is-visible', state.showTopButton);
}

function bindEvents() {
  bindAccordion();
  bindWishlist();
  bindCategoryStrip();
  bindHeaderSearch();
  bindHotWidget();
  bindQuickMenu();
  bindGlobalClose();
}

function bindAccordion() {
  document.querySelectorAll('.nav-group__toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.nav-group');
      if (!group) return;
      const isOpen = group.classList.contains('is-open');
      group.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

function bindWishlist() {
  const grid = document.getElementById('wishGrid');
  const clearBtn = document.getElementById('wishClearBtn');
  if (!grid || !clearBtn) return;

  grid.addEventListener('click', (event) => {
    const wishBtn = event.target.closest('.wish-card__wish-btn');
    if (wishBtn) {
      const card = wishBtn.closest('[data-wish-item]');
      if (card) removeWishItem(card.dataset.id);
      return;
    }

    const cartBtn = event.target.closest('.wish-card__cart-btn');
    if (cartBtn) {
      cartBtn.textContent = '장바구니 담김';
      cartBtn.classList.add('is-done');
    }
  });

  clearBtn.addEventListener('click', () => {
    Array.from(state.wishItems.keys()).forEach((id) => removeWishItem(id));
  });
}

function bindCategoryStrip() {
  const megaPanel = document.getElementById('v3CatMega');

  document.querySelectorAll('.cat-trigger').forEach((trigger) => {
    trigger.addEventListener('mouseenter', () => {
      if (window.innerWidth <= 768) return;
      state.catDropdown.open = true;
      state.catDropdown.activeKey = trigger.dataset.catKey || 'all';
      state.catDropdown.activeGroupIndex = 0;
      state.catDropdown.activeSubIndex = 0;
      renderCatDropdown();
    });

    trigger.addEventListener('focus', () => {
      state.catDropdown.open = true;
      state.catDropdown.activeKey = trigger.dataset.catKey || 'all';
      state.catDropdown.activeGroupIndex = 0;
      state.catDropdown.activeSubIndex = 0;
      renderCatDropdown();
    });
  });

  document.addEventListener('mousemove', (event) => {
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
      event.clientX >= navRect.left - bufferLeft &&
      event.clientX <= navRect.right + bufferRight &&
      event.clientY >= navRect.top - bufferY &&
      event.clientY <= navRect.bottom + bufferY;

    const inMegaZone =
      event.clientX >= megaRect.left - bufferLeft &&
      event.clientX <= megaRect.right + bufferRight &&
      event.clientY >= megaRect.top - bufferY &&
      event.clientY <= megaRect.bottom + bufferY;

    if (!inNavZone && !inMegaZone) {
      state.catDropdown.open = false;
      renderCatDropdown();
    }
  });

  megaPanel?.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  megaPanel?.addEventListener('mouseover', (event) => {
    const major = event.target.closest('[data-cat-group]');
    if (major && window.innerWidth > 768) {
      state.catDropdown.activeGroupIndex = Number(major.dataset.catGroup) || 0;
      state.catDropdown.activeSubIndex = 0;
      renderCatDropdown();
      return;
    }

    const sub = event.target.closest('[data-cat-sub]');
    if (sub && window.innerWidth > 768) {
      state.catDropdown.activeSubIndex = Number(sub.dataset.catSub) || 0;
      renderCatDropdown();
    }
  });

  megaPanel?.addEventListener('focusin', (event) => {
    const major = event.target.closest('[data-cat-group]');
    if (major) {
      state.catDropdown.activeGroupIndex = Number(major.dataset.catGroup) || 0;
      state.catDropdown.activeSubIndex = 0;
      renderCatDropdown();
      return;
    }

    const sub = event.target.closest('[data-cat-sub]');
    if (sub) {
      state.catDropdown.activeSubIndex = Number(sub.dataset.catSub) || 0;
      renderCatDropdown();
    }
  });
}

function bindHeaderSearch() {
  const searchForm = document.querySelector('.gh__search');
  const searchInput = document.querySelector('.gh__search-input');
  const searchSelect = document.querySelector('.gh__search-select');
  if (!searchForm || !searchInput || !searchSelect) return;

  const openSearch = () => {
    state.search.open = true;
    renderSearchLayer();
  };

  searchInput.addEventListener('focus', openSearch);
  searchInput.addEventListener('click', openSearch);
  searchSelect.addEventListener('focus', openSearch);
  searchSelect.addEventListener('click', openSearch);

  searchForm.addEventListener('submit', (event) => {
    const keyword = searchInput.value.trim();
    if (!keyword) return;
    event.preventDefault();
    addRecentSearch(keyword);
    state.search.open = true;
    renderSearchLayer();
  });

  searchForm.addEventListener('click', (event) => {
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
      searchInput.value = keyword;
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
}

function bindHotWidget() {
  const hotWidget = document.getElementById('ghHotWidget');
  const searchInput = document.querySelector('.gh__search-input');
  if (!hotWidget || !searchInput) return;

  hotWidget.addEventListener('click', (event) => {
    event.stopPropagation();

    if (event.target.closest('#ghHotCloseBtn')) {
      state.hot.open = false;
      renderHotWidget();
      return;
    }

    if (event.target.closest('#ghHotTriggerBtn')) {
      state.hot.open = !state.hot.open;
      renderHotWidget();
      return;
    }

    const termBtn = event.target.closest('[data-hot-term]');
    if (termBtn) {
      const keyword = termBtn.dataset.hotTerm || '';
      searchInput.value = keyword;
      addRecentSearch(keyword);
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

function bindGlobalClose() {
  document.addEventListener('click', () => {
    if (state.catDropdown.open) state.catDropdown.open = false;
    if (state.search.open) state.search.open = false;
    if (state.hot.open) state.hot.open = false;
    if (state.notify.open) state.notify.open = false;
    renderCatDropdown();
    renderSearchLayer();
    renderHotWidget();
    renderNotifyModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (state.catDropdown.open) state.catDropdown.open = false;
    if (state.search.open) state.search.open = false;
    if (state.hot.open) state.hot.open = false;
    if (state.notify.open) state.notify.open = false;
    renderCatDropdown();
    renderSearchLayer();
    renderHotWidget();
    renderNotifyModal();
  });
}

function removeWishItem(id) {
  const item = state.wishItems.get(id);
  if (!item) return;
  item.remove();
  state.wishItems.delete(id);
  renderWishlist();
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

function startHotRotation() {
  clearInterval(state.hot.timer);
  state.hot.timer = setInterval(() => {
    state.hot.currentIndex = state.hot.currentIndex <= 0
      ? state.search.popularTerms.length - 1
      : state.hot.currentIndex - 1;
    renderHotWidget();
  }, state.hot.DELAY);
}

function renderTrendMarkup(term) {
  if (term.trend === 'up') return `▲ ${term.count}`;
  if (term.trend === 'down') return `▼ ${term.count}`;
  return '-';
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

function initWishItems() {
  document.querySelectorAll('[data-wish-item]').forEach((item) => {
    const id = item.dataset.id;
    if (id) state.wishItems.set(id, item);
  });
}

function init() {
  initWishItems();
  bindNotifyModal();
  bindEvents();
  render();
  startHotRotation();
}

document.addEventListener('DOMContentLoaded', init);
