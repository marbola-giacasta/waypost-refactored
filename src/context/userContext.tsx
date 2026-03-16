import { createContext, useState, useEffect } from 'react';
import type { Dispatch, SetStateAction, ReactNode } from 'react';

export interface User {
  id?:              string;
  name?:            string;
  email?:           string;
  accessToken?:     string;
  spokenLanguages?: string[];
  [key: string]:    unknown;
}

type UserContextType = [User, Dispatch<SetStateAction<User>>];

const UserContext = createContext<UserContextType>([{}, () => {}]);

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const stored = localStorage.getItem('waypost_user');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      localStorage.setItem('waypost_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('waypost_user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={[user, setUser]}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
