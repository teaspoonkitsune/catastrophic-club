'use client';

import { useEffect, useState } from 'react';
import type { AuthSession } from '@/shared/auth';
import { FOCUS_INLINE_LOGIN_EVENT, OPEN_INLINE_REGISTER_EVENT } from '@/shared/auth/client-events';
import styles from './mobile-auth-panel.module.css';

type MobileAuthPanelProps = {
  session?: AuthSession | null;
  currentPath?: string;
};

type ApiErrorResponse = {
  error?: string;
};

type AuthMode = 'login' | 'register';

async function readError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return payload.error ?? fallback;
  } catch {
    return fallback;
  }
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 800px)').matches;
}

export function MobileAuthPanel({ session = null, currentPath = '/' }: MobileAuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isOpen, setIsOpen] = useState(false);
  const [loginValue, setLoginValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function openLogin() {
      if (!isMobileViewport()) {
        return;
      }

      setError(null);
      setMode('login');
      setIsOpen(true);
    }

    function openRegister() {
      if (!isMobileViewport()) {
        return;
      }

      setError(null);
      setMode('register');
      setIsOpen(true);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener(FOCUS_INLINE_LOGIN_EVENT, openLogin);
    window.addEventListener(OPEN_INLINE_REGISTER_EVENT, openRegister);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener(FOCUS_INLINE_LOGIN_EVENT, openLogin);
      window.removeEventListener(OPEN_INLINE_REGISTER_EVENT, openRegister);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!loginValue.trim() || !passwordValue) {
      setError('Введите логин и пароль.');
      return;
    }

    try {
      setIsLoggingIn(true);
      setError(null);

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
        setError(await readError(response, 'Не удалось войти в аккаунт.'));
        return;
      }

      window.location.reload();
    } catch {
      setError('Не удалось войти в аккаунт.');
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!registerEmail.trim() || !registerPassword) {
      setError('Заполни email и пароль.');
      return;
    }

    try {
      setIsRegistering(true);
      setError(null);

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
        setError(await readError(response, 'Не удалось создать аккаунт.'));
        return;
      }

      window.location.reload();
    } catch {
      setError('Не удалось создать аккаунт.');
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

      window.location.href = currentPath || '/';
    } catch {
      window.location.reload();
    }
  }

  function openMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setIsOpen(true);
  }

  return (
    <div className={styles.mobileAuth}>
      {session ? (
        <>
          <span className={styles.accountLabel}>Ты вошёл как {session.user.name ?? session.user.email}</span>
          <button type="button" className={styles.authButton} onClick={handleLogout}>
            Выйти
          </button>
        </>
      ) : (
        <>
          <button type="button" className={styles.authButton} onClick={() => openMode('login')}>
            Войти
          </button>
          <button type="button" className={styles.authButtonAlt} onClick={() => openMode('register')}>
            Регистрация
          </button>
        </>
      )}

      {isOpen ? (
        <div
          className={styles.overlay}
          data-modal-overlay="true"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <p className={styles.modalEyebrow}>аккаунт</p>
              <button type="button" className={styles.closeButton} onClick={() => setIsOpen(false)}>
                x
              </button>
            </div>

            <h2 className={styles.modalTitle}>{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</h2>

            <div className={styles.modeTabs} aria-label="Выбор действия">
              <button
                type="button"
                className={styles.modeTab}
                data-active={mode === 'login' ? 'true' : 'false'}
                onClick={() => openMode('login')}
              >
                Вход
              </button>
              <button
                type="button"
                className={styles.modeTab}
                data-active={mode === 'register' ? 'true' : 'false'}
                onClick={() => openMode('register')}
              >
                Регистрация
              </button>
            </div>

            {mode === 'login' ? (
              <form className={styles.form} onSubmit={handleLoginSubmit}>
                <label className={styles.label}>
                  Email или логин
                  <input
                    className={styles.input}
                    value={loginValue}
                    onChange={(event) => setLoginValue(event.target.value)}
                    autoComplete="username"
                    name="username"
                  />
                </label>

                <label className={styles.label}>
                  Пароль
                  <input
                    className={styles.input}
                    type="password"
                    value={passwordValue}
                    onChange={(event) => setPasswordValue(event.target.value)}
                    autoComplete="current-password"
                    name="password"
                  />
                </label>

                {error ? <p className={styles.errorText}>{error}</p> : null}

                <div className={styles.actions}>
                  <button type="submit" className={styles.primaryButton} disabled={isLoggingIn}>
                    {isLoggingIn ? 'Входим...' : 'Войти'}
                  </button>
                  <button type="button" className={styles.secondaryButton} onClick={() => openMode('register')}>
                    Регистрация
                  </button>
                </div>
              </form>
            ) : (
              <form className={styles.form} onSubmit={handleRegisterSubmit}>
                <label className={styles.label}>
                  Имя
                  <input
                    className={styles.input}
                    value={registerName}
                    onChange={(event) => setRegisterName(event.target.value)}
                    autoComplete="name"
                    name="name"
                  />
                </label>

                <label className={styles.label}>
                  Email
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
                  Пароль
                  <input
                    className={styles.input}
                    type="password"
                    value={registerPassword}
                    onChange={(event) => setRegisterPassword(event.target.value)}
                    autoComplete="new-password"
                    name="password"
                  />
                </label>

                {error ? <p className={styles.errorText}>{error}</p> : null}

                <div className={styles.actions}>
                  <button type="submit" className={styles.primaryButton} disabled={isRegistering}>
                    {isRegistering ? 'Создаём...' : 'Создать аккаунт'}
                  </button>
                  <button type="button" className={styles.secondaryButton} onClick={() => openMode('login')}>
                    Уже есть аккаунт
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
