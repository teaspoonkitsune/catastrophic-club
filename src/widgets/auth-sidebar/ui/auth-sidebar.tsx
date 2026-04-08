'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { AuthSession } from '@/shared/auth';
import {
  ACCOUNT_PANEL_ID,
  FOCUS_INLINE_LOGIN_EVENT,
  OPEN_INLINE_REGISTER_EVENT,
} from '@/shared/auth/client-events';
import { useI18n } from '@/shared/i18n';
import { PaperPanel, SidebarEyebrow } from '@/shared/ui/page-surface';
import styles from './auth-sidebar.module.css';

type AuthSidebarProps = {
  session?: AuthSession | null;
  currentPath?: string;
};

type ApiErrorResponse = {
  error?: string;
};

async function readError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return payload.error ?? fallback;
  } catch {
    return fallback;
  }
}

function shouldUseSidebarAuth() {
  return !window.matchMedia('(max-width: 800px)').matches;
}

export function AuthSidebar({ session = null, currentPath }: AuthSidebarProps) {
  const { messages } = useI18n();
  const pathname = usePathname();
  const returnPath = currentPath ?? pathname ?? '/';
  const loginInputRef = useRef<HTMLInputElement>(null);
  const [loginValue, setLoginValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    function focusLoginField() {
      if (!shouldUseSidebarAuth()) {
        return;
      }

      setIsRegisterOpen(false);
      window.setTimeout(() => loginInputRef.current?.focus(), 40);
    }

    function openRegisterModal() {
      if (!shouldUseSidebarAuth()) {
        return;
      }

      setIsRegisterOpen(true);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsRegisterOpen(false);
      }
    }

    window.addEventListener(FOCUS_INLINE_LOGIN_EVENT, focusLoginField);
    window.addEventListener(OPEN_INLINE_REGISTER_EVENT, openRegisterModal);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener(FOCUS_INLINE_LOGIN_EVENT, focusLoginField);
      window.removeEventListener(OPEN_INLINE_REGISTER_EVENT, openRegisterModal);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!loginValue.trim() || !passwordValue) {
      setLoginError(messages.auth.errors.enterCredentials);
      return;
    }

    try {
      setIsLoggingIn(true);
      setLoginError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginValue.trim(),
          password: passwordValue,
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        setLoginError(await readError(response, messages.auth.errors.loginFailed));
        return;
      }

      window.location.reload();
    } catch {
      setLoginError(messages.auth.errors.loginFailed);
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!registerEmail.trim() || !registerPassword) {
      setRegisterError(messages.auth.errors.fillEmailPassword);
      return;
    }

    try {
      setIsRegistering(true);
      setRegisterError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerName.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        setRegisterError(await readError(response, messages.auth.errors.registerFailed));
        return;
      }

      window.location.reload();
    } catch {
      setRegisterError(messages.auth.errors.registerFailed);
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        cache: 'no-store',
      });

      if (!response.ok) {
        return;
      }

      window.location.href = returnPath;
    } catch {
      window.location.reload();
    }
  }

  return (
    <>
      <PaperPanel
        id={ACCOUNT_PANEL_ID}
        className={styles.accountPanel}
        inset
      >
        <SidebarEyebrow>{messages.auth.account}</SidebarEyebrow>

        {session ? (
          <div className={styles.loggedInBlock}>
            <p className={styles.loggedInLabel}>{messages.auth.loggedInAs}</p>
            <p className={styles.loggedInValue}>{session.user.name ?? session.user.email}</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleLogout}
            >
              {messages.auth.logout}
            </button>
          </div>
        ) : (
          <>
            <form
              className={styles.form}
              onSubmit={handleLoginSubmit}
            >
              <label className={styles.label}>
                {messages.auth.emailOrLogin}
                <input
                  ref={loginInputRef}
                  className={styles.input}
                  value={loginValue}
                  onChange={(event) => setLoginValue(event.target.value)}
                  autoComplete="username"
                  name="username"
                />
              </label>

              <label className={styles.label}>
                {messages.auth.password}
                <input
                  className={styles.input}
                  type="password"
                  value={passwordValue}
                  onChange={(event) => setPasswordValue(event.target.value)}
                  autoComplete="current-password"
                  name="password"
                />
              </label>

              {loginError ? <p className={styles.errorText}>{loginError}</p> : null}

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? messages.common.loading : messages.auth.login}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setIsRegisterOpen(true)}
                >
                  {messages.auth.register}
                </button>
              </div>
            </form>

            <p className={styles.helperText}>
              {messages.auth.helper}
            </p>
          </>
        )}
      </PaperPanel>

      {isRegisterOpen ? (
        <div
          className={styles.overlay}
          data-modal-overlay="true"
          role="presentation"
          onClick={() => setIsRegisterOpen(false)}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <p className={styles.modalEyebrow}>{messages.auth.account}</p>
            <h2 className={styles.modalTitle}>{messages.auth.createAccount}</h2>

            <form
              className={styles.form}
              onSubmit={handleRegisterSubmit}
            >
              <label className={styles.label}>
                {messages.auth.name}
                <input
                  className={styles.input}
                  value={registerName}
                  onChange={(event) => setRegisterName(event.target.value)}
                  autoComplete="name"
                  name="name"
                />
              </label>

              <label className={styles.label}>
                {messages.auth.email}
                <input
                  className={styles.input}
                  type="email"
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  autoComplete="email"
                  name="email"
                />
              </label>

              <label className={styles.label}>
                {messages.auth.password}
                <input
                  className={styles.input}
                  type="password"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  autoComplete="new-password"
                  name="password"
                />
              </label>

              {registerError ? <p className={styles.errorText}>{registerError}</p> : null}

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={isRegistering}
                >
                  {isRegistering ? messages.common.loading : messages.auth.createAccount}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setIsRegisterOpen(false)}
                >
                  {messages.auth.close}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
