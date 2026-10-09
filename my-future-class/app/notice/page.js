'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { checkIsAdmin } from '../../lib/admin';
import Link from 'next/link';

export default function NoticePage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notices, setNotices] = useState([]);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setIsAdmin(checkIsAdmin(user.email));
      }
      fetchNotices();
    };
    init();
  }, []);

  const fetchNotices = async () => {
    const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    if (data) setNotices(data);
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('관리자만 공지사항을 등록할 수 있습니다.');
    if (!noticeTitle.trim() || !noticeContent.trim()) return alert('제목과 내용을 모두 입력해 주세요.');

    const { error } = await supabase.from('notices').insert([
      { title: noticeTitle.trim(), content: noticeContent.trim() }
    ]);

    if (!error) {
      alert('공지사항이 성공적으로 등록되었습니다!');
      setNoticeTitle('');
      setNoticeContent('');
      setShowNoticeForm(false);
      fetchNotices();
    } else {
      alert(`공지사항 등록 실패: ${error.message}`);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!isAdmin) return;
    if (!confirm('이 공지사항을 삭제하시겠습니까?')) return;

    const { error } = await supabase.from('notices').delete().eq('id', id);
    if (!error) {
      alert('공지사항이 삭제되었습니다.');
      fetchNotices();
    } else {
      alert(`삭제 실패: ${error.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* 상단 통일 헤더 */}
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
            {user ? (
              <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href="/profile" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="프로필" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span>👤</span>
                  )}
                  <strong>{user.user_metadata?.nickname || user.email.split('@')[0]}</strong> {isAdmin ? '👑' : ''}님
                </Link>
                <Link href="/profile" style={{ padding: '4px 8px', backgroundColor: 'var(--border-color)', color: 'var(--text-color)', borderRadius: '4px', textDecoration: 'none', fontSize: '12px' }}>
                  ⚙️ 개인 설정
                </Link>
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

        {/* 네비게이션바 (메인 홈, 하루 글, 구성원, 공지 추가) */}
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
            <Link href="/notice" style={{ padding: '14px 0', color: '#2563eb', fontWeight: 'bold', textDecoration: 'none', borderBottom: '3px solid #2563eb' }}>
              📢 소스쿨 공지
            </Link>
          </div>
        </nav>
      </header>

      {/* 본문 영역 */}
      <main style={{ maxWidth: '1100px', margin: '25px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', margin: 0 }}>📢 소스쿨 공지사항</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/" style={{ padding: '8px 14px', backgroundColor: 'var(--bg-card)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>
              🏠 메인 홈으로 돌아가기
            </Link>
            {isAdmin && (
              <button
                onClick={() => setShowNoticeForm(!showNoticeForm)}
                style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {showNoticeForm ? '닫기' : '✏️ 공지사항 작성 (관리자)'}
              </button>
            )}
          </div>
        </div>

        {/* 관리자 공지 작성 폼 */}
        {isAdmin && showNoticeForm && (
          <form onSubmit={handleCreateNotice} style={{ marginBottom: '25px', padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>➕ 새 공지사항 등록</h3>
            <input
              type="text"
              placeholder="공지사항 제목"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)', marginBottom: '12px', boxSizing: 'border-box' }}
            />
            <textarea
              placeholder="공지사항 내용을 상세히 작성하세요..."
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)', marginBottom: '12px', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
              공지사항 올리기
            </button>
          </form>
        )}

        {/* 공지 목록 */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '20px' }}>
          {notices.length > 0 ? (
            notices.map((notice) => (
              <div key={notice.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#38bdf8' }}>📌 {notice.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                      📅 {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                    </span>
                    {isAdmin && (
                      <button onClick={() => handleDeleteNotice(notice.id)} style={{ padding: '2px 6px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>
                        삭제
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{notice.content}</p>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-sub)', textAlign: 'center', margin: 0, padding: '20px 0' }}>등록된 공지사항이 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
