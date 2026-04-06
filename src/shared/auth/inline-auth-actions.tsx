'use client';

import { requestInlineLogin, requestInlineRegister } from './client-events';

type InlineAuthActionsProps = {
  className?: string;
  loginClassName?: string;
  registerClassName?: string;
  loginLabel?: string;
  registerLabel?: string;
};

export function InlineAuthActions({
  className,
  loginClassName,
  registerClassName,
  loginLabel = 'Войти',
  registerLabel = 'Регистрация',
}: InlineAuthActionsProps) {
  return (
    <div className={className}>
      <button type="button" className={loginClassName} onClick={requestInlineLogin}>
        {loginLabel}
      </button>
      <button type="button" className={registerClassName} onClick={requestInlineRegister}>
        {registerLabel}
      </button>
    </div>
  );
}
