'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  BattleHistoryPage,
  BattleHistoryRecord,
} from '@/entities/battle-cat';
import {
  fetchBattleHistoryPage,
  refreshBattleHistoryPage,
} from '@/entities/battle-cat/api';
import { formatDateTime, useI18n } from '@/shared/i18n';
import { toHttpCatError } from '@/shared/lib/http-cat';
import { ImagePreview } from '@/shared/ui/image-preview';
import { BattleHistoryViewerModal } from './battle-history-viewer-modal';
import { PanelHeader, PaperPanel } from '@/shared/ui/page-surface';
import styles from './battle-history.module.css';

const HISTORY_LIMIT = 10;
const GLOBAL_POLLING_MS = 45_000;
const GLOBAL_HISTORY_POLL_LOCK_KEY = 'catastrophic-club:battles:global-history:poll-lock';
const GLOBAL_HISTORY_SNAPSHOT_KEY = 'catastrophic-club:battles:global-history:snapshot';
const GLOBAL_HISTORY_POLL_LOCK_TTL_MS = 10_000;

type BattleHistoryScope = 'global' | 'mine';

type BattleHistoryProps = {
  initialGlobalHistory: BattleHistoryPage;
  initialPrivateHistory: BattleHistoryPage | null;
  isAuthenticated: boolean;
  localEntries: BattleHistoryRecord[];
};

type BattleHistoryPageStack = {
  activeIndex: number;
  pages: BattleHistoryPage[];
};

type HistoryPairImage = {
  id: string;
  imageUrl: string;
  alt: string;
};

type GlobalHistoryPollLock = {
  owner: string;
  expiresAt: number;
};

type GlobalHistorySnapshot = {
  page: BattleHistoryPage;
  updatedAt: number;
};

function readStoredJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function tryAcquireGlobalHistoryPollLock(owner: string) {
  const now = Date.now();
  const current = readStoredJson<GlobalHistoryPollLock>(
    window.localStorage.getItem(GLOBAL_HISTORY_POLL_LOCK_KEY),
  );

  if (current && current.owner !== owner && current.expiresAt > now) {
    return false;
  }

  const nextLock = {
    owner,
    expiresAt: now + GLOBAL_HISTORY_POLL_LOCK_TTL_MS,
  };

  window.localStorage.setItem(
    GLOBAL_HISTORY_POLL_LOCK_KEY,
    JSON.stringify(nextLock),
  );

  const confirmed = readStoredJson<GlobalHistoryPollLock>(
    window.localStorage.getItem(GLOBAL_HISTORY_POLL_LOCK_KEY),
  );

  return confirmed?.owner === owner;
}

function releaseGlobalHistoryPollLock(owner: string) {
  const current = readStoredJson<GlobalHistoryPollLock>(
    window.localStorage.getItem(GLOBAL_HISTORY_POLL_LOCK_KEY),
  );

  if (current?.owner === owner) {
    window.localStorage.removeItem(GLOBAL_HISTORY_POLL_LOCK_KEY);
  }
}

