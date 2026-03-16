import React, { useState } from 'react';
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

  const desc    = job._translatedDesc ?? job.description ?? '';
  const ago     = job._parsedDate ? formatTimeAgo(job._parsedDate) : '';
  const dateStr = job._parsedDate
    ? job._parsedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
    : '';

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
        className={`jc-desc${expanded ? ' expanded' : ''}`}
        title="click to expand"
        onClick={() => setExpanded(v => !v)}
      >
        {desc
          ? <Highlight text={desc.slice(0, 700)} kw={filtersKeyword} lang={targetLang} />
          : <span className="no-desc">no description available</span>}
        {!expanded && <span className="expand-hint">↕</span>}
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
