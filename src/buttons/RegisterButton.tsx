import React, { useState } from 'react';
import { handleRegisterSubmit } from '../handlers/handleLogin';

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

const RegisterButton: React.FC<Props> = ({ expanded, onToggle }) => {
  const [creds, setCreds] = useState({ email: '', password: '', username: '' });
  const [done,  setDone]  = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    handleRegisterSubmit(
      creds,
      () => { setDone(true); setTimeout(onToggle, 800); },
      () => setError('registration failed'),
    );
  };

  return (
    <form className={`auth-form${expanded ? ' expanded' : ''}`} onSubmit={submit}>
      <span className="auth-label register" onClick={onToggle}>REGISTER</span>
      <div className={`auth-fields${expanded ? ' visible' : ''}`}>
        {done ? (
          <span className="auth-ok">✓ registered</span>
        ) : (
          <>
            <input
              type="text"
              placeholder="username"
              value={creds.username}
              onChange={e => setCreds({ ...creds, username: e.target.value })}
            />
            <input
              type="email"
              placeholder="email"
              value={creds.email}
              onChange={e => setCreds({ ...creds, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="password"
              value={creds.password}
              onChange={e => setCreds({ ...creds, password: e.target.value })}
            />
            <button type="submit">→</button>
            {error && <span className="auth-err">{error}</span>}
          </>
        )}
      </div>
    </form>
  );
};

export default RegisterButton;
