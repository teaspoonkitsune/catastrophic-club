'use client';

import { useState } from 'react';
import type {
  BattleCatRecord,
  BattleHistoryPage,
  BattleHistoryRecord,
} from '@/entities/battle-cat';
import { PageCopy, PanelSection } from '@/shared/ui/page-surface';
import { BattleHistory } from '@/widgets/battle-history';
import { CatBattleArena } from '@/widgets/cat-battle';

type BattlesWorkspaceProps = {
  initialPair: BattleCatRecord[];
  initialGlobalHistory: BattleHistoryPage;
  initialPrivateHistory: BattleHistoryPage | null;
  isAuthenticated: boolean;
};

export function BattlesWorkspace({
  initialPair,
  initialGlobalHistory,
  initialPrivateHistory,
  isAuthenticated,
}: BattlesWorkspaceProps) {
  const [localHistoryEntries, setLocalHistoryEntries] = useState<
    BattleHistoryRecord[]
  >([]);

  function handleHistoryEntry(entry: BattleHistoryRecord) {
    // Keep recent local votes visible immediately; BattleHistory dedupes them later.
    setLocalHistoryEntries((entries) => {
      if (entries.some((item) => item.id === entry.id)) {
        return entries;
      }

      return [entry, ...entries].slice(0, 10);
    });
  }

  return (
    <>
      <PanelSection title="Текущая пара" meta="Победитель +1, проигравший -1">
        <PageCopy>
          <CatBattleArena
            initialPair={initialPair}
            isAuthenticated={isAuthenticated}
            onHistoryEntry={handleHistoryEntry}
          />
        </PageCopy>
      </PanelSection>

      <BattleHistory
        initialGlobalHistory={initialGlobalHistory}
        initialPrivateHistory={initialPrivateHistory}
        isAuthenticated={isAuthenticated}
        localEntries={localHistoryEntries}
      />
    </>
  );
}
