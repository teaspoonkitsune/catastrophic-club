import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import styles from './page-surface.module.css';

type ElementProps<T extends keyof React.JSX.IntrinsicElements> = ComponentPropsWithoutRef<T>;

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export const pageSurfaceClassNames = {
  authGateActions: styles.authGateActions,
  authGatePrimary: styles.authGatePrimary,
  authGateSecondary: styles.authGateSecondary,
  sidebarLink: styles.sidebarLink,
};

export function PageIntro({ className, ...props }: ElementProps<'section'>) {
  return <section className={classNames(styles.pageIntro, className)} {...props} />;
}

type PaperPanelProps = ElementProps<'section'> & {
  inset?: boolean;
};

export function PaperPanel({ className, inset = false, ...props }: PaperPanelProps) {
  return (
    <section
      className={classNames(styles.paperPanel, inset && styles.paperPanelInset, className)}
      {...props}
    />
  );
}

export function PanelHeader({ className, ...props }: ElementProps<'div'>) {
  return <div className={classNames(styles.panelHeader, className)} {...props} />;
}

export function PageCopy({ className, ...props }: ElementProps<'div'>) {
  return <div className={classNames(styles.pageCopy, className)} {...props} />;
}

export function AuthGate({ className, ...props }: ElementProps<'div'>) {
  return <div className={classNames(styles.authGate, className)} {...props} />;
}

export function SidebarEyebrow({ className, ...props }: ElementProps<'span'>) {
  return <span className={classNames(styles.sidebarEyebrow, className)} {...props} />;
}

type SidebarListProps = ElementProps<'ul'> & {
  variant?: 'sidebar' | 'stamp';
};

export function SidebarList({ className, variant = 'sidebar', ...props }: SidebarListProps) {
  return (
    <ul
      className={classNames(variant === 'stamp' ? styles.stampList : styles.sidebarList, className)}
      {...props}
    />
  );
}

type BadgeMarqueeProps = ElementProps<'div'> & {
  labels: string[];
};

export function BadgeMarquee({ className, labels, ...props }: BadgeMarqueeProps) {
  const trackLabels = [...labels, ...labels];

  return (
    <div className={classNames(styles.badgeMarquee, className)} {...props}>
      <div className={styles.badgeTrack} aria-hidden="true">
        {trackLabels.map((label, index) => (
          <span key={label + '-' + index} className={styles.badgeChip}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

type PanelSectionProps = PaperPanelProps & {
  title: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
};

export function PanelSection({ title, meta, children, ...props }: PanelSectionProps) {
  return (
    <PaperPanel {...props}>
      <PanelHeader>
        {typeof title === 'string' ? <h2>{title}</h2> : title}
        {meta ? <p>{meta}</p> : null}
      </PanelHeader>
      {children}
    </PaperPanel>
  );
}
