// 로그인 상태를 앱 전체에 알려 주는 Provider (Observer 패턴)
// Firebase의 로그인 상태 변화를 구독하고, 바뀌면 이 값을 쓰는 화면이 다시 그려집니다.
import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeAuth } from '../services/authService.js';

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe; // 화면이 사라질 때 구독 해제
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
