import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PHRASES = [
  'opportunities',
  'focused on Switzerland',
  'no algorithm',
  'no AI',
  'no data stored',
  'if a job surfaces anywhere, we catch it for you',
];

// Each phrase is visible for HOLD ms, then fades out over FADE ms
const HOLD = 4000;
const FADE = 600;
const TOTAL = HOLD + FADE;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [visible,   setVisible]   = useState(true);

  useEffect(() => {
    // Hold → fade out
    const holdTimer = setTimeout(() => setVisible(false), HOLD);
    // After fade out → advance to next phrase and fade in
    const cycleTimer = setTimeout(() => {
      setPhraseIdx(i => (i + 1) % PHRASES.length);
      setVisible(true);
    }, TOTAL);

    return () => { clearTimeout(holdTimer); clearTimeout(cycleTimer); };
  }, [phraseIdx]);

  return (
    <div className="landing-root">
      {/* CRT scanlines overlay (from globals.css) — already on body, nothing to add */}

      {/* Brand */}
      <div className="landing-brand">
        <span className="landing-brand-text">waypost</span>
      </div>

      {/* Rotating phrases */}
      <div className="landing-phrases">
        <p
          className="landing-phrase"
          style={{ opacity: visible ? 1 : 0, transition: `opacity ${FADE}ms ease` }}
        >
          {PHRASES[phraseIdx]}
        </p>
      </div>

      {/* CTA buttons */}
      <div className="landing-ctas">
        <button
          className="landing-btn landing-btn-about"
          onClick={() => navigate('/about')}
        >
          ABOUT
        </button>
        <button
          className="landing-btn landing-btn-search"
          onClick={() => navigate('/search')}
        >
          SEARCH
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
