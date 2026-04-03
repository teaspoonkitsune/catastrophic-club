import styles from './site-footer.module.css';

const footerButtons = ['cat stamp', 'club gif', 'soft paws'];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.textBlock}>
        <p className={styles.text}>Contact: kitty-committee@catastrophic.club</p>
        <p className={styles.text}>Built with Next 16, React 19 and an unreasonable amount of cat energy.</p>
        <p className={styles.text}>2026 CATastrophic club // do not copy the cats, only admire them.</p>
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
