/**
 * An in-memory ConsoleApi, so the screens can be built and judged before the
 * server routes exist.
 *
 * Two properties make it useful rather than merely present:
 *
 *  - **It is slow and it fails.** Every call takes a beat, and `send` and
 *    `publish` reject on inputs the real server would reject. A mock that
 *    answers instantly and always succeeds hides exactly the states a console
 *    exists to handle.
 *  - **It holds state.** Edits persist for the session, so publishing after an
 *    edit shows a real pending count rather than a constant.
 *
 * Nothing here is a fixture the server will ever return. The fixtures are
 * shaped like ESKARA because that is the layer set the festival surface is for.
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
  TopicSet,
} from './types';
import { TOPICS } from './topics.fixture';
import { lint, blocking, TOPIC_LIMIT } from '../lib/lint';

/** Enough delay to see a loading state, short enough not to be annoying. */
const LATENCY_MS = 320;
const wait = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
const fail = (message: string): Promise<never> =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), LATENCY_MS));

/**
 * Synthetic devices, so `countDevices` can do a real set union.
 *
 * The previous mock returned `first + 0.88 × rest`, a fabricated dedup ratio.
 * That mattered more than a wrong number usually would: `mock.ts` is the only
 * executable description of these endpoints, so a server built to match it
 * would have implemented the fabrication. Here each device subscribes to a
 * plausible set and the count is `|union|`, which is what Firestore's
 * `array-contains-any` actually returns.
 */
interface MockDevice {
  id: string;
  topics: string[];
  locale: 'ko' | 'en';
}

const DEVICES: MockDevice[] = (() => {
  const out: MockDevice[] = [];
  const categories = TOPICS.filter((t) => t.id.startsWith('category:'));
  const depts = TOPICS.filter((t) => t.id.startsWith('dept:'));
  const others = TOPICS.filter((t) => !t.id.startsWith('category:') && !t.id.startsWith('dept:'));

  // Deterministic: a mock that shuffles makes every reach number irreproducible
  // and every screenshot an argument.
  let seed = 20260809;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < 6000; i += 1) {
    const topics: string[] = [];
    for (const c of categories) if (rand() < 0.45) topics.push(c.id);
    // maxSelection on the dept tab is 5, so a student cannot follow more.
    const deptCount = Math.floor(rand() * 3);
    for (let d = 0; d < deptCount; d += 1) {
      const pick = depts[Math.floor(rand() * depts.length)];
      if (pick && !topics.includes(pick.id)) topics.push(pick.id);
    }
    for (const o of others) if (rand() < 0.06) topics.push(o.id);
    if (topics.length === 0) continue;
    out.push({ id: `dev_${i}`, topics, locale: rand() < 0.08 ? 'en' : 'ko' });
  }
  return out;
})();

const PLACES: Place[] = [
  { id: 'nsc-plaza-a1', layerSetId: 'eskara-2026', campus: 'nsc', name: { ko: 'A-1 구역' }, zone: '중앙광장', lifecycle: 'active', coordinates: [126.9755, 37.2923] },
  { id: 'nsc-plaza-a2', layerSetId: 'eskara-2026', campus: 'nsc', name: { ko: 'A-2 구역' }, zone: '중앙광장', lifecycle: 'active', coordinates: [126.9757, 37.2924] },
  { id: 'nsc-plaza-a3', layerSetId: 'eskara-2026', campus: 'nsc', name: { ko: 'A-3 구역' }, zone: '중앙광장', lifecycle: 'active', coordinates: [126.9759, 37.2925] },
  { id: 'hssc-front-b1', layerSetId: 'eskara-2026', campus: 'hssc', name: { ko: 'B-1 구역' }, zone: '정문 앞', lifecycle: 'active', coordinates: [126.9936, 37.5873] },
  { id: 'hssc-field-c1', layerSetId: 'eskara-2026', campus: 'hssc', name: { ko: 'C-1 구역' }, zone: '운동장', lifecycle: 'active', coordinates: [126.9940, 37.5876] },
];

