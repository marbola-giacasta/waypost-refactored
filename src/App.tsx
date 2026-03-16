import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/userContext';
import LandingPage      from './pages/LandingPage';
import IndexPage        from './pages/IndexPage';

// Placeholder — replace with real About page when ready
const AboutPage: React.FC = () => (
  <div style={{
    height: '100dvh', background: '#0a0c0b', color: '#00ff41',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.18em', fontSize: 13,
  }}>
    about — coming soon
  </div>
);

const DisclaimerPage: React.FC = () => (
  <div style={{
    height: '100dvh', background: '#0a0c0b', color: '#00ff41',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.18em', fontSize: 13,
  }}>
    disclaimer — coming soon
  </div>
);

export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/"        element={<LandingPage />} />
        <Route path="/search"  element={<IndexPage />} />
        <Route path="/about"       element={<AboutPage />} />
        <Route path="/disclaimer"  element={<DisclaimerPage />} />
        {/* Redirect any unknown path back to landing */}
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </UserProvider>
  );
}
