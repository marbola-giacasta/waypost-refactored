/**
 * formatTimeAgo — returns a human-readable relative time string.
 * Uses the browser's current time as "now" (which equals CET for Swiss users,
 * and is correct regardless since both date and now are in the same local zone).
 */
export const formatTimeAgo = (date: Date): string => {
  const now  = new Date();
  const mins = Math.floor((now.getTime() - date.getTime()) / 60_000);

  if (mins < 0)   return 'just now';      // clock skew / future date
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return '1d ago';
  if (days < 7)   return `${days}d ago`;
  if (days < 30)  return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};
