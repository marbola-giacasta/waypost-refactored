import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider }    from './context/userContext';
import LandingPage         from './pages/LandingPage';
import IndexPage           from './pages/IndexPage';
import { FloatingFooter }  from './components/Layout/FloatingFooter';

const AboutPage: React.FC = () => (
  <div style={{
    height: '100dvh', background: '#0a0c0b', color: '#00ff41',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.18em', fontSize: 13,
    position: 'relative',
  }}>
    about — coming soon
    <FloatingFooter />
  </div>
);

const DisclaimerPage: React.FC = () => (
  <div style={{
    height: '100dvh', background: '#0a0c0b', color: '#00ff41',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.18em', fontSize: 13,
    position: 'relative',
  }}>
    disclaimer — coming soon
    <FloatingFooter />
  </div>
);

export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/"           element={<LandingPage />} />
        <Route path="/search"     element={<IndexPage />} />
        <Route path="/about"      element={<AboutPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </UserProvider>
  );
}
