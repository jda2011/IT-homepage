'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { checkIsAdmin } from '../lib/admin';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 메인 사진 배열 및 슬라이드 인덱스 관리
  const [mainPhotos, setMainPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [classMotto, setClassMotto] = useState('배움과 성장이 있는 공간');
  const [isEditingMotto, setIsEditingMotto] = useState(false);
  const [newMottoInput, setNewMottoInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setIsAdmin(checkIsAdmin(user.email));
      }
      fetchMainPhotos();
      fetchClassMotto();
      fetchRecentPosts();
    };
    init();
  }, []);

  // 1분(60초) 타이머 설정 (사진이 2개 이상일 때 자동 전환)
  useEffect(() => {
    if (mainPhotos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % mainPhotos.length);
    }, 60000); // 60,000ms = 1분

    return () => clearInterval(timer);
  }, [mainPhotos]);

  // 메인 사진 목록 불러오기 (단일 URL 및 다중 URL 호환 처리)
  const fetchMainPhotos = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'main_photos').maybeSingle();
    
    if (data?.value) {
      try {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed)) {
          setMainPhotos(parsed);
          return;
        }
      } catch (e) {
        // 기존 단일 URL 구조일 경우 배열로 전환
        setMainPhotos([data.value]);
        return;
      }
    }

    // 기존 main_photo 키 호환성 체크
    const { data: singleData } = await supabase.from('settings').select('value').eq('key', 'main_photo').maybeSingle();
    if (singleData?.value) {
      setMainPhotos([singleData.value]);
    }
  };

  const fetchClassMotto = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'class_motto').maybeSingle();
    if (data?.value) {
      setClassMotto(data.value);
      setNewMottoInput(data.value);
    }
  };

  const fetchRecentPosts = async () => {
    const { data } = await supabase.from('daily_posts').select('*').order('created_at', { ascending: false }).limit(3);
    if (data) setRecentPosts(data);
  };

  const handleSaveMotto = async () => {
    if (!isAdmin) return;
    if (!newMottoInput.trim()) return alert('급훈을 입력해주세요.');

    const { error } = await supabase.from('settings').upsert({ key: 'class_motto', value: newMottoInput });
    if (!error) {
      setClassMotto(newMottoInput);
      setIsEditingMotto(false);
      alert('급훈이 수정되었습니다!');
    } else {
      alert(`급훈 수정 실패: ${error.message}`);
    }
  };

  // 메인 사진 추가 업로드
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

      const updatedPhotos = [...mainPhotos, publicUrl];

      const { error: dbError } = await supabase
        .from('settings')
        .upsert({ key: 'main_photos', value: JSON.stringify(updatedPhotos) });

      if (dbError) throw dbError;

      setMainPhotos(updatedPhotos);
      setCurrentIndex(updatedPhotos.length - 1); // 새 사진으로 이동
      alert('메인 사진이 추가 되었습니다!');
    } catch (err) {
      alert(`사진 업로드 실패: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 특정 사진 삭제 (관리자 기능)
  const handleDeletePhoto = async (indexToDelete) => {
    if (!isAdmin) return;
    if (!confirm('이 사진을 삭제하시겠습니까?')) return;

    const updatedPhotos = mainPhotos.filter((_, idx) => idx !== indexToDelete);

    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'main_photos', value: JSON.stringify(updatedPhotos) });

    if (!error) {
      setMainPhotos(updatedPhotos);
      if (currentIndex >= updatedPhotos.length && updatedPhotos.length > 0) {
        setCurrentIndex(updatedPhotos.length - 1);
      } else {
        setCurrentIndex(0);
      }
      alert('사진이 삭제되었습니다.');
    } else {
      alert(`사진 삭제 실패: ${error.message}`);
    }
  };

  const handlePrevPhoto = () => {
    setCurrentIndex((prev) => (prev === 0 ? mainPhotos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % mainPhotos.length);
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!logoError ? (
              <img 
                src="/logo.png" 
                alt="IT 로고" 
                onError={() => setLogoError(true)} 
                style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} 
              />
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
                <span>
                  👤 <strong>{user.user_metadata?.nickname || user.email.split('@')[0]}</strong> {isAdmin ? '👑' : ''}님
                </span>
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
              👥 소스쿨 구성원
            </Link>
          </div>
        </nav>
      </header>

      {/* 3. 본문 영역 */}
      <main style={{ maxWidth: '1100px', margin: '25px auto', padding: '0 20px' }}>
        
        {/* 설명 배너 & 급훈 영역 */}
        <section style={{ backgroundColor: '#2563eb', color: '#fff', padding: '30px', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            {isEditingMotto ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>급훈:</span>
                <input
                  type="text"
                  value={newMottoInput}
                  onChange={(e) => setNewMottoInput(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', color: '#000', fontSize: '14px' }}
                />
                <button onClick={handleSaveMotto} style={{ padding: '4px 10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>저장</button>
                <button onClick={() => setIsEditingMotto(false)} style={{ padding: '4px 10px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>취소</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                  급훈: {classMotto}
                </span>
                {isAdmin && (
                  <button onClick={() => { setIsEditingMotto(true); setNewMottoInput(classMotto); }} style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>
                    ✏️ 급훈 수정
                  </button>
                )}
              </div>
            )}
          </div>

          <h2 style={{ fontSize: '24px', margin: '10px 0 8px 0' }}>반갑습니다! 미래공학소스쿨 공간입니다 🌟</h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
            하루 글 게시판에서 서로의 생각을 나누고 소스쿨 구성원 프로필을 확인하세요.
          </p>
        </section>

        {/* 🖼️ 슬라이드쇼 메인 사진 영역 */}
        <section style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '25px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>🖼️ 미래공학소스쿨 메인 사진</h3>
            {mainPhotos.length > 1 && (
              <span style={{ fontSize: '13px', color: 'var(--text-sub)', fontWeight: 'bold' }}>
                ({currentIndex + 1} / {mainPhotos.length}) · 1분 자동 전환 중
              </span>
            )}
          </div>
          
          <div style={{ position: 'relative', width: '100%', maxHeight: '450px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', overflow: 'hidden', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
            {mainPhotos.length > 0 ? (
              <>
                <img src={mainPhotos[currentIndex]} alt={`메인 사진 ${currentIndex + 1}`} style={{ width: '100%', maxHeight: '450px', objectFit: 'cover' }} />
                
                {/* 2개 이상일 때 이전/다음 버튼 표시 */}
                {mainPhotos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPhoto}
                      style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px' }}
                    >
                      ◀
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px' }}
                    >
                      ▶
                    </button>
                  </>
                )}
              </>
            ) : (
              <p style={{ color: 'var(--text-sub)' }}>등록된 메인 사진이 없습니다.</p>
            )}
          </div>

          {/* 관리자 사진 관리 (업로드 & 삭제) */}
          {isAdmin && (
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'inline-block' }}>
                {isUploading ? '사진 업로드 중...' : '📷 사진 추가하기'}
                <input type="file" accept="image/*" onChange={handleMainPhotoUpload} style={{ display: 'none' }} disabled={isUploading} />
              </label>

              {mainPhotos.length > 0 && (
                <button
                  onClick={() => handleDeletePhoto(currentIndex)}
                  style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                >
                  🗑️ 현재 사진 삭제
                </button>
              )}
            </div>
          )}
        </section>

        {/* 최근 하루 글 & 소스쿨 구성원 영역 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>💬 최근 하루 글</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <li key={post.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>📌 {post.text}</li>
                ))
              ) : (
                <li style={{ padding: '10px 0', color: 'var(--text-sub)', fontSize: '14px' }}>등록된 글이 없습니다.</li>
              )}
            </ul>
          </div>
          
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>👥 소스쿨 구성원</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginBottom: '15px' }}>선생님과 구성원들의 프로필 및 사진을 확인하세요.</p>
            <Link href="/members" style={{ display: 'block', textAlign: 'center', padding: '10px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
              구성원 보러가기 →
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
