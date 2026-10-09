'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { checkIsAdmin } from '../lib/admin';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    const getUserAndData = async () => {
      // 1. 유저 확인
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setIsAdmin(checkIsAdmin(user.email));
      }

      // 2. 최근 하루 글 (공지/게시글) 3개 불러오기
      const { data: postsData } = await supabase
        .from('daily_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      if (postsData) setRecentPosts(postsData);

      // 3. 구성원 수 확인
      const { count } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
      if (count !== null) setMemberCount(count);
    };

    getUserAndData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    alert('로그아웃 되었습니다.');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* 1. 최상단 학교/학급 유틸리티 바 */}
      <header style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* 학교 및 학급 로고 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🏫</span>
            <div>
              <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 'bold' }}>전인고등학교 학급 홈페이지</h1>
              <p style={{ fontSize: '12px', margin: 0, color: 'var(--text-sub)' }}>우리들의 따뜻한 소통 공간</p>
            </div>
          </div>

          {/* 우측 로그인 & 테마 설정 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <ThemeToggle />
            {user ? (
              <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>👤 <strong>{user.email.split('@')[0]}</strong> {isAdmin ? '👑' : ''}님</span>
                <button
                  onClick={handleLogout}
                  style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link href="/login" style={{ padding: '6px 14px', backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}>
                🔐 로그인 / 회원가입
              </Link>
            )}
          </div>
        </div>

        {/* 2. 네비게이션 메뉴바 */}
        <nav style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '30px' }}>
            <Link href="/" style={{ padding: '12px 0', color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none', borderBottom: '2px solid #3b82f6' }}>
              🏠 메인 홈
            </Link>
            <Link href="/daily" style={{ padding: '12px 0', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}>
              💬 하루 글 (게시판)
            </Link>
            <Link href="/members" style={{ padding: '12px 0', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}>
              👥 학급 구성원
            </Link>
          </div>
        </nav>
      </header>

      <main style={{ maxWidth: '1100px', margin: '20px auto', padding: '0 20px' }}>
        {/* 3. 메인 배너 영역 */}
        <section style={{ backgroundColor: '#2563eb', color: '#fff', padding: '35px 30px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            2026학년도 우리반 홈페이지
          </span>
          <h2 style={{ fontSize: '26px', margin: '10px 0 8px 0' }}>반갑습니다! 우리들의 활기찬 학급 공간입니다 🌟</h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
            하루 글 게시판에서 서로의 생각을 나누고, 학급 구성원 메뉴에서 동료들의 프로필을 확인해보세요.
          </p>
        </section>

        {/* 4. 메인 위젯 분할 구역 (알림판 & 빠른 링크 & 구성원 요약) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* 위젯 1: 최근 게시글 (하루 글 요약) */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>💬 최근 등록된 하루 글</h3>
              <Link href="/daily" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none' }}>
                전체보기 +
              </Link>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <li key={post.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    📌 {post.text}
                  </li>
                ))
              ) : (
                <li style={{ padding: '15px 0', color: 'var(--text-sub)', fontSize: '14px', textAlign: 'center' }}>
                  아직 등록된 글이 없습니다.
                </li>
              )}
            </ul>
          </div>

          {/* 위젯 2: 학급 요약 및 관리자 상태 */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>📊 우리반 현황</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span>👥 등록된 학급 구성원</span>
                <strong>{memberCount} 명</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span>👑 나의 권한 상태</span>
                <strong style={{ color: isAdmin ? '#10b981' : 'var(--text-color)' }}>
                  {user ? (isAdmin ? '관리자 권한 (@jeonin)' : '일반 사용자') : '비로그인'}
                </strong>
              </div>
            </div>
            <div style={{ marginTop: '15px' }}>
              <Link href="/members" style={{ display: 'block', textAlign: 'center', padding: '10px', backgroundColor: '#10b981', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                📷 구성원 및 사진 보러가기
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* 5. 하단 푸터 (학교 정보) */}
      <footer style={{ marginTop: '50px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', padding: '20px 0', textAlign: 'center', fontSize: '13px', color: 'var(--text-sub)' }}>
        <p style={{ margin: '5px 0' }}>전인고등학교 학급 홈페이지 | 관리자 도메인: @jeonin.gwe.hs.kr</p>
        <p style={{ margin: 0 }}>© 2026 Future Class. All rights reserved.</p>
      </footer>
    </div>
  );
}
