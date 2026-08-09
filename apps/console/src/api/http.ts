/**
 * The real ConsoleApi, against `skkuverse-server`.
 *
 * Not reachable yet: `VITE_API_MODE` defaults to `mock` and the console routes
 * it calls do not exist on the server. It is written now so that "connect real
 * data" is a server task plus an env var, rather than a rewrite of every screen
 * — and so the shape the server has to implement is written down somewhere
 * executable instead of only in an issue.
 *
 * Per umbrella ADR 0006 the token comes from a Firebase project separate from
 * the app's, and every authorization decision is a claim the server checks.
 * Nothing here inspects the token: `currentUser()` asks the server who it is,
 * because only the server's answer carries the claims, and a client that
 * decoded roles out of a JWT would be reading its own input.
 */
import type { ConsoleApi } from './client';
import type {
  ConsoleUser,
  LayerSet,
  NotificationDraft,
  Place,
  PublishResult,
  SendRecord,
  Session,
  Topic,
} from './types';

/**
 * Supplies the bearer token.
 *
 * A seam rather than a Firebase import, mirroring
 * `skkuverse-app/packages/shared/src/api/interceptors/auth.ts`, which takes its
 * token through an injected provider so the API layer stays environment-
 * agnostic. Registering the Firebase web SDK's `getIdToken` here is the whole
 * of the auth wiring; issue skkuverse#23 has the rest.
 */
let tokenProvider: () => Promise<string | null> = async () => null;

export function setAuthTokenProvider(provider: () => Promise<string | null>): void {
  tokenProvider = provider;
}

function baseUrl(): string {
  const base = import.meta.env.VITE_API_BASE;
  if (!base) {
    // Deliberately fatal. A console that silently talks to the wrong origin, or
    // to none, is worse than one that will not start: the failure would surface
    // as empty lists that look like empty data.
    throw new Error(
      'VITE_API_BASE is required when VITE_API_MODE=http. Set it to the skkuverse-server origin.',
    );
  }
  return base.replace(/\/$/, '');
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await tokenProvider();
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 401) throw new Error('로그인이 필요해요.');
  // 403 is the expected answer for a signed-in user without the claim, which
  // ADR 0006 makes the default rather than an exception. It is not an error to
  // debug; it is the security model working.
  if (res.status === 403) throw new Error('이 작업을 할 권한이 없어요.');

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(detail || `${res.status} ${res.statusText}`);
  }

  // The server wraps every response as { meta, data }.
  const json = (await res.json()) as { data: T };
  return json.data;
}

export function createHttpApi(): ConsoleApi {
  return {
    currentUser: () => request<ConsoleUser | null>('/console/me'),
    signIn: () => {
      // Sign-in is Firebase's email-link flow in the browser, not a server
      // call. The server never sees a credential — it only ever verifies the
      // token that flow produces.
      throw new Error('signIn is handled by the Firebase email-link flow, not by the API client.');
    },
    signOut: () => request<void>('/console/signout', { method: 'POST' }),

    listTopics: () => request<Topic[]>('/console/notifications/topics'),
    listSends: () => request<SendRecord[]>('/console/notifications/sends'),
    estimateReach: (topics) =>
      request<{ reach: number }>('/console/notifications/reach', {
        method: 'POST',
        body: JSON.stringify({ topics }),
      }).then((r) => r.reach),
    // The server proxies to the Cloud Function holding FCM_API_KEY. The key
    // never reaches a browser, and the send is attributable in the server log.
    send: (draft: NotificationDraft) =>
      request<SendRecord>('/console/notifications/send', {
        method: 'POST',
        body: JSON.stringify(draft),
      }),

    listLayerSets: () => request<LayerSet[]>('/console/eventmap/layer-sets'),
    listPlaces: (layerSetId) =>
      request<Place[]>(`/console/eventmap/${encodeURIComponent(layerSetId)}/places`),
    listSessions: (layerSetId) =>
      request<Session[]>(`/console/eventmap/${encodeURIComponent(layerSetId)}/sessions`),
    updateSession: (id, patch) =>
      request<Session>(`/console/eventmap/sessions/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    // Materializes and publishes a new snapshot version. The app picks it up on
    // its next manifest poll, so this is the moment an edit reaches phones.
    publish: (layerSetId) =>
      request<PublishResult>(`/console/eventmap/${encodeURIComponent(layerSetId)}/publish`, {
        method: 'POST',
      }),
    setActivation: (layerSetId, enabled) =>
      request<LayerSet>(`/console/eventmap/${encodeURIComponent(layerSetId)}/activation`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
      }),
  };
}
