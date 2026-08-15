import { useState } from 'react';
import { SegmentedControl } from '@skkuverse/ui';
import { Page, Section } from '../../components/page';
import { ARCHIVE_NOTICE, FESTIVAL, FESTIVAL_LABEL } from './data/festival';
import { IMAGES } from './data/images';
import { ArchiveNotice, Figure, PageHeading } from '../../components/eskara';

const MAPS = {
  day1: IMAGES.festivalMapDay1,
  day2: IMAGES.festivalMapDay2,
} as const;

type Day = keyof typeof MAPS;

/**
 * Two designed graphics and nothing else, which is what this page is upstream
 * too — the timetable and the booth layout are art, not data we hold.
 *
 * The day switch is a SegmentedControl rather than two stacked images: the maps
 * differ in a handful of pins, and stacking them invites reading the wrong one.
 * Both are imported eagerly so switching costs no request; `Figure` marks them
 * `loading="lazy"`, so the one below the fold still stays off the first paint.
 */
function Timetable() {
  const [day, setDay] = useState<Day>('day1');
  const map = MAPS[day];

  return (
    <Page>
      <ArchiveNotice notice={ARCHIVE_NOTICE} />
      <PageHeading eyebrow={FESTIVAL_LABEL} title="타임테이블" lead={`${FESTIVAL.dates} · ${FESTIVAL.campus} 대운동장`} />

      <Section label="공연">
        <Figure {...IMAGES.timetable} />
      </Section>

      <Section label="배치" title="페스티벌 맵" divided>
        <div style={{ marginBottom: 16 }}>
          <SegmentedControl value={day} onChange={(v) => setDay(v as Day)}>
            <SegmentedControl.Item value="day1">1일차</SegmentedControl.Item>
            <SegmentedControl.Item value="day2">2일차</SegmentedControl.Item>
          </SegmentedControl>
        </div>
        <Figure {...map} />
      </Section>
    </Page>
  );
}

export default Timetable;