const SESSIONS: Session[] = [
  {
    id: 'eskara-2026-d1-cse-booth', layerSetId: 'eskara-2026', placeId: 'nsc-plaza-a1', campus: 'nsc',
    tenant: { id: 'cse', name: { ko: '소프트웨어학과 학생회' }, kind: 'department' },
    title: { ko: '소웨 부스', en: 'CSE Booth' }, subtitle: { ko: '전공 상담 + 굿즈' },
    category: '부스', tags: ['학과', '체험'], dayIndex: 1, date: '2026-09-18', slot: 'day',
    startAt: '2026-09-18T02:00:00.000Z', endAt: '2026-09-18T09:00:00.000Z',
    hoursLabel: { ko: '11:00 ~ 18:00' },
    actions: [{ id: 'detail', label: { ko: '자세히 보기' }, actionType: 'content', actionValue: 'eskara-cse-2026', style: 'primary' }],
    order: 10, lifecycle: 'published', updatedAt: '2026-08-01T05:12:00.000Z',
  },
  {
    id: 'eskara-2026-d1-biz-booth', layerSetId: 'eskara-2026', placeId: 'nsc-plaza-a2', campus: 'nsc',
    tenant: { id: 'biz', name: { ko: '경영대학 학생회' }, kind: 'department' },
    title: { ko: '경영대 주점' }, subtitle: null,
    category: '주점', tags: ['학과'], dayIndex: 1, date: '2026-09-18', slot: 'night',
    startAt: '2026-09-18T09:00:00.000Z', endAt: '2026-09-18T14:00:00.000Z',
    hoursLabel: { ko: '18:00 ~ 23:00' },
    actions: [], order: 20, lifecycle: 'published', updatedAt: '2026-08-02T11:40:00.000Z',
  },
  {
    id: 'eskara-2026-d2-food-truck', layerSetId: 'eskara-2026', placeId: 'nsc-plaza-a3', campus: 'nsc',
    tenant: { id: null, name: { ko: '외부 푸드트럭' }, kind: 'vendor' },
    title: { ko: '푸드트럭 존' }, subtitle: { ko: '6개 팀 운영' },
    category: '먹거리', tags: ['외부'], dayIndex: 2, date: '2026-09-19', slot: 'day',
    startAt: '2026-09-19T02:00:00.000Z', endAt: '2026-09-19T12:00:00.000Z',
    hoursLabel: { ko: '11:00 ~ 21:00' },
    actions: [], order: 30, lifecycle: 'published', updatedAt: '2026-08-03T02:15:00.000Z',
  },
  {
    id: 'eskara-2026-d2-main-stage', layerSetId: 'eskara-2026', placeId: 'hssc-field-c1', campus: 'hssc',
    tenant: { id: 'union', name: { ko: '총학생회' }, kind: 'union' },
    title: { ko: '메인 무대 — 연예인 공연' }, subtitle: { ko: '입장 팔찌 필요' },
    category: '공연', tags: ['메인'], dayIndex: 2, date: '2026-09-19', slot: 'night',
    startAt: '2026-09-19T10:00:00.000Z', endAt: '2026-09-19T13:00:00.000Z',
    hoursLabel: { ko: '19:00 ~ 22:00' },
    actions: [
      { id: 'entry', label: { ko: '입장 안내' }, actionType: 'webview', actionValue: 'https://webview.skkuverse.com/eskara/entry', style: 'primary' },
      { id: 'timetable', label: { ko: '타임테이블' }, actionType: 'webview', actionValue: 'https://webview.skkuverse.com/eskara/timetable' },
    ],
    order: 5, lifecycle: 'draft', updatedAt: '2026-08-06T23:30:00.000Z',
  },
  {
    id: 'eskara-2026-d3-flea-market', layerSetId: 'eskara-2026', placeId: 'hssc-front-b1', campus: 'hssc',
    tenant: { id: null, name: { ko: '동아리연합회' }, kind: 'club' },
    title: { ko: '플리마켓' }, subtitle: null,
    category: '부스', tags: ['동아리'], dayIndex: 3, date: '2026-09-20', slot: 'day',
    startAt: null, endAt: null, hoursLabel: { ko: '미정' },
    actions: [], order: 40, lifecycle: 'hidden', updatedAt: '2026-08-05T08:00:00.000Z',
  },
];

const LAYER_SETS: LayerSet[] = [
  {
    id: 'eskara-2026',
    label: { ko: 'ESKARA 2026', en: 'ESKARA 2026' },
    activation: { layerSetId: 'eskara-2026', enabled: true, activeFrom: '2026-09-17T15:00:00.000Z', activeUntil: '2026-09-20T15:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z' },
    publishedVersion: 7,
    publishedAt: '2026-08-05T09:20:00.000Z',
    pendingChanges: 1,
  },
  {
    id: 'daedongje-2026',
    label: { ko: '대동제 2026' },
    activation: { layerSetId: 'daedongje-2026', enabled: false, activeFrom: null, activeUntil: null, updatedAt: '2026-07-20T00:00:00.000Z' },
    publishedVersion: null,
    publishedAt: null,
    pendingChanges: 0,
  },
];

