/**
 * formatTimeAgo — returns a human-readable relative time string.
 * Uses the browser's current time as "now" (which equals CET for Swiss users,
 * and is correct regardless since both date and now are in the same local zone).
 */
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60)   return 'just now';
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} minute${m === 1 ? '' : 's'} ago`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  const d = Math.floor(seconds / 86400);
  if (d < 7)  return `${d} day${d === 1 ? '' : 's'} ago`;
  const w = Math.floor(d / 7);
  if (w < 5)  return `${w} week${w === 1 ? '' : 's'} ago`;
  const mo = Math.floor(d / 30);
  return `${mo} month${mo === 1 ? '' : 's'} ago`;
}
