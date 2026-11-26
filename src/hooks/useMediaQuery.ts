'use client';

import { useSyncExternalStore } from 'react';

/**
 * Subscribe to a CSS media query from React.
 *
 * useSyncExternalStore is React's official way to read state that lives
 * OUTSIDE React (here: the browser's matchMedia). It needs:
 *   subscribe       → tell React when the value may have changed
 *   getSnapshot     → read the current value in the browser
 *   getServerSnapshot → value used during server rendering (no window)
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** true when the visitor asked the OS for less motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
