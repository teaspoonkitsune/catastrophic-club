'use client';

import { useState } from 'react';
import { ToggleFavoriteButton } from '@/features/toggle-favorite';
import type { BattleCatRecord } from '@/entities/battle-cat';
import { useI18n } from '@/shared/i18n';
import { ImagePreview } from '@/shared/ui/image-preview';
import { ImageViewer } from '@/shared/ui/image-viewer';
import styles from './battle-leaderboard-table.module.css';

type BattleLeaderboardTableProps = {
  cats: BattleCatRecord[];
  isAuthenticated?: boolean;
  rankOffset?: number;
};

export function BattleLeaderboardTable({
  cats,
  isAuthenticated = false,
  rankOffset = 0,
}: BattleLeaderboardTableProps) {
  const { messages } = useI18n();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeCat = activeIndex === null ? null : cats[activeIndex] ?? null;

  function closeViewer() {
    setActiveIndex(null);
  }

  function showPrevious() {
    setActiveIndex((current) => {
      if (current === null) {
        return current;
      }

      return current === 0 ? cats.length - 1 : current - 1;
    });
  }

  function showNext() {
    setActiveIndex((current) => {
      if (current === null) {
        return current;
      }

      return current === cats.length - 1 ? 0 : current + 1;
    });
  }

  if (cats.length === 0) {
    return (
      <p className={styles.empty}>
        {messages.leaderboard.empty}
      </p>
    );
  }

  return (
    <>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>{messages.leaderboard.table.photo}</th>
              <th>{messages.leaderboard.table.score}</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((cat, index) => (
              <tr key={cat.id}>
                <td className={styles.rank} data-label="#">
                  <span className={styles.rankBadge}>{rankOffset + index + 1}</span>
                </td>
                <td className={styles.photoCell} data-label={messages.leaderboard.table.photo}>
                  <div className={styles.imageCell}>
                    <ImagePreview
                      className={styles.preview}
                      src={cat.imageUrl}
                      alt={`${messages.leaderboard.table.viewerAlt} ${index + 1}`}
                      aspectRatio="4 / 3"
                      renderAs="button"
                      onOpen={() => setActiveIndex(index)}
                    />
                  </div>
                </td>
                <td className={styles.score} data-label={messages.leaderboard.table.score}>
                  <span className={styles.scoreValue}>{cat.score}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeCat ? (
        <ImageViewer
          src={activeCat.imageUrl}
          alt={messages.leaderboard.table.viewerAlt}
          ariaLabel={messages.leaderboard.table.viewerAria}
          hasMultiple={cats.length > 1}
          imageAction={(
            <ToggleFavoriteButton
              id={activeCat.id}
              imageUrl={activeCat.imageUrl}
              size="sm"
              showOnHover={false}
              isAuthenticated={isAuthenticated}
            />
          )}
          onClose={closeViewer}
          onPrevious={showPrevious}
          onNext={showNext}
        />
      ) : null}
    </>
  );
}
