export const parseTimestamp = (raw: unknown): Date | null => {
  if (!raw) return null;
  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;
  if (typeof raw === 'number') {
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d;
  }
  const str = String(raw).trim();
  if (!str) return null;
  // ISO / YYYY-MM-DD HH:MM
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str.replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
  }
  // DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
    const [d, m, y] = str.split('/').map(Number);
    const dt = new Date(y, m - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};
