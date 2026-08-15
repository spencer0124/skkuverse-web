/**
 * Copy checks for notification text.
 *
 * The rules come from `skkuverse-app/packages/sds/TOSS_UX_GUIDE.md` §2, which is
 * already the adopted writing standard for this product. Reusing it means the
 * console enforces the same voice the app is written in, rather than a second
 * standard invented here.
 *
 * ## Why regexes work at all on Korean
 *
 * Korean is agglutinative, so token-level rules need a morphological analyser
 * that will not fit in a browser. But every rule the guide actually enforces is
 * about the **sentence-final ending** — a closed vocabulary at a known position,
 * which a regex handles reliably. Rules that need stemming are dropped below,
 * explicitly, so nobody adds them back thinking they were forgotten.
 *
 * ## Why some checks are missing on purpose
 *
 * A linter that fires on correct copy gets switched off, and then the checks
 * that mattered go with it. Three rules from the guide are therefore NOT
 * implemented:
 *
 * - **일반 피동 (`-이/히/리/기-`)** needs a stemmer to tell 보이다 from 보이차.
 * - **긍정형 (`없어요` → `있어요`)** is a semantic rewrite, and §2.6 whitelists
 *   half the cases. `잔여석이 없어요` is often exactly the right message.
 * - **명사+명사 (§2.5)** would fire on `수강 신청`, `학사 일정`, `장학 상담` —
 *   which is to say on nearly every legitimate notice title.
 *
 * Spellcheck is also absent: there is no CORS-open Korean spellchecker, and
 * scraping one from a browser is not something to ship.
 */

/** How much a finding is allowed to interrupt. */
export type LintLevel =
  /** A fact, not a preference. Blocks the send. */
  | 'block'
  /** Style. Dismissible per item, and the dismissal is recorded in the send. */
  | 'warn'
  /** Context. No interaction. */
  | 'info';

export interface LintFinding {
  /** Stable across runs, so a dismissal can be remembered and audited. */
  id: string;
  level: LintLevel;
  field: 'title_ko' | 'body_ko' | 'title_en' | 'body_en' | 'topics' | 'payload';
  message: string;
  /** Offered only where the correction is unambiguous. */
  fix?: { label: string; apply: (value: string) => string };
}

export interface LintInput {
  purpose: 'notice' | 'promotion';
  title_ko: string;
  body_ko: string;
  title_en?: string | null;
  body_en?: string | null;
  topicCount: number;
}

/** Firestore's `array-contains-any` limit, enforced by the Cloud Function with a 400. */
export const TOPIC_LIMIT = 30;

/**
 * Split on sentence enders so rules can look at the ending rather than anywhere.
 *
 * Naive by design: Korean notice copy rarely contains decimals or abbreviations,
 * and over-splitting only costs an extra check on a fragment.
 */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** §2.6 permits passive when the subject is one of these. */
const PASSIVE_EXCEPTIONS = /(종료|만료|연체|해지|적용|중단|제한)/;

/**
 * Honorifics the guide asks to drop.
 *
 * `시나요`/`셨나요` are deliberately absent: §2.6 keeps them for questions about
 * the reader's own situation, which is the one place the guide wants honorifics.
 */
const OVER_HONORIFIC = /(시겠어요|시겠습니까|해\s?주십시오|하시기\s?바랍니다|바랍니다|계시|여쭈|하오니|드리오니|귀하)/;

const FORMAL_ENDING = /(습니다|ㅂ니다|습니까|하십시오)\s*[.!?]?$/;

/**
 * Sensational vocabulary, checked only for promotions.
 *
 * `긴급` is the load-bearing exclusion here. It is the correct word for a 휴강 or
 * a 재난 notice, and a console that blocks it at a university is switched off in
 * a week — taking every other check with it.
 */
const SENSATIONAL = /(마지막\s?기회|후회|놀라운|충격|초특가|파격|역대급|대박|단독)/;

