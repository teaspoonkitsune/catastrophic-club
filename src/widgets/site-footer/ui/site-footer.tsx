import styles from './site-footer.module.css';

const footerButtons = ['котопечать', 'клубный gif', 'мягкие лапки'];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.textBlock}>
        <p className={styles.text}>Почта: kitty-committee@catastrophic.club</p>
        <p className={styles.text}>Сделано на Next 16 и React 19, с большим запасом любви к котам.</p>
        <p className={styles.text}>2026 CATastrophic club. Котов не копируем, просто любуемся.</p>
      </div>

      <div className={styles.buttonStack}>
        {footerButtons.map((button) => (
          <div key={button} className={styles.buttonRow}>
            <span className={styles.buttonBadge}>{button}</span>
            <span className={styles.buttonCode}>{'<a><img /></a>'}</span>
          </div>
        ))}
      </div>
    </footer>
  );
}
