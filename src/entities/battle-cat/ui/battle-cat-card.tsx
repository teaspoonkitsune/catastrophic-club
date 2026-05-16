'use client';

import type { ReactNode } from 'react';
import { useI18n } from '@/shared/i18n';
import { GalleryImage } from '@/shared/ui/gallery-image';
import type { BattleCatRecord } from '../model/types';
import styles from './battle-cat-card.module.css';

type BattleCatCardProps = {
  cat: BattleCatRecord;
  galleryItems?: string[];
  onImageOpen?: () => void;
  onVote: (id: string) => void;
  actionSlot?: ReactNode;
  disabled?: boolean;
  isAuthenticated?: boolean;
};

export function BattleCatCard({
  cat,
  galleryItems,
  onImageOpen,
  onVote,
  actionSlot,
  disabled = false,
  isAuthenticated = false,
}: BattleCatCardProps) {
  const { messages } = useI18n();

  return (
    <article className={styles.card}>
      <GalleryImage
        src={cat.imageUrl}
        alt={messages.battles.battleImageAlt}
        previewSize="full"
        galleryItems={galleryItems}
        loading="eager"
        fetchPriority="high"
        onOpen={onImageOpen}
      >
        {actionSlot}
      </GalleryImage>

      <div className={styles.footer}>
        <p className={styles.score}>{messages.leaderboard.table.score}: {cat.score}</p>
        <button
          type="button"
          className={styles.voteButton}
          onClick={() => onVote(cat.id)}
          disabled={disabled || !isAuthenticated}
        >
          {isAuthenticated ? messages.battles.voteButton : messages.battles.loginToVote}
        </button>
      </div>
    </article>
  );
}
