import React, { useState, useMemo } from 'react';
import Header                      from './NAVs/Header';
import { JobItem }                 from '../components/Jobs/JobItem';
import { CompanyItem }             from '../components/Companies/CompanyItem';
import { TranslationSelector }     from '../components/Translation/TranslationSelector';
import { useLoadJobs }             from '../hooks/useLoadJobs';
import { useLoadLinkedInJobs }     from '../hooks/useLoadLinkedInJobs';
import { useLoadCompanies }        from '../hooks/useLoadCompanies';
import { useFilteredData }         from '../hooks/useFilteredData';
import type { SortKey }            from '../hooks/useFilteredData';

type View = 'jobs' | 'companies';

const IndexPage: React.FC = () => {
  const [view, setView]   = useState<View>('jobs');

  // Filters
  const [filters, setFilters] = useState({
    company:    '',
    role:       '',
    location:   '',
    department: '',
    keyword:    '',
  });
  const setF = (k: keyof typeof filters, v: string) =>
    setFilters(f => ({ ...f, [k]: v }));
  const clearFilters = () =>
    setFilters({ company: '', role: '', location: '', department: '', keyword: '' });

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const setSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(v => !v);
    else { setSortKey(k); setSortAsc(k !== 'date'); }
  };

  // Translation
  const [targetLang, setTargetLang] = useState('no');

  // Data — load both sources; neither blocks the other
  const { jobs: scraperJobs,   loading: jLoading }  = useLoadJobs();
  const { jobs: linkedInJobs,  loading: liLoading }  = useLoadLinkedInJobs();
  const { companies,           loading: cLoading }   = useLoadCompanies();

  // Merge and re-sort by date (most recent first)
  const allJobs = useMemo(() => {
    const merged = [...scraperJobs, ...linkedInJobs];
    return merged.sort(
      (a, b) => (b._parsedDate?.getTime() ?? 0) - (a._parsedDate?.getTime() ?? 0),
    );
  }, [scraperJobs, linkedInJobs]);

  const { filteredJobs, filteredCompanies } = useFilteredData(
    allJobs, companies, filters, sortKey, sortAsc, targetLang,
  );

  // Ticker text built from unique company names across both sources
  const tickerText = useMemo(() => {
    const cos = [...new Set(allJobs.map(j => j.company).filter(Boolean))];
    return cos.map(c => `· ${c}`).join('   ');
  }, [allJobs]);

  const loading   = view === 'jobs' ? (jLoading || liLoading) : cLoading;
  const count     = view === 'jobs' ? filteredJobs.length : filteredCompanies.length;

  return (
    <div className="page-root">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Header tickerText={tickerText} resultCount={count} />

      {/* ── Filters bar ────────────────────────────────────────────────── */}
      <div className="filters-bar">
        <div className="fg">
          <label className="flbl">Company</label>
          <input className="fi" placeholder="e.g. Glencore" value={filters.company}
            onChange={e => setF('company', e.target.value)} />
        </div>

        {view === 'jobs' && (
          <div className="fg">
            <label className="flbl">Role</label>
            <input className="fi" placeholder="e.g. analyst" value={filters.role}
              onChange={e => setF('role', e.target.value)} />
          </div>
        )}

        <div className="fg">
          <label className="flbl">Location</label>
          <input className="fi" placeholder="e.g. Zurich" value={filters.location}
            onChange={e => setF('location', e.target.value)} />
        </div>

        {view === 'jobs' && (
          <div className="fg">
            <label className="flbl">Department</label>
            <input className="fi" placeholder="e.g. IT" value={filters.department}
              onChange={e => setF('department', e.target.value)} />
          </div>
        )}

        <div className="fg">
          <label className="flbl">Keyword</label>
          <input className="fi kw" placeholder="any word…" value={filters.keyword}
            onChange={e => setF('keyword', e.target.value)} />
        </div>

        <button className="fclear" onClick={clearFilters}>✕ clear</button>

        <div className="fbar-right">
          <TranslationSelector targetLang={targetLang} setTargetLang={setTargetLang} />
        </div>
      </div>

      {/* ── Meta / sort bar ────────────────────────────────────────────── */}
      <div className="meta-bar">
        {/* View toggle — jobs ←→ companies */}
        <div className="view-tabs">
          <button
            className={`vtab${view === 'jobs' ? ' active' : ''}`}
            onClick={() => setView('jobs')}
          >
            jobs {(jLoading || liLoading) ? '…' : `(${filteredJobs.length})`}
          </button>
          <button
            className={`vtab${view === 'companies' ? ' active' : ''}`}
            onClick={() => setView('companies')}
          >
            companies {cLoading ? '…' : `(${filteredCompanies.length})`}
          </button>
        </div>

        {/* Keyword active indicator */}
        {filters.keyword && (
          <span className="kw-active">
            kw: &quot;{filters.keyword}&quot;
          </span>
        )}

        {/* Sort (jobs only) */}
        {view === 'jobs' && (
          <div className="sorts">
            <span className="sort-lbl">SORT:</span>
            {(['date', 'title', 'company', 'location'] as SortKey[]).map(k => (
              <button
                key={k}
                className={`sbtn${sortKey === k ? ' on' : ''}${sortKey === k && !sortAsc ? ' d' : ''}`}
                onClick={() => setSort(k)}
              >
                {k}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Column headers ─────────────────────────────────────────────── */}
      <div className="col-hdr">
        <span className="ch ch-idx">#</span>
        <span className="ch">company / {view === 'jobs' ? 'role' : 'sectors'}</span>
        <span className="ch ch-desc">description excerpt <em>· click to expand</em></span>
        <span className="ch ch-r">link / posted</span>
      </div>

      {/* ── Slide wrapper — jobs | companies ─────────────────────────── */}
      <div className="slide-outer">
        <div className={`slide-track${view === 'companies' ? ' show-co' : ''}`}>

          {/* JOBS */}
          <div className="slide-panel">
            <div className="scroll-fade-wrap">
              {loading ? (
                <div className="loading-msg">
                  <span className="loading-dot" />loading jobs from /uploads/ …
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="empty-msg">
                  <span className="empty-glyph">∅</span>
                  no results — try adjusting your filters
                </div>
              ) : (
                <div className="job-list">
                  {filteredJobs.map((job, i) => (
                    <JobItem
                      key={`${job.company}-${job.title}-${i}`}
                      job={job}
                      filtersKeyword={filters.keyword}
                      targetLang={targetLang}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COMPANIES */}
          <div className="slide-panel">
            <div className="scroll-fade-wrap">
              {cLoading ? (
                <div className="loading-msg">
                  <span className="loading-dot" />loading companies…
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="empty-msg">
                  <span className="empty-glyph">∅</span>
                  no results
                </div>
              ) : (
                <div className="job-list">
                  {filteredCompanies.map((co, i) => (
                    <CompanyItem
                      key={`${co['Company Name']}-${i}`}
                      company={co}
                      filtersKeyword={filters.keyword}
                      targetLang={targetLang}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IndexPage;
