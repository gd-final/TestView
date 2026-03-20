너는 세계 최고 수준의 시니어 프론트엔드 개발자다.
아래 기준을 **절대적으로** 따라서 GoodeeB2B BtoB 쇼핑몰의 서브 페이지를 구현해라.

---

## [프로젝트 개요]

- 서비스명: GoodeeB2B
- 서비스 성격: BtoB 무역/배송 종합 쇼핑몰 (기업 고객 대상)
- 기술 스택: Spring Boot + Thymeleaf + JPA (서버사이드 렌더링)
- 디자인 기준: 기존 메인페이지 V3 시안 (`main_v3.html`, `main_v3.css`, `main_v3.js`)
- 출력 파일: HTML / CSS / JS 각각 분리 (파일명은 요청 시 지정)

---

## [추가 공통 UI 규칙 — 반드시 적용]

### 1. 고정 퀵메뉴 (오른쪽)

- `main_v3.html` 우측에 있는 **고정 퀵메뉴 영역을 그대로 모든 페이지에 포함**해라.
- 구조, 클래스명, 위치, 스타일을 절대 변경하지 않는다.
- 스크롤 시 따라오는 behavior까지 동일하게 유지한다.

---

### 2. 사이드바 (좌측 — cart 페이지 필수)

- `cart.html`에서는 메인 영역 좌측에 `main_v3.html`의 **사이드바 영역을 그대로 가져와서 배치**해라.
- HTML 구조, 클래스명, 스타일을 절대 변경하지 않는다.
- 장바구니 본문은 우측 컨텐츠 영역에 배치한다.
- 즉, `cart.html`은 아래 레이아웃을 따라야 한다.

```text
좌측: main_v3의 사이드바
우측: 장바구니 페이지 고유 컨텐츠
```

### 3. 헤더 검색 인터랙션 (반드시 유지)

`main_v3.html`의 헤더는 단순 검색창이 아니라,
검색창 + 최근 검색어 레이어 + 실시간 인기 검색어 레이어 + 주간 인기 검색어 위젯까지 포함하는 구조다.

따라서 모든 서브 페이지는 헤더를 복사할 때
`<form class="gh__search"> ... </form>` 만 가져오는 것이 아니라,
그 내부의 `gh-search-layer`와
검색창 우측의 `gh-hot` 위젯까지 모두 포함한 전체 헤더 구조를 그대로 사용해야 한다.

- 구조, 클래스명, aria 속성, 버튼 id, DOM 계층을 절대 임의로 단순화하거나 변경하지 않는다.
- `main_v3.js`에서 검색/인기검색어/주간 인기검색어 동작에 사용하는 id/class를 그대로 유지한다.

---

## [V3 디자인 시스템 — 반드시 준수]

### 1. CSS 변수 (모든 페이지 공통 사용)

모든 서브 페이지의 CSS 파일 최상단에 아래 `:root` 변수를 그대로 선언해라.
절대 임의로 다른 색상 값을 하드코딩하지 말고, 반드시 아래 변수를 참조해라.

