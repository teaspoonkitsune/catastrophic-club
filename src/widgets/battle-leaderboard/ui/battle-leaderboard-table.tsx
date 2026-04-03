import { ToggleFavoriteButton } from '@/features/toggle-favorite';
import type { BattleCatRecord } from '@/entities/battle-cat';
import { ZoomableImage } from '@/shared/ui/zoomable-image';
import styles from './battle-leaderboard-table.module.css';

type BattleLeaderboardTableProps = {
  cats: BattleCatRecord[];
  isAuthenticated?: boolean;
};

export function BattleLeaderboardTable({
  cats,
  isAuthenticated = false,
}: BattleLeaderboardTableProps) {
  if (cats.length === 0) {
    return (
      <p className={styles.empty}>
        Пока нет котиков с очками. Проведи несколько боёв, и рейтинг заполнится.
      </p>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Котик</th>
            <th>Ссылка</th>
            <th>Очки</th>
          </tr>
        </thead>
        <tbody>
          {cats.map((cat, index) => (
            <tr key={cat.id}>
              <td className={styles.rank}>{index + 1}</td>
              <td>
                <div className={styles.imageCell}>
                  <ZoomableImage
                    src={cat.imageUrl}
                    alt={`Leaderboard cat ${index + 1}`}
                    previewSize="full"
                    previewAspectRatio="4 / 3"
                  >
                    <ToggleFavoriteButton
                      id={cat.id}
                      imageUrl={cat.imageUrl}
                      size="sm"
                      isAuthenticated={isAuthenticated}
                    />
                  </ZoomableImage>
                </div>
              </td>
              <td>
                <a className={styles.link} href={cat.imageUrl} target="_blank" rel="noreferrer">
                  Открыть
                </a>
              </td>
              <td className={styles.score}>{cat.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
