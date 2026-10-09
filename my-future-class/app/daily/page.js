'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { checkIsAdmin } from '../../lib/admin';
import Link from 'next/link';
import ThemeToggle from '../../components/ThemeToggle';

export default function DailyPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setIsAdmin(checkIsAdmin(user.email));
      }
      fetchPosts();
    };
    init();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from('daily_posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!user) return alert('로그인이 필요합니다.');
    if (!textInput.trim()) return alert('내용을 입력해 주세요.');

    const { error } = await supabase.from('daily_posts').insert([{ text: textInput.trim() }]);
    if (!error) {
      setTextInput('');
      fetchPosts();
    } else {
      alert(`글 작성 실패: ${error.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* 1. 상단 헤더 통일 */}
      <header style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!logoError ? (
              <img src="/logo.png" alt="IT 로고" onError={() => setLogoError(true)} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                IT
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '20px', margin: 0, fontWeight: 'bold' }}>미래공학소스쿨 홈페이지</h1>
              <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-sub)' }}>우리들의 따뜻한 소통 공간</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggle />
            {user ? (
              <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>👤 <strong>{user.user_metadata?.nickname || user.email.split('@')[0]}</strong> {isAdmin ? '👑' : ''}님</span>
                <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  로그아웃
                </button>
              </div>
            ) : (
              <Link href="/login" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}>
                🔐 로그인 / 회원가입
              </Link>
            )}
          </div>
        </div>

        {/* 2. 네비게이션 통일 */}
        <nav style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '30px' }}>
            <Link href="/" style={{ padding: '14px 0', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}>
              🏠 메인 홈
            </Link>
            <Link href="/daily" style={{ padding: '14px 0', color: '#2563eb', fontWeight: 'bold', textDecoration: 'none', borderBottom: '3px solid #2563eb' }}>
              💬 하루 글 (게시판)
            </Link>
            <Link href="/members" style={{ padding: '14px 0', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}>
              👥 소스쿨 구성원
            </Link>
          </div>
        </nav>
      </header>

      {/* 3. 본문 */}
      <main style={{ maxWidth: '1100px', margin: '25px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>💬 하루 글 한줄 게시판</h2>

        {user && (
          <form onSubmit={handleAddPost} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
            <input
              type="text"
              placeholder="오늘 하루 하고 싶은 한마디를 나누어보세요!"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
            />
            <button type="submit" style={{ padding: '0 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              등록
            </button>
          </form>
        )}

        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '15px' }}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '15px' }}>📌 {post.text}</p>
                <span style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '4px', display: 'block' }}>
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-sub)', textAlign: 'center', padding: '20px 0' }}>등록된 한줄 글이 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
