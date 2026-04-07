import { getBattleLeaderboard } from '@/entities/battle-cat/api/repository';
import type { BattleCatRecord } from '@/entities/battle-cat';
import { getAuthSession } from '@/shared/auth';
import { BattleLeaderboardTable } from '@/widgets/battle-leaderboard';
import { SitePageGrid } from '@/widgets/site-layout';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getAuthSession();
  const cats: BattleCatRecord[] = (await getBattleLeaderboard()).map((cat) => ({
    id: cat.id,
    imageUrl: cat.imageUrl,
    score: cat.score,
  }));

  return (
    <>
      <section className="page-intro">
        <h1>Рейтинг</h1>
        <p>
          Здесь видно, кто чаще побеждает в битвах. В таблицу попадают только те котики,
          у которых уже есть очки.
        </p>
      </section>

      <SitePageGrid
        session={session}
        sidebar={(
          <section className="paper-panel paper-panel-inset">
            <span className="sidebar-eyebrow">как читать рейтинг</span>
            <ul className="sidebar-list">
              <li>Ранг считается по очкам, при равенстве раньше созданный кот выше.</li>
              <li>Картинку можно открыть крупно или сразу отметить звездой.</li>
              <li>Нулевые результаты скрыты, чтобы рейтинг был плотнее и чище.</li>
            </ul>
          </section>
        )}
      >
        <section className="paper-panel">
          <div className="panel-header">
            <h2>Лучшие котики</h2>
            <p>В таблице: {cats.length}</p>
          </div>
          <div className="page-copy">
            <BattleLeaderboardTable cats={cats} isAuthenticated={Boolean(session)} />
          </div>
        </section>
      </SitePageGrid>
    </>
  );
}
