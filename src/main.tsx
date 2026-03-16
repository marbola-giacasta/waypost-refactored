import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './styles/variables.css';
import './styles/globals.css';
import './styles/header.css';
import './styles/auth.css';
import './styles/filters.css';
import './styles/layout.css';
import './styles/jobs.css';
import './styles/translation.css';
import './styles/mobile.css';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
