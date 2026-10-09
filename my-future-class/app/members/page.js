'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { checkIsAdmin } from '../../lib/admin';
import Link from 'next/link';
import ThemeToggle from '../../components/ThemeToggle';

export default function MembersPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState([]);
  
  // 양식 입력 상태
  const [name, setName] = useState('');          // 성함/이름
  const [nickname, setNickname] = useState('');  // 이르름
  const [role, setRole] = useState('student');    // 구분
  const [year, setYear] = useState('2026');
  const [file, setFile] = useState(null);         // 프로필 사진 업로드
  const [isUploading, setIsUploading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setIsAdmin(checkIsAdmin(user.email));
      }
      fetchMembers();
    };
    init();
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: true });
    if (data) setMembers(data);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('관리자만 등록할 수 있습니다.');
    if (!name.trim()) return alert('성함/이름을 입력해 주세요.');

    setIsUploading(true);
    try {
      let imageUrl = '';
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `profiles/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('members').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('members').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      // name에 이름과 (이르름)을 함께 저장하거나 DB 컬럼 구조에 지정
      const fullName = nickname.trim() ? `${name.trim()} (${nickname.trim()})` : name.trim();

      const { error } = await supabase.from('members').insert([
        { name: fullName, role, year, image_url: imageUrl }
      ]);

      if (error) throw error;

      alert('구성원이 성공적으로 등록되었습니다!');
      setName('');
      setNickname('');
      setFile(null);
      fetchMembers();
    } catch (err) {
      alert(`등록 실패: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!isAdmin) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const { error } = await supabase.from('members').delete().eq('id', id);
    if (!error) {
      alert('삭제되었습니다.');
      fetchMembers();
    } else {
      alert(`삭제 실패: ${error.message}`);
    }
  };

  const teachers = members.filter((m) => m.role === 'teacher');
  const students = members.filter((m) => m.role === 'student');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* 1. 통일된 헤더 */}
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
            <Link href="/daily" style={{ padding: '14px 0', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}>
              💬 하루 글 (게시판)
            </Link>
            <Link href="/members" style={{ padding: '14px 0', color: '#2563eb', fontWeight: 'bold', textDecoration: 'none', borderBottom: '3px solid #2563eb' }}>
              👥 소스쿨 구성원
            </Link>
          </div>
        </nav>
      </header>

      {/* 3. 본문 영역 */}
      <main style={{ maxWidth: '1100px', margin: '25px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>👥 미래공학소스쿨 구성원 소개</h2>

        {/* 관리자 전용 신규 구성원 등록 양식 */}
        {isAdmin && (
          <form onSubmit={handleAddMember} style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>➕ 신규 구성원 등록 (관리자)</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              {/* 성함/이름 */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>성함/이름</label>
                <input
                  type="text"
                  placeholder="이름 작성"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
                />
              </div>

              {/* 이르름 */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>이르름</label>
                <input
                  type="text"
                  placeholder="이르름 작성"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
                />
              </div>

              {/* 구분 (드롭다운 가독성 수정) */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>구분</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-color)',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  <option value="student" style={{ color: '#000000', backgroundColor: '#ffffff' }}>학생</option>
                  <option value="teacher" style={{ color: '#000000', backgroundColor: '#ffffff' }}>선생님</option>
                </select>
              </div>

              {/* 프로필 사진 업로드 */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>프로필 사진 업로드</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ fontSize: '12px', color: 'var(--text-color)', marginTop: '5px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              style={{ padding: '10px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              {isUploading ? '등록 중...' : '구성원 등록하기'}
            </button>
          </form>
        )}

        {/* 선생님 목록 */}
        <section style={{ marginBottom: '35px' }}>
          <h3 style={{ fontSize: '18px', borderBottom: '2px solid #2563eb', paddingBottom: '8px', color: '#2563eb' }}>👨‍🏫 선생님</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', marginTop: '15px' }}>
            {teachers.map((m) => (
              <div key={m.id} style={{ backgroundColor: 'var(--bg-card)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ width: '90px', height: '90px', margin: '0 auto 10px auto', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '30px' }}>👨‍🏫</span>
                  )}
                </div>
                <h4 style={{ margin: '5px 0', fontSize: '16px' }}>{m.name}</h4>
                {isAdmin && (
                  <button onClick={() => handleDeleteMember(m.id)} style={{ marginTop: '8px', padding: '3px 8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>삭제</button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 학생 목록 */}
        <section>
          <h3 style={{ fontSize: '18px', borderBottom: '2px solid #2563eb', paddingBottom: '8px', color: '#2563eb' }}>🎓 학생</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', marginTop: '15px' }}>
            {students.map((m) => (
              <div key={m.id} style={{ backgroundColor: 'var(--bg-card)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ width: '90px', height: '90px', margin: '0 auto 10px auto', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '30px' }}>🎓</span>
                  )}
                </div>
                <h4 style={{ margin: '5px 0', fontSize: '16px' }}>{m.name}</h4>
                {isAdmin && (
                  <button onClick={() => handleDeleteMember(m.id)} style={{ marginTop: '8px', padding: '3px 8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>삭제</button>
                )}
              </div>
            ))}
          </div>
        </section>
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
