'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { checkIsAdmin } from '../../lib/admin';
import Link from 'next/link';

export default function Daily() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [isBanned, setIsBanned] = useState(false);
  const [posts, setPosts] = useState([]);
  const [inputText, setInputText] = useState('');

  const badWords = ['비난', '욕설'];

  // 현재 로그인 유저 정보 확인
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

  // DB에서 글 목록 불러오기
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('daily_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setPosts(data);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    alert('로그아웃 되었습니다.');
  };

  // 글 등록
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

  // 관리자 전용: 글 삭제 기능
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
    <div style={{ padding: '20px', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>💬 하루 글 (자유 게시판)</h1>
        <div>
          {user ? (
            <div>
              <span>👤 {user.email} {isAdmin ? '👑(관리자)' : ''} </span>
              <button onClick={handleLogout} style={{ marginLeft: '10px', padding: '5px 10px' }}>로그아웃</button>
            </div>
          ) : (
            <Link href="/login" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
              🔐 로그인 / 회원가입 하러가기
            </Link>
          )}
        </div>
      </div>

      <p style={{ marginTop: '10px' }}>
        상태: {user ? (isAdmin ? '관리자 권한 보유' : '일반 사용자') : '비로그인'} | 경고 횟수: {warningCount}/3
      </p>

      {user ? (
        <div style={{ margin: '20px 0' }}>
          <input 
            type="text" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)}
            placeholder="하고 싶은 말을 적어주세요."
            style={{ width: '300px', padding: '8px', marginRight: '10px', color: '#000' }}
          />
          <button onClick={handlePostSubmit} style={{ padding: '8px 16px' }}>글 등록</button>
        </div>
      ) : (
        <p style={{ color: '#f87171', margin: '20px 0' }}>글을 작성하려면 로그인이 필요합니다.</p>
      )}

      <div>
        <h3>등록된 글 목록</h3>
        <ul>
          {posts.map((post) => (
            <li key={post.id} style={{ marginBottom: '8px' }}>
              {post.text}
              {isAdmin && (
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  style={{ marginLeft: '10px', color: 'red', cursor: 'pointer' }}
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
