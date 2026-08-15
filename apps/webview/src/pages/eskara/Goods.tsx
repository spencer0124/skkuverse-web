import { Border, Paragraph, useAdaptive } from '@skkuverse/ui';
import { Card, NoteRow, Page, Section } from '../../components/page';
import { ARCHIVE_NOTICE, FESTIVAL_LABEL } from './data/festival';
import { DRESS_CODE, LEAD, PREORDER, SALES, TSHIRT } from './data/goods';
import { ArchiveNotice, InfoRow, PageHeading } from '../../components/eskara';

function Goods() {
  const adaptive = useAdaptive();

  return (
    <Page>
      <ArchiveNotice notice={ARCHIVE_NOTICE} />
      <PageHeading eyebrow={FESTIVAL_LABEL} title="굿즈 · 티셔츠" lead={LEAD} />

      <Section label="굿즈" title="현장 판매">
        <Card>
          <InfoRow label="기간">{SALES.period}</InfoRow>
          <Border />
          <InfoRow label="위치">{SALES.place}</InfoRow>
        </Card>
      </Section>

      <Section label="굿즈" title="프리오더 수령" divided>
        <Card style={{ marginBottom: 12 }}>
          <InfoRow label="위치">{PREORDER.place}</InfoRow>
        </Card>
        <NoteRow>{PREORDER.note}</NoteRow>
      </Section>

      <Section label="드레스코드" title={DRESS_CODE.color} divided>
        <Paragraph typography="t6" color={adaptive.grey600}>
          {DRESS_CODE.body}
        </Paragraph>
      </Section>

      <Section label="티셔츠" title="배부 안내" divided>
        <Card style={{ marginBottom: 12 }}>
          <InfoRow label="위치">{TSHIRT.place}</InfoRow>
          {TSHIRT.hours.map((h) => (
            <div key={h.who}>
              <Border />
              <InfoRow label={h.who}>{h.time}</InfoRow>
            </div>
          ))}
        </Card>
        <div style={{ marginBottom: 12 }}>
          <Paragraph typography="t6" color={adaptive.grey600}>
            {TSHIRT.eligibility}
          </Paragraph>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {TSHIRT.notes.map((n) => (
            <NoteRow key={n}>{n}</NoteRow>
          ))}
        </div>
      </Section>
    </Page>
  );
}

export default Goods;
