'use client';

import { useEffect, useState } from 'react';
import type {
  BattleHistoryPage,
  BattleHistoryRecord,
} from '@/entities/battle-cat';
import { fetchBattleHistoryPage } from '@/entities/battle-cat/api';
import { ToggleFavoriteButton } from '@/features/toggle-favorite';
import { toHttpCatError } from '@/shared/lib/http-cat';
import { ImageViewer } from '@/shared/ui/image-viewer';
import { ImagePreview } from '@/shared/ui/image-preview';
import styles from './battle-history.module.css';

const HISTORY_LIMIT = 10;
const GLOBAL_POLLING_MS = 15_000;

type BattleHistoryScope = 'global' | 'mine';

type BattleHistoryProps = {
  initialGlobalHistory: BattleHistoryPage;
  initialPrivateHistory: BattleHistoryPage | null;
  isAuthenticated: boolean;
  localEntries: BattleHistoryRecord[];
};

type HistoryPairImage = {
  id: string;
  imageUrl: string;
  alt: string;
};

type ActiveHistoryPair = {
  images: [HistoryPairImage, HistoryPairImage];
  activeIndex: number;
};

function formatBattleDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function prependEntries(
  page: BattleHistoryPage,
  entries: BattleHistoryRecord[],
): BattleHistoryPage {
  if (entries.length === 0) {
    return page;
  }

  const nextItems = [...entries, ...page.items].filter(
    (entry, index, items) =>
      items.findIndex((item) => item.id === entry.id) === index,
  );

  return {
    ...page,
    items: nextItems.slice(0, page.limit),
    hasNext: page.hasNext || nextItems.length > page.limit,
  };
}

function toHistoryPair(entry: BattleHistoryRecord): ActiveHistoryPair['images'] {
  return [
    {
      id: entry.winnerId,
      imageUrl: entry.winnerImageUrl,
      alt: 'Победитель битвы',
    },
    {
      id: entry.loserId,
      imageUrl: entry.loserImageUrl,
      alt: 'Проигравший битвы',
    },
  ];
}

function togglePairIndex(pair: ActiveHistoryPair | null) {
  if (!pair) {
    return pair;
  }

  return {
    ...pair,
    activeIndex: pair.activeIndex === 0 ? 1 : 0,
  };
}