/** Words that suggest marketing when the sender says it is a notice. */
const PROMO_SCENT = /(할인|이벤트|무료|증정|쿠폰|응모|선착순|제휴)/;

export const AD_LABEL = '(광고)';
/**
 * The opt-out path, fixed rather than free text.
 *
 * 정보통신망법 wants a working way to refuse. There is no 080 number and never
 * will be, so the only true answer is where the toggle actually lives.
 */
export const AD_OPT_OUT = '설정 > 알림에서 끌 수 있어요.';

/** 21:00–08:00 needs separate prior consent, which nothing here collects. */
export function isNightWindow(at: Date): boolean {
  const h = at.getHours();
  return h >= 21 || h < 8;
}

export function lint(input: LintInput, now: Date = new Date()): LintFinding[] {
  const out: LintFinding[] = [];
  const { title_ko: title, body_ko: body, purpose } = input;

  // ── Facts. These block. ────────────────────────────────────────────────────

  if (!title.trim()) {
    out.push({ id: 'title-empty', level: 'block', field: 'title_ko', message: '제목을 입력해 주세요.' });
  }
  if (!body.trim()) {
    out.push({ id: 'body-empty', level: 'block', field: 'body_ko', message: '내용을 입력해 주세요.' });
  }

  // The single most valuable check here: it guards a live production bug. The
  // Cloud Function falls back with `title_en ?? title_ko`, which catches null but
  // not '' — so a cleared English field sends a BLANK title to every English
  // device, with no error and no failure count.
  for (const [field, value] of [
    ['title_en', input.title_en],
    ['body_en', input.body_en],
  ] as const) {
    if (typeof value === 'string' && value.length > 0 && !value.trim()) {
      out.push({
        id: `${field}-blank`,
        level: 'block',
        field,
        message: '영어 문구가 공백만 있어요. 비우거나 채워주세요 — 지금 보내면 영어 사용자에게 빈 제목이 가요.',
      });
    }
  }

  if (input.topicCount > TOPIC_LIMIT) {
    out.push({
      id: 'topics-over-cap',
      level: 'block',
      field: 'topics',
      message: `토픽은 한 번에 ${TOPIC_LIMIT}개까지예요. 지금 ${input.topicCount}개 골랐어요.`,
    });
  }
  if (input.topicCount === 0) {
    out.push({ id: 'topics-empty', level: 'block', field: 'topics', message: '받을 대상을 하나 이상 골라주세요.' });
  }

  if (purpose === 'promotion') {
    if (!title.startsWith(AD_LABEL)) {
      out.push({
        id: 'ad-label-missing',
        level: 'block',
        field: 'title_ko',
        message: '광고성 알림은 제목이 (광고)로 시작해야 해요.',
        fix: { label: '(광고) 붙이기', apply: (v) => `${AD_LABEL}${v.replace(AD_LABEL, '').trimStart()}` },
      });
    }
    if (!body.includes(AD_OPT_OUT)) {
      out.push({
        id: 'ad-optout-missing',
        level: 'block',
        field: 'body_ko',
        message: '광고성 알림은 수신거부 방법을 함께 알려야 해요.',
        fix: { label: '수신거부 문구 넣기', apply: (v) => `${v.trimEnd()} ${AD_OPT_OUT}` },
      });
    }
    if (isNightWindow(now)) {
      out.push({
        id: 'ad-night-window',
        level: 'block',
        field: 'payload',
        message: '광고성 알림은 21시부터 다음 날 8시까지 따로 동의를 받아야 보낼 수 있어요.',
      });
    }
  }

  // ── Style. These warn, and a dismissal is recorded. ────────────────────────

  for (const [field, text] of [
    ['title_ko', title],
    ['body_ko', body],
  ] as const) {
    if (!text.trim()) continue;

    for (const s of sentences(text)) {
      if (FORMAL_ENDING.test(s)) {
        out.push({
          id: `${field}-formal`,
          level: 'warn',
          field,
          // The highest-value check on this screen: copy pasted from a 학교 공지
          // is always 하십시오체, and this is the moment to catch it.
          message: '해요체로 써주세요. 학교 공지를 그대로 붙여넣으면 보통 여기가 걸려요.',
        });
        break;
      }
    }

    if (OVER_HONORIFIC.test(text)) {
      out.push({
        id: `${field}-honorific`,
        level: 'warn',
        field,
        message: '경어를 덜어주세요. "보내시겠어요?"보다 "보낼까요?"가 이 앱의 말투예요.',
      });
    }

    if (text.includes('되어요')) {
      out.push({
        id: `${field}-doeeoyo`,
        level: 'warn',
        field,
        message: '"되어요"는 "돼요"로 써요.',
        fix: { label: '돼요로 바꾸기', apply: (v) => v.replaceAll('되어요', '돼요') },
      });
    }

    if (/(?<!함)께(?![서])/.test(text)) {
      out.push({ id: `${field}-kke`, level: 'warn', field, message: '"께"보다 "에게"를 써요.' });
    }

    // Passive endings, softened where §2.6 allows them. 종료·만료 and friends
    // keep the passive because the nuance is the point.
    const passive = /(됐어요|되었어요|되어요|돼요)/.exec(text);
    if (passive) {
      const exempt = PASSIVE_EXCEPTIONS.test(text);
      out.push({
        id: `${field}-passive`,
        level: exempt ? 'info' : 'warn',
        field,
        message: exempt
          ? '피동 표현이 있지만, 종료·만료 같은 맥락은 그대로 써도 괜찮아요.'
          : '능동형으로 바꿔보세요. "완료됐어요"보다 "완료했어요".',
      });
    }

    if (purpose === 'promotion' && SENSATIONAL.test(text)) {
      out.push({
        id: `${field}-sensational`,
        level: 'warn',
        field,
        message: '자극적인 표현은 빼주세요.',
      });
    }
  }

  if (/[.!?]$/.test(title.trim())) {
    out.push({
      id: 'title-period',
      level: 'warn',
      field: 'title_ko',
      message: '제목에는 마침표를 찍지 않아요.',
      fix: { label: '마침표 빼기', apply: (v) => v.trim().replace(/[.!?]+$/, '') },
    });
  }

  // Info rather than warn, and the reason is measured. Against 96 real notice
  // summaries this fired on 97%, and against 123 lines of pasted 공지 prose on
  // 68% — the source material is noun-phrase style and simply does not end in
  // periods. As a warning it would be pure noise; the value left in it is the
  // one-click fix, so that is what survives.
  if (body.trim() && !/[.!?]$/.test(body.trim())) {
    out.push({
      id: 'body-period',
      level: 'info',
      field: 'body_ko',
      message: '내용은 마침표로 끝내요.',
      fix: { label: '마침표 찍기', apply: (v) => `${v.trimEnd()}.` },
    });
  }

  // A 해요체 ending check on the body was tried and removed. It fired on 90% of
  // real notice summaries and 95% of pasted 공지 prose, because both are written
  // as noun phrases ending in 모집·신청·안내. A rule that flags nine correct
  // messages in ten cannot guide anyone, and it would have trained people to
  // ignore the panel that also carries the blocking checks. 하십시오체 — the
  // actual problem — is caught by FORMAL_ENDING above, which fired on 5% of the
  // same prose and was right every time.

  if (purpose === 'notice' && (PROMO_SCENT.test(title) || PROMO_SCENT.test(body))) {
    out.push({
      id: 'promo-scent',
      level: 'warn',
      field: 'body_ko',
      // Never a block. Plenty of legitimate 공지 mention 무료 or 선착순.
      message: '홍보처럼 읽히는 표현이 있어요. 광고성 알림이라면 목적을 바꿔주세요.',
    });
  }

  return out;
}

export const blocking = (findings: LintFinding[]): LintFinding[] =>
  findings.filter((f) => f.level === 'block');
