import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize theme from localStorage or default
const savedTheme = localStorage.getItem('mili-theme');
const savedDarkMode = localStorage.getItem('mili-dark-mode');

if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

if (savedDarkMode === 'true') {
  document.documentElement.classList.add('dark');
}

// Listen for theme changes and save to localStorage
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'data-theme') {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme) localStorage.setItem('mili-theme', theme);
    }
    if (mutation.attributeName === 'class') {
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('mili-dark-mode', String(isDark));
    }
  });
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme', 'class'],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
