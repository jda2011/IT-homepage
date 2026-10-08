'use client';

import { useState } from 'react';

export default function Members() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [years, setYears] = useState(
    Array.from({ length: 2027 - 2005 + 1 }, (_, i) => (2005 + i).toString())
  );
  const [newYear, setNewYear] = useState('');

  const handleAddYear = () => {
    if (newYear && !years.includes(newYear)) {
      setYears([...years, newYear].sort());
      setNewYear('');
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <h1>👨‍💻 학급 구성원 소개</h1>

      <section style={{ marginBottom: '40px' }}>
        <h2>선생님들</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={cardStyle} onClick={() => alert('선생님 사진 등록')}>
            <p>사진을 넣어주세요</p>
            <p><strong>선생님 성함</strong></p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <label>년도 선택: </label>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ padding: '5px', color: '#000' }}>
          {years.map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>

        <div style={{ marginTop: '10px' }}>
          <input 
            type="number" 
            placeholder="새 년도 입력 (예: 2028)" 
            value={newYear} 
            onChange={(e) => setNewYear(e.target.value)}
            style={{ padding: '5px', marginRight: '5px', color: '#000' }}
          />
          <button onClick={handleAddYear} style={{ padding: '5px 10px' }}>년도 창 추가</button>
        </div>
      </section>

      <section>
        <h3>{selectedYear}년도 학생 목록</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
          <div style={cardStyle} onClick={() => alert('학생 사진 등록')}>
            <p>사진을 넣어주세요</p>
            <p>학생 이름</p>
          </div>
        </div>
      </section>
    </div>
  );
}

const cardStyle = {
  border: '1px solid #334155',
  padding: '15px',
  textAlign: 'center',
  borderRadius: '8px',
  backgroundColor: '#1e293b',
  cursor: 'pointer'
};
