'use client';

import { useState } from 'react';
import type {
  BattleCatRecord,
  BattleHistoryPage,
  BattleHistoryRecord,
} from '@/entities/battle-cat';
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
    setLocalHistoryEntries((entries) => {
      if (entries.some((item) => item.id === entry.id)) {
        return entries;
      }

      return [entry, ...entries].slice(0, 10);
    });
  }

  return (
    <>
      <section className="paper-panel">
        <div className="panel-header">
          <h2>Текущая пара</h2>
          <p>Победитель +1, проигравший -1</p>
        </div>
        <div className="page-copy">
          <CatBattleArena
            initialPair={initialPair}
            isAuthenticated={isAuthenticated}
            onHistoryEntry={handleHistoryEntry}
          />
        </div>
      </section>

      <BattleHistory
        initialGlobalHistory={initialGlobalHistory}
        initialPrivateHistory={initialPrivateHistory}
        isAuthenticated={isAuthenticated}
        localEntries={localHistoryEntries}
      />
    </>
  );
}
