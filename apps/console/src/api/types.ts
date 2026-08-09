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
 * accepted and delivered to nobody.
 *
 * Not an FCM topic. Nothing in the fleet calls `subscribeToTopic`; this is a
 * string in a Firestore array, and a send resolves device tokens with
 * `.where('subscribedTopics','array-contains-any', topics)`. Two consequences
 * run through this whole surface: the 30-topic cap below is Firestore's limit
 * on that operator, and reach is exactly countable rather than estimable.
 */
export interface Topic {
  /** The wire value, e.g. `category:academic` or `dept:cse-undergrad`. */
  id: string;
  label: I18n;
  /** Which tab group it belongs to, for grouping in the picker. */
  group: string;
  /** Devices currently subscribed. Recomputed on read; never stored. */
  subscriberCount: number;
  /**
   * Whether subscribers to this topic consented to marketing, as opposed to
   * consenting to a category of notice.
   *
   * Someone who subscribed to `category:event` agreed to hear about 행사 공지,
   * not about 제휴 마케팅. So an advertising send may only target topics where
   * this is true, which turns a question about 정보통신망법 into a constraint the
   * UI can enforce. It is false everywhere today, and that is the true state:
   * there is currently no audience an advertising push may reach.
   */
  adConsent: boolean;
}

/**
 * A saved, reusable set of topics — the slim version of Toss's 세그먼트.
 *
 * Server-owned rather than local: the point is the next operator reusing it,
 * a bad send's first question is which set and who edited it, and the 30-topic
 * cap has to be enforced at save time rather than discovered at send.
 */
export interface TopicSet {
  id: string;
  name: string;
  topics: string[];
  updatedBy: string;
  updatedAt: string;
  /**
   * Topics in this set that no longer exist upstream.
   *
   * `categories.json` changes, and a stored string that no device subscribes to
   * fails silently — the send succeeds and reaches fewer people than intended.
   * The server resolves this on read so the console can show it.
   */
  staleTopicIds: string[];
}

/**
 * Why a message is going out.
 *
 * Asked as a question rather than offered as a checkbox labelled 광고성, which
 * is always left unticked. The answer decides which topics are eligible, whether
 * `(광고)` is prepended, and whether the night-time window applies.
 */
export type SendPurpose = 'notice' | 'promotion';

/** Where a tap lands. */
export type TapTarget =
  | { kind: 'none' }
  /**
   * The only destination the app can actually honour.
   *
   * `notification-router.ts` switches on `data.type` and has one case, `notice`,
   * requiring both of these as strings. Any other shape returns false and the
   * tap does nothing at all — and because the router ships inside the binary,
   * the vocabulary is pinned to the oldest installed version rather than to the
   * backend.
   */
  | { kind: 'notice'; sourceId: string; articleNo: string };

/**
 * What the console posts to the server to send a push.
 *
 * The console never talks to the Cloud Function directly. Per umbrella ADR 0006
 * the server holds `FCM_API_KEY` and proxies, so the key never reaches a browser
 * and the send is attributable to a signed-in user.
 *
 * No `zh`. The push pipeline models locale as `'ko' | 'en'` on purpose and folds
 * Chinese-locale users into Korean; a `title_zh` would be accepted as unknown
 * JSON and silently ignored.
 */
export interface NotificationDraft {
  purpose: SendPurpose;
  topics: string[];
  title_ko: string;
  body_ko: string;
  /**
   * Optional. Null means English-locale devices receive the Korean copy, which
   * is a supported mode rather than an error.
   *
   * Must be null rather than `''`. The handler falls back with `??`, which
   * catches null and undefined but not an empty string — so a cleared English
   * field currently sends a blank title to every English device.
   */
  title_en?: string | null;
  body_en?: string | null;
  target: TapTarget;
}

export type SendStatus = 'sending' | 'sent' | 'partial' | 'failed';
export type SendMode = 'test' | 'live';

export interface SendRecord {
  id: string;
  sentAt: string;
  /** The signed-in console user who sent it. */
  sentBy: string;
  mode: SendMode;
  purpose: SendPurpose;
  topics: string[];
  topicSetId?: string | null;
  /** Server-generated, `console:<consoleUid>:<ulid>`. The Cloud Function requires it. */
  noticeId: string;
  title_ko: string;
  body_ko: string;
  status: SendStatus;
  /** Devices FCM accepted. */
  delivered: number;
  /**
   * Devices FCM rejected, including the dead tokens the send garbage-collects.
   *
   * Mostly not failure: subtract `cleanedUp` to get the residue worth worrying
   * about. Reporting this number raw makes every healthy send look broken.
   */
  failed: number;
  /** Dead tokens deactivated during this send. A subset of `failed`. */
  cleanedUp: number;
  /** Style warnings the sender dismissed, kept so the choice is auditable. */
  dismissedWarnings: string[];
}

export interface TestSendResult {
  sent: number;
  failed: number;
  /** Zero is a real outcome, not an error — see `reason`. */
  devices: number;
  reason?: string | null;
}

export interface DeviceCount {
  devices: number;
  /** One number would hide that this is two messages to two audiences. */
  byLocale: { ko: number; en: number };
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
