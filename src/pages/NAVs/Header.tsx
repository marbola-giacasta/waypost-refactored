import React, { useContext, useState } from 'react';
import { UserContext }  from '../../context/userContext';
import LoginButton      from '../../buttons/LoginButton';
import RegisterButton   from '../../buttons/RegisterButton';
import LogoutButton     from '../../buttons/LogoutButton';

interface HeaderProps {
  tickerText:  string;
  resultCount: number;
}

const Header: React.FC<HeaderProps> = ({ tickerText, resultCount }) => {
  const [user]       = useContext(UserContext);
  const [activeForm, setActiveForm] = useState<'login' | 'register' | null>(null);
  const toggle = (f: 'login' | 'register') =>
    setActiveForm(p => (p === f ? null : f));

  const authContent = user.name ? (
    <div className="auth-row">
      <span className="hdr-username">{user.name}</span>
      <LogoutButton />
    </div>
  ) : (
    <div className="auth-row">
      <LoginButton    expanded={activeForm === 'login'}    onToggle={() => toggle('login')} />
      {activeForm === null && <span className="auth-sep">|</span>}
      <RegisterButton expanded={activeForm === 'register'} onToggle={() => toggle('register')} />
    </div>
  );

  return (
    <header className="hdr">

      {/* ── Desktop: single-row ──────────────────────────────────────── */}
      {/* ── Mobile:  row 1 = brand + marquee ────────────────────────── */}
      <div className="hdr-row1">
        <div className="hdr-brand">waypost</div>
        <span className="hdr-pipe">|</span>
        <div className="hdr-marquee-wrap">
          <div className="hdr-marquee-inner">jobs ... in a minute</div>
        </div>

        {/* Desktop-only: spacer + count + auth inline */}
        <div className="hdr-spacer" />
        <div className="hdr-right-desktop">
          <span className="hdr-count">{resultCount} roles</span>
          {authContent}
        </div>
      </div>

      {/* ── Mobile only: row 2 = auth buttons full-width ─────────────── */}
      <div className="hdr-row2-mobile">
        {authContent}
      </div>

    </header>
  );
};

export default Header;
