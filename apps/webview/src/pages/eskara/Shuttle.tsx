import { Border, Paragraph, useAdaptive } from '@skkuverse/ui';
import { Card, NoteRow, Page, RouteDirection, Section } from '../../components/page';
import { ARCHIVE_NOTICE, FESTIVAL_LABEL } from './data/festival';
import { DAYS, FAST_TRACK, LEAD, SCHEDULE_POINTER } from './data/shuttle';
import { ArchiveNotice, InfoRow, PageHeading } from '../../components/eskara';

/**
 * What changes about the shuttle during the festival — not the timetable itself.
 *
 * The running times already exist in the server's `bus_overrides` and are drawn
 * by the app's 교통 tab. Copying them here would be a second source that goes
 * stale the first time a bus is added, so the page points at that tab instead.
 * The map sheet does the same with a `route` action to `/(tabs)/transit`, which
 * is the navigable version of this pointer — a page in the webview cannot move
 * the app itself.
 */
function Shuttle() {
  const adaptive = useAdaptive();

  return (
    <Page>
      <ArchiveNotice notice={ARCHIVE_NOTICE} />
      <PageHeading eyebrow={FESTIVAL_LABEL} title="셔틀 증차" lead={LEAD} />

      <Section label="시간표">
        <Card>
          <div style={{ marginBottom: 6 }}>
            <Paragraph typography="t6" fontWeight="bold">
              {SCHEDULE_POINTER.title}
            </Paragraph>
          </div>
          <Paragraph typography="t6" color={adaptive.grey600}>
            {SCHEDULE_POINTER.body}
          </Paragraph>
        </Card>
      </Section>

      <Section label="증차" title="인자/자인셔틀" divided>
        <div style={{ marginBottom: 4 }}>
          <RouteDirection from="인사캠" to="자과캠" />
        </div>
        {DAYS.map((d, i) => (
          <Card key={d.day} style={{ marginBottom: i < DAYS.length - 1 ? 12 : 0 }}>
            <div style={{ marginBottom: 10 }}>
              <Paragraph typography="t6" fontWeight="bold">
                {d.day}
              </Paragraph>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {d.notes.map((n) => (
                <NoteRow key={n}>{n}</NoteRow>
              ))}
            </div>
          </Card>
        ))}
      </Section>

      <Section label="인사캠" title="패스트트랙" divided>
        <div style={{ marginBottom: 16 }}>
          <Paragraph typography="t6" color={adaptive.grey600}>
            {FAST_TRACK.what}
          </Paragraph>
        </div>
        <Card style={{ marginBottom: 12 }}>
          <InfoRow label="날짜">{FAST_TRACK.date}</InfoRow>
          <Border />
          <InfoRow label="장소">{FAST_TRACK.place}</InfoRow>
          {FAST_TRACK.hours.map((h) => (
            <div key={h.who}>
              <Border />
              <InfoRow label={h.who}>{h.time}</InfoRow>
            </div>
          ))}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {FAST_TRACK.notes.map((n) => (
            <NoteRow key={n}>{n}</NoteRow>
          ))}
        </div>
      </Section>
    </Page>
  );
}

export default Shuttle;
