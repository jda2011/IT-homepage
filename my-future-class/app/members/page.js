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

  // 등록 폼 상태
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [year, setYear] = useState('2026');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // 구성원 및 사진 추가
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('관리자 권한이 필요합니다.');
    if (!name.trim()) return alert('이름을 입력해주세요.');

    setIsUploading(true);
    let imageUrl = '';

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `photos/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('members').upload(filePath, imageFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('members').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      const { error: dbError } = await supabase.from('members').insert([{ name, role, year, image_url: imageUrl }]);
      if (dbError) throw dbError;

      alert('구성원이 등록되었습니다!');
      setName('');
      setImageFile(null);
      fetchMembers();
    } catch (err) {
      alert(`등록 실패: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (confirm('삭제하시겠습니까?')) {
      await supabase.from('members').delete().eq('id', id);
      fetchMembers();
    }
  };

  const teachers = members.filter((m) => m.role === 'teacher');
  const students = members.filter((m) => m.role === 'student');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', padding: '20px' }}>
      
      {/* 상단 네비게이션 헤더 */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 25px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* 🏠 홈 버튼 */}
          <Link href="/" style={{ padding: '8px 14px', backgroundColor: 'var(--bg-card)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
            ← 🏠 홈으로 가기
          </Link>
          <h1 style={{ fontSize: '20px', margin: 0 }}>👥 학급 구성원 소개</h1>
        </div>
        <ThemeToggle />
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* 관리자 등록 폼 */}
        {isAdmin && (
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>👑 구성원 및 사진 추가 (관리자)</h3>
            <form onSubmit={handleAddMember} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>성함 / 이름</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름 입력" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>구분</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)', boxSizing: 'border-box' }}>
                  <option value="student">학생</option>
                  <option value="teacher">선생님</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>사진 파일 선택</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ fontSize: '13px' }} />
              </div>

              <button type="submit" disabled={isUploading} style={{ padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isUploading ? '업로드 중...' : '등록하기'}
              </button>
            </form>
          </div>
        )}

        {/* 선생님 섹션 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', borderBottom: '2px solid #2563eb', paddingBottom: '8px', display: 'inline-block' }}>👨‍🏫 선생님</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', marginTop: '15px' }}>
            {teachers.map((m) => (
              <MemberCard key={m.id} member={m} isAdmin={isAdmin} onDelete={handleDelete} />
            ))}
          </div>
        </section>

        {/* 학생 섹션 */}
        <section>
          <h2 style={{ fontSize: '20px', borderBottom: '2px solid #10b981', paddingBottom: '8px', display: 'inline-block' }}>👩‍🎓 학생 목록 ({year}년)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', marginTop: '15px' }}>
            {students.map((m) => (
              <MemberCard key={m.id} member={m} isAdmin={isAdmin} onDelete={handleDelete} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

// 모던한 카드 컴포넌트
function MemberCard({ member, isAdmin, onDelete }) {
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '15px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ width: '100%', height: '160px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', border: '1px solid var(--border-color)' }}>
        {member.image_url ? (
          <img src={member.image_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: '13px' }}>
            📷 사진 없음
          </div>
        )}
      </div>
      <h3 style={{ margin: '5px 0', fontSize: '16px' }}>{member.name}</h3>
      {isAdmin && (
        <button onClick={() => onDelete(member.id)} style={{ marginTop: '8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
          삭제
        </button>
      )}
    </div>
  );
}
