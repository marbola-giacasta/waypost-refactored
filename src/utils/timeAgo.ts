export const formatTimeAgo = (date: Date, now: Date = new Date()): string => {
  const mins = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ${mins % 60}m ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days}d ago`;
  if (days < 30)  return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
};
