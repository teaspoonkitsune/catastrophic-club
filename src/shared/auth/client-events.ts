export const ACCOUNT_PANEL_ID = 'account-panel';
export const OPEN_INLINE_REGISTER_EVENT = 'catastrophic-club:open-inline-register';
export const FOCUS_INLINE_LOGIN_EVENT = 'catastrophic-club:focus-inline-login';

function scrollToAccountPanel() {
  if (typeof document === 'undefined') {
    return;
  }

  document.getElementById(ACCOUNT_PANEL_ID)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function requestInlineLogin() {
  if (typeof window === 'undefined') {
    return;
  }

  scrollToAccountPanel();
  window.dispatchEvent(new CustomEvent(FOCUS_INLINE_LOGIN_EVENT));
}

export function requestInlineRegister() {
  if (typeof window === 'undefined') {
    return;
  }

  scrollToAccountPanel();
  window.dispatchEvent(new CustomEvent(OPEN_INLINE_REGISTER_EVENT));
}
