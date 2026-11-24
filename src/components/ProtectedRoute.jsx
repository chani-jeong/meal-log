// 로그인한 사용자만 안쪽 화면에 들어가게 막는 문지기 (Proxy 패턴)
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page"><p className="muted">로그인 상태를 확인하는 중입니다…</p></div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
