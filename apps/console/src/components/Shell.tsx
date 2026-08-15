/**
 * Chrome shared by every signed-in page: the nav, the account row, and the
 * banner that says which data source is in play.
 */
import { NavLink, useLocation } from 'react-router-dom';
import { Badge, Border, Paragraph, TextButton, useAdaptive } from '@skkuverse/ui';
import { API_MODE } from '../api/client';
import { useAuth } from '../auth/AuthProvider';
import type { Role } from '../api/types';
import type { ReactNode } from 'react';

const NAV: { to: string; label: string; role: Role }[] = [
  { to: '/notifications', label: '알림 보내기', role: 'notifier' },
  { to: '/notifications/history', label: '발송 내역', role: 'notifier' },
  { to: '/festival', label: '축제 데이터', role: 'festival-editor' },
];

export function Shell({ children }: { children: ReactNode }) {
  const adaptive = useAdaptive();
  const { user, signOut, can } = useAuth();
  const { pathname } = useLocation();

  return (
    <div style={{ minHeight: '100vh', background: adaptive.greyBackground }}>
      <header
        style={{
          background: adaptive.background,
          borderBottom: `1px solid ${adaptive.grey200}`,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Paragraph typography="t5" fontWeight="bold">
            스꾸버스 콘솔
          </Paragraph>

          {/*
            Which data source is live, stated permanently rather than on a
            toggle. The mock answers every call successfully, so without this
            a demo and production look identical — and the one screen here that
            sends a real push to real phones is the one where that matters.
          */}
          {API_MODE === 'mock' ? (
            <Badge color="yellow" variant="weak" size="small">
              목업 데이터
            </Badge>
          ) : (
            <Badge color="red" variant="fill" size="small">
              실 데이터
            </Badge>
          )}

          <nav style={{ display: 'flex', gap: 4, marginLeft: 12, flex: 1 }}>
            {NAV.filter((n) => can(n.role)).map((n) => {
              const active = pathname === n.to || (n.to !== '/notifications' && pathname.startsWith(n.to));
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    background: active ? adaptive.greyOpacity200 : 'transparent',
                  }}
                >
                  <Paragraph
                    typography="t6"
                    fontWeight={active ? 'bold' : 'medium'}
                    color={active ? adaptive.grey900 : adaptive.grey600}
                  >
                    {n.label}
                  </Paragraph>
                </NavLink>
              );
            })}
          </nav>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Paragraph typography="t7" color={adaptive.grey500}>
                {user.email}
              </Paragraph>
              <TextButton size="small" onClick={() => void signOut()}>
                로그아웃
              </TextButton>
            </div>
          )}
        </div>
        <Border />
      </header>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 20px 80px' }}>{children}</main>
    </div>
  );
}

/** A titled block, so the pages stop redeclaring the same heading markup. */
export function Panel({
  title,
  description,
  right,
  children,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const adaptive = useAdaptive();
  return (
    <section
      style={{
        background: adaptive.background,
        borderRadius: 16,
        border: `1px solid ${adaptive.grey200}`,
        padding: 24,
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <Paragraph typography="t4" fontWeight="bold">
            {title}
          </Paragraph>
          {description && (
            <div style={{ marginTop: 4 }}>
              <Paragraph typography="t7" color={adaptive.grey500}>
                {description}
              </Paragraph>
            </div>
          )}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}
