/**
 * The one interface the console talks to, and the switch that decides who
 * implements it.
 *
 * Everything above this file — every page, every form — depends on
 * `ConsoleApi` and never on fetch, on a URL, or on whether a server exists.
 * That is the whole point: connecting real data is implementing this interface
 * in `http.ts` and flipping `VITE_API_MODE`, not editing screens.
 *
 * The mock is the default rather than a fallback. A missing or misspelled
 * `VITE_API_BASE` silently returning invented data would be worse than either
 * mode, so `http` is selected explicitly and throws at startup without a base
 * URL.
 */
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

export interface ConsoleApi {
  // Identity. The console asks the server who it is rather than reading the
  // token, because the roles are the server's claims and only the server's
  // answer is meaningful.
  currentUser(): Promise<ConsoleUser | null>;
  signIn(email: string): Promise<ConsoleUser>;
  signOut(): Promise<void>;

  // Notifications
  listTopics(): Promise<Topic[]>;
  listSends(): Promise<SendRecord[]>;
  /** Resolves how many devices a topic set reaches, deduplicated. */
  estimateReach(topics: string[]): Promise<number>;
  send(draft: NotificationDraft): Promise<SendRecord>;

  // Festival
  listLayerSets(): Promise<LayerSet[]>;
  listPlaces(layerSetId: string): Promise<Place[]>;
  listSessions(layerSetId: string): Promise<Session[]>;
  updateSession(id: string, patch: Partial<Session>): Promise<Session>;
  publish(layerSetId: string): Promise<PublishResult>;
  setActivation(layerSetId: string, enabled: boolean): Promise<LayerSet>;
}

export type ApiMode = 'mock' | 'http';

export const API_MODE: ApiMode = import.meta.env.VITE_API_MODE === 'http' ? 'http' : 'mock';

let instance: ConsoleApi | null = null;

/**
 * Lazily built so the http client's missing-base-URL error surfaces on first
 * use, with a stack that points at the caller, rather than at module load.
 */
export async function api(): Promise<ConsoleApi> {
  if (instance) return instance;
  if (API_MODE === 'http') {
    const { createHttpApi } = await import('./http');
    instance = createHttpApi();
  } else {
    const { createMockApi } = await import('./mock');
    instance = createMockApi();
  }
  return instance;
}
