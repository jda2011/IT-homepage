'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

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
        alert('회원가입 완료! 로그인 해주세요.');
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
        router.push('/daily'); // 로그인 후 하루 글 게시판으로 이동
      }
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto', color: '#fff' }}>
      <h1>{isSignUp ? '🔑 회원가입' : '🔐 로그인'}</h1>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input
          type="email"
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', color: '#000' }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', color: '#000' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {isSignUp ? '회원가입 완료' : '로그인'}
        </button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        style={{ marginTop: '15px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
      >
        {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
      </button>
    </div>
  );
}
