import { Badge, Border, Paragraph, useAdaptive } from '@skkuverse/ui';
import { Card, NoteRow, Page, Section } from '../../components/page';
import { IMAGES } from './data/images';
import {
  DOCUMENTS,
  DOCUMENT_NOTES,
  EARLY_CHECK_IN,
  GATES,
  GRADUATION_CERT_PLACES,
  LEAD,
  OUTSIDER_FEE,
  TICKET_BOOTHS,
  TICKET_HOURS,
} from './data/entry';
import { ArchiveNotice, Figure, InfoRow, PageHeading } from './shared';

/** The page a map pin's 입장 안내 button opens. */
function Entry() {
  const adaptive = useAdaptive();

  return (
    <Page>
      <ArchiveNotice />
      <PageHeading title="입장 안내" lead={LEAD} />

      <Section label="티켓" title="수령 시간">
        <Card>
          {TICKET_HOURS.map((h, i) => (
            <div key={h.who}>
              {i > 0 && <Border />}
              <InfoRow label={h.who}>{h.time}</InfoRow>
            </div>
          ))}
        </Card>
      </Section>

      <Section label="티켓" title="수령 위치" divided>
        <Card style={{ marginBottom: 16 }}>
          {TICKET_BOOTHS.map((b, i) => (
            <div key={b.who}>
              {i > 0 && <Border />}
              <InfoRow label={b.who}>{b.place}</InfoRow>
            </div>
          ))}
        </Card>
        <Figure image={IMAGES.ticketBooths} caption="티켓부스 위치" />
      </Section>

      <Section label="성균인" title="얼리 체크인" divided>
        <Card style={{ marginBottom: 12 }}>
          <InfoRow label="시간">{EARLY_CHECK_IN.time}</InfoRow>
          <Border />
          <InfoRow label="위치">{EARLY_CHECK_IN.place}</InfoRow>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {EARLY_CHECK_IN.notes.map((n) => (
            <NoteRow key={n}>{n}</NoteRow>
          ))}
        </div>
      </Section>

      <Section label="준비물" title="본인 확인에 필요해요" divided>
        <Card style={{ marginBottom: 12 }}>
          {DOCUMENTS.map((d, i) => (
            <div key={d.who}>
              {i > 0 && <Border />}
              <InfoRow label={d.who}>{d.need}</InfoRow>
            </div>
          ))}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {DOCUMENT_NOTES.map((n) => (
            <NoteRow key={n}>{n}</NoteRow>
          ))}
        </div>
        <Card>
          <div style={{ marginBottom: 8 }}>
            <Paragraph typography="t6" fontWeight="bold">
              졸업증명서 발급 (자과캠)
            </Paragraph>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {GRADUATION_CERT_PLACES.map((p) => (
              <NoteRow key={p}>{p}</NoteRow>
            ))}
          </div>
        </Card>
      </Section>

      <Section label="대운동장" title="입·퇴장 게이트" divided>
        <Card style={{ marginBottom: 16 }}>
          {GATES.map((g, i) => (
            <div key={g.name}>
              {i > 0 && <Border />}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                }}
              >
                <Paragraph typography="t6" fontWeight="medium">
                  {g.name}
                </Paragraph>
                <div style={{ display: 'flex', gap: 6 }}>
                  {/* Both states are labelled rather than one being an absence.
                      A single "입장" chip would leave "no chip" meaning either
                      exit-only or missing data. */}
                  <Badge variant={g.enter ? 'fill' : 'weak'} size="small" color={g.enter ? 'green' : 'elephant'}>
                    {g.enter ? '입장 가능' : '입장 불가'}
                  </Badge>
                  <Badge variant={g.exit ? 'fill' : 'weak'} size="small" color={g.exit ? 'green' : 'elephant'}>
                    {g.exit ? '퇴장 가능' : '퇴장 불가'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </Card>
        <Figure image={IMAGES.stadiumGates} caption="게이트 위치" />
      </Section>

      <Section label="외부인" title="환경부담금" divided>
        <Card>
          <InfoRow label={OUTSIDER_FEE.label}>{OUTSIDER_FEE.amount}</InfoRow>
          <Border />
          <InfoRow label="결제">{OUTSIDER_FEE.payment}</InfoRow>
        </Card>
        <div style={{ marginTop: 12 }}>
          <Paragraph typography="t7" color={adaptive.grey500}>
            성균인에게는 부과되지 않아요.
          </Paragraph>
        </div>
      </Section>
    </Page>
  );
}

export default Entry;
