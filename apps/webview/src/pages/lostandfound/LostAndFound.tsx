import { useState } from 'react';
import { Border, ListRow, Paragraph, StepperRow, Toast, useAdaptive } from '@skkuverse/ui';
import { openUrl } from '../../bridge';
import { Card, Page, Section } from '../../components/page';

const EMAIL = 'studentaid@skku.edu';

const STEPS = [
  { step: 1, title: '학생지원팀으로 전달', description: '누군가 주우면 1~2일 안에 학생지원팀으로 보내요' },
  { step: 2, title: '게시판에 올려요', description: '학생지원팀에서 유실물 게시판에 1개월간 올려요' },
  { step: 3, title: '1년 보관 후 폐기', description: '1년 동안 보관한 뒤 폐기해요' },
];

const BOARDS = [
  {
    icon: '🔍',
    title: '물건을 찾고 있어요',
    description: '잃어버린 물건을 찾고 있어요',
    url: 'https://www.skku.edu/skku/campus/support/lost_and_found_2.do',
  },
  {
    icon: '📦',
    title: '주인을 찾고 있어요',
    description: '습득한 물건의 주인을 찾아요',
    url: 'https://www.skku.edu/skku/campus/support/lost_and_found_3.do',
  },
];

const OFFICES = [
  { campus: '인사캠', place: '600주년기념관 1층', display: '02-760-1077', tel: 'tel:027601077' },
  { campus: '자과캠', place: '학생회관 종합행정실 1층', display: '031-290-5034', tel: 'tel:0312905034' },
];

function Chevron() {
  const adaptive = useAdaptive();
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden>
      <path
        d="M1 1l6 6-6 6"
        stroke={adaptive.grey400}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LabelledRow({ label, children }: { label: string; children: React.ReactNode }) {
  const adaptive = useAdaptive();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
      <Paragraph typography="t6" color={adaptive.grey500}>
        {label}
      </Paragraph>
      {children}
    </div>
  );
}

function LostAndFound() {
  const adaptive = useAdaptive();
  const [toast, setToast] = useState<string | null>(null);

  // Replaces a pair of alert() calls. A blocking dialog to confirm a copy is
  // heavier than the action it reports, and inside the app's webview it stops
  // the page rather than sitting beside it.
  const copyEmail = () => {
    navigator.clipboard
      .writeText(EMAIL)
      .then(() => setToast('이메일 주소를 복사했어요'))
      .catch(() => setToast('복사하지 못했어요'));
  };

  return (
    <Page>
      <Section label="유실물" title="이렇게 처리돼요">
        {STEPS.map((s, i) => (
          <StepperRow
            key={s.step}
            step={s.step}
            title={s.title}
            description={s.description}
            isLast={i === STEPS.length - 1}
          />
        ))}
      </Section>

      <Section label="분실물 게시판" title="게시판 바로가기" divided>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BOARDS.map((b) => (
            <Card key={b.url} style={{ padding: '4px 16px' }}>
              <ListRow
                left={<ListRow.AssetIcon>{b.icon}</ListRow.AssetIcon>}
                contents={<ListRow.Texts type="2RowTypeA" top={b.title} bottom={b.description} />}
                right={<Chevron />}
                onClick={() => openUrl(b.url)}
              />
            </Card>
          ))}
        </div>
      </Section>

      <Section label="안내" title="학생지원팀" divided>
        <Card style={{ marginBottom: 12 }}>
          <LabelledRow label="운영시간">
            <Paragraph typography="t6" fontWeight="medium">
              평일 09:00 ~ 17:30
            </Paragraph>
          </LabelledRow>
          <LabelledRow label="이메일">
            <button
              type="button"
              onClick={copyEmail}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <Paragraph typography="t6" fontWeight="medium" color={adaptive.blue500}>
                {EMAIL}
              </Paragraph>
            </button>
          </LabelledRow>
        </Card>

        {OFFICES.map((o, i) => (
          <Card key={o.tel} style={{ marginBottom: i < OFFICES.length - 1 ? 12 : 0 }}>
            <div style={{ marginBottom: 4 }}>
              <Paragraph typography="t5" fontWeight="bold">
                {o.campus}
              </Paragraph>
            </div>
            <LabelledRow label="위치">
              <Paragraph typography="t6" fontWeight="medium">
                {o.place}
              </Paragraph>
            </LabelledRow>
            <Border />
            <LabelledRow label="전화">
              <button
                type="button"
                onClick={() => openUrl(o.tel)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <Paragraph typography="t6" fontWeight="medium" color={adaptive.blue500}>
                  {o.display}
                </Paragraph>
              </button>
            </LabelledRow>
          </Card>
        ))}
      </Section>

      {toast && <Toast message={toast} icon="check" open onClose={() => setToast(null)} />}
    </Page>
  );
}

export default LostAndFound;
