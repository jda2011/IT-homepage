'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [year] = useState('2026');

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#38bdf8' }}>🚀 미래공학 학급 홈페이지</h1>
      </header>

      <section style={{ border: '2px dashed #38bdf8', padding: '20px', textAlign: 'center', borderRadius: '10px', marginBottom: '30px' }}>
        <h2>{year}년 학급 메인 사진</h2>
        <div 
          onClick={() => alert('파일 선택 창이 열립니다.')}
          style={{ cursor: 'pointer', padding: '40px', backgroundColor: '#1e293b', borderRadius: '8px', color: '#94a3b8' }}
        >
          사진을 넣어주세요 (클릭하여 파일 선택)
        </div>
      </section>

      <nav style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <Link href="/members" style={buttonStyle}>학급 소개</Link>
        <Link href="/news" style={buttonStyle}>소식 누리집</Link>
        <Link href="/daily" style={buttonStyle}>하루 글</Link>
      </nav>
    </main>
  );
}

const buttonStyle = {
  padding: '12px 24px',
  backgroundColor: '#0284c7',
  color: '#fff',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold'
};
