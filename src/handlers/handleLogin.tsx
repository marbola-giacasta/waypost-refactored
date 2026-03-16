import type { User } from '../context/userContext';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export const handleLoginSubmit = async (
  credentials: { email: string; password: string },
  setUser: (u: User) => void,
  onSuccess?: () => void,
  onError?:   (e: Error) => void,
) => {
  try {
    const res = await fetch(`${API_BASE}/api/users/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    setUser({
      name:            data.username,
      email:           data.email,
      id:              data._id,
      spokenLanguages: data.spokenLanguages,
      accessToken:     data.accessToken,
    });
    onSuccess?.();
  } catch (err) {
    onError?.(err as Error);
    console.error('Login error:', err);
  }
};

export const handleRegisterSubmit = async (
  credentials: { email: string; password: string; username: string },
  onSuccess?: () => void,
  onError?:   (e: Error) => void,
) => {
  try {
    const res = await fetch(`${API_BASE}/api/users/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Registration failed');
    onSuccess?.();
  } catch (err) {
    onError?.(err as Error);
    console.error('Register error:', err);
  }
};
