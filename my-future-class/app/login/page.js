'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email || !password) {
      setErrorMsg('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    if (isSignUp) {
      if (!nickname.trim()) {
        setErrorMsg('닉네임을 입력해 주세요.');
        return;
      }

      // 회원가입
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: nickname.trim(),
            warning_count: 0 // 경고 횟수 기본값 0
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered') || error.status === 400) {
          alert('이미 회원가입이 되셨습니다. 로그인 화면으로 이동합니다.');
          setIsSignUp(false);
        } else {
          setErrorMsg(`회원가입 실패: ${error.message}`);
        }
      } else if (data.user) {
        alert('회원가입이 완료되었습니다! 로그인해 주세요.');
        setIsSignUp(false);
      }
    } else {
      // 로그인
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setErrorMsg('Supabase 설정에서 Confirm email을 OFF로 변경해주세요.');
        } else {
          setErrorMsg('이메일 또는 비밀번호가 올바르지 않습니다.');
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
          {/* 이메일 입력 */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>이메일 주소</label>
            <input
              type="email"
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)', boxSizing: 'border-box' }}
            />
          </div>

          {/* 회원가입 시 닉네임 추가 입력 */}
          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>닉네임</label>
              <input
                type="text"
                placeholder="사용할 닉네임 입력"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* 비밀번호 입력 (숨김 / 보임 토글) */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>비밀번호</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호 입력 (6자리 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{ padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
          >
            {isSignUp ? '회원가입 완료' : '로그인'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
          {isSignUp ? (
            <p>
              이미 계정이 있으신가요?{' '}
              <button onClick={() => { setIsSignUp(false); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>
                로그인으로 이동
              </button>
            </p>
          ) : (
            <p>
              계정이 없으신가요?{' '}
              <button onClick={() => { setIsSignUp(true); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>
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
