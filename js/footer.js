/**
 * footer.js
 * 의미:
 * - footer fragment의 연도(© YYYY) 텍스트를 현재 연도로 동기화합니다.
 *
 * 경로 메모:
 * - 폴더 구조를 바꾸면 아래 HTML 스크립트 경로를 함께 수정해야 합니다.
 *   <script src="js/footer.js"></script>
 */
'use strict';

(() => {
  if (window.__goodeeFooterInitialized) return;
  window.__goodeeFooterInitialized = true;

  function syncFooterYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll('.gf__copy').forEach((el) => {
      const original = el.textContent || '';
      const normalized = original.replace(/©\s*\d{4}/, `© ${year}`);
      el.textContent = normalized;
    });
  }

  function initFooter() {
    if (!document.querySelector('.gf')) return;
    syncFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter, { once: true });
  } else {
    initFooter();
  }
})();

