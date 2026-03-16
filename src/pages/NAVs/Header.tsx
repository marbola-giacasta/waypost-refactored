import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/userContext';
import LoginButton    from '../../buttons/LoginButton';
import RegisterButton from '../../buttons/RegisterButton';
import LogoutButton   from '../../buttons/LogoutButton';

interface HeaderProps {
  tickerText:  string;
  resultCount: number;
}

const Header: React.FC<HeaderProps> = ({ tickerText, resultCount }) => {
  const [user]        = useContext(UserContext);
  const [activeForm, setActiveForm] = useState<'login' | 'register' | null>(null);

  const toggle = (form: 'login' | 'register') =>
    setActiveForm(prev => (prev === form ? null : form));

  return (
    <header className="hdr">
      {/* Brand block */}
      <div className="hdr-brand">waypost</div>

      <div className="hdr-pipe" />

      {/* Vertical marquee tagline — restored */}
      <div className="hdr-marquee-wrap">
        <div className="hdr-marquee-inner">jobs ... in a minute</div>
      </div>

      {/* Spacer pushes right content to the edge */}
      <div style={{ flex: 1 }} />

      {/* Right side */}
      <div className="hdr-right">
        <span className="hdr-count">{resultCount} roles</span>

        {user.name ? (
          <div className="auth-row">
            <span className="hdr-username">{user.name}</span>
            <LogoutButton />
          </div>
        ) : (
          <div className="auth-row">
            <LoginButton
              expanded={activeForm === 'login'}
              onToggle={() => toggle('login')}
            />
            {activeForm === null && <span className="auth-sep">|</span>}
            <RegisterButton
              expanded={activeForm === 'register'}
              onToggle={() => toggle('register')}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
