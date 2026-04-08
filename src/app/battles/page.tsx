import { getBattleHistoryPage, getBattlePair } from '@/entities/battle-cat/api/repository';
import type { BattleCatRecord } from '@/entities/battle-cat';
import { getAuthSession } from '@/shared/auth';
import { getRequestI18n } from '@/shared/i18n/server';
import { PageIntro, PaperPanel, SidebarEyebrow, SidebarList } from '@/shared/ui/page-surface';
import { BattlesWorkspace } from '@/widgets/battles-workspace';
import { SitePageGrid } from '@/widgets/site-layout';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [{ messages }, session, pair] = await Promise.all([
    getRequestI18n(),
    getAuthSession(),
    getBattlePair(),
  ]);
  const initialPair: BattleCatRecord[] = pair.map((cat) => ({
    id: cat.id,
    imageUrl: cat.imageUrl,
    score: cat.score,
  }));
  const initialGlobalHistory = await getBattleHistoryPage();
  const initialPrivateHistory = session
    ? await getBattleHistoryPage({ userId: session.user.subject })
    : null;

  return (
    <>
      <PageIntro>
        <h1>{messages.battles.introTitle}</h1>
        <p>{messages.battles.introText}</p>
      </PageIntro>

      <SitePageGrid
        session={session}
        sidebar={(
          <PaperPanel inset>
            <SidebarEyebrow>{messages.battles.rulesEyebrow}</SidebarEyebrow>
            <SidebarList>
              {messages.battles.rules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </SidebarList>
          </PaperPanel>
        )}
      >
        <BattlesWorkspace
          initialPair={initialPair}
          initialGlobalHistory={initialGlobalHistory}
          initialPrivateHistory={initialPrivateHistory}
          isAuthenticated={Boolean(session)}
        />
      </SitePageGrid>
    </>
  );
}
