'use client';

import { useState, useEffect } from 'react';

export default function Daily() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [isBanned, setIsBanned] = useState(false);
  const [posts, setPosts] = useState([]);
  const [inputText, setInputText] = useState('');

  const badWords = ['비난', '욕설'];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const confirmAdmin = window.confirm('관리자 권한을 허용하시겠습니까?');
      if (confirmAdmin) {
        setIsAdmin(true);
      }
    }
  }, []);

  const handlePostSubmit = () => {
    if (isBanned) {
      alert('경고 3회 누적으로 글을 작성할 수 없습니다.');
      return;
    }

    const hasBadWord = badWords.some((word) => inputText.includes(word));

    if (hasBadWord) {
      const newCount = warningCount + 1;
      setWarningCount(newCount);
      alert(`부적절한 표현이 포함되어 있습니다. (경고 ${newCount}/3회)`);

      if (newCount >= 3) {
        setIsBanned(true);
        alert('경고 3회가 누적되어 관리자의 승인 전까지 접근이 제한됩니다.');
      }
      return;
    }

    if (!inputText.trim()) return;

    setPosts([...posts, { text: inputText, id: Date.now() }]);
    setInputText('');
  };

  if (isBanned && !isAdmin) {
    return (
      <div style={{ padding: '50px', color: 'red', textAlign: 'center' }}>
        <h1>🚫 접근이 제한되었습니다.</h1>
        <p>경고 3회 누적으로 인해 관리자의 승인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <h1>💬 하루 글 (자유 게시판)</h1>
      <p>현재 상태: {isAdmin ? '관리자 Mode' : '일반 사용자 Mode'} | 나의 경고 횟수: {warningCount}/3</p>

      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)}
          placeholder="하고 싶은 말을 적어주세요."
          style={{ width: '300px', padding: '8px', marginRight: '10px', color: '#000' }}
        />
        <button onClick={handlePostSubmit} style={{ padding: '8px 16px' }}>글 등록</button>
      </div>

      <div>
        <h3>등록된 글 목록</h3>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>{post.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
