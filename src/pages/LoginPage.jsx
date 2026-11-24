import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { logIn, signUp, toKoreanMessage } from '../services/authService.js';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const isSignup = mode === 'signup';

  function validate() {
    if (!email.trim()) return '이메일을 입력해 주세요.';
    if (password.length < 6) return '비밀번호는 6자 이상이어야 합니다.';
    if (isSignup && !nickname.trim()) return '닉네임을 입력해 주세요.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setPending(true);
    setError('');
    try {
      if (isSignup) await signUp(email.trim(), password, nickname.trim());
      else await logIn(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(toKoreanMessage(err)); // 실패를 성공처럼 보이지 않게 오류만 표시
    } finally {
      setPending(false);
    }
  }

  function switchMode() {
    setMode(isSignup ? 'login' : 'signup');
    setError('');
  }

  return (
    <div className="page auth-page">
      <h1 className="brand auth-brand">
        <span className="wordmark">Meal<strong>Log</strong></span>
      </h1>
      <form className="panel auth-panel" onSubmit={handleSubmit} noValidate>
        <h2 className="panel-title">{isSignup ? '회원가입' : '로그인'}</h2>

        {isSignup && (
          <>
            <label className="field-label" htmlFor="nickname">닉네임</label>
            <input id="nickname" className="input" value={nickname}
              onChange={(e) => setNickname(e.target.value)} autoComplete="nickname" />
          </>
        )}

        <label className="field-label" htmlFor="email">이메일</label>
        <input id="email" type="email" className="input" value={email}
          onChange={(e) => setEmail(e.target.value)} autoComplete="email" />

        <label className="field-label" htmlFor="password">비밀번호 (6자 이상)</label>
        <input id="password" type="password" className="input" value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignup ? 'new-password' : 'current-password'} />

        {error && <p role="alert" className="error">{error}</p>}

        <button type="submit" className="btn-primary auth-submit" disabled={pending}>
          {pending ? '처리 중…' : isSignup ? '가입하기' : '로그인'}
        </button>

        <button type="button" className="auth-switch" onClick={switchMode}>
          {isSignup ? '이미 계정이 있나요? 로그인' : '처음이신가요? 회원가입'}
        </button>
      </form>
    </div>
  );
}
