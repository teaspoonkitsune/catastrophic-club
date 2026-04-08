import { getRandomCatFact, getRandomCatImage } from '@/entities/cat';
import { getAuthSession } from '@/shared/auth';
import { getRequestI18n } from '@/shared/i18n/server';
import {
  PageCopy,
  PageIntro,
  PanelSection,
  PaperPanel,
  SidebarEyebrow,
  SidebarList,
} from '@/shared/ui/page-surface';
import { FeaturedCatWidget } from '@/widgets/featured-cat';
import { SitePageGrid } from '@/widgets/site-layout';

export default async function Page() {
  const [fact, cat, session, { messages }] = await Promise.all([
    getRandomCatFact(),
    getRandomCatImage(),
    getAuthSession(),
    getRequestI18n(),
  ]);

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
                  <li key={item}>{item}</li>
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
            fact={fact.fact}
            isAuthenticated={Boolean(session)}
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
