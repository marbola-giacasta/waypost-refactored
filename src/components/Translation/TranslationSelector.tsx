import React, { useState, useRef, useEffect } from 'react';
import { LANGUAGES, LANGUAGE_NAMES } from './languages';

interface Props {
  targetLang:    string;
  setTargetLang: (lang: string) => void;
}

export const TranslationSelector: React.FC<Props> = ({ targetLang, setTargetLang }) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);
  const current         = LANGUAGES.find(l => l.code === targetLang);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="trans-root" ref={ref}>
      <button className="trans-trigger" onClick={() => setOpen(v => !v)}>
        <span className="trans-label">TRANSLATE</span>
        {current?.flag
          ? <img src={current.flag} alt={current.label} className="trans-flag" />
          : <span className="trans-no">NO</span>}
        <span className="trans-code">{current?.label ?? 'NO'}</span>
        <span className="trans-caret">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="trans-dropdown">
          {LANGUAGES.map(lang => (
            <div
              key={lang.code}
              className={`trans-item ${targetLang === lang.code ? 'active' : ''}`}
              onClick={() => { setTargetLang(lang.code); setOpen(false); }}
            >
              {lang.flag
                ? <img src={lang.flag} alt={lang.label} className="trans-flag" />
                : <span className="trans-no">NO</span>}
              <span>{lang.code === 'no' ? 'No translation' : LANGUAGE_NAMES[lang.code]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
