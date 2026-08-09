import { useState } from 'react';
import { Badge, Button, Paragraph, TextField, useAdaptive } from '@skkuverse/ui';
import { API_MODE } from '../api/client';
import { useAuth } from '../auth/AuthProvider';

/**
 * Sign-in.
 *
 * The real flow is Firebase email-link — `sendSignInLinkToEmail`, then
 * `signInWithEmailLink` on the return. There is no password field here and
 * there never will be: ADR 0006 chose email link precisely so there is no
 * password to store, reset or breach.
 *
 * In mock mode any address signs in with every role. That is stated on the
 * screen rather than left implicit, because a demo build and a real one would
 * otherwise be indistinguishable at the one moment it matters.
 */
export default function SignIn() {
  const adaptive = useAdaptive();
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: adaptive.greyBackground,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: adaptive.background,
          border: `1px solid ${adaptive.grey200}`,
          borderRadius: 20,
          padding: 32,
        }}
      >
        <Paragraph typography="t3" fontWeight="bold">
          스꾸버스 콘솔
        </Paragraph>
        <div style={{ marginTop: 6, marginBottom: 24 }}>
          <Paragraph typography="t6" color={adaptive.grey600}>
            이메일로 로그인 링크를 보내드려요. 비밀번호는 없어요.
          </Paragraph>
        </div>

        {API_MODE === 'mock' && (
          <div style={{ marginBottom: 20 }}>
            <Badge color="yellow" variant="weak" size="small">
              목업 모드 — 아무 이메일이나 통과해요
            </Badge>
          </div>
        )}

        <TextField
          variant="box"
          label="이메일"
          value={email}
          onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          hasError={Boolean(error)}
          help={error ?? undefined}
        />

        <div style={{ marginTop: 20 }}>
          <Button display="full" size="large" loading={loading} onClick={() => void signIn(email)}>
            로그인 링크 받기
          </Button>
        </div>

        <div style={{ marginTop: 20 }}>
          <Paragraph typography="t7" color={adaptive.grey500}>
            로그인해도 권한은 따로 부여돼요. 계정을 만드는 것과 권한을 받는 것은 별개예요.
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