```css
:root {
  /* 컬러 */
  --p-ink:      #1c3d5a;   /* 주요 네이비 잉크 */
  --p-blue:     #0070c0;   /* 스틸 블루 (primary) */
  --p-blue-dk:  #005da0;   /* 블루 hover */
  --p-teal:     #00875a;   /* 배송/출고 강조 */
  --p-amber:    #b45309;   /* 생활용품 강조 */
  --p-sky:      #0284c7;
  --p-purple:   #6d28d9;
  --p-green:    #15803d;
  --p-red:      #c0392b;   /* 에러/삭제/할인 */

  /* 텍스트 */
  --p-text:     #1e2a38;   /* 본문 기본색 */
  --p-sub:      #4a5568;   /* 보조 텍스트 */
  --p-muted:    #8a95a3;   /* 흐린 텍스트 */

  /* 배경/서피스 */
  --p-bg:       #f4f5f8;   /* 페이지 배경 (쿨 라이트 그레이) */
  --p-white:    #ffffff;
  --p-surface:  #eef0f4;   /* 카드 내부 구분 배경 */
  --p-border:   #dce0e8;
  --p-border-h: #c5cad4;   /* hover 시 border */

  /* 폰트 */
  --ff: 'Apple SD Gothic Neo', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;

  /* 그림자 */
  --s-xs: 0 1px 3px rgba(28, 61, 90, 0.06);
  --s-sm: 0 2px 8px rgba(28, 61, 90, 0.08);
  --s-md: 0 6px 20px rgba(28, 61, 90, 0.11);

  /* 테두리 반경 */
  --r3:   3px;
  --r5:   5px;
  --r7:   7px;
  --r10:  10px;
  --pill: 999px;

  /* 트랜지션 */
  --t: all 0.18s ease;

  /* 레이아웃 */
  --gh-h:  68px;   /* 글로벌 헤더 높이 */
  --cat-h: 44px;   /* 카테고리 스트립 높이 */
}
```

### 2. 레이아웃 컨테이너

모든 페이지의 최대 너비는 1320px, 좌우 패딩은 24px로 통일한다.

```css
.wrap {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
}
```

서브 페이지 본문 영역은 아래 클래스를 사용해라.

```css
.page-content {
  max-width: 1320px;
  margin: 0 auto;
  padding: 32px 24px 72px;
}
```

### 3. 헤더 (Global Header) — 모든 페이지 공통

헤더는 V3 `main_v3.html`의 `<header class="gh">` 구조를 그대로 복사해서 사용해라.
단, 현재 V3 헤더는 아래 요소를 모두 포함하는 완성형 구조이므로 일부만 발췌하지 말고 전체를 유지해야 한다.

- 브랜드 로고 (`.gh__brand`)
- 중앙 확장 검색창 (`.gh__search`)
- 검색창 하단 레이어 (`.gh-search-layer`)
  - 최근 검색어
  - 실시간 인기 검색어
- 검색창 우측 주간 인기 검색어 위젯 (`.gh-hot`)
- 우측 유틸 메뉴 (`.gh__util`)

즉, 헤더는 단순 검색 input 1개짜리 구조가 아니라
검색 인터랙션 UI 전체가 포함된 복합 헤더다.

(추후 Thymeleaf fragment로 분리할 수 있도록 주석을 달아둬라)

