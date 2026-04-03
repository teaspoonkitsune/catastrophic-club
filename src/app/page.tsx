import { getRandomCatFact, getRandomCatImage } from '@/entities/cat';
import { getAuthSession } from '@/shared/auth';
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
      <SiteHeader session={session} currentPath="/" />
      <section className="page-intro">
        <h1>First time in CATastrophic club?</h1>
        <p>
          Это наш небольшой уголок интернета про котов: свежая морда дня, коллекция
          любимчиков и локальный турнирный рейтинг. Всё в духе домашней ретро-страницы,
          но с текущей логикой проекта.
        </p>
      </section>

      <div className="page-grid">
        <div className="page-main-column">
          <section className="paper-panel">
            <div className="panel-header">
              <h2>Cat of the day</h2>
              <p>fresh transmission from the club archive</p>
            </div>
            <FeaturedCatWidget
              id={cat.id}
              imageUrl={cat.imageUrl}
              fact={fact.fact}
              isAuthenticated={Boolean(session)}
            />
          </section>

          <section className="paper-panel paper-panel-inset">
            <span className="sidebar-eyebrow">club bulletin</span>
            <div className="page-copy">
              <p>Нажми на картинку, чтобы открыть полноразмерный просмотр.</p>
              <p>Кнопка со звездой добавляет котика в избранное без переходов.</p>
              <p>Если мордочка не зашла, у клуба всегда найдется новая картиночка.</p>
            </div>
          </section>
        </div>

        <aside className="page-sidebar">
          <section className="paper-panel paper-panel-inset">
            <span className="sidebar-eyebrow">routes</span>
            <ul className="sidebar-list">
              <li>favorites: личная полка любимых котиков</li>
              <li>battles: дуэль двух случайных претендентов</li>
              <li>leaders: таблица славы по итогам боёв</li>
            </ul>
          </section>

          <section className="paper-panel paper-panel-inset">
            <span className="sidebar-eyebrow">stamps</span>
            <ul className="stamp-list">
              <li>hand-fed from `cataas.com`</li>
              <li>facts via `catfact.ninja`</li>
              <li>favorites stored in postgres</li>
            </ul>
          </section>

          <section className="paper-panel">
            <div className="panel-header">
              <h2>club buttons</h2>
              <p>88x31 spirit, cat edition</p>
            </div>
            <div className="badge-marquee">
              <div className="badge-track" aria-hidden="true">
                {['cat of day', 'feline fan', 'battle mode', 'soft paws', 'zoom me', 'star this'].map((label) => (
                  <span key={label} className="badge-chip">
                    {label}
                  </span>
                ))}
                {['cat of day', 'feline fan', 'battle mode', 'soft paws', 'zoom me', 'star this'].map((label) => (
                  <span key={`${label}-dup`} className="badge-chip">
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
