'use client';

import { useEffect, useState } from 'react';
import { ToggleFavoriteButton } from '@/features/toggle-favorite';
import { useI18n } from '@/shared/i18n';
import { toHttpCatError } from '@/shared/lib/http-cat';
import { LazyHttpCatErrorState } from '@/shared/ui/http-cat-error';
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
  const { messages } = useI18n();
  const [pair, setPair] = useState(initialPair);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [isDailyLimitReached, setIsDailyLimitReached] = useState(false);
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
      setIsDailyLimitReached(false);
      const result = await submitBattleResult({
        winnerId,
        loserId: loser.id,
      });
      if ('dailyLimitReached' in result) {
        setIsDailyLimitReached(true);
        return;
      }

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
      <LazyHttpCatErrorState
        status={errorStatus}
        title={messages.battles.errorTitle}
        description={messages.battles.errorDescription}
        actionLabel={messages.common.hide}
        onAction={() => setErrorStatus(null)}
      />
    );
  }

  if (pair.length < 2) {
    return <p>{messages.battles.insufficientData}</p>;
  }

  return (
    <>
      {isDailyLimitReached ? (
        <p className={styles.limitNotice}>{messages.battles.dailyLimitReached}</p>
      ) : null}

      <section className={styles.wrapper}>
        <BattleCatCard
          cat={pair[0]}
          galleryItems={galleryItems}
          onImageOpen={() => setActiveImageIndex(0)}
          onVote={handleVote}
          actionSlot={(
            <ToggleFavoriteButton
              id={pair[0].id}
              imageUrl={pair[0].imageUrl}
              isAuthenticated={isAuthenticated}
              loadOnMount={false}
            />
          )}
          disabled={isSubmitting || isDailyLimitReached}
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
          actionSlot={(
            <ToggleFavoriteButton
              id={pair[1].id}
              imageUrl={pair[1].imageUrl}
              isAuthenticated={isAuthenticated}
              loadOnMount={false}
            />
          )}
          disabled={isSubmitting || isDailyLimitReached}
          isAuthenticated={isAuthenticated}
        />
      </section>

      {activeImageSrc ? (
        <ImageViewer
          src={activeImageSrc}
          alt={messages.battles.battleImageAlt}
          ariaLabel={messages.battles.battleViewerAria}
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
