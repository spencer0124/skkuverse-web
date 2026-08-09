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
  DeviceCount,
  LayerSet,
  NotificationDraft,
  Place,
  PublishResult,
  SendRecord,
  Session,
  TestSendResult,
  Topic,
  TopicSet,
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

    // Exact, from `.count()` on the same array-contains-any query the send
    // uses. Sharing the query is the point: the number shown and the audience
    // reached cannot diverge except by the seconds between them.
    countDevices: (topics) =>
      request<DeviceCount>('/console/notifications/count', {
        method: 'POST',
        body: JSON.stringify({ topics }),
      }),

    // Pre-flight, so the Cloud Function's 400s (over 30 topics, missing title)
    // surface while the draft is still being edited rather than after someone
    // has confirmed an irreversible action.
    validate: (draft) =>
      request<{ problems: string[] }>('/console/notifications/validate', {
        method: 'POST',
        body: JSON.stringify(draft),
      }).then((r) => r.problems),

    // Resolves the signed-in console user to their own app devices and sends
    // only there. The console's Firebase project is not the app's, so that
    // mapping is data an admin maintains, not something the token carries.
    //
    // The Cloud Function needs one addition for this: an optional
    // `targetDeviceIds` that replaces the topic query AND skips the dead-token
    // cleanup pass — a test must not deactivate the tester's own device.
    testSend: (draft) =>
      request<TestSendResult>('/console/notifications/test', {
        method: 'POST',
        body: JSON.stringify(draft),
      }),

    // The server holds FCM_API_KEY and proxies to the Cloud Function, per
    // umbrella ADR 0006, so the key never reaches a browser and the send is
    // attributable to a verified token.
    //
    // Two rules the server side must honour, neither of which the console can
    // enforce from here:
    //
    //  1. Write the history row BEFORE calling the Cloud Function, with
    //     `status: 'sending'`, then patch it with the result. Written after, a
    //     CF timeout leaves a push that went out with no record of it — the
    //     worst possible audit outcome for an irreversible action.
    //  2. Generate `noticeId` server-side as `console:<consoleUid>:<ulid>`. The
    //     Cloud Function requires it and a draft has no source for one.
    //
    // A 429 must carry `retryAfterSeconds` so the console can say when rather
    // than just no.
    send: (draft: NotificationDraft) =>
      request<SendRecord>('/console/notifications/send', {
        method: 'POST',
        body: JSON.stringify(draft),
      }),

    // Saved audiences. Server-owned so the next operator inherits them, edits
    // are attributable, and the 30-topic cap is enforced at save time. The
    // server resolves `staleTopicIds` on read — a stored topic that no longer
    // exists upstream fails silently, reaching fewer people than intended.
    listTopicSets: () => request<TopicSet[]>('/console/notifications/topic-sets'),
    saveTopicSet: (name, topics) =>
      request<TopicSet>('/console/notifications/topic-sets', {
        method: 'POST',
        body: JSON.stringify({ name, topics }),
      }),
    deleteTopicSet: (id) =>
      request<void>(`/console/notifications/topic-sets/${encodeURIComponent(id)}`, {
        method: 'DELETE',
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
