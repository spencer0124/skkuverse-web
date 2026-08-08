import { Badge, Border, Button, ListRow, Paragraph, useAdaptive } from '@skkuverse/ui';
import { openUrl } from '../../bridge';
import { Card, NoteRow, Page, RouteDirection, RouteStop, RouteTimeline, Section } from '../../components/page';

const STOPS = {
  hssc: {
    lat: 37.587308,
    lon: 126.993688,
    nameEncoded:
      '%EC%8A%A4%EA%BE%B8%EB%B2%84%EC%8A%A4%20%7C%20%EC%9D%B8%EC%82%AC%EC%BA%A0%20%EC%85%94%ED%8B%80%20%EC%9C%84%EC%B9%98',
    place: '600주년 기념관 건너편',
  },
  nsc: {
    lat: 37.292345,
    lon: 126.975532,
    nameEncoded:
      '%EC%8A%A4%EA%BE%B8%EB%B2%84%EC%8A%A4%20%7C%20%EC%9E%90%EA%B3%BC%EC%BA%A0%20%EC%85%94%ED%8B%80%20%EC%9C%84%EC%B9%98',
    place: 'N센터 앞',
  },
};

const CONTACTS = [
  { name: '인자셔틀 업무용', sub: '일반 인자셔틀 분실물', display: '010-8982-2852', tel: 'tel:01089822852' },
  { name: '학부대학 행정실 (인사캠)', sub: '금요일 증차노선 관련', display: '02-760-0991', tel: 'tel:027600991' },
  { name: '학부대학 행정실 (자과캠)', sub: '금요일 증차노선 관련', display: '031-299-4224', tel: 'tel:0312994224' },
];

/**
 * Brand marks, kept as literal hex.
 *
 * `skkuverse-web/CLAUDE.md` forbids a hex literal in a component because the
 * token file is where a colour is decided. These are the exception the rule
 * implies rather than states: they are trademarks belonging to Naver, Kakao and
 * Apple, not design decisions, and re-theming them would make each logo wrong.
 */
function NaverMark() {
  const adaptive = useAdaptive();
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect width="16" height="16" rx="4" fill="#03C75A" />
      <path d="M4 11V5h1.6l2.8 4V5h1.6v6h-1.6L5.6 7v4H4z" fill={adaptive.background} />
    </svg>
  );
}

function KakaoMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect width="16" height="16" rx="4" fill="#FEE500" />
      <path
        d="M8 4C5.5 4 3.5 5.6 3.5 7.5c0 1.2.8 2.3 2 3l-.4 1.5c0 .1.1.2.2.1L7 11.2c.3 0 .7.1 1 .1 2.5 0 4.5-1.6 4.5-3.5S10.5 4 8 4z"
        fill="#3C1E1E"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect width="24" height="24" rx="6" fill="#000000" />
      <g transform="translate(4.5 4.5) scale(0.625)">
        <path
          d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.035 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
}

function Boarding({ stop }: { stop: (typeof STOPS)['hssc'] }) {
  const adaptive = useAdaptive();
  const { lat, lon, nameEncoded } = stop;

  const apps = [
    { label: '네이버', mark: <NaverMark />, url: `nmap://route/walk?dlat=${lat}&dlng=${lon}&dname=${nameEncoded}` },
    { label: '카카오', mark: <KakaoMark />, url: `kakaomap://route?ep=${lat},${lon}&by=FOOT&eName=${nameEncoded}` },
    { label: 'Apple', mark: <AppleMark />, url: `maps://?t=m&daddr=${lat},${lon}` },
  ];

  return (
    <div style={{ marginTop: 18 }}>
      <Paragraph typography="t7" fontWeight="semibold" color={adaptive.grey500}>
        탑승장소
      </Paragraph>
      <div style={{ marginTop: 4, marginBottom: 12 }}>
        <Paragraph typography="t6" fontWeight="bold">
          {stop.place}
        </Paragraph>
      </div>
      {/*
        `textColor` is not decoration here. color="light" seeds the button theme
        with #FFFFFFDE and the label colour is derived from that seed, which
        assumes a dark one — so a light button renders a white label on a white
        fill and reads as an empty pill. Worth fixing upstream; until then every
        light button needs its text colour named.
      */}
      <div style={{ display: 'flex', gap: 8 }}>
        {apps.map((a) => (
          <Button
            key={a.label}
            color="light"
            size="small"
            textColor={adaptive.grey900}
            leftAccessory={a.mark}
            onClick={() => openUrl(a.url)}
          >
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function CampusBusInfo() {
  const adaptive = useAdaptive();

  return (
    <Page>
      <Section label="운행시간" title="매주 금요일">
        <NoteRow>금요일 7시 버스는 8시에 출발해요</NoteRow>
        <div style={{ marginTop: 12 }}>
          <Badge color="yellow" variant="weak" size="medium">
            주말과 휴일에는 쉬어요
          </Badge>
        </div>
      </Section>

      <Section label="요금과 결제" divided>
        <Paragraph typography="st1" fontWeight="bold">
          무료
        </Paragraph>
      </Section>

      <Section label="참고" title="안내" divided>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <NoteRow>금요일엔 학부대학 셔틀이 추가로 다녀요</NoteRow>
            <NoteRow>모든 셔틀 통합 시간표예요</NoteRow>
          </div>
        </Card>
      </Section>

      <Section label="문의" title="분실물 연락처" divided>
        {CONTACTS.map((c, i) => (
          <div key={c.tel}>
            <ListRow
              contents={<ListRow.Texts type="2RowTypeA" top={c.name} bottom={c.sub} />}
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
          <RouteDirection from="인사캠" to="자과캠" />
          <RouteTimeline>
            <RouteStop name="인사캠" terminal />
            <RouteStop name="자과캠" terminal />
          </RouteTimeline>
          <Boarding stop={STOPS.hssc} />
        </Card>

        <Card style={{ padding: '22px 20px' }}>
          <RouteDirection from="자과캠" to="인사캠" />
          <RouteTimeline>
            <RouteStop name="자과캠" terminal />
            <RouteStop name="인사캠" terminal />
          </RouteTimeline>
          <Boarding stop={STOPS.nsc} />
        </Card>
      </Section>
    </Page>
  );
}

export default CampusBusInfo;
