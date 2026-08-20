import { useEffect, useState } from 'react';
import { ListRow, Paragraph, useAdaptive } from '@skkuverse/ui';
import { Page, Section } from '../../components/page';
import {
  ApiNotConfiguredError,
  fetchMiniAppNotifications,
  type MiniAppNotification,
} from '../../lib/api';

/**
 * The ESKARA notification feed at `/eskara/inbox`.
 *
 * This page is the reason skkuverse-app ADR 0002 could be narrowed rather than
 * reversed. That ADR rejected a notification inbox; its Revisited section allows
 * a *broadcast feed* because a push that is not a notice has no recovery path
 * once the banner is cleared, and a rain delay is exactly that. So the job here
 * is recovery: what was announced, and when.
 *
 * It is a feed, not an inbox, and the difference is the whole justification.
 * There is no read state, no per-user badge and no delete control — anyone
 * adding one should amend that ADR first, because their absence is why the
 * decision could be narrowed at all.
 *
 * Unlike every other page here it fetches, which is why it is also the only one
 * with three states to render.
 */

type FeedState =
  | { status: 'loading' }
  | { status: 'ready'; items: MiniAppNotification[] }
  | { status: 'failed' };

const MINI_APP_ID = 'eskara-2026';

/**
 * "3분 전" / "어제" rather than a timestamp.
 *
 * A push is read minutes after it arrives, so elapsed time is the useful axis;
 * an absolute time makes the reader do the subtraction. Falls back to a date
 * past a week, where "8일 전" stops meaning anything.
 */
function relativeTime(iso: string, now: number): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const mins = Math.floor((now - then) / 60000);
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  return new Date(then).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

/**
 * The href a row opens, or null for a row that is only text.
 *
 * The feed carries the same `actionType`/`actionValue` the push did, and a
 * recovery surface that drops them is only half a recovery: a rain-delay
 * notification whose tap opened the shuttle page should still reach the shuttle
 * page an hour later.
 *
 * Only `webview` and `external` become links, and only when the value is an
 * https URL. `route` is an in-app path with no meaning in a browser, and the
 * https check is not decoration — an href built from server data is the one
 * place this page could be made to emit `javascript:`. The server already
 * refuses anything else on the way in; this is the second half of that, because
 * a feed row outlives the validation that admitted it.
 */
function hrefFor(item: MiniAppNotification): string | null {
  if (item.actionType !== 'webview' && item.actionType !== 'external') return null;
  const value = item.actionValue;
  return value && value.startsWith('https://') ? value : null;
}

function Inbox() {
  const adaptive = useAdaptive();
  const [state, setState] = useState<FeedState>({ status: 'loading' });
  // Frozen at mount: a ticking clock would re-render the whole list every
  // minute to move one label, and nobody is watching "3분 전" become "4분 전".
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const controller = new AbortController();
    fetchMiniAppNotifications(MINI_APP_ID, controller.signal)
      .then((items) => setState({ status: 'ready', items }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        // A missing VITE_API_BASE is a deploy mistake, not a user-facing one,
        // but it reaches the user identically — so it renders as failed and
        // says so in the console rather than silently showing an empty feed.
        if (err instanceof ApiNotConfiguredError) console.error(err.message);
        setState({ status: 'failed' });
      });
    return () => controller.abort();
  }, []);

  return (
    <Page>
      <Section label="ESKARA 2026" title="알림">
        {state.status === 'loading' ? (
          <Paragraph typography="t6" color={adaptive.grey500}>
            불러오는 중…
          </Paragraph>
        ) : null}

        {state.status === 'failed' ? (
          <Paragraph typography="t6" color={adaptive.grey500}>
            알림을 불러오지 못했어요. 잠시 후 다시 열어주세요.
          </Paragraph>
        ) : null}

        {/*
          Empty is the COMMON state, not an error: before the first announcement
          this is what everyone sees, and it has to read as "nothing has happened
          yet" rather than as a failure. Distinct copy from the failed branch for
          exactly that reason.
        */}
        {state.status === 'ready' && state.items.length === 0 ? (
          <Paragraph typography="t6" color={adaptive.grey500}>
            아직 도착한 알림이 없어요.
          </Paragraph>
        ) : null}

        {state.status === 'ready' && state.items.length > 0 ? (
          <div>
            {state.items.map((item) => {
              const href = hrefFor(item);
              const row = (
                <ListRow
                  contents={
                    <ListRow.Texts
                      type="2RowTypeA"
                      top={item.title}
                      bottom={item.body}
                    />
                  }
                  right={
                    <Paragraph typography="t7" color={adaptive.grey500}>
                      {relativeTime(item.sentAt, now)}
                    </Paragraph>
                  }
                />
              );
              // Same tab: these are first-party festival pages, and the mini-app
              // shell has no tab affordance for a user to come back from.
              return href ? (
                <a
                  key={item.id}
                  href={href}
                  style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                >
                  {row}
                </a>
              ) : (
                <div key={item.id}>{row}</div>
              );
            })}
          </div>
        ) : null}
      </Section>
    </Page>
  );
}

export default Inbox;
