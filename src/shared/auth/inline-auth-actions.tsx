'use client';

import { useI18n } from '@/shared/i18n';
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
  loginLabel,
  registerLabel,
}: InlineAuthActionsProps) {
  const { messages } = useI18n();

  return (
    <div className={className}>
      <button type="button" className={loginClassName} onClick={requestInlineLogin}>
        {loginLabel ?? messages.auth.login}
      </button>
      <button type="button" className={registerClassName} onClick={requestInlineRegister}>
        {registerLabel ?? messages.auth.createAccount}
      </button>
    </div>
  );
}