```html
<!-- th:replace="fragments/layout :: header" -->
<header class="gh">
  <div class="gh__wrap">

    <!-- 브랜드 로고 -->
    <a href="/" th:href="@{/}" class="gh__brand" aria-label="Goodee B2B 홈">
      <svg class="gh__brand-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="6" fill="#1c3d5a"/>
        <rect x="6" y="6" width="7" height="7" rx="1" fill="#fff" opacity="0.9"/>
        <rect x="15" y="6" width="7" height="7" rx="1" fill="#fff" opacity="0.6"/>
        <rect x="6" y="15" width="7" height="7" rx="1" fill="#fff" opacity="0.6"/>
        <rect x="15" y="15" width="7" height="7" rx="1" fill="#4da6e8" opacity="0.9"/>
      </svg>
      <span class="gh__brand-name">Goodee <strong>B2B</strong></span>
    </a>

    <!-- 검색창 + 검색 레이어 -->
    <form class="gh__search" action="/search" th:action="@{/search}" method="get" role="search">
      <div class="gh__search-box">
        <button type="submit" class="gh__search-submit" aria-label="검색">
          <i class="fas fa-search" aria-hidden="true"></i>
        </button>
        <input
          type="search"
          name="q"
          class="gh__search-input"
          placeholder="품목명, 카테고리, 품번으로 검색"
          aria-label="상품 검색"
          autocomplete="off"
        >
        <div class="gh__search-divider" aria-hidden="true"></div>
        <select name="searchType" class="gh__search-select" aria-label="검색 기준 선택">
          <option value="">전체</option>
          <option value="product">상품명</option>
          <option value="tag">태그</option>
        </select>
      </div>

      <div class="gh-search-layer" id="ghSearchLayer" aria-hidden="true">
        <section class="gh-search-layer__section" aria-labelledby="ghRecentTitle">
          <div class="gh-search-layer__head">
            <strong class="gh-search-layer__title" id="ghRecentTitle">최근 검색어</strong>
            <button type="button" class="gh-search-layer__clear" id="ghRecentClearBtn">전체 삭제</button>
          </div>
          <ul class="gh-search-layer__recent-list" id="ghRecentList" role="list"></ul>
          <p class="gh-search-layer__empty" id="ghRecentEmpty" hidden>최근 검색어가 없습니다.</p>
        </section>

        <section class="gh-search-layer__section" aria-labelledby="ghPopularTitle">
          <div class="gh-search-layer__head">
            <strong class="gh-search-layer__title" id="ghPopularTitle">실시간 인기 검색어</strong>
            <button type="button" class="gh-search-layer__more" id="ghPopularToggleBtn" aria-expanded="false">더보기</button>
          </div>
          <ol class="gh-search-layer__popular-list" id="ghPopularList"></ol>
        </section>
      </div>
    </form>

    <!-- 주간 인기 검색어 위젯 -->
    <div class="gh-hot" id="ghHotWidget">
      <button
        type="button"
        class="gh-hot__trigger"
        id="ghHotTriggerBtn"
        aria-label="주간 인기 검색어 전체 보기"
        aria-expanded="false"
        aria-controls="ghHotPanel"
      >
        <span class="gh-hot__slot" id="ghHotCurrent" aria-live="polite">
          <span class="gh-hot__label">주간 인기 검색어</span>
          <span class="gh-hot__item">
            <span class="gh-hot__rank">10위</span>
            <span class="gh-hot__keyword">명함 케이스</span>
          </span>
        </span>
        <span class="gh-hot__toggle-mark" aria-hidden="true">
          <i class="fas fa-chevron-down" aria-hidden="true"></i>
        </span>
      </button>

      <div class="gh-hot__panel" id="ghHotPanel" aria-hidden="true">
        <div class="gh-hot__panel-head">
          <strong class="gh-hot__panel-title">주간 인기 검색어</strong>
          <button type="button" class="gh-hot__close" id="ghHotCloseBtn" aria-label="주간 인기 검색어 닫기">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <ol class="gh-hot__list" id="ghHotList"></ol>
      </div>
    </div>

    <!-- 유틸 메뉴 -->
    <nav class="gh__util" aria-label="유틸 메뉴">
      <a href="/login" th:href="@{/login}" class="gh__util-btn">
        <i class="fas fa-user" aria-hidden="true"></i>
        <span>로그인</span>
      </a>
      <a href="/mypage" th:href="@{/mypage}" class="gh__util-btn">
        <i class="fas fa-th-large" aria-hidden="true"></i>
        <span>마이페이지</span>
      </a>
      <a href="/order/track" th:href="@{/order/track}" class="gh__util-btn">
        <i class="fas fa-shipping-fast" aria-hidden="true"></i>
        <span>배송조회</span>
      </a>
      <a href="/cart" th:href="@{/cart}" class="gh__util-btn gh__util-btn--cart" aria-label="장바구니">
        <i class="fas fa-shopping-cart" aria-hidden="true"></i>
        <span>장바구니</span>
        <em class="gh__cart-badge" th:text="${cartCount}">3</em>
      </a>
    </nav>

  </div>
</header>
```

### 4. 카테고리 스트립 (GNB) — 모든 페이지 공통

메인 헤더 바로 아래, 카테고리 칩 스크롤 바를 모든 페이지에 포함해라.
V3 `<div class="cat-strip">` 구조를 그대로 사용한다.

```html
<!-- th:replace="fragments/layout :: catStrip" -->
<div class="cat-strip" role="navigation" aria-label="카테고리 탐색">
  <!-- (main_v3.html의 cat-strip 내용 그대로) -->
</div>
```

