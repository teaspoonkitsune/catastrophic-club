import { getRandomCatFact, getRandomCatImage } from '@/entities/cat';
import { getAuthSession } from '@/shared/auth';
import {
  BadgeMarquee,
  PageCopy,
  PageIntro,
  PanelSection,
  PaperPanel,
  SidebarEyebrow,
  SidebarList,
} from '@/shared/ui/page-surface';
import { FeaturedCatWidget } from '@/widgets/featured-cat';
import { SitePageGrid } from '@/widgets/site-layout';

const clubBadgeLabels = [
  'кот дня',
  'люблю котов',
  'режим битвы',
  'мягкие лапки',
  'открыть фото',
  'в избранное',
];

export default async function Page() {
  const [fact, cat, session] = await Promise.all([
    getRandomCatFact(),
    getRandomCatImage(),
    getAuthSession(),
  ]);

  return (
    <>
      <PageIntro>
        <h1>Добро пожаловать в CATastrophic club</h1>
        <p>
          Это маленький сайт про котов: здесь есть кот дня, избранное и простой рейтинг по битвам.
          Всё сделано легко и по-домашнему.
        </p>
      </PageIntro>

      <SitePageGrid
        session={session}
        sidebar={(
          <>
            <PaperPanel inset>
              <SidebarEyebrow>разделы</SidebarEyebrow>
              <SidebarList>
                <li>Избранное: твоя личная подборка котиков</li>
                <li>Битвы: выбор победителя из двух случайных котов</li>
                <li>Рейтинг: таблица лучших по итогам голосований</li>
              </SidebarList>
            </PaperPanel>

            <PaperPanel inset>
              <SidebarEyebrow>откуда данные</SidebarEyebrow>
              <SidebarList variant="stamp">
                <li>Картинки приходят с `cataas.com`</li>
                <li>Факты о котах берутся с `catfact.ninja`</li>
                <li>Избранное хранится в Postgres</li>
              </SidebarList>
            </PaperPanel>

            <PanelSection title="Кнопки клуба" meta="маленькие бейджи в духе старого интернета">
              <BadgeMarquee labels={clubBadgeLabels} />
            </PanelSection>
          </>
        )}
      >
        <PanelSection title="Кот дня" meta="сегодняшний главный герой">
          <FeaturedCatWidget
            id={cat.id}
            imageUrl={cat.imageUrl}
            fact={fact.fact}
            isAuthenticated={Boolean(session)}
          />
        </PanelSection>

        <PaperPanel inset>
          <SidebarEyebrow>что можно сделать</SidebarEyebrow>
          <PageCopy>
            <p>Нажми на картинку, чтобы открыть полноразмерный просмотр.</p>
            <p>Кнопка со звездой добавляет котика в избранное без переходов.</p>
            <p>Если котик не понравился, можно сразу открыть нового.</p>
          </PageCopy>
        </PaperPanel>
      </SitePageGrid>
    </>
  );
}
