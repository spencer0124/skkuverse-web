/**
 * How long is too long, answered by measuring rather than by counting.
 *
 * ## Why there is no character limit here
 *
 * Notification text truncates in **pixels**, not characters. Android varies by
 * device width (360dp to 480dp+), by the user's font scale (up to 2×), by OEM
 * skin, and by whether a large icon is stealing width. iOS gives the title one
 * line and the body up to two in a banner, then re-truncates differently in
 * Notification Center, on the lock screen, and on a forwarded Watch.
 *
 * So a number like "40 characters" is not a simplification of that, it is a
 * guess — and the previous constants guessed in the worst direction, telling the
 * operator they were safe well after a real tray had already cut. Apps-in-Toss
 * publishes 7 and 25 for their own surface; importing those would be worse
 * still, since seven characters cannot hold `2학기 수강신청 일정`.
 *
 * `measureOverflow` therefore asks the browser. The preview renders the copy at
 * the same line clamps a tray uses, and overflow is read off the layout.
 *
 * ## The one number that is exact
 *
 * FCM rejects a payload over 4 KB, and nothing in the fleet checks it. That
 * failure is unusually nasty: `messaging/invalid-argument` is deliberately
 * excluded from the Cloud Function's token-cleanup allowlist, so an oversized
 * payload fails the entire batch with no cleanup and no distinct error. It is
 * the one hard block in this file.
 */

/** FCM's documented ceiling. */
const FCM_PAYLOAD_BYTES = 4096;
/**
 * Where we refuse, leaving room for the fields the server adds.
 *
 * The console does not build the final payload — the server adds `noticeId`,
 * the analytics label and the channel id — so refusing at exactly 4 KB would
 * let a draft through that the server then grows past the limit.
 */
export const PAYLOAD_WARN_BYTES = 3500;

export function payloadBytes(draft: Record<string, unknown>): number {
  return new TextEncoder().encode(JSON.stringify(draft)).length;
}

export function payloadTooLarge(draft: Record<string, unknown>): boolean {
  return payloadBytes(draft) > PAYLOAD_WARN_BYTES;
}

export { FCM_PAYLOAD_BYTES };

/**
 * Preview width, in CSS pixels.
 *
 * PROVISIONAL — not yet measured against a real device. It is a plain 360dp
 * assumption minus typical tray padding, which is the most common Android width
 * but is an assumption all the same, and it is recorded as one so nobody reads
 * it as fact.
 *
 * To replace it with something real: send a ruler string (`가나다라마바사아자차
 * 카타파하…`, marked every five characters) through 테스트 발송 to a 360dp Android
 * at default font scale, the same device at 1.3×, and an iPhone. Read where each
 * cuts, take the narrowest, and record the device, OS version and font scale
 * beside the new value. Four data points, under an hour, and the number stops
 * being a guess.
 */
export const PREVIEW_WIDTH_PX = 268;

export type Fit = 'safe' | 'tight' | 'clipped';

/**
 * Whether text fits, asked of the layout.
 *
 * `scrollWidth > clientWidth` is the real question — it is true exactly when the
 * browser had to clip, at whatever width and font the element actually has. The
 * `tight` band exists because sitting one character inside the limit is not
 * comfortable: a slightly wider font or a slightly narrower phone clips it.
 */
export function measureFit(el: HTMLElement | null): Fit {
  if (!el) return 'safe';
  const overflow = el.scrollWidth - el.clientWidth;
  if (overflow > 0) return 'clipped';
  if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth * 0.92) return 'tight';
  return 'safe';
}

export const FIT_MESSAGE: Record<Fit, string | null> = {
  safe: null,
  tight: '기기에 따라 잘릴 수 있어요.',
  clipped: '이 미리보기 너비에서는 잘려요.',
};

/**
 * Normalise an optional English field before it goes on the wire.
 *
 * The Cloud Function falls back with `title_en ?? title_ko`, which catches null
 * and undefined but **not** an empty string — so a field that was typed into and
 * then cleared sends a blank title to every English-locale device, silently.
 * Every path that builds a draft must go through this.
 */
export function normaliseOptional(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
