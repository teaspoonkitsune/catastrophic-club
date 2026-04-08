'use client';

import { useEffect, useState } from 'react';
import type {
  BattleHistoryPage,
  BattleHistoryRecord,
} from '@/entities/battle-cat';
import { fetchBattleHistoryPage } from '@/entities/battle-cat/api';
import { toHttpCatError } from '@/shared/lib/http-cat';
import { ImagePreview } from '@/shared/ui/image-preview';
import { BattleHistoryViewerModal } from './battle-history-viewer-modal';
import { PanelHeader, PaperPanel } from '@/shared/ui/page-surface';
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
  // Merge just-submitted local votes with the server page until polling catches up.
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

function toHistoryPair(entry: BattleHistoryRecord): HistoryPairImage[] {
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

function toHistoryImages(entries: BattleHistoryRecord[]) {
  return entries.flatMap(toHistoryPair);
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
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
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
  const currentHistoryImages = currentPage ? toHistoryImages(currentPage.items) : [];
  const activeHistoryImage =
    activeImageIndex === null ? null : currentHistoryImages[activeImageIndex] ?? null;

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

    // Only poll the first global page; paginated and private views are user-driven.
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

  function openViewer(entryIndex: number, imageIndex: number) {
    const nextActiveIndex = entryIndex * 2 + imageIndex;

    if (!currentHistoryImages[nextActiveIndex]) {
      return;
    }

    setActiveImageIndex(nextActiveIndex);
  }

  function closeViewer() {
    setActiveImageIndex(null);
  }

  function showPreviousImage() {
    setActiveImageIndex((current) => {
      if (current === null || currentHistoryImages.length === 0) {
        return current;
      }

      return current === 0 ? currentHistoryImages.length - 1 : current - 1;
    });
  }

  function showNextImage() {
    setActiveImageIndex((current) => {
      if (current === null || currentHistoryImages.length === 0) {
        return current;
      }

      return current === currentHistoryImages.length - 1 ? 0 : current + 1;
    });
  }

  return (
    <PaperPanel>
      <PanelHeader>
        <h2>История битв</h2>
        <p>{isLoading ? 'Обновляем...' : 'Последние десять боёв'}</p>
      </PanelHeader>

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
            {currentPage.items.map((entry, entryIndex) => (
              <li key={entry.id} className={styles.item}>
                <span className={styles.date}>{formatBattleDate(entry.createdAt)}</span>
                <span className={styles.matchup}>
                  <ImagePreview
                    src={entry.winnerImageUrl}
                    alt="Победитель"
                    className={styles.catPreview}
                    renderAs="button"
                    sizes="96px"
                    onOpen={() => openViewer(entryIndex, 0)}
                  />
                  <span className={styles.result}>победил</span>
                  <ImagePreview
                    src={entry.loserImageUrl}
                    alt="Проигравший"
                    className={styles.catPreview}
                    renderAs="button"
                    sizes="96px"
                    onOpen={() => openViewer(entryIndex, 1)}
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

      {activeHistoryImage ? (
        <BattleHistoryViewerModal
          images={currentHistoryImages}
          activeIndex={activeImageIndex ?? 0}
          isAuthenticated={isAuthenticated}
          onClose={closeViewer}
          onPrevious={showPreviousImage}
          onNext={showNextImage}
        />
      ) : null}
    </PaperPanel>
  );
}
