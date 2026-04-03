'use client';

import { useState } from 'react';
import { toHttpCatError } from '@/shared/lib/http-cat';
import { HttpCatErrorState } from '@/shared/ui/http-cat-error';
import type { BattleCatRecord } from '@/entities/battle-cat';
import { BattleCatCard } from '@/entities/battle-cat';
import { submitBattleResult } from '@/entities/battle-cat/api';
import styles from './cat-battle-arena.module.css';

type CatBattleArenaProps = {
  initialPair: BattleCatRecord[];
  isAuthenticated?: boolean;
};

export function CatBattleArena({
  initialPair,
  isAuthenticated = false,
}: CatBattleArenaProps) {
  const [pair, setPair] = useState(initialPair);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  async function handleVote(winnerId: string) {
    const loser = pair.find((cat) => cat.id !== winnerId);

    if (!loser) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorStatus(null);
      const nextPair = await submitBattleResult({
        winnerId,
        loserId: loser.id,
      });
      setPair(nextPair);
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
    <section className={styles.wrapper}>
      <BattleCatCard
        cat={pair[0]}
        onVote={handleVote}
        disabled={isSubmitting}
        isAuthenticated={isAuthenticated}
      />

      <div className={styles.versus}>
        <div className={styles.versusBadge}>VS</div>
        <p className={styles.versusHint}>Позже тут можно поставить картинку.</p>
      </div>

      <BattleCatCard
        cat={pair[1]}
        onVote={handleVote}
        disabled={isSubmitting}
        isAuthenticated={isAuthenticated}
      />
    </section>
  );
}
