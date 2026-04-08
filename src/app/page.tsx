import { getRandomCatFact, getRandomCatImage } from '@/entities/cat';
import { getAuthSession } from '@/shared/auth';
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
  const [fact, cat, session] = await Promise.all([
    getRandomCatFact(),
    getRandomCatImage(),
    getAuthSession(),
  ]);

  return (
    <>
      <PageIntro>
        <h1>CATastrophic club</h1>
        <p>
          Здесь кот, там кот. Заходи посмотреть кота дня, собрать избранное и устроить пару честных
          битв за звание самой обаятельной мордочки.
        </p>
      </PageIntro>

      <SitePageGrid
        session={session}
        sidebar={
          <>
            <PaperPanel inset>
              <SidebarEyebrow>разделы</SidebarEyebrow>
              <SidebarList>
                <li>Избранное для любимых находок</li>
                <li>Битвы для быстрых дуэлей</li>
                <li>Рейтинг для победителей</li>
              </SidebarList>
            </PaperPanel>

            <PaperPanel inset>
              <SidebarEyebrow>данные</SidebarEyebrow>
              <SidebarList variant="stamp">
                <li>Фото: `cataas.com`</li>
                <li>Факты: `catfact.ninja`</li>
                <li>Избранное хранится в Postgres</li>
              </SidebarList>
            </PaperPanel>
          </>
        }
      >
        <PanelSection title="Кот дня">
          <FeaturedCatWidget
            id={cat.id}
            imageUrl={cat.imageUrl}
            fact={fact.fact}
            isAuthenticated={Boolean(session)}
          />
        </PanelSection>

        <PaperPanel inset>
          <SidebarEyebrow>действия</SidebarEyebrow>
          <PageCopy>
            <p>
              Открой фото, сохрани понравившегося кота или обнови карточку, если хочется увидеть еще
              одного героя дня.
            </p>
          </PageCopy>
        </PaperPanel>
      </SitePageGrid>
    </>
  );
}
