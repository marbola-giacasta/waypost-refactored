// ── Shared normalized shape — both scrapers map into this ────────────────
// JobItem, useFilteredData, and all display logic use ONLY this type.
export type NormalizedJob = {
  company:       string;
  title:         string;
  location:      string;
  description:   string;
  link:          string;
  scrapedAt:     string;
  source:        'scraper' | 'linkedin' | 'direct';
  _parsedDate:   Date | null;
  rawPostedDate: string;   // exact string from the file, shown as grey subtitle
};

export type NormalizedJobWithTranslation = NormalizedJob & {
  _translatedDesc?: string;
};

// ── server-direct / excel-writer.mjs v7 output columns ───────────────────
export type JobRecord = {
  Company:          string;
  'Job Title':      string;
  Location:         string;
  Department:       string;
  'Job Type':       string;
  'Posted Date':    string | number | Date;
  'Closing Date':   string | number | Date;
  Salary:           string;
  'Reference ID':   string;
  'Apply Link':     string;
  'Source URL':     string;
  'Scraped At':     string;
  // optional — present in some scraper versions
  'Direct Apply Link'?:     string;
  'Description (excerpt)'?: string;
  'Has Form'?:              string;
  'Emails Found'?:          string;
};

// ── jobs-linkedin.xlsx columns ────────────────────────────────────────────
export type LinkedInJobRecord = {
  companyName:     string;
  companyPage?:    string;
  companyId?:      string;
  roleTitle:       string;
  location:        string;
  description:     string;
  summary?:        string;
  jobLink?:        string;   // camelCase header from writer.js
  applyLink?:      string;   // camelCase header from writer.js
  internalLink?:   string;   // legacy fallback
  externalLink?:   string;   // legacy fallback
  postedRelative:  string;
  postedAbsolute:  string;
  scrapedAt:       string;
  republished:     string;
  emails:          string;
  relatedPersons:  string;
};

// ── Company (companies xlsx — unchanged) ─────────────────────────────────
export type CompanyRecord = {
  'Company Name':            string;
  Industry:                  string;
  Location:                  string;
  'LinkedIn URL'?:           string;
  Website?:                  string;
  Panoramica?:               string;
  'Settori di competenza'?:  string;
  'Latest News'?:            string;
};

export interface ParsedCompany extends CompanyRecord {
  _sourceFile: string;
}

export interface ParsedCompanyWithTranslation extends ParsedCompany {
  _translatedDesc?: string;
}

export type ViewMode = 'jobs' | 'companies';


// ── jobs-direct_*.xlsx columns (server-direct-URL-drill Phase 2 output) ──────
export type DirectJobRecord = {
  'Company':       string;
  'Job Title':     string;
  'Location':      string;
  'Department':    string;
  'Job Type':      string;
  'Description':   string;
  'Summary':       string;
  'Salary':        string;
  'Posted Date':   string | number | Date;
  'Closing Date':  string | number | Date;
  'Reference ID':  string;
  'Apply Link':    string;
  'External Link': string;
  'Career Hub':    string;
  'Source URL':    string;
  'ATS Platform':  string;
  'Enriched At':   string;
  // Phase 1 only (drilled_cards, no enrichment yet)
  'Scraped At'?:   string;
};
