import { getBattlePair } from '@/entities/battle-cat/api/repository';
import type { BattleCatRecord } from '@/entities/battle-cat';
import { getAuthSession } from '@/shared/auth';
import { AuthSidebar } from '@/widgets/auth-sidebar';
import { CatBattleArena } from '@/widgets/cat-battle';
import { SiteFooter } from '@/widgets/site-footer';
import { SiteHeader } from '@/widgets/site-header';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getAuthSession();
  const initialPair: BattleCatRecord[] = (await getBattlePair()).map((cat) => ({
    id: cat.id,
    imageUrl: cat.imageUrl,
    score: cat.score,
  }));

  return (
    <main data-page-tone="red">
      <SiteHeader session={session} currentPath="/battles" />
      <section className="page-intro">
        <h1>Битвы котиков</h1>
        <p>
          Выбирай победителя из двух котиков. За каждое голосование один получает очко,
          а второй его теряет.
        </p>
      </section>

      <div className="page-grid">
        <div className="page-main-column">
          <section className="paper-panel">
            <div className="panel-header">
              <h2>Текущая пара</h2>
              <p>Победитель +1, проигравший -1</p>
            </div>
            <div className="page-copy">
              <CatBattleArena initialPair={initialPair} isAuthenticated={Boolean(session)} />
            </div>
          </section>
        </div>

        <aside className="page-sidebar">
          <AuthSidebar session={session} currentPath="/battles" />

          <section className="paper-panel paper-panel-inset">
            <span className="sidebar-eyebrow">правила</span>
            <ul className="sidebar-list">
              <li>Оценивай только мордочку, харизму и общий вайб.</li>
              <li>После клика подгрузится новая пара без ручного обновления.</li>
              <li>Звезда на карточке сразу отправляет бойца в избранное.</li>
            </ul>
          </section>

          <section className="paper-panel paper-panel-inset">
            <span className="sidebar-eyebrow">что происходит</span>
            <div className="page-copy">
              <p>Если котиков в базе мало, система сама подгрузит новых перед следующей битвой.</p>
            </div>
          </section>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
