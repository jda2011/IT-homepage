'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const router = useRouter();

  // 아이디를 이메일 주소 형태로 변환 (@jeonin.gwe.hs.kr 자동 결합)
  const formatEmail = (id) => {
    const cleanId = id.trim();
    if (cleanId.includes('@')) return cleanId;
    return `${cleanId}@jeonin.gwe.hs.kr`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!username || !password) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    const email = formatEmail(username);

    if (isSignUp) {
      // 1. 회원가입 시도
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // 이미 가입된 계정인 경우 처리
        if (error.message.includes('User already registered') || error.status === 400) {
          alert('회원가입이 되셨습니다.');
          setIsSignUp(false); // 로그인 모드로 전환
          setInfoMsg('이미 가입된 계정입니다. 비밀번호를 입력해 로그인해주세요.');
        } else {
          setErrorMsg(`회원가입 실패: ${error.message}`);
        }
      } else if (data.user) {
        alert('회원가입이 완료되었습니다! 로그인 해주세요.');
        setIsSignUp(false);
      }
    } else {
      // 2. 로그인 시도
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setErrorMsg('Supabase 설정에서 Confirm email을 OFF로 변경해주세요.');
        } else {
          setErrorMsg('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
      } else {
        alert('로그인 성공!');
        router.push('/');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          {isSignUp ? '📝 소스쿨 회원가입' : '🔐 소스쿨 로그인'}
        </h2>

        {errorMsg && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '15px', textAlign: 'center' }}>{errorMsg}</p>}
        {infoMsg && <p style={{ color: '#10b981', fontSize: '13px', marginBottom: '15px', textAlign: 'center' }}>{infoMsg}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>아이디 (Username)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="text"
                placeholder="아이디 입력"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '3px', display: 'block' }}>
              * 관리자 권한은 특정한 아이디 규칙에 따라 부여됩니다.
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호 (6자리 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            style={{ padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
          >
            {isSignUp ? '회원가입 하기' : '로그인 하기'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
          {isSignUp ? (
            <p>
              이미 계정이 있으신가요?{' '}
              <button onClick={() => { setIsSignUp(false); setErrorMsg(''); setInfoMsg(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>
                로그인으로 이동
              </button>
            </p>
          ) : (
            <p>
              계정이 없으신가요?{' '}
              <button onClick={() => { setIsSignUp(true); setErrorMsg(''); setInfoMsg(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>
                회원가입하기
              </button>
            </p>
          )}
        </div>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: '12px', color: 'var(--text-sub)', textDecoration: 'none' }}>
            ← 메인 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