const SENDS: SendRecord[] = [
  {
    id: 'snd_0031', sentAt: '2026-08-06T04:12:00.000Z', sentBy: 'zoyoong124@gmail.com',
    mode: 'live', purpose: 'notice', topics: ['category:academic'], topicSetId: null,
    noticeId: 'console:zoyoong124@gmail.com:m9x2a1',
    title_ko: '2학기 수강신청 일정 안내', body_ko: '8월 12일 10시부터 시작해요.',
    status: 'sent', delivered: 4791, failed: 29, cleanedUp: 29, dismissedWarnings: [],
  },
  {
    id: 'snd_0030', sentAt: '2026-08-04T23:40:00.000Z', sentBy: 'zoyoong124@gmail.com',
    mode: 'live', purpose: 'notice', topics: ['category:event'], topicSetId: null,
    noticeId: 'console:zoyoong124@gmail.com:m9w7b3',
    title_ko: '학생회 주최 여름 행사 안내', body_ko: '이번 주 금요일 오후 6시에 시작해요.',
    // The one record with a real residue: 53 failed, 41 of which were dead
    // tokens, so 12 are worth looking at. History must show that split.
    status: 'partial', delivered: 1402, failed: 53, cleanedUp: 41, dismissedWarnings: ['body_ko-formal'],
  },
  {
    id: 'snd_0029', sentAt: '2026-08-01T02:05:00.000Z', sentBy: 'zoyoong124@gmail.com',
    mode: 'test', purpose: 'notice', topics: ['category:scholarship'], topicSetId: 'ts_seed',
    noticeId: 'console:zoyoong124@gmail.com:m9t4c8',
    title_ko: '국가장학금 2차 신청', body_ko: '기한은 8월 9일까지예요.',
    status: 'sent', delivered: 2, failed: 0, cleanedUp: 0, dismissedWarnings: [],
  },
];

