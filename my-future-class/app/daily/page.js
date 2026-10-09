'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { checkIsAdmin } from '../../lib/admin';
import Link from 'next/link';
import ThemeToggle from '../../components/ThemeToggle';

export default function Daily() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [isBanned, setIsBanned] = useState(false);
  const [posts, setPosts] = useState([]);
  const [inputText, setInputText] = useState('');

  const badWords = ['비난', '욕설'];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setIsAdmin(checkIsAdmin(user.email));
      }
    };
    getUser();
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('daily_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setPosts(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    alert('로그아웃 되었습니다.');
  };

  const handlePostSubmit = async () => {
    if (!user) {
      alert('글을 작성하려면 먼저 로그인해야 합니다.');
      return;
    }

    if (isBanned && !isAdmin) {
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
        alert('경고 3회가 누적되어 접근이 제한됩니다.');
      }
      return;
    }

    if (!inputText.trim()) return;

    const { error } = await supabase
      .from('daily_posts')
      .insert([{ text: inputText, author_email: user.email }]);

    if (error) {
      alert('글 저장에 실패했습니다.');
    } else {
      setInputText('');
      fetchPosts();
    }
  };

  const handleDeletePost = async (id) => {
    if (!isAdmin) return;
    if (confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      const { error } = await supabase
        .from('daily_posts')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchPosts();
      } else {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* 상단 네비게이션 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontWeight: 'bold' }}>
            🏠 메인 홈
          </Link>
          <h1 style={{ fontSize: '20px', margin: 0 }}>💬 하루 글 (자유 게시판)</h1>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* 다크/라이트 모드 토글 버튼 */}
          <ThemeToggle />

          {user ? (
            <div>
              <span>👤 {user.email} {isAdmin ? '👑(관리자)' : ''} </span>
              <button onClick={handleLogout} style={{ marginLeft: '10px', padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>로그아웃</button>
            </div>
          ) : (
            <Link href="/login" style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
              🔐 로그인 / 회원가입
            </Link>
          )}
        </div>
      </div>

      <p style={{ marginTop: '10px', color: 'var(--text-sub)' }}>
        상태: {user ? (isAdmin ? '👑 관리자 권한 보유' : '일반 사용자') : '비로그인'} | 경고 횟수: {warningCount}/3
      </p>

      {user ? (
        <div style={{ margin: '20px 0' }}>
          <input 
            type="text" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)}
            placeholder="하고 싶은 말을 적어주세요."
            style={{ width: '300px', padding: '10px', marginRight: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
          />
          <button onClick={handlePostSubmit} style={{ padding: '10px 18px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>글 등록</button>
        </div>
      ) : (
        <p style={{ color: '#ef4444', margin: '20px 0' }}>글을 작성하려면 로그인이 필요합니다.</p>
      )}

      <div>
        <h3>등록된 글 목록</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map((post) => (
            <li key={post.id} style={{ marginBottom: '10px', padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{post.text}</span>
              {isAdmin && (
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  [삭제]
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
