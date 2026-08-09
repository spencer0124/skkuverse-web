/**
 * The console's view of the server's data.
 *
 * These mirror `skkuverse-server` rather than duplicating it: the eventmap
 * shapes come from `src/eventmap/types.ts` and the notification payload from
 * `skkuverse-app/functions/src/types.ts`. They are hand-written copies, not
 * generated and not contract-locked, so they can drift — narrowed deliberately
 * to what the console reads or writes so that drift has less surface to happen
 * on. `PlaceDoc.extensions`, the snapshot payload bundles and the layer specs
 * are all omitted for that reason.
 *
 * Dates are ISO strings, not `Date`. They arrive over JSON, and parsing them
 * into `Date` here would mean serialising them back on every write.
 */

export type Campus = 'hssc' | 'nsc';

/** Every user-facing string on the server is a language map with ko required. */
export interface I18n {
  ko: string;
  en?: string;
  zh?: string;
}

// ── Notifications ────────────────────────────────────────────────────────────

/**
 * A topic a push can target.
 *
 * The server derives these from `src/notices/categories.json`: fixed tabs
 * become `category:<key>` and picker tabs become `<pickerKey>:<id>`, so a
 * department is `dept:cse-undergrad`. The console never builds a topic string
 * by hand — it picks from what the server lists, because a typo'd topic is
 * accepted by FCM and delivered to nobody.
 */
export interface Topic {
  /** The wire value, e.g. `category:academic` or `dept:cse-undergrad`. */
  id: string;
  label: I18n;
  /** Which tab group it belongs to, for grouping in the picker. */
  group: string;
  /** Devices currently subscribed. Advisory — the server counts at send time. */
  subscriberCount: number;
}

/**
 * What the console posts to the server to send a push.
 *
 * The console never talks to the Cloud Function directly. Per umbrella ADR 0006
 * the server holds `FCM_API_KEY` and proxies, so the key never reaches a
 * browser and the send is attributable to a signed-in user in the server log.
 */
export interface NotificationDraft {
  topics: string[];
  title_ko: string;
  body_ko: string;
  title_en?: string | null;
  body_en?: string | null;
  /** Optional deep link, e.g. `/notices/skku-main/12345` or a mini-app path. */
  link?: string | null;
}

export type SendStatus = 'sent' | 'partial' | 'failed';

export interface SendRecord {
  id: string;
  sentAt: string;
  /** The signed-in console user who sent it. */
  sentBy: string;
  topics: string[];
  title_ko: string;
  body_ko: string;
  status: SendStatus;
  /** Devices FCM accepted. */
  delivered: number;
  failed: number;
}

// ── Festival (event map) ─────────────────────────────────────────────────────

/**
 * A physical plot. Places are the map's fixed geography — a booth slot exists
 * whether or not anyone is in it this year.
 */
export interface Place {
  id: string;
  layerSetId: string;
  campus: Campus;
  name: I18n;
  zone?: string | null;
  lifecycle: 'draft' | 'active' | 'retired';
  /** [lng, lat], GeoJSON order — not [lat, lng]. */
  coordinates: [number, number];
}

export type SessionLifecycle = 'draft' | 'published' | 'hidden' | 'cancelled';

export interface SessionAction {
  id: string;
  label: I18n;
  actionType: 'content' | 'route' | 'webview' | 'external' | 'miniapp';
  actionValue: string;
  style?: 'primary' | 'secondary';
}

/**
 * One occupancy interval — who is in a place, when.
 *
 * This is what "fixing festival data" means in practice. `category` is an open
 * string on the server on purpose, so a new kind of programme next year is a
 * data edit rather than a deploy; the console offers the categories already in
 * use as suggestions but does not constrain the field.
 */
export interface Session {
  id: string;
  layerSetId: string;
  placeId: string;
  campus: Campus;
  tenant: { id: string | null; name: I18n; kind: string };
  title: I18n;
  subtitle?: I18n | null;
  category: string;
  tags: string[];
  dayIndex: number | null;
  date: string | null;
  slot: string | null;
  startAt: string | null;
  endAt: string | null;
  hoursLabel?: I18n | null;
  actions: SessionAction[];
  order: number;
  lifecycle: SessionLifecycle;
  updatedAt: string;
}

/** The on/off lever for a whole layer set, independent of publishing. */
export interface Activation {
  layerSetId: string;
  enabled: boolean;
  activeFrom: string | null;
  activeUntil: string | null;
  updatedAt: string;
}

export interface LayerSet {
  id: string;
  label: I18n;
  activation: Activation;
  /** The version currently served to the app, or null if never published. */
  publishedVersion: number | null;
  publishedAt: string | null;
  /** Sessions edited since that publish. Zero means the app is up to date. */
  pendingChanges: number;
}

export interface PublishResult {
  layerSetId: string;
  version: number;
  publishedAt: string;
  sessionCount: number;
}

// ── Identity ─────────────────────────────────────────────────────────────────

/**
 * Roles are custom claims the server sets through the Admin SDK.
 *
 * ADR 0006's first invariant: a valid token proves identity and nothing else.
 * The console hides what a role cannot reach, but that is a courtesy to the
 * user, not a control — the server denies by absence of claim on every route,
 * and this field is only ever what the server told us it granted.
 */
export type Role = 'notifier' | 'festival-editor' | 'admin';

export interface ConsoleUser {
  email: string;
  roles: Role[];
}
