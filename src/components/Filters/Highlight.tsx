import React from 'react';

interface Props {
  text: string;
  kw:   string;
  lang?: string;
}

export const Highlight: React.FC<Props> = ({ text, kw }) => {
  if (!text) return null;
  if (!kw || kw.trim().length < 2) return <>{text}</>;

  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts   = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === kw.toLowerCase()
          ? <mark key={i} className="highlight-keyword">{part}</mark>
          : <span key={i}>{part}</span>,
      )}
    </>
  );
};
