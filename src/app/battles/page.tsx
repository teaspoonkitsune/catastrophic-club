import { getBattleHistoryPage, getBattlePair } from '@/entities/battle-cat/api/repository';
import type { BattleCatRecord } from '@/entities/battle-cat';
import { getAuthSession } from '@/shared/auth';
import { AuthSidebar } from '@/widgets/auth-sidebar';
import { BattlesWorkspace } from '@/widgets/battles-workspace';
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
  const initialGlobalHistory = await getBattleHistoryPage();
  const initialPrivateHistory = session
    ? await getBattleHistoryPage({ userId: session.user.subject })
    : null;

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
          <BattlesWorkspace
            initialPair={initialPair}
            initialGlobalHistory={initialGlobalHistory}
            initialPrivateHistory={initialPrivateHistory}
            isAuthenticated={Boolean(session)}
          />
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
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