function publishGlobalHistorySnapshot(page: BattleHistoryPage) {
  const snapshot: GlobalHistorySnapshot = {
    page,
    updatedAt: Date.now(),
  };

  window.localStorage.setItem(
    GLOBAL_HISTORY_SNAPSHOT_KEY,
    JSON.stringify(snapshot),
  );
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

function toHistoryPair(entry: BattleHistoryRecord, winnerAlt: string, loserAlt: string): HistoryPairImage[] {
  return [
    {
      id: entry.winnerId,
      imageUrl: entry.winnerImageUrl,
      alt: winnerAlt,
    },
    {
      id: entry.loserId,
      imageUrl: entry.loserImageUrl,
      alt: loserAlt,
    },
  ];
}

function toHistoryImages(entries: BattleHistoryRecord[], winnerAlt: string, loserAlt: string) {
  return entries.flatMap((entry) => toHistoryPair(entry, winnerAlt, loserAlt));
}

export function BattleHistory({
  initialGlobalHistory,
  initialPrivateHistory,
  isAuthenticated,
  localEntries,
}: BattleHistoryProps) {
  const { locale, messages } = useI18n();
  const tabIdRef = useRef(
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `battle-history-${Math.random().toString(36).slice(2)}`,
  );
  const latestSnapshotUpdateRef = useRef(0);
  const [scope, setScope] = useState<BattleHistoryScope>('global');
  const [globalHistory, setGlobalHistory] = useState<BattleHistoryPageStack>({
    activeIndex: 0,
    pages: [initialGlobalHistory],
  });
  const [privateHistory, setPrivateHistory] = useState<BattleHistoryPageStack | null>(
    initialPrivateHistory
      ? {
          activeIndex: 0,
          pages: [initialPrivateHistory],
        }
      : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const currentGlobalPage = globalHistory.pages[globalHistory.activeIndex] ?? initialGlobalHistory;
  const currentPrivatePage = privateHistory
    ? privateHistory.pages[privateHistory.activeIndex] ?? privateHistory.pages[0]
    : null;
  const displayedGlobalHistory =
    globalHistory.activeIndex === 0
      ? prependEntries(currentGlobalPage, localEntries)
      : currentGlobalPage;
  const displayedPrivateHistory =
    privateHistory && privateHistory.activeIndex === 0
      ? prependEntries(currentPrivatePage ?? privateHistory.pages[0], localEntries)
      : currentPrivatePage;
  const currentPage =
    scope === 'global' ? displayedGlobalHistory : displayedPrivateHistory;
  const currentHistoryImages = currentPage
    ? toHistoryImages(currentPage.items, messages.history.winnerAlt, messages.history.loserAlt)
    : [];
  const activeHistoryImage =
    activeImageIndex === null ? null : currentHistoryImages[activeImageIndex] ?? null;

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== GLOBAL_HISTORY_SNAPSHOT_KEY || !event.newValue) {
        return;
      }

      const snapshot = readStoredJson<GlobalHistorySnapshot>(event.newValue);

      if (!snapshot || snapshot.updatedAt <= latestSnapshotUpdateRef.current) {
        return;
      }

      latestSnapshotUpdateRef.current = snapshot.updatedAt;
      setGlobalHistory((current) => {
        const pages = [...current.pages];
        pages[0] = snapshot.page;

        return {
          ...current,
          pages,
        };
      });
    }

    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  async function loadInitialPrivateHistory() {
    try {
      setIsLoading(true);
      setErrorStatus(null);
      const page = await fetchBattleHistoryPage({
        scope: 'mine',
        limit: HISTORY_LIMIT,
      });
      setPrivateHistory({
        activeIndex: 0,
        pages: [page],
      });
      setScope('mine');
    } catch (error) {
      console.error('Failed to load battle history', error);
      setErrorStatus(toHttpCatError(error).status);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (scope !== 'global' || globalHistory.activeIndex !== 0) {
      return;
    }

    const tabId = tabIdRef.current;
    let isRefreshing = false;

    // Only poll the first global page; paginated and private views are user-driven.
    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== 'visible' || isRefreshing) {
        return;
      }

      if (!tryAcquireGlobalHistoryPollLock(tabId)) {
        return;
      }

      isRefreshing = true;

      void refreshBattleHistoryPage({
        scope: 'global',
        headId: displayedGlobalHistory.items[0]?.id ?? null,
        limit: HISTORY_LIMIT,
        })
        .then((result) => {
          if (result.changed) {
            setGlobalHistory((current) => {
              const pages = [...current.pages];
              pages[0] = result.page;

              return {
                ...current,
                pages,
              };
            });
            publishGlobalHistorySnapshot(result.page);
          }
        })
        .catch((error) => {
          console.error('Failed to refresh global battle history', error);
        })
        .finally(() => {
          releaseGlobalHistoryPollLock(tabId);
          isRefreshing = false;
        });
    }, GLOBAL_POLLING_MS);

    return () => {
      window.clearInterval(intervalId);
      releaseGlobalHistoryPollLock(tabId);
    };
  }, [displayedGlobalHistory, globalHistory.activeIndex, scope]);

  async function loadNextPage(nextScope: BattleHistoryScope) {
    if (nextScope === 'mine' && !isAuthenticated) {
      setScope('mine');
      return;
    }

    const currentStack = nextScope === 'global' ? globalHistory : privateHistory;
    const currentLoadedPage = currentStack?.pages[currentStack.activeIndex] ?? null;

    if (!currentLoadedPage?.nextCursor) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorStatus(null);
      const page = await fetchBattleHistoryPage({
        scope: nextScope,
        cursor: currentLoadedPage.nextCursor,
        limit: HISTORY_LIMIT,
      });

      if (nextScope === 'global') {
        setGlobalHistory((current) => ({
          activeIndex: current.activeIndex + 1,
          pages: [...current.pages.slice(0, current.activeIndex + 1), page],
        }));
      } else {
        setPrivateHistory((current) => {
          if (!current) {
            return {
              activeIndex: 0,
              pages: [page],
            };
          }

          return {
            activeIndex: current.activeIndex + 1,
            pages: [...current.pages.slice(0, current.activeIndex + 1), page],
          };
        });
      }

      setScope(nextScope);
    } catch (error) {
      console.error('Failed to load battle history', error);
      setErrorStatus(toHttpCatError(error).status);
    } finally {
      setIsLoading(false);
    }
  }

  function showPreviousPage(nextScope: BattleHistoryScope) {
    if (nextScope === 'global') {
      setGlobalHistory((current) => ({
        ...current,
        activeIndex: Math.max(0, current.activeIndex - 1),
      }));
    } else {
      setPrivateHistory((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          activeIndex: Math.max(0, current.activeIndex - 1),
        };
      });
    }

    setErrorStatus(null);
    setScope(nextScope);
  }

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
        <h2>{messages.history.title}</h2>
        <p>{isLoading ? messages.history.updating : messages.history.recent}</p>
      </PanelHeader>

      <div className={styles.body}>
        <div className={styles.tabs} aria-label={messages.history.tabsLabel}>
          <button
            type="button"
            className={scope === 'global' ? styles.activeTab : styles.tab}
            onClick={() => {
              if (scope === 'global') {
                return;
              }

              setErrorStatus(null);
              setScope('global');
            }}
          >
            {messages.history.all}
          </button>
          <button
            type="button"
            className={scope === 'mine' ? styles.activeTab : styles.tab}
            onClick={() => {
              if (!isAuthenticated) {
                setScope('mine');
                return;
              }

              if (privateHistory) {
                setErrorStatus(null);
                setScope('mine');
                return;
              }

              void loadInitialPrivateHistory();
            }}
          >
            {messages.history.mine}
          </button>
        </div>

        {scope === 'mine' && !isAuthenticated ? (
          <p className={styles.empty}>{messages.history.loginRequired}</p>
        ) : null}

        {errorStatus ? (
          <p className={styles.empty}>{messages.history.loadFailed} {errorStatus}</p>
        ) : null}

        {currentPage && currentPage.items.length > 0 ? (
          <ol className={styles.list}>
            {currentPage.items.map((entry, entryIndex) => (
              <li key={entry.id} className={styles.item}>
                <span className={styles.date}>{formatDateTime(entry.createdAt, locale, {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</span>
                <span className={styles.matchup}>
                  <ImagePreview
                    src={entry.winnerImageUrl}
                    alt={messages.history.winnerAlt}
                    className={styles.catPreview}
                    renderAs="button"
                    sizes="96px"
                    onOpen={() => openViewer(entryIndex, 0)}
                  />
                  <span className={styles.result}>{messages.history.resultWon}</span>
                  <ImagePreview
                    src={entry.loserImageUrl}
                    alt={messages.history.loserAlt}
                    className={styles.catPreview}
                    renderAs="button"
                    sizes="96px"
                    onOpen={() => openViewer(entryIndex, 1)}
                  />
                </span>
              </li>
            ))}
          </ol>
        ) : errorStatus || (scope === 'mine' && !isAuthenticated) ? null : (
          <p className={styles.empty}>{messages.history.empty}</p>
        )}

        {currentPage ? (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => showPreviousPage(scope)}
              disabled={
                isLoading ||
                (scope === 'global'
                  ? globalHistory.activeIndex === 0
                  : (privateHistory?.activeIndex ?? 0) === 0) ||
                (scope === 'mine' && !isAuthenticated)
              }
            >
              {messages.common.back}
            </button>
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => void loadNextPage(scope)}
              disabled={
                isLoading ||
                !currentPage.nextCursor ||
                (scope === 'mine' && !isAuthenticated)
              }
            >
              {messages.common.next}
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
