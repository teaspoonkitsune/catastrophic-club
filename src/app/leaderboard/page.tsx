import { getBattleLeaderboard } from '@/entities/battle-cat/api/repository';
import type { BattleCatRecord } from '@/entities/battle-cat';
import { getAuthSession } from '@/shared/auth';
import { PageCopy, PageIntro, PanelSection, PaperPanel, SidebarEyebrow, SidebarList } from '@/shared/ui/page-surface';
import { BattleLeaderboardPager, BattleLeaderboardTable } from '@/widgets/battle-leaderboard';
import { SitePageGrid } from '@/widgets/site-layout';

export const dynamic = 'force-dynamic';

type LeaderboardPageProps = {
  searchParams: Promise<{
    offset?: string | string[];
  }>;
};

function parseOffset(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const offset = rawValue ? Number.parseInt(rawValue, 10) : 0;

  if (!Number.isFinite(offset)) {
    return 0;
  }

  return Math.max(0, offset);
}

export default async function Page({ searchParams }: LeaderboardPageProps) {
  const { offset: rawOffset } = await searchParams;
  const offset = parseOffset(rawOffset);
  const session = await getAuthSession();
  const leaderboard = await getBattleLeaderboard({ offset });
  const cats: BattleCatRecord[] = leaderboard.items.map((cat) => ({
    id: cat.id,
    imageUrl: cat.imageUrl,
    score: cat.score,
  }));

  return (
    <>
      <PageIntro>
        <h1>Рейтинг</h1>
        <p>Здесь собираются котики, которые чаще других выходят из битв победителями.</p>
      </PageIntro>

      <SitePageGrid
        session={session}
        sidebar={(
          <PaperPanel inset>
            <SidebarEyebrow>сортировка</SidebarEyebrow>
            <SidebarList>
              <li>Выше поднимаются котики с большим числом очков</li>
              <li>При равенстве выше остается тот, кто появился раньше</li>
            </SidebarList>
          </PaperPanel>
        )}
      >
        <PanelSection title="Лучшие котики">
          <PageCopy>
            <BattleLeaderboardTable
              cats={cats}
              isAuthenticated={Boolean(session)}
              rankOffset={leaderboard.offset}
            />
            <BattleLeaderboardPager
              hasNext={leaderboard.hasNext}
              limit={leaderboard.limit}
              offset={leaderboard.offset}
            />
          </PageCopy>
        </PanelSection>
      </SitePageGrid>
    </>
  );
}
