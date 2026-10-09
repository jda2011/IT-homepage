'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [warningCount, setWarningCount] = useState(0);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setNickname(user.user_metadata?.nickname || '');
        setAvatarUrl(user.user_metadata?.avatar_url || '');
        setWarningCount(user.user_metadata?.warning_count || 0);
      }
    };
    init();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsUploading(true);
    try {
      let updatedAvatarUrl = avatarUrl;

      // 새 프로필 사진 파일이 선택되었을 경우 업로드
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `avatars/${user.id}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('members').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('members').getPublicUrl(filePath);
        updatedAvatarUrl = urlData.publicUrl;
      }

      // Supabase 사용자 메타데이터 업데이트
      const { data, error } = await supabase.auth.updateUser({
        data: {
          nickname: nickname.trim(),
          avatar_url: updatedAvatarUrl
        }
      });

      if (error) throw error;

      setAvatarUrl(updatedAvatarUrl);
      alert('개인 설정이 성공적으로 저장되었습니다!');
    } catch (err) {
      alert(`저장 실패: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>로그인이 필요한 페이지입니다. <Link href="/login" style={{ color: '#2563eb' }}>로그인하기</Link></p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', padding: '30px 20px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>⚙️ 개인 설정 (내 프로필)</h2>
          <Link href="/" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>
            🏠 메인 홈으로
          </Link>
        </div>

        {/* 현재 프로필 아이콘 / 사진 */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 12px auto', border: '2px solid var(--border-color)', backgroundColor: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="프로필 사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '40px' }}>👤</span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-sub)' }}>{user.email}</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#ef4444', fontWeight: 'bold' }}>⚠️ 내 경고 횟수: {warningCount}회</p>
        </div>

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>닉네임 변경</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>프로필 사진 업로드</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ fontSize: '12px', color: 'var(--text-color)' }}
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            style={{ padding: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
          >
            {isUploading ? '저장 중...' : '설정 저장하기'}
          </button>
        </form>

      </div>
    </div>
  );
}
