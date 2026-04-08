import { getFavoriteCats } from '@/entities/favorite-cat/api/repository';
import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import { InlineAuthActions } from '@/shared/auth/inline-auth-actions';
import { getAuthSession } from '@/shared/auth';
import { getRequestI18n } from '@/shared/i18n/server';
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
  const [{ messages }, session] = await Promise.all([
    getRequestI18n(),
    getAuthSession(),
  ]);
  const cats: FavoriteCatRecord[] = session ? (await getFavoriteCats(session.user.subject)).map((cat) => ({
    id: cat.id,
    imageUrl: cat.imageUrl,
    addedAt: cat.addedAt.toISOString(),
  })) : [];

  return (
    <>
      <PageIntro>
        <h1>{messages.favorites.introTitle}</h1>
        <p>{messages.favorites.introText}</p>
      </PageIntro>

      <SitePageGrid
        session={session}
        sidebar={(
          <>
            <PaperPanel inset>
              <SidebarEyebrow>{messages.favorites.previewEyebrow}</SidebarEyebrow>
              <SidebarList>
                {messages.favorites.previewItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </SidebarList>
            </PaperPanel>

            <PaperPanel inset>
              <SidebarEyebrow>{messages.favorites.orderEyebrow}</SidebarEyebrow>
              <PageCopy>
                <p>{messages.favorites.orderText}</p>
              </PageCopy>
            </PaperPanel>
          </>
        )}
      >
        <PanelSection
          title={messages.favorites.sectionTitle}
          meta={session ? <>{messages.favorites.savedLabel}: {cats.length}</> : messages.favorites.loginRequiredMeta}
        >
          <PageCopy>
            {session ? (
              <FavoritesBrowser initialCats={cats} />
            ) : (
              <AuthGate>
                <p>{messages.favorites.authPrompt}</p>
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
