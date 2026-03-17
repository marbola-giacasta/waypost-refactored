import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { ParsedCompanyWithTranslation } from '../../utils/constants';
import { Highlight } from '../Filters/Highlight';

interface Props {
  company:        ParsedCompanyWithTranslation;
  filtersKeyword: string;
  targetLang:     string;
  index:          number;
  resetKey?:      number;  // increments when user navigates away — collapses open drawers
}

export const CompanyItem: React.FC<Props> = ({ company, filtersKeyword, targetLang, index, resetKey }) => {
  const [expanded, setExpanded] = useState(false);
  const descRef   = useRef<HTMLDivElement>(null);
  const pointerY  = useRef<number>(0);
  const didScroll = useRef(false);

  // Silently collapse any open drawer when the parent signals a reset.
  // This avoids remounting the panel (which causes the white-flash "reload").
  useEffect(() => {
    if (resetKey === undefined) return;
    setExpanded(false);
    if (descRef.current) descRef.current.scrollTop = 0;
  }, [resetKey]);

  const desc    = company._translatedDesc ?? company.Panoramica ?? '';
  const sectors = company['Settori di competenza'] ?? '';

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerY.current  = e.clientY;
    didScroll.current = false;
  }, []);
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (Math.abs(e.clientY - pointerY.current) > 8) didScroll.current = true;
  }, []);

  const handleCardClick = useCallback(() => {
    if (didScroll.current) { didScroll.current = false; return; }
    setExpanded(v => !v);
  }, []);

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

      {/* ── Card row ── */}
      <div
        className={`job-entry company-card${expanded ? ' is-expanded' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleCardClick}
      >
        <div className="jc-idx">{index + 1}</div>

        <div className="jc-main">
          <div className="jc-company">
            <Highlight text={company['Company Name']} kw={filtersKeyword} lang={targetLang} />
            {company._sourceFile && (
              <span className="loc-pill">{company._sourceFile}</span>
            )}
          </div>
          <div className="jc-sectors-marquee">
            <span className="jc-sectors-inner">
              {sectors || 'Various sectors'}
              &nbsp;&nbsp;·&nbsp;&nbsp;
              {sectors || 'Various sectors'}
            </span>
          </div>
        </div>

        {/* Links — fixed 120px right column, always visible if populated */}
        <div className="jc-right">
          {company.Website && company.Website !== 'N/A' && (
            <a
              className="jc-link"
              href={company.Website.startsWith('http') ? company.Website : `https://${company.Website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
            >
              website ↗
            </a>
          )}
          {company['LinkedIn URL'] && company['LinkedIn URL'] !== 'N/A' && (
            <a
              className="jc-link"
              href={company['LinkedIn URL']}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
            >
              linkedin ↗
            </a>
          )}
        </div>
      </div>

      {/* ── Description drawer — identical mechanism to JobItem ── */}
      {expanded && (
        <div
          className="job-desc-drawer"
          ref={descRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onClick={handleDrawerClick}
        >
          <button className="desc-close" onClick={handleCollapse}>✕ close</button>
          {desc
            ? <Highlight text={desc} kw={filtersKeyword} lang={targetLang} />
            : <span className="no-desc">no description available</span>}
        </div>
      )}

    </div>
  );
};
