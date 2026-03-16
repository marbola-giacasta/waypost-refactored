import React, { useState, useRef, useCallback } from 'react';
import type { NormalizedJobWithTranslation } from '../../utils/constants';
import { Highlight } from '../Filters/Highlight';
import { formatTimeAgo } from '../../utils/timeAgo';

interface Props {
  job:            NormalizedJobWithTranslation;
  filtersKeyword: string;
  targetLang:     string;
  index:          number;
}

export const JobItem: React.FC<Props> = ({ job, filtersKeyword, targetLang, index }) => {
  const [expanded, setExpanded] = useState(false);
  const descRef    = useRef<HTMLDivElement>(null);
  // Track pointer-down position to distinguish tap vs scroll-drag
  const pointerY   = useRef<number>(0);
  const didScroll  = useRef(false);

  const desc    = job._translatedDesc ?? job.description ?? '';
  const ago     = job._parsedDate ? formatTimeAgo(job._parsedDate) : '';
  const dateStr = job._parsedDate
    ? job._parsedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
    : '';

  // Record position when pointer/touch goes down
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerY.current  = e.clientY;
    didScroll.current = false;
  }, []);

  // If pointer moved more than 8px vertically before release → it's a scroll, not a tap
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (Math.abs(e.clientY - pointerY.current) > 8) {
      didScroll.current = true;
    }
  }, []);

  // The actual expand/collapse logic — called by onClick (which fires after pointerUp)
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Ignore if the pointer moved (scroll gesture)
    if (didScroll.current) { didScroll.current = false; return; }

    if (!expanded) {
      // Collapsed → expand
      setExpanded(true);
    } else {
      // Expanded → only collapse if user hasn't scrolled into the content
      // (i.e. they're tapping the top area, not mid-scroll)
      const el = descRef.current;
      if (el && el.scrollTop > 6) return; // let them keep scrolling
      setExpanded(false);
    }
  }, [expanded]);

  // Collapse button in the top-right when expanded
  const handleCollapse = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (descRef.current) descRef.current.scrollTop = 0;
    setExpanded(false);
  }, []);

  return (
    <div className="job-entry" style={{ '--stagger': index } as React.CSSProperties}>

      {/* Index */}
      <div className="jc-idx">{index + 1}</div>

      {/* Company + title */}
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

      {/* Description */}
      <div
        ref={descRef}
        className={`jc-desc${expanded ? ' expanded' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
      >
        {desc
          ? <Highlight text={desc} kw={filtersKeyword} lang={targetLang} />
          : <span className="no-desc">no description available</span>}

        {/* Collapsed: expand hint at bottom */}
        {!expanded && <span className="expand-hint">↕</span>}

        {/* Expanded: close button pinned to top-right */}
        {expanded && (
          <span
            className="desc-close"
            onPointerDown={e => e.stopPropagation()}
            onClick={handleCollapse}
          >
            ✕
          </span>
        )}
      </div>

      {/* Link + time */}
      <div className="jc-right">
        {job.link && (
          <a className="jc-link" href={job.link} target="_blank" rel="noopener noreferrer">
            apply ↗
          </a>
        )}
        <div className="jc-time">
          {ago     && <span className="ago">{ago}</span>}
          {dateStr && <span className="date-sub">{dateStr}</span>}
        </div>
      </div>

    </div>
  );
};
