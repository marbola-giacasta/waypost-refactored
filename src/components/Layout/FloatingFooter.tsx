import React from 'react';
import { useNavigate } from 'react-router-dom';

export const FloatingFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="floating-footer">
      <button
        className="footer-btn footer-btn-back"
        onClick={() => navigate(-1)}
        title="Go back"
      >
        ←
      </button>

      <div className="footer-sep" />

      <button className="footer-btn" onClick={() => navigate('/about')}>
        ABOUT
      </button>

      <div className="footer-sep" />

      <button className="footer-btn" onClick={() => navigate('/disclaimer')}>
        DISCLAIMER
      </button>

      <div className="footer-sep" />

      <button className="footer-btn" onClick={() => navigate('/')}>
        HOME
      </button>
    </div>
  );
};
