/**
 * The festival's identity, and the one switch that says whose festival it is.
 *
 * Every page under `/eskara` reads its content from a sibling module in this
 * folder, so a new year is a data edit rather than a rewrite. The pages ship
 * with 2025's content because 2026's is not published yet — the event map runs
 * on the 2025 layout for the same reason (skkuverse#12).
 *
 * `archived` is what keeps that honest. While it is true the pages say so, in
 * one line each, rather than presenting last year's times as this year's. Flip
 * it in the same commit that replaces the content, and the notices disappear.
 */
export const FESTIVAL = {
  name: 'ESKARA',
  year: '2025',
  subtitle: '초록의 파도',
  dates: '9. 11.(목) – 9. 12.(금)',
  campus: '자연과학캠퍼스',
  archived: true,
} as const;

/**
 * Shown at the top of every page while `FESTIVAL.archived` holds, and `null`
 * once it does not — so flipping that one flag removes every banner at once
 * rather than leaving five pages to remember.
 */
export const ARCHIVE_NOTICE: string | null = FESTIVAL.archived
  ? `${FESTIVAL.year}년 ESKARA 안내예요. 올해 정보가 확정되면 업데이트할게요.`
  : null;

/** The eyebrow above every page title. */
export const FESTIVAL_LABEL = `${FESTIVAL.year} ${FESTIVAL.name}`;

export interface PageLink {
  path: string;
  icon: string;
  title: string;
  description: string;
}

/** The index at `/eskara`. Order is the order they appear. */
export const PAGES: PageLink[] = [
  {
    path: '/eskara/entry',
    icon: '🎫',
    title: '입장 안내',
    description: '티켓 수령과 게이트, 얼리 체크인',
  },
  {
    path: '/eskara/timetable',
    icon: '🗓️',
    title: '타임테이블 · 페스티벌 맵',
    description: '양일 공연 순서와 부스 배치',
  },
  {
    path: '/eskara/shuttle',
    icon: '🚌',
    title: '셔틀 증차',
    description: '인자/자인셔틀 증차와 패스트트랙',
  },
  {
    path: '/eskara/goods',
    icon: '👕',
    title: '굿즈 · 티셔츠',
    description: '현장 판매, 프리오더 수령, 드레스코드',
  },
];
