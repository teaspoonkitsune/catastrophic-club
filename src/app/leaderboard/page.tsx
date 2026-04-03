import { getBattleLeaderboard } from '@/entities/battle-cat/api/repository';
import type { BattleCatRecord } from '@/entities/battle-cat';
import { getAuthSession } from '@/shared/auth';
import { BattleLeaderboardTable } from '@/widgets/battle-leaderboard';
import { SiteFooter } from '@/widgets/site-footer';
import { SiteHeader } from '@/widgets/site-header';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getAuthSession();
  const cats: BattleCatRecord[] = (await getBattleLeaderboard()).map((cat) => ({
    id: cat.id,
    imageUrl: cat.imageUrl,
    score: cat.score,
  }));

  return (
    <main data-page-tone="blue">
      <SiteHeader session={session} currentPath="/leaderboard" />
      <section className="page-intro">
        <h1>Leaderboard archive</h1>
        <p>
          Таблица славы клуба. Сюда попадают только те бойцы, которые уже успели
          набрать или потерять очки в турнире.
        </p>
      </section>

      <div className="page-grid">
        <div className="page-main-column">
          <section className="paper-panel">
            <div className="panel-header">
              <h2>Top scorers</h2>
              <p>{cats.length} cat(s) with non-zero score</p>
            </div>
            <div className="page-copy">
              <BattleLeaderboardTable cats={cats} isAuthenticated={Boolean(session)} />
            </div>
          </section>
        </div>

        <aside className="page-sidebar">
          <section className="paper-panel paper-panel-inset">
            <span className="sidebar-eyebrow">how to read</span>
            <ul className="sidebar-list">
              <li>Ранг считается по очкам, при равенстве раньше созданный кот выше.</li>
              <li>Картинку можно открыть крупно или сразу отметить звездой.</li>
              <li>Нулевые результаты скрыты, чтобы рейтинг был плотнее и чище.</li>
            </ul>
          </section>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
