import Link from 'next/link';
import { getMessages } from '@/shared/i18n';
import { getRequestLocale } from '@/shared/i18n/server';
import styles from './battle-leaderboard-pager.module.css';

type BattleLeaderboardPagerProps = {
  hasNext: boolean;
  limit: number;
  offset: number;
};

function getLeaderboardHref(offset: number) {
  return offset > 0 ? '/leaderboard?offset=' + offset : '/leaderboard';
}

export async function BattleLeaderboardPager({
  hasNext,
  limit,
  offset,
}: BattleLeaderboardPagerProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const previousOffset = Math.max(0, offset - limit);
  const nextOffset = offset + limit;

  return (
    <nav className={styles.pager} aria-label={messages.leaderboard.pagerAria}>
      {offset > 0 ? (
        <Link className={styles.link} href={getLeaderboardHref(previousOffset)} scroll={false}>
          {messages.common.back}
        </Link>
      ) : (
        <span className={styles.disabledLink} aria-disabled="true">
          {messages.common.back}
        </span>
      )}

      {hasNext ? (
        <Link className={styles.link} href={getLeaderboardHref(nextOffset)} scroll={false}>
          {messages.common.next}
        </Link>
      ) : (
        <span className={styles.disabledLink} aria-disabled="true">
          {messages.common.next}
        </span>
      )}
    </nav>
  );
}
