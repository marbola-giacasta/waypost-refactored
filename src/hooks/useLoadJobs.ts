import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import type { JobRecord, NormalizedJob } from '../utils/constants';
import { parseTimestamp } from '../utils/parseTimestamp';

/** Strip stray "\n\t\n13" artifacts that appear in Salary/date cells */
function clean(s: unknown): string {
  return String(s ?? '').replace(/[\n\t\r]/g, ' ').trim();
}

export const useLoadJobs = () => {
  const [jobs, setJobs]       = useState<NormalizedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/uploads/jobs.xlsx');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        const wb  = XLSX.read(buf, { type: 'array', cellDates: true });
        const raw = XLSX.utils.sheet_to_json<JobRecord>(
          wb.Sheets[wb.SheetNames[0]],
          { raw: true, defval: '' },
        );

        const normalized: NormalizedJob[] = raw
          .map(r => {
            const postedRaw = r['Posted Date'];
            const postedStr = postedRaw
              ? String(postedRaw).replace(/[\n\t\r]/g, ' ').trim()
              : '';
            return {
              company:       clean(r.Company)     || 'not available',
              title:         clean(r['Job Title']) || 'not available',
              location:      clean(r.Location)     || 'not available',
              description:   clean(r['Description (excerpt)'] ?? ''),
              link:          clean(r['Apply Link']) || '',
              scrapedAt:     clean(r['Scraped At']) || '',
              source:        'scraper' as const,
              rawPostedDate: postedStr,
              _parsedDate:   parseTimestamp(postedRaw),
            };
          })
          .filter(j => j.title || j.company)
          .sort((a, b) => (b._parsedDate?.getTime() ?? 0) - (a._parsedDate?.getTime() ?? 0));

        setJobs(normalized);
      } catch (e) {
        console.error('useLoadJobs:', e);
        setError(String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { jobs, loading, error };
};
