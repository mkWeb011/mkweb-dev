'use client';

import { useEffect, useState } from 'react';
import { timeIn } from '@/lib/format';

/**
 * Live "HH:MM" clock for a time zone, refreshed every 20 s.
 *
 * Why start with '—' instead of the real time?
 * The server renders the page at BUILD time. If we rendered the time there,
 * the browser's first render (minutes or days later) would not match the HTML
 * and React would warn about a hydration mismatch. So: placeholder first,
 * real value after mount (useEffect only runs in the browser).
 */
export function useLocalTime(timeZone: string): string {
  const [time, setTime] = useState('—');

  useEffect(() => {
    const tick = () => setTime(timeIn(timeZone));
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id); // cleanup on unmount
  }, [timeZone]);

  return time;
}
