import React, { useContext } from 'react';
import { UserContext } from '../context/userContext';

const LogoutButton: React.FC = () => {
  const [, setUser] = useContext(UserContext);
  return (
    <span
      className="auth-label logout"
      onClick={() => { setUser({}); localStorage.removeItem('waypost_user'); }}
    >
      LOGOUT
    </span>
  );
};

export default LogoutButton;
