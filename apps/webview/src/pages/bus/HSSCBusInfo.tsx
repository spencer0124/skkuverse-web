import { Badge, Border, ListRow, Paragraph, useAdaptive } from '@skkuverse/ui';
import { openUrl } from '../../bridge';
import { Card, NoteRow, Page, RouteDirection, RouteStop, RouteTimeline, Section } from '../../components/page';

const CONTACTS = [
  { name: '학생지원팀', display: '02-760-1073', tel: 'tel:027601073' },
  { name: '인사캠 관리팀', display: '02-760-0110', tel: 'tel:027600110' },
];

const TO_HYEHWA = ['농구장', '학생회관', '정문', '올림픽기념국민생활관', '혜화동 우체국', '혜화동로터리', '혜화역 1번출구'];
const TO_CAMPUS = ['혜화역 1번출구', '혜화동로터리', '성균관대입구사거리', '정문', '600주년기념관'];

function OperatingHours({ label, value }: { label: string; value: string }) {
  const adaptive = useAdaptive();
  return (
    <div style={{ flex: 1, background: adaptive.grey100, borderRadius: 16, padding: 20, textAlign: 'center' }}>
      <Paragraph typography="t7" fontWeight="semibold" color={adaptive.grey500}>
        {label}
      </Paragraph>
      <div style={{ marginTop: 10 }}>
        <Paragraph typography="t5" fontWeight="bold">
          {value}
        </Paragraph>
      </div>
    </div>
  );
}

function PayItem({ children, note, allowed }: { children: string; note?: string; allowed: boolean }) {
  const adaptive = useAdaptive();
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
        <span style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>
          <Paragraph typography="t6" color={allowed ? adaptive.grey700 : adaptive.grey400}>
            {allowed ? '✓' : '✕'}
          </Paragraph>
        </span>
        <Paragraph typography="t6" fontWeight="medium" color={allowed ? adaptive.grey700 : adaptive.grey400}>
          {children}
        </Paragraph>
      </div>
      {note && (
        <div style={{ paddingLeft: 30, marginTop: 4 }}>
          <Paragraph typography="t7" color={adaptive.grey500}>
            {note}
          </Paragraph>
        </div>
      )}
    </>
  );
}

function HSSCBusInfo() {
  const adaptive = useAdaptive();

  return (
    <Page>
      <Section label="운행시간" title="월요일 ~ 금요일">
        <NoteRow>공휴일에는 쉬어요</NoteRow>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <OperatingHours label="학기중" value="07:00 ~ 23:00" />
          <OperatingHours label="방학중" value="07:00 ~ 19:00" />
        </div>
      </Section>

      <Section label="요금과 결제" divided>
        <div style={{ marginBottom: 16 }}>
          <Paragraph typography="st1" fontWeight="bold">
            400원
          </Paragraph>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 10 }}>
            <Badge color="green" variant="weak" size="small">
              결제할 수 있어요
            </Badge>
          </div>
          <Card>
            <PayItem allowed note="후불교통결제가 되는 카드만 쓸 수 있어요">
              체크 / 신용카드
            </PayItem>
            <PayItem allowed>T머니</PayItem>
            <PayItem allowed>캐시비카드</PayItem>
          </Card>
        </div>

        <div>
          <div style={{ marginBottom: 10 }}>
            <Badge color="elephant" variant="weak" size="small">
              결제할 수 없어요
            </Badge>
          </div>
          <Card>
            <PayItem allowed={false}>현금</PayItem>
            <PayItem allowed={false}>회수권</PayItem>
          </Card>
        </div>
      </Section>

      <Section label="문의" title="연락처" divided>
        {CONTACTS.map((c, i) => (
          <div key={c.tel}>
            <ListRow
              contents={<ListRow.Texts type="1RowTypeA" top={c.name} />}
              right={
                <Paragraph typography="t6" fontWeight="medium" color={adaptive.blue500}>
                  {c.display}
                </Paragraph>
              }
              onClick={() => openUrl(c.tel)}
            />
            {i < CONTACTS.length - 1 && <Border />}
          </div>
        ))}
      </Section>

      <Section label="노선" title="운행 경로" divided>
        <Card style={{ padding: '22px 20px', marginBottom: 12 }}>
          <RouteDirection from="인사캠" to="혜화역" />
          <RouteTimeline>
            {TO_HYEHWA.map((name, i) => (
              <RouteStop key={name} name={name} terminal={i === 0 || i === TO_HYEHWA.length - 1} />
            ))}
          </RouteTimeline>
        </Card>

        <Card style={{ padding: '22px 20px' }}>
          <RouteDirection from="혜화역" to="인사캠" />
          <RouteTimeline>
            {TO_CAMPUS.map((name, i) => (
              <RouteStop key={name} name={name} terminal={i === 0 || i === TO_CAMPUS.length - 1} />
            ))}
          </RouteTimeline>
        </Card>
      </Section>
    </Page>
  );
}

export default HSSCBusInfo;
