import type { ReactNode } from 'react';
import { site } from '@/content/site';

/**
 * "Available — start a call" pill. Opens the Google Meet link in a new tab.
 * A Server Component: no state, no effects → zero JavaScript shipped for it.
 * `children` lets the caller decide the label (long/short versions).
 */
export function AvailablePill({ children, className = '' }: { children?: ReactNode; className?: string }) {
  if (!site.available) return null;
  return (
    <a className={`avail ${className}`} href={site.meetUrl} target="_blank" rel="noopener noreferrer">
      <span className="dot" aria-hidden="true" />
      {children ?? 'Available — start a call'}
    </a>
  );
}
