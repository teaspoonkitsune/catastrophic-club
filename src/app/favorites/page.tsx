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
        <p>Твоя личная полка с котиками, к которым хочется возвращаться.</p>
      </PageIntro>

      <SitePageGrid
        session={session}
        sidebar={(
          <>
            <PaperPanel inset>
              <SidebarEyebrow>просмотр</SidebarEyebrow>
              <SidebarList>
                <li>Фото открываются в крупном просмотре</li>
                <li>Между сохраненными котиками можно листать</li>
                <li>Убрать кота можно прямо из окна просмотра</li>
              </SidebarList>
            </PaperPanel>

            <PaperPanel inset>
              <SidebarEyebrow>порядок</SidebarEyebrow>
              <PageCopy>
                <p>Новые сохранения всегда лежат сверху.</p>
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
                <p>Войдите, чтобы собирать свою коллекцию любимых котиков.</p>
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
