import { useMemo } from 'react';
import type {
  NormalizedJob, NormalizedJobWithTranslation,
  ParsedCompany, ParsedCompanyWithTranslation,
} from '../utils/constants';

export interface Filters {
  company:  string;
  role:     string;
  location: string;
  keyword:  string;
}

export type SortKey = 'date' | 'title' | 'company' | 'location';

// ── Filter helpers (pure, synchronous, no translation) ───────────────────
// Translation is handled per-item in JobItem — only when the user expands
// a description. This makes filtering instant even on 12 000+ items.

function jobMatches(job: NormalizedJob, filters: Filters): boolean {
  const kw = filters.keyword.toLowerCase();
  return (
    (!filters.company  || job.company.toLowerCase().includes(filters.company.toLowerCase()))  &&
    (!filters.role     || job.title.toLowerCase().includes(filters.role.toLowerCase()))        &&
    (!filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
    (!kw || (
      job.description.toLowerCase().includes(kw) ||
      job.title.toLowerCase().includes(kw)       ||
      job.company.toLowerCase().includes(kw)
    ))
  );
}

function coMatches(co: ParsedCompany, filters: Filters): boolean {
  const kw = filters.keyword.toLowerCase();
  return (
    (!filters.company  || co['Company Name'].toLowerCase().includes(filters.company.toLowerCase())) &&
    (!filters.location || co._sourceFile.toLowerCase().includes(filters.location.toLowerCase()))    &&
    (!kw || (
      (co.Panoramica ?? '').toLowerCase().includes(kw) ||
      co['Company Name'].toLowerCase().includes(kw)    ||
      (co['Settori di competenza'] ?? '').toLowerCase().includes(kw)
    ))
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────
// Pure useMemo — no useEffect, no async, no translation.
// Runs synchronously on every filter/sort change.

export const useFilteredData = (
  rawJobs:      NormalizedJob[],
  rawCompanies: ParsedCompany[],
  filters:      Filters,
  sortKey:      SortKey,
  sortAsc:      boolean,
) => {
  const filteredJobs = useMemo((): NormalizedJobWithTranslation[] => {
    const matched = rawJobs
      .filter(j => jobMatches(j, filters))
      .map(j  => ({ ...j, _translatedDesc: undefined }));

    return matched.sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortKey === 'date') {
        va = a._parsedDate?.getTime() ?? 0;
        vb = b._parsedDate?.getTime() ?? 0;
      } else if (sortKey === 'title') {
        va = a.title.toLowerCase(); vb = b.title.toLowerCase();
      } else if (sortKey === 'location') {
        va = a.location.toLowerCase(); vb = b.location.toLowerCase();
      } else {
        va = a.company.toLowerCase(); vb = b.company.toLowerCase();
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1  : -1;
      return 0;
    });
  }, [rawJobs, filters, sortKey, sortAsc]);

  const filteredCompanies = useMemo((): ParsedCompanyWithTranslation[] =>
    rawCompanies
      .filter(co => coMatches(co, filters))
      .map(co   => ({ ...co, _translatedDesc: co.Panoramica ?? '' })),
  [rawCompanies, filters]);

  return { filteredJobs, filteredCompanies };
};
