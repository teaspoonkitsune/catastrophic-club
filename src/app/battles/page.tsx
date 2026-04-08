import { getBattleHistoryPage, getBattlePair } from '@/entities/battle-cat/api/repository';
import type { BattleCatRecord } from '@/entities/battle-cat';
import { getAuthSession } from '@/shared/auth';
import { PageIntro, PaperPanel, SidebarEyebrow, SidebarList } from '@/shared/ui/page-surface';
import { BattlesWorkspace } from '@/widgets/battles-workspace';
import { SitePageGrid } from '@/widgets/site-layout';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getAuthSession();
  const initialPair: BattleCatRecord[] = (await getBattlePair()).map((cat) => ({
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
        <h1>Битвы котиков</h1>
        <p>Две мордочки, один голос. Выбери того, кто сегодня явно в ударе.</p>
      </PageIntro>

      <SitePageGrid
        session={session}
        sidebar={(
          <PaperPanel inset>
            <SidebarEyebrow>правила</SidebarEyebrow>
            <SidebarList>
              <li>Победитель получает одно очко</li>
              <li>Новая пара появляется сразу после выбора</li>
              <li>Понравившегося кота можно сохранить</li>
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
