/**
 * quick.js
 * 의미:
 * - quick fragment 동작(TOP 버튼 노출/스크롤, 1:1 문의 모달 탭/열기/닫기)을 제어합니다.
 *
 * 경로 메모:
 * - 폴더 구조를 바꾸면 아래 HTML 스크립트 경로를 함께 수정해야 합니다.
 *   <script src="js/quick.js"></script>
 */
'use strict';

(() => {
  if (window.__goodeeQuickInitialized) return;
  window.__goodeeQuickInitialized = true;

  const hasQuickUI = document.querySelector('.quick-side') || document.getElementById('quickChatModal');
  if (!hasQuickUI) return;

  const state = {
    quickMenu: {
      showTop: false,
    },
    chat: {
      open: false,
      tab: 'home',
      threadOpen: false,
    },
  };

  function renderQuickMenu() {
    const topBtn = document.getElementById('quickTopBtn');
    if (!topBtn) return;
    topBtn.classList.toggle('is-visible', state.quickMenu.showTop);
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

  function openChat(tab) {
    state.chat.open = true;
    state.chat.tab = tab === 'conversation' ? 'conversation' : 'home';
    state.chat.threadOpen = false;
    renderChatModal();
  }

  function closeChat() {
    state.chat.open = false;
    state.chat.tab = 'home';
    state.chat.threadOpen = false;
    renderChatModal();
  }

  function setChatTab(tab) {
    state.chat.tab = tab === 'conversation' ? 'conversation' : 'home';
    if (state.chat.tab !== 'conversation') {
      state.chat.threadOpen = false;
    }
    renderChatModal();
  }

  function openThread() {
    state.chat.tab = 'conversation';
    state.chat.threadOpen = true;
    renderChatModal();
  }

  function closeThread() {
    state.chat.tab = 'conversation';
    state.chat.threadOpen = false;
    renderChatModal();
  }

  function bindQuickTop() {
    const topBtn = document.getElementById('quickTopBtn');
    if (!topBtn) return;

    const syncQuickMenu = () => {
      state.quickMenu.showTop = window.scrollY > 80;
      renderQuickMenu();
    };

    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', syncQuickMenu, { passive: true });
    syncQuickMenu();
  }

  function bindChatEvents() {
    const trigger = document.getElementById('quickChatBtn');
    const modal = document.getElementById('quickChatModal');

    trigger?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openChat('home');
    });

    modal?.addEventListener('click', (e) => {
      if (e.target.closest('.quick-chat-modal__dialog')) {
        e.stopPropagation();
      }

      if (e.target.closest('#quickChatCloseBtn') || e.target.classList.contains('quick-chat-modal__backdrop')) {
        closeChat();
        return;
      }

      if (e.target.closest('#quickChatStartBtn')) {
        setChatTab('conversation');
        return;
      }

      if (e.target.closest('#quickChatNewInquiryBtn')) {
        openThread();
        return;
      }

      if (e.target.closest('#quickChatBackBtn')) {
        closeThread();
        return;
      }

      const tabBtn = e.target.closest('[data-chat-tab]');
      if (tabBtn) {
        setChatTab(tabBtn.dataset.chatTab);
      }
    });

    document.addEventListener('click', (e) => {
      if (!state.chat.open) return;
      if (e.target.closest('#quickChatModal') || e.target.closest('#quickChatBtn')) return;
      closeChat();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.chat.open) {
        closeChat();
      }
    });
  }

  function initQuick() {
    renderQuickMenu();
    renderChatModal();
    bindQuickTop();
    bindChatEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuick, { once: true });
  } else {
    initQuick();
  }
})();

