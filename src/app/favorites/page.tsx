import { getFavoriteCats } from '@/entities/favorite-cat/api/repository';
import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import { InlineAuthActions } from '@/shared/auth/inline-auth-actions';
import { getAuthSession } from '@/shared/auth';
import { FavoritesBrowser } from '@/widgets/favorites-browser';
import { SitePageGrid } from '@/widgets/site-layout';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getAuthSession();
  const cats: FavoriteCatRecord[] = session ? (await getFavoriteCats(session.user.subject)).map((cat) => ({
    id: cat.id,
    imageUrl: cat.imageUrl,
    addedAt: cat.addedAt.toISOString(),
  })) : [];

  return (
    <>
      <section className="page-intro">
        <h1>Избранное</h1>
        <p>
          Здесь собраны котики, которых ты сохранил. Можно открыть фото крупно,
          полистать соседние картинки и убрать кота из избранного прямо в просмотре.
        </p>
      </section>

      <SitePageGrid
        session={session}
        sidebar={(
          <>
            <section className="paper-panel paper-panel-inset">
              <span className="sidebar-eyebrow">подсказка</span>
              <ul className="sidebar-list">
                <li>Картинки удобно смотреть крупно и листать по соседству.</li>
                <li>На самой полке остаются только фотографии, без лишних кнопок.</li>
                <li>Если убрать котика из избранного, он исчезнет после обновления страницы.</li>
              </ul>
            </section>

            <section className="paper-panel paper-panel-inset">
              <span className="sidebar-eyebrow">порядок</span>
              <div className="page-copy">
                <p>Новые сохранённые котики появляются выше остальных.</p>
              </div>
            </section>
          </>
        )}
      >
        <section className="paper-panel">
          <div className="panel-header">
            <h2>Мои котики</h2>
            <p>{session ? `Сохранено: ${cats.length}` : 'Нужно войти в аккаунт'}</p>
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
                <InlineAuthActions
                  className="auth-gate-actions"
                  loginClassName="auth-gate-primary"
                  registerClassName="auth-gate-secondary"
                />
              </div>
            )}
          </div>
        </section>
      </SitePageGrid>
    </>
  );
}
