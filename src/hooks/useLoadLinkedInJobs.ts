import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import type { LinkedInJobRecord, NormalizedJob } from '../utils/constants';
import { parseTimestamp } from '../utils/parseTimestamp';

export const useLoadLinkedInJobs = () => {
  const [jobs, setJobs]       = useState<NormalizedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/uploads/jobs-linkedin.xlsx');
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
              description:   String(r.description  ?? '').trim(),
              link:          String(r.internalLink !== 'N/A' ? r.internalLink : (r.externalLink ?? '')).trim(),
              scrapedAt:     String(r.scrapedAt     ?? '').trim(),
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
