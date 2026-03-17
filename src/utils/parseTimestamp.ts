/**
 * parseTimestamp — converts any date-like value from xlsx cells into a Date.
 * All dates from both scrapers are treated as CET (UTC+1 / UTC+2 DST).
 * Returns null if the value is missing or unparseable.
 */

/** Offset in ms for CET (UTC+1). DST detection via Intl when available. */
function cetOffsetMs(): number {
  try {
    // Use Intl to get the actual CET offset at the target time
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Zurich',
      hour: 'numeric', hour12: false,
      timeZoneName: 'shortOffset',
    });
    const parts = fmt.formatToParts(new Date());
    const tzPart = parts.find(p => p.type === 'timeZoneName')?.value ?? '+1';
    const match = tzPart.match(/([+-])(\d+)(?::(\d+))?/);
    if (match) {
      const sign = match[1] === '+' ? 1 : -1;
      const h = parseInt(match[2], 10);
      const m = parseInt(match[3] ?? '0', 10);
      return sign * (h * 60 + m) * 60_000;
    }
  } catch { /* fallback */ }
  return 60 * 60_000; // CET = UTC+1 fallback
}

/** Parse DD.MM.YYYY HH:MM or DD.MM.YYYY as CET */
function parseDotDate(str: string): Date | null {
  // DD.MM.YYYY HH:MM
  const m1 = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (m1) {
    const [, dd, mm, yyyy, hh, min] = m1.map(Number);
    // Build as UTC then subtract CET offset to treat the value as CET
    const utc = Date.UTC(yyyy, mm - 1, dd, hh, min);
    return new Date(utc - cetOffsetMs());
  }
  // DD.MM.YYYY only
  const m2 = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (m2) {
    const [, dd, mm, yyyy] = m2.map(Number);
    return new Date(Date.UTC(yyyy, mm - 1, dd) - cetOffsetMs());
  }
  return null;
}

export const parseTimestamp = (raw: unknown): Date | null => {
  if (raw === null || raw === undefined || raw === '') return null;

  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;

  // Excel serial number
  if (typeof raw === 'number') {
    if (raw === 0) return null;
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(raw).trim();
  if (!str) return null;

  // ISO  YYYY-MM-DD [HH:MM[:SS]]
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str.replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
  }

  // DD/MM/YYYY [HH:MM]
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (slashMatch) {
    const [, dd, mm, yyyy, hh = '0', min = '0'] = slashMatch;
    const d = new Date(+yyyy, +mm - 1, +dd, +hh, +min);
    return isNaN(d.getTime()) ? null : d;
  }

  // DD.MM.YYYY [HH:MM]  ← LinkedIn postedAbsolute format
  const dot = parseDotDate(str);
  if (dot) return dot;

  // Fallback
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};