### 5. 푸터 (Global Footer) — 모든 페이지 공통

V3 `<footer class="gf">` 구조를 그대로 사용한다.

```html
<!-- th:replace="fragments/layout :: footer" -->
<footer class="gf">
  <!-- (main_v3.html의 gf 내용 그대로) -->
</footer>
```

### 6. 버튼 컴포넌트 규칙

모든 서브 페이지에서 버튼은 아래 4가지 종류만 사용한다.
새로운 버튼 스타일을 임의로 만들지 않는다.

```css
/* Primary — 주요 행동 */
.btn-primary {
  background: var(--p-blue);
  color: var(--p-white);
  height: 40px; padding: 0 22px;
  border-radius: var(--r3);
  font-size: 14px; font-weight: 700;
  border: none; cursor: pointer;
  transition: var(--t);
}
.btn-primary:hover { background: var(--p-blue-dk); }

/* Secondary — 보조 행동 */
.btn-secondary {
  background: transparent;
  color: var(--p-blue);
  height: 40px; padding: 0 20px;
  border-radius: var(--r3);
  font-size: 14px; font-weight: 700;
  border: 1.5px solid var(--p-blue);
  cursor: pointer; transition: var(--t);
}
.btn-secondary:hover { background: var(--p-blue); color: var(--p-white); }

/* Ghost — 부가 행동 */
.btn-ghost {
  background: transparent;
  color: var(--p-sub);
  height: 38px; padding: 0 18px;
  border-radius: var(--r3);
  font-size: 13.5px; font-weight: 600;
  border: 1.5px solid var(--p-border-h);
  cursor: pointer; transition: var(--t);
}
.btn-ghost:hover { background: var(--p-surface); border-color: var(--p-border-h); }

/* Danger — 삭제/취소 */
.btn-danger {
  background: transparent;
  color: var(--p-red);
  height: 36px; padding: 0 16px;
  border-radius: var(--r3);
  font-size: 13px; font-weight: 600;
  border: 1.5px solid var(--p-red);
  cursor: pointer; transition: var(--t);
}
.btn-danger:hover { background: var(--p-red); color: var(--p-white); }
```

### 7. 카드(섹션 박스) 컴포넌트 규칙

서브 페이지에서 정보를 묶는 카드형 컨테이너는 아래 규칙을 따른다.

```css
.panel {
  background: var(--p-white);
  border: 1px solid var(--p-border);
  border-radius: var(--r10);
  padding: 28px;
}

.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--p-surface);
}
.panel__title {
  font-size: 16px;
  font-weight: 800;
  color: var(--p-text);
  letter-spacing: -0.2px;
}
```

### 8. 페이지 내 상태 표시 뱃지 규칙

상태값(주문완료, 배송중, 취소 등)은 아래 뱃지 스타일만 사용한다.

```css
.badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: var(--pill); }
.badge--blue   { background: #dbeafe; color: #1d4ed8; }
.badge--green  { background: #dcfce7; color: #15803d; }
.badge--teal   { background: #ccfbf1; color: #0f766e; }
.badge--amber  { background: #fef3c7; color: #92400e; }
.badge--red    { background: #fee2e2; color: #c0392b; }
.badge--gray   { background: #f1f5f9; color: #64748b; }
```

### 9. 폼(Form) 요소 규칙

```css
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field__label {
  font-size: 13px;
  font-weight: 700;
  color: var(--p-sub);
}
.field__input,
.field__select,
.field__textarea {
  height: 42px;
  border: 1.5px solid var(--p-border-h);
  border-radius: var(--r5);
  padding: 0 14px;
  font-size: 14px;
  font-family: var(--ff);
  color: var(--p-text);
  background: var(--p-white);
  outline: none;
  transition: var(--t);
}
.field__textarea { height: auto; padding: 12px 14px; resize: vertical; }
.field__input:focus,
.field__select:focus,
.field__textarea:focus {
  border-color: var(--p-blue);
  box-shadow: 0 0 0 3px rgba(0, 112, 192, 0.10);
}
.field__hint {
  font-size: 12px;
  color: var(--p-muted);
}
.field__error {
  font-size: 12px;
  color: var(--p-red);
}
```

