import { getFavoriteCats } from '@/entities/favorite-cat/api/repository';
import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import { buildAuthHref } from '@/shared/auth/links';
import { getAuthSession } from '@/shared/auth';
import { FavoritesBrowser } from '@/widgets/favorites-browser';
import { SiteFooter } from '@/widgets/site-footer';
import { SiteHeader } from '@/widgets/site-header';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getAuthSession();
  const cats: FavoriteCatRecord[] = session ? (await getFavoriteCats(session.user.subject)).map((cat) => ({
    id: cat.id,
    imageUrl: cat.imageUrl,
    addedAt: cat.addedAt.toISOString(),
  })) : [];

  return (
    <main data-page-tone="yellow">
      <SiteHeader session={session} currentPath="/favorites" />
      <section className="page-intro">
        <h1>Favorites shelf</h1>
        <p>
          Здесь живут котики, которым ты выдал звезду. Полка нарочито олдскульная,
          но действия остаются современными: убираем из избранного прямо со страницы.
        </p>
      </section>

      <div className="page-grid">
        <div className="page-main-column">
          <section className="paper-panel">
            <div className="panel-header">
              <h2>Saved cats</h2>
              <p>{session ? `${cats.length} item(s) currently pinned` : 'login required'}</p>
            </div>
            <div className="page-copy">
              {session ? (
                <FavoritesBrowser initialCats={cats} />
              ) : (
                <div className="auth-gate">
                  <p>
                    Полка избранного теперь привязана к аккаунту. Войди или зарегистрируйся
                    в клубе, и у тебя появится личная коллекция котиков.
                  </p>
                  <div className="auth-gate-actions">
                    <a href={buildAuthHref('login', '/favorites')} className="auth-gate-primary">
                      login
                    </a>
                    <a href={buildAuthHref('register', '/favorites')} className="auth-gate-secondary">
                      register
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="page-sidebar">
          <section className="paper-panel paper-panel-inset">
            <span className="sidebar-eyebrow">curator notes</span>
            <ul className="sidebar-list">
              <li>Каждая карточка хранит дату, когда котик попал в коллекцию.</li>
              <li>Изображение можно открыть в полноразмерном просмотре.</li>
              <li>Удаление работает без перезагрузки страницы.</li>
            </ul>
          </section>

          <section className="paper-panel paper-panel-inset">
            <span className="sidebar-eyebrow">sorting rule</span>
            <div className="page-copy">
              <p>Новые любимчики поднимаются вверх. Полка ведет себя как свежий журнал клуба.</p>
            </div>
          </section>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
