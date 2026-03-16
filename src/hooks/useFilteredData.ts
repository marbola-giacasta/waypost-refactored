import { useEffect, useState } from 'react';
import type {
  NormalizedJob, NormalizedJobWithTranslation,
  ParsedCompany, ParsedCompanyWithTranslation,
} from '../utils/constants';
import { translateText } from '../services/translate';

export interface Filters {
  company:    string;
  role:       string;
  location:   string;
  department: string;
  keyword:    string;
}

export type SortKey = 'date' | 'title' | 'company' | 'location';

// ── Helpers ──────────────────────────────────────────────────────────────

function sortJobs(
  jobs:    NormalizedJobWithTranslation[],
  sortKey: SortKey,
  sortAsc: boolean,
): NormalizedJobWithTranslation[] {
  return [...jobs].sort((a, b) => {
    let va: number | string, vb: number | string;
    if (sortKey === 'date') {
      va = a._parsedDate?.getTime() ?? 0;
      vb = b._parsedDate?.getTime() ?? 0;
    } else if (sortKey === 'title') {
      va = a.title.toLowerCase();
      vb = b.title.toLowerCase();
    } else if (sortKey === 'location') {
      va = a.location.toLowerCase();
      vb = b.location.toLowerCase();
    } else {
      va = a.company.toLowerCase();
      vb = b.company.toLowerCase();
    }
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });
}

function jobMatchesFilters(
  job:     NormalizedJob,
  filters: Filters,
  desc:    string,
): boolean {
  const kw = filters.keyword.toLowerCase();
  return (
    (!filters.company  || job.company.toLowerCase().includes(filters.company.toLowerCase()))  &&
    (!filters.role     || job.title.toLowerCase().includes(filters.role.toLowerCase()))        &&
    (!filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
    // department filter — LinkedIn jobs have no department field, so skip gracefully
    (!filters.department) &&
    (!kw || (
      desc.toLowerCase().includes(kw) ||
      job.title.toLowerCase().includes(kw) ||
      job.company.toLowerCase().includes(kw)
    ))
  );
}

function companyMatchesFilters(
  co:      ParsedCompany,
  filters: Filters,
  desc:    string,
): boolean {
  const kw = filters.keyword.toLowerCase();
  return (
    (!filters.company  || co['Company Name'].toLowerCase().includes(filters.company.toLowerCase())) &&
    (!filters.location || co._sourceFile.toLowerCase().includes(filters.location.toLowerCase()))    &&
    (!kw || (
      desc.toLowerCase().includes(kw) ||
      co['Company Name'].toLowerCase().includes(kw) ||
      (co['Settori di competenza'] ?? '').toLowerCase().includes(kw)
    ))
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────

export const useFilteredData = (
  rawJobs:      NormalizedJob[],
  rawCompanies: ParsedCompany[],
  filters:      Filters,
  sortKey:      SortKey,
  sortAsc:      boolean,
  targetLang:   string,
) => {
  const [filteredJobs,      setFilteredJobs]      = useState<NormalizedJobWithTranslation[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<ParsedCompanyWithTranslation[]>([]);

  useEffect(() => {
    // ── FAST PATH — no translation ──────────────────────────────────────
    // Synchronous: handles 12 000+ rows without any async overhead.
    if (targetLang === 'no') {
      const jobs = rawJobs
        .filter(job => jobMatchesFilters(job, filters, job.description))
        .map(job  => ({ ...job, _translatedDesc: job.description }));
      setFilteredJobs(sortJobs(jobs, sortKey, sortAsc));

      const cos = rawCompanies
        .filter(co => companyMatchesFilters(co, filters, co.Panoramica ?? ''))
        .map(co   => ({ ...co, _translatedDesc: co.Panoramica ?? '' }));
      setFilteredCompanies(cos);
      return;
    }

    // ── SLOW PATH — translation in chunks of 200 ───────────────────────
    let cancelled = false;

    const run = async () => {
      const CHUNK = 200;

      // Jobs
      const jobOut: NormalizedJobWithTranslation[] = [];
      for (let i = 0; i < rawJobs.length; i += CHUNK) {
        if (cancelled) return;
        const results = await Promise.all(
          rawJobs.slice(i, i + CHUNK).map(async job => {
            const desc = await translateText(job.description, targetLang);
            return jobMatchesFilters(job, filters, desc)
              ? { ...job, _translatedDesc: desc }
              : null;
          }),
        );
        results.forEach(r => r && jobOut.push(r));
      }
      if (!cancelled) setFilteredJobs(sortJobs(jobOut, sortKey, sortAsc));

      // Companies
      const coOut: ParsedCompanyWithTranslation[] = [];
      for (let i = 0; i < rawCompanies.length; i += CHUNK) {
        if (cancelled) return;
        const results = await Promise.all(
          rawCompanies.slice(i, i + CHUNK).map(async co => {
            const desc = await translateText(co.Panoramica ?? '', targetLang);
            return companyMatchesFilters(co, filters, desc)
              ? { ...co, _translatedDesc: desc }
              : null;
          }),
        );
        results.forEach(r => r && coOut.push(r));
      }
      if (!cancelled) setFilteredCompanies(coOut);
    };

    run();
    return () => { cancelled = true; };

  }, [rawJobs, rawCompanies, filters, sortKey, sortAsc, targetLang]);

  return { filteredJobs, filteredCompanies };
};
