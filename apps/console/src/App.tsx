import { Navigate, Route, Routes } from 'react-router-dom';
import { ErrorPage, Loader } from '@skkuverse/ui';
import { useAuth } from './auth/AuthProvider';
import { Shell } from './components/Shell';
import SignIn from './pages/SignIn';
import Compose from './pages/notifications/Compose';
import History from './pages/notifications/History';
import Festival from './pages/festival/Festival';
import type { Role } from './api/types';
import type { ReactNode } from 'react';

/**
 * Route guarding here is presentation, not enforcement.
 *
 * ADR 0006 invariant 1: a valid token proves identity and nothing else. Every
 * console route on the server requires an explicit claim and denies by its
 * absence, so this only decides what is worth rendering. A user who edits the
 * URL past it reaches a screen whose every request comes back 403 — annoying,
 * not a breach. Treating this as the control is how a client-side check becomes
 * the only check.
 */
function Requires({ role, children }: { role: Role; children: ReactNode }) {
  const { can } = useAuth();
  if (!can(role)) {
    return <ErrorPage statusCode={404} title="권한이 없어요" description="이 화면을 볼 수 있는 역할이 계정에 없어요." />;
  }
  return <>{children}</>;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading && !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Loader size="large" label="불러오는 중" />
      </div>
    );
  }

  if (!user) return <SignIn />;

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Navigate to="/notifications" replace />} />
        <Route path="/notifications" element={<Requires role="notifier"><Compose /></Requires>} />
        <Route path="/notifications/history" element={<Requires role="notifier"><History /></Requires>} />
        <Route path="/festival" element={<Requires role="festival-editor"><Festival /></Requires>} />
        <Route path="*" element={<ErrorPage statusCode={404} />} />
      </Routes>
    </Shell>
  );
}
