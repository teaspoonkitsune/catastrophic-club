import { getRandomCatFact, getRandomCatImage } from '@/entities/cat';
import { getAuthSession } from '@/shared/auth';
import { AuthSidebar } from '@/widgets/auth-sidebar';
import { FeaturedCatWidget } from '@/widgets/featured-cat';
import { SiteFooter } from '@/widgets/site-footer';
import { SiteHeader } from '@/widgets/site-header';

export default async function Page() {
  const [fact, cat, session] = await Promise.all([
    getRandomCatFact(),
    getRandomCatImage(),
    getAuthSession(),
  ]);

  return (
    <main data-page-tone="purple">
      <SiteHeader />
      <section className="page-intro">
        <h1>Добро пожаловать в CATastrophic club</h1>
        <p>
          Это маленький сайт про котов: здесь есть кот дня, избранное и простой рейтинг по битвам.
          Всё сделано легко и по-домашнему.
        </p>
      </section>

      <div className="page-grid">
        <div className="page-main-column">
          <section className="paper-panel">
            <div className="panel-header">
              <h2>Кот дня</h2>
              <p>сегодняшний главный герой</p>
            </div>
            <FeaturedCatWidget
              id={cat.id}
              imageUrl={cat.imageUrl}
              fact={fact.fact}
              isAuthenticated={Boolean(session)}
            />
          </section>

          <section className="paper-panel paper-panel-inset">
            <span className="sidebar-eyebrow">что можно сделать</span>
            <div className="page-copy">
              <p>Нажми на картинку, чтобы открыть полноразмерный просмотр.</p>
              <p>Кнопка со звездой добавляет котика в избранное без переходов.</p>
              <p>Если котик не понравился, можно сразу открыть нового.</p>
            </div>
          </section>
        </div>

        <aside className="page-sidebar">
          <AuthSidebar
            session={session}
            currentPath="/"
          />

          <section className="paper-panel paper-panel-inset">
            <span className="sidebar-eyebrow">разделы</span>
            <ul className="sidebar-list">
              <li>Избранное: твоя личная подборка котиков</li>
              <li>Битвы: выбор победителя из двух случайных котов</li>
              <li>Рейтинг: таблица лучших по итогам голосований</li>
            </ul>
          </section>

          <section className="paper-panel paper-panel-inset">
            <span className="sidebar-eyebrow">откуда данные</span>
            <ul className="stamp-list">
              <li>Картинки приходят с `cataas.com`</li>
              <li>Факты о котах берутся с `catfact.ninja`</li>
              <li>Избранное хранится в Postgres</li>
            </ul>
          </section>

          <section className="paper-panel">
            <div className="panel-header">
              <h2>Кнопки клуба</h2>
              <p>маленькие бейджи в духе старого интернета</p>
            </div>
            <div className="badge-marquee">
              <div
                className="badge-track"
                aria-hidden="true"
              >
                {[
                  'кот дня',
                  'люблю котов',
                  'режим битвы',
                  'мягкие лапки',
                  'открыть фото',
                  'в избранное',
                ].map((label) => (
                  <span
                    key={label}
                    className="badge-chip"
                  >
                    {label}
                  </span>
                ))}
                {[
                  'кот дня',
                  'люблю котов',
                  'режим битвы',
                  'мягкие лапки',
                  'открыть фото',
                  'в избранное',
                ].map((label) => (
                  <span
                    key={`${label}-dup`}
                    className="badge-chip"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
