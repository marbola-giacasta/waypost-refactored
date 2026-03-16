import React, { useState } from 'react';
import { handleRegisterSubmit } from '../handlers/handleLogin';

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

// Two fields only — toggle between "username" and "email" via a small arrow
const RegisterButton: React.FC<Props> = ({ expanded, onToggle }) => {
  const [creds, setCreds]       = useState({ email: '', password: '', username: '' });
  const [useEmail, setUseEmail] = useState(true);   // true = email field, false = username
  const [done,  setDone]        = useState(false);
  const [error, setError]       = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Send whichever identifier the user filled in
    const payload = useEmail
      ? { email: creds.email,    password: creds.password, username: '' }
      : { email: '',             password: creds.password, username: creds.username };
    handleRegisterSubmit(
      payload,
      () => { setDone(true); setTimeout(onToggle, 800); },
      () => setError('failed'),
    );
  };

  return (
    <form className={`auth-form${expanded ? ' expanded' : ''}`} onSubmit={submit}>
      <span className="auth-label register" onClick={onToggle}>REGISTER</span>

      <div className={`auth-fields${expanded ? ' visible' : ''}`}>
        {done ? (
          <span className="auth-ok">✓ done</span>
        ) : (
          <>
            {/* First field — email OR username, with toggle arrow */}
            <div className="auth-toggle-wrap">
              <input
                type={useEmail ? 'email' : 'text'}
                placeholder={useEmail ? 'email' : 'username'}
                autoComplete={useEmail ? 'email' : 'username'}
                value={useEmail ? creds.email : creds.username}
                onChange={e =>
                  useEmail
                    ? setCreds({ ...creds, email: e.target.value })
                    : setCreds({ ...creds, username: e.target.value })
                }
              />
              {/* Small toggle arrow overlaying the right edge of the input */}
              <button
                type="button"
                className="auth-toggle-btn"
                title={useEmail ? 'Switch to username' : 'Switch to email'}
                onClick={() => setUseEmail(v => !v)}
              >
                {useEmail ? '↔u' : '↔@'}
              </button>
            </div>

            {/* Password field */}
            <input
              type="password"
              placeholder="password"
              autoComplete="new-password"
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
