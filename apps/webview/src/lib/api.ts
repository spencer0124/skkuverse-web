/**
 * The webview's first and only server call.
 *
 * Every other page here renders from static files in each page's own `data`
 * folder, which is the right default: festival content is authored, reviewed
 * and deployed, so a build artefact is more honest than a request. The mini-app
 * notification feed cannot work that way — it exists to be readable seconds
 * after a push, and a rebuild is not seconds.
 *
 * Deliberately not a client library. No React Query, no interceptors, no retry
 * policy: one GET, three states, and nothing that has to be configured before a
 * page can render. If a second endpoint ever appears, that is the moment to ask
 * for more, not now.
 */

/** Same env name the console uses, so one origin is spelled one way. */
const BASE = import.meta.env.VITE_API_BASE as string | undefined;

export class ApiNotConfiguredError extends Error {
  constructor() {
    super('VITE_API_BASE is not set — the notification feed cannot be fetched.');
    this.name = 'ApiNotConfiguredError';
  }
}

/**
 * Unwraps the server's `{ meta, data }` envelope.
 *
 * Throws rather than returning null on failure: the caller has three states to
 * render and needs to tell "no notifications yet" from "we could not ask",
 * which a nullable return collapses into one.
 */
export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  if (!BASE) throw new ApiNotConfiguredError();

  const res = await fetch(`${BASE.replace(/\/+$/, '')}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  const envelope = (await res.json()) as { data?: T };
  if (envelope?.data === undefined) {
    throw new Error(`GET ${path} returned no data`);
  }
  return envelope.data;
}

export interface MiniAppNotification {
  id: string;
  title: string;
  body: string;
  /** ISO 8601, server-side. */
  sentAt: string;
  actionType?: string;
  actionValue?: string;
}

export function fetchMiniAppNotifications(
  miniAppId: string,
  signal?: AbortSignal,
): Promise<MiniAppNotification[]> {
  return getJson<MiniAppNotification[]>(
    `/miniapps/${encodeURIComponent(miniAppId)}/notifications`,
    signal,
  );
}
