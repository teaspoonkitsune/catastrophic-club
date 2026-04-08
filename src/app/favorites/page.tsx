import { getFavoriteCats } from '@/entities/favorite-cat/api/repository';
import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import { InlineAuthActions } from '@/shared/auth/inline-auth-actions';
import { getAuthSession } from '@/shared/auth';
import {
  AuthGate,
  PageCopy,
  PageIntro,
  PanelSection,
  PaperPanel,
  SidebarEyebrow,
  SidebarList,
  pageSurfaceClassNames,
} from '@/shared/ui/page-surface';
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
      <PageIntro>
        <h1>Избранное</h1>
        <p>
          Здесь собраны котики, которых ты сохранил. Можно открыть фото крупно,
          полистать соседние картинки и убрать кота из избранного прямо в просмотре.
        </p>
      </PageIntro>

      <SitePageGrid
        session={session}
        sidebar={(
          <>
            <PaperPanel inset>
              <SidebarEyebrow>подсказка</SidebarEyebrow>
              <SidebarList>
                <li>Картинки удобно смотреть крупно и листать по соседству.</li>
                <li>На самой полке остаются только фотографии, без лишних кнопок.</li>
                <li>Если убрать котика из избранного, он исчезнет после обновления страницы.</li>
              </SidebarList>
            </PaperPanel>

            <PaperPanel inset>
              <SidebarEyebrow>порядок</SidebarEyebrow>
              <PageCopy>
                <p>Новые сохранённые котики появляются выше остальных.</p>
              </PageCopy>
            </PaperPanel>
          </>
        )}
      >
        <PanelSection
          title="Мои котики"
          meta={session ? <>Сохранено: {cats.length}</> : 'Нужно войти в аккаунт'}
        >
          <PageCopy>
            {session ? (
              <FavoritesBrowser initialCats={cats} />
            ) : (
              <AuthGate>
                <p>
                  Полка избранного теперь привязана к аккаунту. Войди или зарегистрируйся
                  в клубе, и у тебя появится личная коллекция котиков.
                </p>
                <InlineAuthActions
                  className={pageSurfaceClassNames.authGateActions}
                  loginClassName={pageSurfaceClassNames.authGatePrimary}
                  registerClassName={pageSurfaceClassNames.authGateSecondary}
                />
              </AuthGate>
            )}
          </PageCopy>
        </PanelSection>
      </SitePageGrid>
    </>
  );
}
