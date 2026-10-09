'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (isSignUp) {
      // 회원가입
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        alert(`회원가입 실패: ${error.message}`);
      } else {
        alert('회원가입 요청이 완료되었습니다! 로그인해 주세요.');
        setIsSignUp(false);
      }
    } else {
      // 로그인
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert(`로그인 실패: ${error.message}`);
      } else {
        alert('로그인 성공!');
        router.push('/daily'); // 로그인 후 게시판으로 이동
      }
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '60px auto', color: '#fff', backgroundColor: '#1e293b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      {/* 홈으로 이동 버튼 */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>
          ← 🏠 홈으로 돌아가기
        </Link>
      </div>

      {/* 로그인 / 회원가입 전환 탭 버튼 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setIsSignUp(false)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: !isSignUp ? '#3b82f6' : '#334155',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🔐 로그인
        </button>
        <button
          onClick={() => setIsSignUp(true)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: isSignUp ? '#3b82f6' : '#334155',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          📝 회원가입
        </button>
      </div>

      <h1>{isSignUp ? '📝 회원가입' : '🔐 로그인'}</h1>

      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#cbd5e1' }}>이메일</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#cbd5e1' }}>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: '12px',
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          {isSignUp ? '회원가입 신청' : '로그인 하기'}
        </button>
      </form>
    </div>
  );
}