### 10. 구분선 / 섹션 간격 규칙

- 섹션 간 상하 간격: `margin-top: 28px`
- 패널 내부 요소 간격: `gap: 16px` (flex/grid)
- 테이블 행 구분선: `border-bottom: 1px solid var(--p-surface)`
- 강조 구분선: `border-bottom: 2px solid var(--p-blue)`

---

## [HTML 작성 규칙]

### 기본 문서 구조

모든 서브 페이지는 아래 골격을 기준으로 시작한다.

```html
<!DOCTYPE html>
<html lang="ko" xmlns:th="http://www.thymeleaf.org">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[페이지명] — Goodee B2B</title>
  <link rel="stylesheet" href="v3-common.css" th:href="@{/css/v3-common.css}">
  <link rel="stylesheet" href="[페이지].css" th:href="@{/css/[페이지].css}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>

  <!-- 공통 헤더 -->
  <!-- th:replace="fragments/layout :: header" -->
  <header class="gh">
    <!-- main_v3.html의 gh 전체 구조 그대로 -->
  </header>

  <!-- 공통 카테고리 스트립 -->
  <!-- th:replace="fragments/layout :: catStrip" -->
  <div class="cat-strip">
    <!-- main_v3.html의 cat-strip 전체 구조 그대로 -->
  </div>

  <!-- 페이지 본문 -->
  <main class="page-content">
    <nav class="breadcrumb" aria-label="현재 위치">
      <ol class="breadcrumb__list">
        <li><a href="/" th:href="@{/}">홈</a></li>
        <li aria-current="page">[현재 페이지명]</li>
      </ol>
    </nav>

    <div class="page-title-row">
      <h1 class="page-title">[페이지 제목]</h1>
      <p class="page-title-sub">[페이지 부제목 또는 설명]</p>
    </div>

    <!-- 페이지 고유 컨텐츠 -->
    ...

  </main>

  <!-- 공통 푸터 -->
  <!-- th:replace="fragments/layout :: footer" -->
  <footer class="gf">
    <!-- main_v3.html의 gf 전체 구조 그대로 -->
  </footer>

  <!-- 공통 고정 퀵메뉴 -->
  <div class="quick-side">
    <!-- main_v3.html의 quick-side 전체 구조 그대로 -->
  </div>

  <script src="[페이지].js" th:src="@{/js/[페이지].js}"></script>
</body>
</html>
```

### 브레드크럼 CSS

```css
.breadcrumb { margin-bottom: 20px; }
.breadcrumb__list {
  display: flex;
  align-items: center;
  gap: 6px;
  list-style: none;
  font-size: 13px;
  color: var(--p-muted);
}
.breadcrumb__list li + li::before {
  content: '/';
  color: var(--p-border-h);
  margin-right: 6px;
}
.breadcrumb__list a { color: var(--p-sub); transition: var(--t); }
.breadcrumb__list a:hover { color: var(--p-blue); }
.breadcrumb__list [aria-current] { color: var(--p-text); font-weight: 600; }
```

### 페이지 타이틀 CSS

```css
.page-title-row  { margin-bottom: 28px; }
.page-title      { font-size: 22px; font-weight: 800; color: var(--p-text); letter-spacing: -0.3px; }
.page-title-sub  { font-size: 13.5px; color: var(--p-muted); margin-top: 4px; }
```

### Thymeleaf 작성 규칙