export function BattleHistory({
  initialGlobalHistory,
  initialPrivateHistory,
  isAuthenticated,
  localEntries,
}: BattleHistoryProps) {
  const [scope, setScope] = useState<BattleHistoryScope>('global');
  const [globalHistory, setGlobalHistory] = useState(initialGlobalHistory);
  const [privateHistory, setPrivateHistory] = useState<BattleHistoryPage | null>(
    initialPrivateHistory,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [activePair, setActivePair] = useState<ActiveHistoryPair | null>(null);
  const displayedGlobalHistory =
    globalHistory.offset === 0
      ? prependEntries(globalHistory, localEntries)
      : globalHistory;
  const displayedPrivateHistory =
    privateHistory?.offset === 0
      ? prependEntries(privateHistory, localEntries)
      : privateHistory;
  const currentPage =
    scope === 'global' ? displayedGlobalHistory : displayedPrivateHistory;

  async function loadHistory(nextScope: BattleHistoryScope, nextOffset: number) {
    if (nextScope === 'mine' && !isAuthenticated) {
      setScope('mine');
      return;
    }

    try {
      setIsLoading(true);
      setErrorStatus(null);
      const page = await fetchBattleHistoryPage({
        scope: nextScope,
        offset: nextOffset,
        limit: HISTORY_LIMIT,
      });

      if (nextScope === 'global') {
        setGlobalHistory(page);
      } else {
        setPrivateHistory(page);
      }

      setScope(nextScope);
    } catch (error) {
      console.error('Failed to load battle history', error);
      setErrorStatus(toHttpCatError(error).status);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (scope !== 'global' || globalHistory.offset !== 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      void fetchBattleHistoryPage({
        scope: 'global',
        offset: 0,
        limit: HISTORY_LIMIT,
      })
        .then(setGlobalHistory)
        .catch((error) => {
          console.error('Failed to refresh global battle history', error);
        });
    }, GLOBAL_POLLING_MS);

    return () => window.clearInterval(intervalId);
  }, [globalHistory.offset, scope]);

  useEffect(() => {
    if (!activePair) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActivePair(null);
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        setActivePair(togglePairIndex);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePair]);

  return (
    <section className="paper-panel">
      <div className="panel-header">
        <h2>История битв</h2>
        <p>{isLoading ? 'Обновляем...' : 'Последние десять боёв'}</p>
      </div>

      <div className={styles.body}>
        <div className={styles.tabs} aria-label="Переключение истории битв">
          <button
            type="button"
            className={scope === 'global' ? styles.activeTab : styles.tab}
            onClick={() => void loadHistory('global', globalHistory.offset)}
          >
            Общая
          </button>
          <button
            type="button"
            className={scope === 'mine' ? styles.activeTab : styles.tab}
            onClick={() => void loadHistory('mine', privateHistory?.offset ?? 0)}
          >
            Моя
          </button>
        </div>

        {scope === 'mine' && !isAuthenticated ? (
          <p className={styles.empty}>
            Войди в аккаунт, чтобы увидеть свою историю битв.
          </p>
        ) : null}

        {errorStatus ? (
          <p className={styles.empty}>
            Не удалось загрузить историю. Код: {errorStatus}
          </p>
        ) : null}

        {currentPage && currentPage.items.length > 0 ? (
          <ol className={styles.list}>
            {currentPage.items.map((entry) => (
              <li key={entry.id} className={styles.item}>
                <span className={styles.date}>{formatBattleDate(entry.createdAt)}</span>
                <span className={styles.matchup}>
                  <ImagePreview
                    src={entry.winnerImageUrl}
                    alt="Победитель"
                    className={styles.catPreview}
                    renderAs="button"
                    sizes="96px"
                    onOpen={() =>
                      setActivePair({
                        activeIndex: 0,
                        images: toHistoryPair(entry),
                      })
                    }
                  />
                  <span className={styles.result}>победил</span>
                  <ImagePreview
                    src={entry.loserImageUrl}
                    alt="Проигравший"
                    className={styles.catPreview}
                    renderAs="button"
                    sizes="96px"
                    onOpen={() =>
                      setActivePair({
                        activeIndex: 1,
                        images: toHistoryPair(entry),
                      })
                    }
                  />
                </span>
              </li>
            ))}
          </ol>
        ) : null}

        {currentPage &&
        currentPage.items.length === 0 &&
        !(scope === 'mine' && !isAuthenticated) ? (
          <p className={styles.empty}>История пока пустая.</p>
        ) : null}

        {currentPage ? (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageButton}
              onClick={() =>
                void loadHistory(scope, Math.max(0, currentPage.offset - HISTORY_LIMIT))
              }
              disabled={
                isLoading ||
                currentPage.offset === 0 ||
                (scope === 'mine' && !isAuthenticated)
              }
            >
              Назад на 10
            </button>
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => void loadHistory(scope, currentPage.offset + HISTORY_LIMIT)}
              disabled={
                isLoading ||
                !currentPage.hasNext ||
                (scope === 'mine' && !isAuthenticated)
              }
            >
              Вперёд на 10
            </button>
          </div>
        ) : null}
      </div>

      {activePair ? (
        <ImageViewer
          src={activePair.images[activePair.activeIndex].imageUrl}
          alt={activePair.images[activePair.activeIndex].alt}
          ariaLabel="Просмотр котика из истории битв"
          hasMultiple
          onClose={() => setActivePair(null)}
          onPrevious={() => setActivePair(togglePairIndex)}
          onNext={() => setActivePair(togglePairIndex)}
          imageAction={(
            <div className={styles.viewerFavorite}>
              <ToggleFavoriteButton
                id={activePair.images[activePair.activeIndex].id}
                imageUrl={activePair.images[activePair.activeIndex].imageUrl}
                isAuthenticated={isAuthenticated}
                showOnHover={false}
              />
            </div>
          )}
        />
      ) : null}
    </section>
  );
}
