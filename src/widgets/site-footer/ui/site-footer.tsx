import styles from './site-footer.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.textBlock}>
        <p className={styles.text}>Почта: kitty-committee@catastrophic.club</p>
        <p className={styles.text}>Сделано на Next 16 и React 19</p>
        <p className={styles.text}>2026 CATastrophic club</p>
      </div>
    </footer>
  );
}
