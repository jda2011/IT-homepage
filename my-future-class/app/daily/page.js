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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (!user) return alert('글을 작성하려면 먼저 로그인해 주세요.');
    if (!textInput.trim()) return alert('내용을 입력해 주세요.');

    setIsSubmitting(true);
    const authorName = user.user_metadata?.nickname || user.email.split('@')[0];

    const { error } = await supabase.from('daily_posts').insert([
      { 
        text: textInput.trim(),
        author_name: authorName
      }
    ]);

    if (!error) {
      setTextInput('');
      fetchPosts();
    } else {
      alert(`글 작성 실패: ${error.message}`);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* 1. 상단 헤더 */}
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

        {/* 2. 네비게이션 */}
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

      {/* 3. 본문 영역 */}
      <main style={{ maxWidth: '1100px', margin: '25px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>💬 하루 글 한줄 게시판</h2>

        {/* 글 작성 폼 */}
        {user ? (
          <form onSubmit={handleAddPost} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
            <input
              type="text"
              placeholder="오늘 하루 하고 싶은 한마디를 나누어보세요!"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ padding: '0 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isSubmitting ? '등록 중...' : '등록'}
            </button>
          </form>
        ) : (
          <p style={{ padding: '15px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px', color: 'var(--text-sub)', marginBottom: '25px' }}>
            💡 글을 남기시려면 <Link href="/login" style={{ color: '#2563eb', fontWeight: 'bold' }}>로그인</Link>이 필요합니다.
          </p>
        )}

        {/* 글 목록 (닉네임 + 날짜 표시) */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '15px' }}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '15px' }}>📌 {post.text}</p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-sub)' }}>
                  <span>👤 <strong>{post.author_name || '익명'}</strong></span>
                  <span>📅 {new Date(post.created_at).toLocaleString('ko-KR')}</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-sub)', textAlign: 'center', padding: '20px 0' }}>등록된 하루 글이 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}

<nav style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
  <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
    <Link href="/" style={{ padding: '14px 0', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}>
      🏠 메인 홈
    </Link>
    <Link href="/daily" style={{ padding: '14px 0', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}>
      💬 하루 글 (게시판)
    </Link>
    <Link href="/members" style={{ padding: '14px 0', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}>
      👥 소스쿨 구성원
    </Link>
    <Link href="/notice" style={{ padding: '14px 0', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}>
      📢 소스쿨 공지
    </Link>
  </div>
</nav>