- 텍스트 치환: `th:text="${변수명}"`
- 링크 치환: `th:href="@{/경로}"`
- 이미지 치환: `th:src="${변수명}"`
- 반복: `th:each="item : ${list}"`
- 조건 표시: `th:if="${조건}"` / `th:unless="${조건}"`
- 클래스 동적 적용: `th:classappend="${조건} ? 'is-active'"`
- 날짜 포맷: `th:text="${#temporals.format(date, 'yyyy-MM-dd')}"`
- 숫자 포맷: `th:text="${#numbers.formatInteger(price, 3, 'COMMA')}"`

---

## [CSS 작성 규칙]

- 모든 색상은 `:root` 변수 참조. 절대 하드코딩 금지.
- 클래스명은 BEM 경량 방식 (블록__요소--변형자) 또는 기능명 단축형 사용.
- 페이지 고유 클래스는 파일명 약어로 네임스페이스를 준다.
  - 예: 장바구니 → `.cart-*`, 고객센터 → `.cs-*`, 주문 → `.order-*`
- 반응형은 태블릿 768px, 모바일 480px 두 단계만 처리한다.
- 애니메이션은 `transition: var(--t)` 이상으로 복잡하게 만들지 않는다.
- `box-shadow`는 `var(--s-xs)`, `var(--s-sm)`, `var(--s-md)` 세 단계만 사용한다.
- 헤더 관련 클래스(`gh__wrap`, `gh__search`, `gh-search-layer`, `gh-hot`, `gh__util`)는 `main_v3.css` 기준 구조와 배치를 그대로 따른다.
- 헤더는 검색창/검색레이어/주간 인기검색어 위젯까지 포함한 4열 grid 구조이므로 헤더 레이아웃을 임의의 단순 flex 한 줄 구조로 바꾸지 않는다.

---

## [JavaScript 작성 규칙]

V3 메인 페이지와 동일한 순수 함수 + 공유 state 객체 패턴을 사용한다.

```js
'use strict';

/* 상태 */
const state = {
  // 페이지 고유 상태값
};

/* 렌더 */
function render() {
  // state → DOM 반영
}

/* 이벤트 바인딩 */
function bindEvents() {
  // 이벤트 리스너 등록
}

/* 초기화 */
function init() {
  bindEvents();
  render();
}

document.addEventListener('DOMContentLoaded', init);
```

- 라이브러리 없이 바닐라 JS만 사용한다.
- DOM 쿼리는 `init()` 내부 또는 함수 내 지역변수로 처리한다.
- `data-*` 속성으로 HTML과 JS 상태를 연결한다.
- 헤더에 포함된 검색 인터랙션(`gh-search-layer`, `gh-hot`)이 필요한 페이지에서는
  `main_v3.js`의 상태 관리 방식과 동작 패턴을 그대로 따른다.

특히 아래 기능은 구조를 임의 단순화하지 말고 유지한다.
- 검색창 focus/click 시 검색 레이어 열기
- 최근 검색어 추가/삭제/전체 삭제
- 실시간 인기 검색어 더보기/접기
- 주간 인기 검색어 자동 순환
- 주간 인기 검색어 패널 열기/닫기
- 외부 클릭 및 ESC 입력 시 레이어 닫기

---

## [디자인 원칙 — 모든 페이지 공통]

| 원칙 | 내용 |
|------|------|
| 톤앤매너 | 쿨 그레이 배경 + 스틸 블루 강조. B2C 이벤트몰 느낌 절대 금지 |
| 정보 밀도 | 적절히 높게. 기업 담당자가 한 화면에서 판단할 수 있는 수준 |
| 여백 | 패딩 기준: 소 12px, 중 20px, 대 28px. 임의 값 금지 |
| 타이포 | 제목: `font-weight: 800`. 본문: `font-weight: 400~500`. 강조: `font-weight: 700` |
| 호버 효과 | `transition: var(--t)` + 색상/배경 변경만. 과한 transform 금지 |
| 에러/성공 표시 | 인라인으로. 팝업/모달 최소화 |
| 비어있는 상태 | 빈 목록/데이터 없음 상태를 반드시 구현 (Empty state) |

---

## [만들 페이지 목록 및 요청 예시]

