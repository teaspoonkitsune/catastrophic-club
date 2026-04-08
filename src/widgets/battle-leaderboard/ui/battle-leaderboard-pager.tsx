import Link from 'next/link';
import styles from './battle-leaderboard-pager.module.css';

type BattleLeaderboardPagerProps = {
  hasNext: boolean;
  limit: number;
  offset: number;
};

function getLeaderboardHref(offset: number) {
  return offset > 0 ? '/leaderboard?offset=' + offset : '/leaderboard';
}

export function BattleLeaderboardPager({
  hasNext,
  limit,
  offset,
}: BattleLeaderboardPagerProps) {
  const previousOffset = Math.max(0, offset - limit);
  const nextOffset = offset + limit;

  return (
    <nav className={styles.pager} aria-label="Навигация по рейтингу">
      {offset > 0 ? (
        <Link className={styles.link} href={getLeaderboardHref(previousOffset)} scroll={false}>
          Назад
        </Link>
      ) : (
        <span className={styles.disabledLink} aria-disabled="true">
          Назад
        </span>
      )}

      {hasNext ? (
        <Link className={styles.link} href={getLeaderboardHref(nextOffset)} scroll={false}>
          Дальше
        </Link>
      ) : (
        <span className={styles.disabledLink} aria-disabled="true">
          Дальше
        </span>
      )}
    </nav>
  );
}
