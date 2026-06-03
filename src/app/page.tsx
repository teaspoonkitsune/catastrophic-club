import { getCatOfTheDay, getRandomCatFact } from '@/entities/cat';
import { getAuthSession } from '@/shared/auth';
import { getRequestI18n } from '@/shared/i18n/server';
import {
  PageCopy,
  PageIntro,
  PanelSection,
  PaperPanel,
  SidebarEyebrow,
  SidebarList,
  pageSurfaceClassNames,
} from '@/shared/ui/page-surface';
import { FeaturedCatWidget } from '@/widgets/featured-cat';
import { SitePageGrid } from '@/widgets/site-layout';

const fallbackFeaturedCat = {
  id: 'fallback-cat',
  imageUrl: '/icon.svg',
};

export default async function Page() {
  const [{ messages }, session] = await Promise.all([
    getRequestI18n(),
    getAuthSession(),
  ]);
  const [factResult, catResult] = await Promise.allSettled([
    getRandomCatFact(),
    getCatOfTheDay(),
  ]);
  const fact = factResult.status === 'fulfilled' ? factResult.value.fact : messages.home.fallbackFact;
  const cat = catResult.status === 'fulfilled' ? catResult.value : fallbackFeaturedCat;

  if (factResult.status === 'rejected') {
    console.error('Failed to load cat fact for the home page', factResult.reason);
  }

  if (catResult.status === 'rejected') {
    console.error('Failed to load cat of the day for the home page', catResult.reason);
  }

  return (
    <>
      <PageIntro>
        <h1>{messages.home.introTitle}</h1>
        <p>{messages.home.introText}</p>
      </PageIntro>

      <SitePageGrid
        session={session}
        sidebar={
          <>
            <PaperPanel inset>
              <SidebarEyebrow>{messages.home.sectionsEyebrow}</SidebarEyebrow>
              <SidebarList>
                {messages.home.sections.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </SidebarList>
            </PaperPanel>

            <PaperPanel inset>
              <SidebarEyebrow>{messages.home.dataEyebrow}</SidebarEyebrow>
              <SidebarList variant="stamp">
                {messages.home.data.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className={pageSurfaceClassNames.sidebarLink}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </SidebarList>
            </PaperPanel>
          </>
        }
      >
        <PanelSection title={messages.home.featuredTitle}>
          <FeaturedCatWidget
            id={cat.id}
            imageUrl={cat.imageUrl}
            fact={fact}
            isAuthenticated={Boolean(session) && catResult.status === 'fulfilled'}
          />
        </PanelSection>

        <PaperPanel inset>
          <SidebarEyebrow>{messages.home.actionsEyebrow}</SidebarEyebrow>
          <PageCopy>
            <p>{messages.home.actionsText}</p>
          </PageCopy>
        </PaperPanel>
      </SitePageGrid>
    </>
  );
}