export function createMockApi(): ConsoleApi {
  // Cloned so edits made in the UI persist for the session without mutating the
  // module-level fixtures, which a hot reload would then double-apply.
  const sessions = SESSIONS.map((s) => ({ ...s }));
  const layerSets = LAYER_SETS.map((l) => ({ ...l }));
  const sends = SENDS.map((s) => ({ ...s }));
  const topicSets: TopicSet[] = [
    {
      id: 'ts_seed',
      name: '전체 공지 구독자',
      topics: ['category:academic', 'category:scholarship', 'category:career', 'category:recruitment', 'category:event'],
      updatedBy: 'zoyoong124@gmail.com',
      updatedAt: '2026-08-01T02:00:00.000Z',
      staleTopicIds: [],
    },
  ];

  // Survives a reload. Without this a refresh or a pasted URL bounces to
  // sign-in, which makes every screen unreachable by address and hides that
  // deep links work at all. sessionStorage rather than localStorage so it dies
  // with the tab — the real client gets persistence from the Firebase SDK, and
  // a mock session outliving the browser would be a worse imitation, not a
  // better one.
  const SESSION_KEY = 'console-mock-user';
  const restore = (): ConsoleUser | null => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as ConsoleUser) : null;
    } catch {
      return null;
    }
  };
  let user: ConsoleUser | null = restore();
  const remember = (next: ConsoleUser | null) => {
    user = next;
    try {
      if (next) sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Private mode, or storage disabled. The session stays in memory.
    }
  };

  return {
    async currentUser() {
      return wait(user);
    },
    async signIn(email) {
      if (!email.includes('@')) return fail('이메일 주소를 확인해 주세요.');
      // Roles come from the server's custom claims in the real client. The mock
      // grants everything, which is exactly why it must never be the default in
      // a deployed build — see client.ts.
      remember({ email, roles: ['notifier', 'festival-editor', 'admin'] });
      return wait(user as ConsoleUser);
    },
    async signOut() {
      remember(null);
      return wait(undefined);
    },

    async listTopics() {
      // subscriberCount recomputed from the device set rather than stored, so
      // the picker's per-topic numbers and the union total cannot disagree.
      return wait(
        TOPICS.map((t) => ({
          ...t,
          subscriberCount: DEVICES.filter((d) => d.topics.includes(t.id)).length,
        })),
      );
    },
    async listSends() {
      return wait([...sends].sort((a, b) => b.sentAt.localeCompare(a.sentAt)));
    },
    async countDevices(topics): Promise<DeviceCount> {
      if (topics.length === 0) return wait({ devices: 0, byLocale: { ko: 0, en: 0 } });
      // A real union — the same thing `array-contains-any` returns. A device
      // subscribed to three of the selected topics is one device.
      const matched = DEVICES.filter((d) => d.topics.some((t) => topics.includes(t)));
      return wait({
        devices: matched.length,
        byLocale: {
          ko: matched.filter((d) => d.locale === 'ko').length,
          en: matched.filter((d) => d.locale === 'en').length,
        },
      });
    },
    async validate(draft) {
      const findings = blocking(
        lint({
          purpose: draft.purpose,
          title_ko: draft.title_ko,
          body_ko: draft.body_ko,
          title_en: draft.title_en,
          body_en: draft.body_en,
          topicCount: draft.topics.length,
        }),
      );
      return wait(findings.map((f) => f.message));
    },
    async testSend(draft): Promise<TestSendResult> {
      const problems = await this.validate(draft);
      if (problems.length > 0) return fail(problems[0] ?? '보낼 수 없어요.');
      // Zero devices is a real outcome with a reason, not a silent success.
      // The console signs in against a different Firebase project than the app,
      // so this mapping is data an admin populates rather than something the
      // token can tell us.
      if (!user) return fail('로그인이 필요해요.');
      const devices = 2;
      return wait({ sent: devices, failed: 0, devices });
    },
    async send(draft: NotificationDraft) {
      const problems = await this.validate(draft);
      if (problems.length > 0) return fail(problems[0] ?? '보낼 수 없어요.');

      const { devices } = await this.countDevices(draft.topics);
      // Most of `failed` is the send garbage-collecting dead tokens, not an
      // error. Modelled separately here so History can show the split rather
      // than painting routine cleanup red.
      const cleanedUp = Math.round(devices * 0.011);
      const residualFailures = Math.round(devices * 0.001);
      const record: SendRecord = {
        id: `snd_${String(sends.length + 32).padStart(4, '0')}`,
        sentAt: new Date().toISOString(),
        sentBy: user?.email ?? 'unknown',
        mode: 'live',
        purpose: draft.purpose,
        topics: draft.topics,
        topicSetId: null,
        noticeId: `console:${user?.email ?? 'unknown'}:${Date.now().toString(36)}`,
        title_ko: draft.title_ko,
        body_ko: draft.body_ko,
        status: residualFailures > 0 ? 'partial' : 'sent',
        delivered: devices - cleanedUp - residualFailures,
        failed: cleanedUp + residualFailures,
        cleanedUp,
        dismissedWarnings: [],
      };
      sends.unshift(record);
      return wait(record);
    },

    async listTopicSets() {
      return wait(topicSets);
    },
    async saveTopicSet(name, topics) {
      if (!name.trim()) return fail('이름을 입력해 주세요.');
      // Enforced at save rather than discovered at send.
      if (topics.length > TOPIC_LIMIT) {
        return fail(`토픽은 ${TOPIC_LIMIT}개까지 저장할 수 있어요.`);
      }
      const known = new Set(TOPICS.map((t) => t.id));
      const set: TopicSet = {
        id: `ts_${topicSets.length + 1}`,
        name: name.trim(),
        topics,
        updatedBy: user?.email ?? 'unknown',
        updatedAt: new Date().toISOString(),
        staleTopicIds: topics.filter((t) => !known.has(t)),
      };
      topicSets.unshift(set);
      return wait(set);
    },
    async deleteTopicSet(id) {
      const i = topicSets.findIndex((t) => t.id === id);
      if (i >= 0) topicSets.splice(i, 1);
      return wait(undefined);
    },

    async listLayerSets() {
      return wait(layerSets);
    },
    async listPlaces(layerSetId) {
      return wait(PLACES.filter((p) => p.layerSetId === layerSetId));
    },
    async listSessions(layerSetId) {
      return wait(sessions.filter((s) => s.layerSetId === layerSetId));
    },
    async updateSession(id, patch) {
      const i = sessions.findIndex((s) => s.id === id);
      const existing = sessions[i];
      if (!existing) return fail(`세션을 찾지 못했어요: ${id}`);
      const next = { ...existing, ...patch, updatedAt: new Date().toISOString() };
      sessions[i] = next;
      const set = layerSets.find((l) => l.id === next.layerSetId);
      if (set) set.pendingChanges += 1;
      return wait(next);
    },
    async publish(layerSetId) {
      const set = layerSets.find((l) => l.id === layerSetId);
      if (!set) return fail(`레이어셋을 찾지 못했어요: ${layerSetId}`);
      const publishable = sessions.filter(
        (s) => s.layerSetId === layerSetId && s.lifecycle === 'published',
      );
      if (publishable.length === 0) {
        return fail('게시 상태인 세션이 없어요. 최소 하나는 있어야 발행할 수 있어요.');
      }
      set.publishedVersion = (set.publishedVersion ?? 0) + 1;
      set.publishedAt = new Date().toISOString();
      set.pendingChanges = 0;
      return wait({
        layerSetId,
        version: set.publishedVersion,
        publishedAt: set.publishedAt,
        sessionCount: publishable.length,
      });
    },
    async setActivation(layerSetId, enabled) {
      const set = layerSets.find((l) => l.id === layerSetId);
      if (!set) return fail(`레이어셋을 찾지 못했어요: ${layerSetId}`);
      set.activation = { ...set.activation, enabled, updatedAt: new Date().toISOString() };
      return wait(set);
    },
  };
}
