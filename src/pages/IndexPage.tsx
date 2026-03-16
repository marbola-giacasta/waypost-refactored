import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Header                      from './NAVs/Header';
import { JobItem }                 from '../components/Jobs/JobItem';
import { CompanyItem }             from '../components/Companies/CompanyItem';
import { TranslationSelector }     from '../components/Translation/TranslationSelector';
import { useLoadJobs }             from '../hooks/useLoadJobs';
import { useLoadLinkedInJobs }     from '../hooks/useLoadLinkedInJobs';
import { useLoadCompanies }        from '../hooks/useLoadCompanies';
import { useFilteredData }         from '../hooks/useFilteredData';
import { FloatingFooter }           from '../components/Layout/FloatingFooter';
import type { SortKey } from '../hooks/useFilteredData';

type View = 'jobs' | 'companies';

const PAGE_SIZE = 50;

const IndexPage: React.FC = () => {
  const [view, setView]           = useState<View>('jobs');
  // Incrementing this key forces CompanyItem components to fully remount
  // whenever we navigate to companies — clearing any open drawer state
  // and preventing the iOS Safari transform+scroll crash.
  const [companiesKey, setCompaniesKey] = useState(0);

  const switchView = useCallback((v: View) => {
    if (v === 'companies') setCompaniesKey(k => k + 1);
    setView(v);
  }, []);

  // ── Filters ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    company:  '',
    role:     '',
    location: '',
    keyword:  '',
  });
  const setF = (k: keyof typeof filters, v: string) =>
    setFilters(f => ({ ...f, [k]: v }));
  const clearFilters = () =>
    setFilters({ company: '', role: '', location: '', keyword: '' });

  // ── Sort ─────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const setSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(v => !v);
    else { setSortKey(k); setSortAsc(k !== 'date'); }
  };

  // ── Translation ───────────────────────────────────────────────────────
  const [targetLang, setTargetLang] = useState('no');

  // ── Data ─────────────────────────────────────────────────────────────
  const { jobs: scraperJobs,  loading: jLoading }  = useLoadJobs();
  const { jobs: linkedInJobs, loading: liLoading }  = useLoadLinkedInJobs();
  const { companies,          loading: cLoading }   = useLoadCompanies();

  const allJobs = useMemo(() => {
    const merged = [...scraperJobs, ...linkedInJobs];
    return merged.sort(
      (a, b) => (b._parsedDate?.getTime() ?? 0) - (a._parsedDate?.getTime() ?? 0),
    );
  }, [scraperJobs, linkedInJobs]);

  const { filteredJobs, filteredCompanies } = useFilteredData(
    allJobs, companies, filters, sortKey, sortAsc,
  );

  // ── Windowed rendering ────────────────────────────────────────────────
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [filteredJobs]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 600 && visibleCount < filteredJobs.length) {
      setVisibleCount(n => Math.min(n + PAGE_SIZE, filteredJobs.length));
    }
  }, [visibleCount, filteredJobs.length]);

  const visibleJobs = useMemo(
    () => filteredJobs.slice(0, visibleCount),
    [filteredJobs, visibleCount],
  );

  // ── Ticker ────────────────────────────────────────────────────────────
  const tickerText = useMemo(() => {
    const cos = [...new Set(allJobs.map(j => j.company).filter(Boolean))];
    return cos.map(c => `· ${c}`).join('   ');
  }, [allJobs]);

  const loading = view === 'jobs' ? (jLoading || liLoading) : cLoading;
  const count   = view === 'jobs' ? filteredJobs.length : filteredCompanies.length;

  return (
    <div className="page-root">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <Header tickerText={tickerText} resultCount={count} />

      {/* ── Filters bar ──────────────────────────────────────────────── */}
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

      {/* ── Meta / sort bar ──────────────────────────────────────────── */}
      <div className="meta-bar">
        <div className="view-tabs">
          <button
            className={`vtab${view === 'jobs' ? ' active' : ''}`}
            onClick={() => switchView('jobs')}
          >
            jobs {(jLoading || liLoading)
              ? '…'
              : visibleCount < filteredJobs.length
                ? `(${visibleCount}+)`
                : `(${filteredJobs.length})`}
          </button>
          <button
            className={`vtab${view === 'companies' ? ' active' : ''}`}
            onClick={() => switchView('companies')}
          >
            companies {cLoading ? '…' : `(${filteredCompanies.length})`}
          </button>
        </div>

        {filters.keyword && (
          <span className="kw-active">kw: &quot;{filters.keyword}&quot;</span>
        )}

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

      {/* ── Column headers ───────────────────────────────────────────── */}
      <div className="col-hdr">
        <span className="ch ch-idx">#</span>
        <span className="ch">company / {view === 'jobs' ? 'role' : 'sectors'}</span>
        <span className="ch ch-desc">description <em>· tap to expand</em></span>
        <span className="ch ch-r">link / posted</span>
      </div>

      {/* ── Slide wrapper ────────────────────────────────────────────── */}
      <div className="slide-outer">
        <div className={`slide-track${view === 'companies' ? ' show-co' : ''}`}>

          {/* JOBS PANEL */}
          <div className="slide-panel">
            <div
              className="scroll-fade-wrap"
              ref={scrollRef}
              onScroll={handleScroll}
            >
              {loading ? (
                <div className="loading-msg">
                  <span className="loading-dot" />loading jobs…
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="empty-msg">
                  <span className="empty-glyph">∅</span>
                  no results — try adjusting your filters
                </div>
              ) : (
                <div className="job-list">
                  {visibleJobs.map((job, i) => (
                    <JobItem
                      key={`${job.company}-${job.title}-${i}`}
                      job={job}
                      filtersKeyword={filters.keyword}
                      targetLang={targetLang}
                      index={i}
                    />
                  ))}
                  {visibleCount < filteredJobs.length && (
                    <div className="load-more-hint">
                      <span className="loading-dot"
                        style={{ display: 'inline-block', marginRight: 8 }} />
                      {visibleCount} / {filteredJobs.length} — scroll for more
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* COMPANIES PANEL — never remounts; resetKey prop collapses open drawers */}
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
                      resetKey={companiesKey}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      {/* ── Floating footer ──────────────────────────────────────────── */}
      <FloatingFooter />

    </div>
  );
};

export default IndexPage;
