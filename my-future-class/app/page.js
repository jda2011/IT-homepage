'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { checkIsAdmin } from '../lib/admin';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mainPhotoUrl, setMainPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setIsAdmin(checkIsAdmin(user.email));
      }
      fetchMainPhoto();
      fetchRecentPosts();
    };
    init();
  }, []);

  const fetchMainPhoto = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'main_photo').single();
    if (data?.value) setMainPhotoUrl(data.value);
  };

  const fetchRecentPosts = async () => {
    const { data } = await supabase.from('daily_posts').select('*').order('created_at', { ascending: false }).limit(3);
    if (data) setRecentPosts(data);
  };

  // 메인 학급 사진 등록 (관리자 기능)
  const handleMainPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !isAdmin) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `main/photo_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('members').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('members').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // DB에 메인 사진 URL 저장
      await supabase.from('settings').upsert({ key: 'main_photo', value: publicUrl });

      setMainPhotoUrl(publicUrl);
      alert('메인 학급 사진이 업데이트 되었습니다!');
    } catch (err) {
      alert(`사진 업로드 실패: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    alert('로그아웃 되었습니다.');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* 1. 상단 유틸리티 & 헤더 */}
      <header style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* 전인고 로고 이미지 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="전인고 로고" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
            <div>
              <h1 style={{ fontSize: '20px', margin: 0, fontWeight: 'bold' }}>전인고등학교 학급 홈페이지</h1>
              <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-sub)' }}>우리들의 따뜻한 소통 공간</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggle />
            {user ? (
              <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>👤 <strong>{user.email.split('@')[0]}</strong> {isAdmin ? '👑' : ''}님</span>
                <button onClick={handleLogout} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
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

        {/* 2. 네비게이션 메뉴바 */}
        <nav style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '30px' }}>
            <Link href="/" style={{ padding: '14px 0', color: '#2563eb', fontWeight: 'bold', textDecoration: 'none', borderBottom: '3px solid #2563eb' }}>
              🏠 메인 홈
            </Link>
            <Link href="/daily" style={{ padding: '14px 0', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}>
              💬 하루 글 (게시판)
            </Link>
            <Link href="/members" style={{ padding: '14px 0', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}>
              👥 학급 구성원
            </Link>
          </div>
        </nav>
      </header>

      {/* 3. 본문 영역 */}
      <main style={{ maxWidth: '1100px', margin: '25px auto', padding: '0 20px' }}>
        
        {/* 설명 배너 */}
        <section style={{ backgroundColor: '#2563eb', color: '#fff', padding: '30px', borderRadius: '12px', marginBottom: '20px' }}>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            2026학년도 우리반 홈페이지
          </span>
          <h2 style={{ fontSize: '24px', margin: '10px 0 8px 0' }}>반갑습니다! 우리들의 활기찬 학급 공간입니다 🌟</h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
            하루 글 게시판에서 서로의 생각을 나누고 학급 구성원 프로필을 확인하세요.
          </p>
        </section>

        {/* 📷 설명 아래 학급 메인 사진 영역 */}
        <section style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '25px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>🖼️ 우리반 메인 단체 사진</h3>
          
          <div style={{ width: '100%', maxHeight: '450px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', overflow: 'hidden', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
            {mainPhotoUrl ? (
              <img src={mainPhotoUrl} alt="우리반 메인 사진" style={{ width: '100%', maxHeight: '450px', objectFit: 'cover' }} />
            ) : (
              <p style={{ color: 'var(--text-sub)' }}>등록된 메인 사진이 없습니다.</p>
            )}
          </div>

          {/* 관리자 전용 사진 등록 버튼 */}
          {isAdmin && (
            <div style={{ marginTop: '15px' }}>
              <label style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'inline-block' }}>
                {isUploading ? '사진 업로드 중...' : '📷 메인 사진 변경하기'}
                <input type="file" accept="image/*" onChange={handleMainPhotoUpload} style={{ display: 'none' }} disabled={isUploading} />
              </label>
            </div>
          )}
        </section>

        {/* 하단 요약 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>💬 최근 하루 글</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentPosts.map((post) => (
                <li key={post.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>📌 {post.text}</li>
              ))}
            </ul>
          </div>
          
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>👥 학급 구성원 카탈로그</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginBottom: '15px' }}>선생님과 학생들의 프로필 및 사진을 관리하고 조회하세요.</p>
            <Link href="/members" style={{ display: 'block', textAlign: 'center', padding: '10px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
              구성원 보러가기 →
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
