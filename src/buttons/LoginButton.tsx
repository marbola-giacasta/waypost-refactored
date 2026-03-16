import React, { useState, useContext } from 'react';
import { UserContext } from '../context/userContext';
import { handleLoginSubmit } from '../handlers/handleLogin';

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

const LoginButton: React.FC<Props> = ({ expanded, onToggle }) => {
  const [, setUser]   = useContext(UserContext);
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    handleLoginSubmit(
      creds,
      setUser,
      onToggle,
      () => setError('invalid credentials'),
    );
  };

  return (
    <form className={`auth-form${expanded ? ' expanded' : ''}`} onSubmit={submit}>
      <span className="auth-label login" onClick={onToggle}>LOGIN</span>
      <div className={`auth-fields${expanded ? ' visible' : ''}`}>
        <input
          type="email"
          placeholder="email"
          autoComplete="email"
          value={creds.email}
          onChange={e => setCreds({ ...creds, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="password"
          autoComplete="current-password"
          value={creds.password}
          onChange={e => setCreds({ ...creds, password: e.target.value })}
        />
        <button type="submit">→</button>
        {error && <span className="auth-err">{error}</span>}
      </div>
    </form>
  );
};

export default LoginButton;