아래 목록 중 원하는 페이지를 선택해서 요청한다.

### 요청 방법

위 전체 프롬프트를 붙여넣고, 아래 섹션을 추가해서 요청한다.

```
[만들 페이지]
장바구니 페이지 (cart.html / cart.css / cart.js)

[페이지 설명]
- 장바구니에 담긴 상품 목록 표시
- 수량 변경 / 개별 삭제 / 전체 삭제
- 주문 금액 요약 (소계, 배송비, 합계)
- 견적서 다운로드 버튼
- 주문하기 버튼
```

### 제작 가능한 서브 페이지 목록

| 페이지 | 파일명 | 주요 기능 |
|--------|--------|-----------|
| 장바구니 | cart.html | 상품 목록, 수량 변경, 금액 요약, 주문하기 |
| 주문/결제 | order.html | 배송지 입력, 결제 방법, 주문 확인 |
| 주문 완료 | order-complete.html | 주문번호, 배송 예정일, 다음 단계 안내 |
| 마이페이지 홈 | mypage.html | 회원 정보, 최근 주문, 빠른 메뉴 |
| 주문 내역 | order-list.html | 주문 목록, 상태 필터, 재주문 |
| 주문 상세 | order-detail.html | 상품 상세, 배송 추적, 세금계산서 |
| 배송 조회 | delivery.html | 운송장 번호 조회, 배송 현황 |
| 상품 목록 | product-list.html | 카테고리 필터, 정렬, 그리드/리스트 전환 |
| 상품 상세 | product-detail.html | 상품 정보, 스펙, 수량 입력, 관련 상품 |
| 견적 문의 | quote.html | 품목 추가, 수량/규격 입력, 문의 전송 |
| 로그인 | login.html | 이메일 로그인, 소셜 로그인, 기업 회원 |
| 회원가입 | register.html | 개인/기업 구분, 정보 입력, 약관 동의 |
| 기업 회원가입 | register-biz.html | 사업자 정보, 담당자 정보, 결제 조건 |
| 고객센터 메인 | cs.html | FAQ 카테고리, 1:1 문의 입력, 공지사항 |
| 1:1 문의 | cs-inquiry.html | 문의 유형, 내용 입력, 파일 첨부 |
| 내 문의 내역 | cs-my-inquiry.html | 문의 목록, 답변 상태, 상세 보기 |
| 정기 납품 신청 | regular-order.html | 품목 선택, 납품 주기, 배송지, 결제 |

---

## [주의 사항]

- 헤더/푸터/GNB/고정 퀵메뉴는 `main_v3.html`에서 복사해서 사용하고, 구조를 바꾸지 않는다.
- 헤더는 검색 input만 복사하는 것이 아니라, 검색 레이어와 주간 인기 검색어 위젯까지 포함한 전체 구조를 유지해야 한다.
- `cart.html`은 좌측 사이드바를 `main_v3` 그대로 사용해야 한다.
- 페이지 고유 CSS만 별도 파일로 분리한다. (공통 CSS는 나중에 `v3-common.css`로 분리 예정)
- 더미 데이터는 실제 서비스처럼 자연스럽게 작성한다. (한국어, B2B 문체)
- Thymeleaf `th:each` 반복 구조는 반드시 적용해서 서버 연동이 쉽도록 작성한다.
- **Empty state (빈 상태)**를 반드시 구현한다. `th:if="${#lists.isEmpty(list)}"` 활용.
- 모바일 반응형은 768px / 480px 기준 두 단계만 처리한다.
- JS는 바닐라 JS만 사용하고, `state + render + bindEvents + init` 패턴을 따른다.
- 헤더 검색 관련 JS는 `main_v3.js`의 동작 패턴과 DOM 연결 방식을 그대로 유지한다.
- 접근성: `aria-label`, `role`, `aria-current`, `disabled` 속성을 적극 사용한다.
- 구조는 최대한 fragment 분리 가능한 형태로 작성한다.
