import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider }  from './context/userContext';
import IndexPage         from './pages/IndexPage';

export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<IndexPage />} />
      </Routes>
    </UserProvider>
  );
}
