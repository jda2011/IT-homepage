'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (mode) => {
    document.documentElement.setAttribute('data-theme', mode);
    document.body.setAttribute('data-theme', mode);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 14px',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-color)',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {theme === 'dark' ? '☀️ 라이트 모드' : '🌙 다크 모드'}
    </button>
  );
}
