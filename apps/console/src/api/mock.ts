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
  LayerSet,
  NotificationDraft,
  Place,
  PublishResult,
  SendRecord,
  Session,
  Topic,
} from './types';

/** Enough delay to see a loading state, short enough not to be annoying. */
const LATENCY_MS = 320;
const wait = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
const fail = (message: string): Promise<never> =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), LATENCY_MS));

const TOPICS: Topic[] = [
  { id: 'category:academic', label: { ko: '학사', en: 'Academic' }, group: '고정 탭', subscriberCount: 4820 },
  { id: 'category:scholarship', label: { ko: '장학', en: 'Scholarship' }, group: '고정 탭', subscriberCount: 3915 },
  { id: 'category:career', label: { ko: '취업/진로', en: 'Career' }, group: '고정 탭', subscriberCount: 2740 },
  { id: 'category:event', label: { ko: '행사', en: 'Event' }, group: '고정 탭', subscriberCount: 2103 },
  { id: 'category:dorm', label: { ko: '기숙사', en: 'Dormitory' }, group: '고정 탭', subscriberCount: 1688 },
  { id: 'dept:cse-undergrad', label: { ko: '소프트웨어학과 (학부)' }, group: '학과', subscriberCount: 612 },
  { id: 'dept:biz-undergrad', label: { ko: '경영학과 (학부)' }, group: '학과', subscriberCount: 903 },
  { id: 'dept:mech-undergrad', label: { ko: '기계공학부 (학부)' }, group: '학과', subscriberCount: 548 },
  { id: 'dept:psych-undergrad', label: { ko: '심리학과 (학부)' }, group: '학과', subscriberCount: 271 },
  { id: 'miniapp:eskara-2026', label: { ko: 'ESKARA 2026' }, group: '미니앱', subscriberCount: 1455 },
];

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
  { id: 'snd_0031', sentAt: '2026-08-06T04:12:00.000Z', sentBy: 'zoyoong124@gmail.com', topics: ['category:academic'], title_ko: '2학기 수강신청 일정 안내', body_ko: '8월 12일 10시부터 시작해요.', status: 'sent', delivered: 4791, failed: 29 },
  { id: 'snd_0030', sentAt: '2026-08-04T23:40:00.000Z', sentBy: 'zoyoong124@gmail.com', topics: ['miniapp:eskara-2026'], title_ko: 'ESKARA 2026 라인업 공개', body_ko: '메인 무대 라인업을 확인해 보세요.', status: 'partial', delivered: 1402, failed: 53 },
  { id: 'snd_0029', sentAt: '2026-08-01T02:05:00.000Z', sentBy: 'zoyoong124@gmail.com', topics: ['category:scholarship', 'category:academic'], title_ko: '국가장학금 2차 신청', body_ko: '기한은 8월 9일까지예요.', status: 'sent', delivered: 7103, failed: 0 },
];

export function createMockApi(): ConsoleApi {
  // Cloned so edits made in the UI persist for the session without mutating the
  // module-level fixtures, which a hot reload would then double-apply.
  const sessions = SESSIONS.map((s) => ({ ...s }));
  const layerSets = LAYER_SETS.map((l) => ({ ...l }));
  const sends = SENDS.map((s) => ({ ...s }));

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
      return wait(TOPICS);
    },
    async listSends() {
      return wait([...sends].sort((a, b) => b.sentAt.localeCompare(a.sentAt)));
    },
    async estimateReach(topics) {
      // Overlap is real: a student subscribed to both 학사 and their department
      // is one device. The server deduplicates by token; this approximates with
      // a flat 12% discount past the first topic so the number is never a naive
      // sum, which would overstate reach and is the number people act on.
      const picked = [...TOPICS]
        .filter((t) => topics.includes(t.id))
        .sort((a, b) => b.subscriberCount - a.subscriberCount);
      if (picked.length === 0) return wait(0);
      const total = picked.reduce(
        (sum, t, i) => sum + (i === 0 ? t.subscriberCount : t.subscriberCount * 0.88),
        0,
      );
      return wait(Math.round(total));
    },
    async send(draft: NotificationDraft) {
      if (draft.topics.length === 0) return fail('토픽을 하나 이상 선택해 주세요.');
      if (!draft.title_ko.trim()) return fail('제목을 입력해 주세요.');
      if (!draft.body_ko.trim()) return fail('내용을 입력해 주세요.');
      const reach = await this.estimateReach(draft.topics);
      const failed = Math.round(reach * 0.006);
      const record: SendRecord = {
        id: `snd_${String(sends.length + 32).padStart(4, '0')}`,
        sentAt: new Date().toISOString(),
        sentBy: user?.email ?? 'unknown',
        topics: draft.topics,
        title_ko: draft.title_ko,
        body_ko: draft.body_ko,
        status: failed > 0 ? 'partial' : 'sent',
        delivered: reach - failed,
        failed,
      };
      sends.unshift(record);
      return wait(record);
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
