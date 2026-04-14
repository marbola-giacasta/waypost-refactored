import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import type { LinkedInJobRecord, NormalizedJob } from '../utils/constants';
import { parseTimestamp } from '../utils/parseTimestamp';

/**
 * Resolves the latest jobs-linkedin file from public/uploads/.
 *
 * Strategy:
 *  1. Fetch /uploads/linkedin-manifest.json (written by server-launcher after each deploy)
 *     → use manifest.latest as the filename
 *  2. If manifest missing or fails, fall back to scanning for jobs-linkedin_*.xlsx
 *     by trying a known fallback name.
 *  3. Final fallback: jobs-linkedin.xlsx (legacy plain name)
 */
async function resolveLatestFile(): Promise<string> {
  // Try manifest first
  try {
    const res = await fetch('/uploads/linkedin-manifest.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.latest) return `/uploads/${data.latest}`;
    }
  } catch {}

  // Fallback: legacy plain name
  return '/uploads/jobs-linkedin.xlsx';
}

export const useLoadLinkedInJobs = () => {
  const [jobs, setJobs]       = useState<NormalizedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const fileUrl = await resolveLatestFile();
        const res     = await fetch(fileUrl, { cache: 'no-store' });

        // File is optional — silently skip if not present
        if (!res.ok) { setLoading(false); return; }

        const buf = await res.arrayBuffer();
        const wb  = XLSX.read(buf, { type: 'array', cellDates: true });
        const raw = XLSX.utils.sheet_to_json<LinkedInJobRecord>(
          wb.Sheets[wb.SheetNames[0]],
          { raw: true, defval: '' },
        );

        const normalized: NormalizedJob[] = raw
          .map(r => {
            const postedRaw = r.postedAbsolute;
            const postedStr = postedRaw && String(postedRaw).trim() !== 'N/A'
              ? String(postedRaw).trim()
              : '';
            return {
              company:       String(r.companyName  ?? '').trim() || 'not available',
              title:         String(r.roleTitle     ?? '').trim() || 'not available',
              location:      String(r.location      ?? '').trim() || 'not available',
              description:   String(r.summary ?? r.description ?? '').trim(),
              link:          String(r.jobLink !== 'N/A' ? r.jobLink : (r.applyLink ?? '')).trim(),
              scrapedAt:     String(r.scrapedAt ?? '').trim(),
              source:        'linkedin' as const,
              rawPostedDate: postedStr,
              _parsedDate:   parseTimestamp(postedRaw),
            };
          })
          .filter(j => j.title || j.company)
          .sort((a, b) => (b._parsedDate?.getTime() ?? 0) - (a._parsedDate?.getTime() ?? 0));

        setJobs(normalized);
      } catch (e) {
        console.error('useLoadLinkedInJobs:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { jobs, loading };
};
