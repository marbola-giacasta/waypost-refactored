import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { NormalizedJobWithTranslation } from '../../utils/constants';
import { Highlight } from '../Filters/Highlight';
import { formatTimeAgo } from '../../utils/timeAgo';
import { translateText } from '../../services/translate';

interface Props {
  job:            NormalizedJobWithTranslation;
  filtersKeyword: string;
  targetLang:     string;
  index:          number;
}

export const JobItem: React.FC<Props> = ({ job, filtersKeyword, targetLang, index }) => {
  const [expanded,      setExpanded]      = useState(false);
  const [translatedDesc, setTranslated]   = useState<string | null>(null);
  const [translating,   setTranslating]   = useState(false);
  const descRef    = useRef<HTMLDivElement>(null);
  const pointerY   = useRef<number>(0);
  const didScroll  = useRef(false);

  // ── Per-item lazy translation ─────────────────────────────────────────
  // Only fires when the user actually expands this card AND a language is set.
  // This means at most 1 translation call at a time per card — no rate-limit issues.
  useEffect(() => {
    if (!expanded || targetLang === 'no') {
      setTranslated(null);
      return;
    }
    let cancelled = false;
    setTranslating(true);
    translateText(job.description, targetLang).then(t => {
      if (!cancelled) { setTranslated(t); setTranslating(false); }
    });
    return () => { cancelled = true; };
  }, [expanded, targetLang, job.description]);

  // Reset translation cache when language changes
  useEffect(() => {
    setTranslated(null);
  }, [targetLang]);

  const displayDesc = translatedDesc ?? job.description ?? '';

  // Red "ago" text: relative to now in CET (browser time for European users)
  const ago     = job._parsedDate ? formatTimeAgo(job._parsedDate) : null;
  // Grey subtitle: the raw date string from the file (postedAbsolute / Posted Date)
  const dateSub = job.rawPostedDate || null;

  // ── Tap vs scroll detection ──────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerY.current  = e.clientY;
    didScroll.current = false;
  }, []);
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (Math.abs(e.clientY - pointerY.current) > 8) didScroll.current = true;
  }, []);

  // Click on the card header row — toggles expand/collapse
  const handleCardClick = useCallback(() => {
    if (didScroll.current) { didScroll.current = false; return; }
    setExpanded(v => !v);
  }, []);

  // Click inside the open drawer — only collapse if user is at the very top
  const handleDrawerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (didScroll.current) { didScroll.current = false; return; }
    const el = descRef.current;
    if (el && el.scrollTop > 6) return;
    setExpanded(false);
  }, []);

  const handleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (descRef.current) descRef.current.scrollTop = 0;
    setExpanded(false);
  }, []);

  return (
    <div className={`job-entry-wrap${expanded ? ' expanded' : ''}`}>

      {/* ── Card row ──────────────────────────────────────────────────── */}
      <div
        className={`job-entry${expanded ? ' is-expanded' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleCardClick}
      >
        {/* Index */}
        <div className="jc-idx">{index + 1}</div>

        {/* Main: company + title */}
        <div className="jc-main">
          <div className="jc-company">
            <Highlight text={job.company} kw={filtersKeyword} lang={targetLang} />
            {job.location && (
              <span className="loc-pill">
                <Highlight text={job.location} kw={filtersKeyword} lang={targetLang} />
              </span>
            )}
            <span className={`src-badge ${job.source}`}>
              {job.source === 'linkedin' ? 'li' : 'sc'}
            </span>
          </div>
          <div className="jc-title">
            <Highlight text={job.title} kw={filtersKeyword} lang={targetLang} />
          </div>
        </div>

        {/* Description preview (desktop only — hidden on mobile) */}
        <div className="jc-desc-preview">
          {job.description
            ? <Highlight text={job.description.slice(0, 200)} kw={filtersKeyword} lang={targetLang} />
            : <span className="no-desc">—</span>}
          <span className="expand-hint">↕</span>
        </div>

        {/* Link + time */}
        <div className="jc-right">
          {job.link && (
            <a
              className="jc-link"
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
            >
              apply ↗
            </a>
          )}
          <div className="jc-time">
            {ago !== null
              ? <span className="ago">{ago}</span>
              : <span className="ago time-missing">time missing</span>}
            {dateSub && <span className="date-sub">{dateSub}</span>}
          </div>
        </div>
      </div>

      {/* ── Description drawer — opens below the row ─────────────────── */}
      {expanded && (
        <div
          className="job-desc-drawer"
          ref={descRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onClick={handleDrawerClick}
        >
          <button className="desc-close" onClick={handleCollapse}>✕ close</button>
          {translating ? (
            <span className="desc-translating">translating…</span>
          ) : (
            <Highlight text={displayDesc} kw={filtersKeyword} lang={targetLang} />
          )}
        </div>
      )}

    </div>
  );
};
