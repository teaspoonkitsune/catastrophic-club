'use client';

import { useEffect, useState } from 'react';
import { toHttpCatError } from '@/shared/lib/http-cat';
import { HttpCatErrorState } from '@/shared/ui/http-cat-error';
import { ImageViewer } from '@/shared/ui/image-viewer';
import type { BattleCatRecord, BattleHistoryRecord } from '@/entities/battle-cat';
import { BattleCatCard } from '@/entities/battle-cat';
import { submitBattleResult } from '@/entities/battle-cat/api';
import styles from './cat-battle-arena.module.css';

type CatBattleArenaProps = {
  initialPair: BattleCatRecord[];
  isAuthenticated?: boolean;
  onHistoryEntry?: (entry: BattleHistoryRecord) => void;
};

export function CatBattleArena({
  initialPair,
  isAuthenticated = false,
  onHistoryEntry,
}: CatBattleArenaProps) {
  const [pair, setPair] = useState(initialPair);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const galleryItems = pair.map((cat) => cat.imageUrl);
  const hasMultipleImages = galleryItems.length > 1;
  const activeImageSrc = activeImageIndex === null ? null : galleryItems[activeImageIndex] ?? null;

  useEffect(() => {
    if (activeImageIndex === null) {
      return;
    }

    const body = document.body;
    const originalOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveImageIndex(null);
        return;
      }

      if (hasMultipleImages && event.key === 'ArrowLeft') {
        event.preventDefault();
        setActiveImageIndex((current) => {
          if (current === null) {
            return current;
          }

          return current === 0 ? galleryItems.length - 1 : current - 1;
        });
        return;
      }

      if (hasMultipleImages && event.key === 'ArrowRight') {
        event.preventDefault();
        setActiveImageIndex((current) => {
          if (current === null) {
            return current;
          }

          return current === galleryItems.length - 1 ? 0 : current + 1;
        });
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeImageIndex, galleryItems.length, hasMultipleImages]);

  async function handleVote(winnerId: string) {
    if (!isAuthenticated) {
      return;
    }

    const loser = pair.find((cat) => cat.id !== winnerId);

    if (!loser) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorStatus(null);
      const result = await submitBattleResult({
        winnerId,
        loserId: loser.id,
      });
      setPair(result.pair);

      if (result.historyEntry) {
        onHistoryEntry?.(result.historyEntry);
      }
    } catch (error) {
      console.error('Failed to submit battle result', error);
      setErrorStatus(toHttpCatError(error).status);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (errorStatus) {
    return (
      <HttpCatErrorState
        status={errorStatus}
        title="Бой котиков временно недоступен"
        description="Не удалось сохранить результат боя или загрузить новую пару."
        actionLabel="Скрыть"
        onAction={() => setErrorStatus(null)}
      />
    );
  }

  if (pair.length < 2) {
    return <p>Для битвы пока не хватает котиков в базе.</p>;
  }

  return (
    <>
      <section className={styles.wrapper}>
        <BattleCatCard
          cat={pair[0]}
          galleryItems={galleryItems}
          onImageOpen={() => setActiveImageIndex(0)}
          onVote={handleVote}
          disabled={isSubmitting}
          isAuthenticated={isAuthenticated}
        />

        <div className={styles.versus}>
          <div className={styles.versusBadge}>VS</div>
        </div>

        <BattleCatCard
          cat={pair[1]}
          galleryItems={galleryItems}
          onImageOpen={() => setActiveImageIndex(1)}
          onVote={handleVote}
          disabled={isSubmitting}
          isAuthenticated={isAuthenticated}
        />
      </section>

      {activeImageSrc ? (
        <ImageViewer
          src={activeImageSrc}
          alt="Котик для битвы"
          ariaLabel="Просмотр котика для битвы"
          hasMultiple={hasMultipleImages}
          onClose={() => setActiveImageIndex(null)}
          onPrevious={() => setActiveImageIndex((current) => {
            if (current === null) {
              return current;
            }

            return current === 0 ? galleryItems.length - 1 : current - 1;
          })}
          onNext={() => setActiveImageIndex((current) => {
            if (current === null) {
              return current;
            }

            return current === galleryItems.length - 1 ? 0 : current + 1;
          })}
        />
      ) : null}
    </>
  );
}
