import React, { useState } from 'react';
import type { ParsedCompanyWithTranslation } from '../../utils/constants';
import { Highlight } from '../Filters/Highlight';

interface Props {
  company:        ParsedCompanyWithTranslation;
  filtersKeyword: string;
  targetLang:     string;
  index:          number;
}

export const CompanyItem: React.FC<Props> = ({ company, filtersKeyword, targetLang, index }) => {
  const [expanded, setExpanded] = useState(false);
  const desc = company._translatedDesc ?? company.Panoramica ?? '';
  const sectors = company['Settori di competenza'] ?? '';

  return (
    <div className="job-entry" style={{ '--stagger': index } as React.CSSProperties}>

      <div className="jc-idx">{index + 1}</div>

      <div className="jc-main">
        <div className="jc-company">
          <Highlight text={company['Company Name']} kw={filtersKeyword} lang={targetLang} />
          {company._sourceFile && (
            <span className="loc-pill">{company._sourceFile}</span>
          )}
        </div>
        <div className="jc-title company-sectors">
          {sectors || 'Various sectors'}
        </div>
      </div>

      <div
        className={`jc-desc${expanded ? ' expanded' : ''}`}
        onClick={() => setExpanded(v => !v)}
        title="click to expand"
      >
        {desc
          ? <Highlight text={desc.slice(0, 700)} kw={filtersKeyword} lang={targetLang} />
          : <span className="no-desc">no description available</span>}
        {!expanded && <span className="expand-hint">↕</span>}
      </div>

      <div className="jc-right">
        {company.Website && (
          <a
            className="jc-link"
            href={company.Website.startsWith('http') ? company.Website : `https://${company.Website}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            website ↗
          </a>
        )}
        {company['LinkedIn URL'] && (
          <a
            className="jc-link linkedin"
            href={company['LinkedIn URL']}
            target="_blank"
            rel="noopener noreferrer"
          >
            linkedin ↗
          </a>
        )}
        {company['Latest News'] && (
          <div className="co-news-ticker">
            <div className="co-news-inner">{company['Latest News']}</div>
          </div>
        )}
      </div>

      <div className="jc-scraped" />
    </div>
  );
};
