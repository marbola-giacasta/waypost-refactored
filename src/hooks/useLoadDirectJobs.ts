import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import type { DirectJobRecord, NormalizedJob } from '../utils/constants';
import { parseTimestamp } from '../utils/parseTimestamp';

function clean(s: unknown): string {
  return String(s ?? '').replace(/[\n\t\r]/g, ' ').trim();
}

async function resolveLatestFile(): Promise<string> {
  try {
    const res = await fetch('/uploads/direct-manifest.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.latest) return `/uploads/${data.latest}`;
    }
  } catch {}
  return '/uploads/jobs-direct.xlsx';
}

export const useLoadDirectJobs = () => {
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

        // Read the Jobs sheet, fall back to first sheet
        const sheetName = wb.SheetNames.includes('Jobs') ? 'Jobs' : wb.SheetNames[0];
        const raw = XLSX.utils.sheet_to_json<DirectJobRecord>(
          wb.Sheets[sheetName],
          { raw: true, defval: '' },
        );

        const normalized: NormalizedJob[] = raw
          .map(r => {
            // Best apply link: prefer External Link if present, else Apply Link
            const link = clean(r['External Link'] || r['Apply Link']) || '';

            // Best description: prefer Description, fall back to Summary
            const description = clean(r['Description'] || r['Summary'] || '');

            // Date: prefer Posted Date, fall back to Enriched At / Scraped At
            const postedRaw = r['Posted Date'] || r['Enriched At'] || r['Scraped At'] || '';
            const postedStr = postedRaw
              ? String(postedRaw).replace(/[\n\t\r]/g, ' ').trim()
              : '';

            return {
              company:       clean(r['Company'])   || 'not available',
              title:         clean(r['Job Title']) || 'not available',
              location:      clean(r['Location'])  || 'not available',
              description,
              link,
              scrapedAt:     clean(r['Enriched At'] || r['Scraped At']) || '',
              source:        'direct' as const,
              rawPostedDate: postedStr,
              _parsedDate:   parseTimestamp(postedRaw),
            };
          })
          .filter(j => j.title !== 'not available' || j.company !== 'not available')
          .sort((a, b) => (b._parsedDate?.getTime() ?? 0) - (a._parsedDate?.getTime() ?? 0));

        setJobs(normalized);
      } catch (e) {
        console.error('useLoadDirectJobs:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { jobs, loading };
};
