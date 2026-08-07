/**
 * Component gallery — every export of `@skkuverse/ui`, rendered.
 *
 * Development only. `App.tsx` gates the route on `import.meta.env.DEV`, so this
 * file and its imports are dropped from the production bundle entirely. That is
 * not only about weight: every page under this origin inherits the native
 * bridge's first-party capabilities, including `Linking.openURL`, so a public
 * gallery would widen the app's trusted surface for no benefit.
 *
 * It exists because until this file was written, `@skkuverse/ui` had no
 * consumers at all — the string appeared nowhere outside its own package.json —
 * and so none of its components had ever run in a browser. Rendering them all in
 * one place is much cheaper than discovering a broken one from inside a page
 * rewrite, where the cause is ambiguous.
 *
 * Icons here are inline SVG. `@phosphor-icons/react` is a dependency of
 * `packages/ui`, not of this app, and pnpm does not hoist it — components can
 * reach it through `packages/ui/src/internal/icons.ts`, pages cannot reach it at
 * all.
 */
import { useState, type ReactNode } from 'react';
import {
  AccordionList,
  Badge,
  BadgeNavRow,
  Border,
  BottomCTA,
  BottomSheet,
  Button,
  Checkbox,
  Dialog,
  Dropdown,
  ErrorPage,
  Gradient,
  IconButton,
  ListFooter,
  ListHeader,
  ListRow,
  Loader,
  Navbar,
  NumericSpinner,
  Paragraph,
  ProgressBar,
  Radio,
  Rating,
  Result,
  SearchField,
  SegmentedControl,
  Shadow,
  Skeleton,
  StepperRow,
  Switch,
  Tab,
  TextButton,
  TextField,
  Toast,
  useAdaptive,
} from '@skkuverse/ui';

/** A trivially small inline icon, since pages cannot import the icon package. */
function DotIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function Section({ name, children }: { name: string; children: ReactNode }) {
  const adaptive = useAdaptive();
  return (
    <section style={{ padding: '20px 16px' }}>
      <h2
        style={{
          margin: '0 0 12px',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: adaptive.grey500,
        }}
      >
        {name}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>{children}</div>
  );
}

export default function Preview() {
  const adaptive = useAdaptive();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  const [switched, setSwitched] = useState(true);
  const [count, setCount] = useState(2);
  const [stars, setStars] = useState(3);
  const [tab, setTab] = useState('one');
  const [segment, setSegment] = useState('a');
  const [radio, setRadio] = useState('x');
  const [dropdown, setDropdown] = useState('kr');

  return (
    <div style={{ background: adaptive.background, minHeight: '100vh', paddingBottom: 96 }}>
      <Navbar title="packages/ui" left={<span style={{ fontSize: 20 }}>←</span>} />

      <Section name="Paragraph">
        <Paragraph typography="t3" fontWeight="bold">
          t3 bold
        </Paragraph>
        <Paragraph typography="t5">t5 regular, the default</Paragraph>
        <Paragraph typography="t7" color={adaptive.grey500}>
          t7 in grey500
        </Paragraph>
        <Paragraph numberOfLines={2}>
          numberOfLines 2 — 성균관대학교 캠퍼스 셔틀버스는 학기 중과 방학 중 운행 시간이 다르며, 자세한
          내용은 각 캠퍼스 안내를 확인해 주세요. 이 문장은 두 줄에서 잘려야 합니다.
        </Paragraph>
        <Paragraph>
          <Paragraph.Text fontWeight="bold">compound: </Paragraph.Text>
          <Paragraph.Icon>
            <DotIcon size={14} />
          </Paragraph.Icon>
          <Paragraph.Text> icon, </Paragraph.Text>
          <Paragraph.Badge color="blue" variant="weak">
            badge
          </Paragraph.Badge>
          <Paragraph.Text> and a </Paragraph.Text>
          <Paragraph.Link type="underline">link</Paragraph.Link>
        </Paragraph>
      </Section>

      <Border type="height16" />

      <Section name="Badge">
        <Row>
          {(['blue', 'teal', 'green', 'red', 'yellow', 'elephant'] as const).map((c) => (
            <Badge key={c} color={c} variant="fill" size="small">
              {c}
            </Badge>
          ))}
        </Row>
        <Row>
          {(['blue', 'teal', 'green', 'red', 'yellow', 'elephant'] as const).map((c) => (
            <Badge key={c} color={c} variant="weak" size="small">
              {c}
            </Badge>
          ))}
        </Row>
        <Row>
          {(['xsmall', 'small', 'medium', 'large'] as const).map((s) => (
            <Badge key={s} color="blue" variant="fill" size={s}>
              {s}
            </Badge>
          ))}
        </Row>
      </Section>

      <Border type="height16" />

      <Section name="Button">
        <Row>
          {(['primary', 'danger', 'light', 'dark'] as const).map((c) => (
            <Button key={c} color={c}>
              {c}
            </Button>
          ))}
        </Row>
        <Row>
          {(['primary', 'danger', 'light', 'dark'] as const).map((c) => (
            <Button key={c} color={c} variant="weak">
              {c} weak
            </Button>
          ))}
        </Row>
        <Row>
          {(['small', 'medium', 'large', 'xlarge'] as const).map((s) => (
            <Button key={s} size={s}>
              {s}
            </Button>
          ))}
        </Row>
        <Row>
          <Button loading>loading</Button>
          <Button disabled>disabled</Button>
          <Button leftAccessory={<DotIcon size={16} />}>leftAccessory</Button>
          <Button as="a" href="#preview">
            as=&quot;a&quot;
          </Button>
        </Row>
        <Button display="full">display full</Button>
      </Section>

      <Border type="height16" />

      <Section name="TextButton">
        <Row>
          {(['arrow', 'underline', 'clear'] as const).map((v) => (
            <TextButton key={v} size="medium" variant={v}>
              {v}
            </TextButton>
          ))}
        </Row>
        <Row>
          {(['xsmall', 'small', 'medium', 'large', 'xlarge', 'xxlarge'] as const).map((s) => (
            <TextButton key={s} size={s}>
              {s}
            </TextButton>
          ))}
        </Row>
      </Section>

      <Border type="height16" />

      <Section name="IconButton">
        <Row>
          {(['fill', 'clear', 'border'] as const).map((v) => (
            <IconButton key={v} aria-label={v} variant={v} icon={<DotIcon />} />
          ))}
          <IconButton aria-label="disabled" icon={<DotIcon />} disabled />
        </Row>
      </Section>

      <Border type="height16" />

      <Section name="ListRow">
        <ListRow
          left={<ListRow.AssetIcon>🚌</ListRow.AssetIcon>}
          contents={<ListRow.Texts type="1RowTypeA" top="1RowTypeA — title only" />}
        />
        <Border />
        <ListRow
          contents={<ListRow.Texts type="2RowTypeA" top="2RowTypeA" bottom="title and bottom" />}
          right={<Paragraph color={adaptive.blue500}>02-760-1073</Paragraph>}
          onClick={() => undefined}
        />
        <Border />
        <ListRow
          contents={
            <ListRow.Texts type="3RowTypeA" top="3RowTypeA" middle="middle" bottom="bottom" />
          }
          right={<ListRow.Texts type="Right2RowTypeA" top="right" bottom="aligned" />}
        />
        <Border />
        <ListRow contents={<ListRow.Texts type="1RowTypeA" top="disabled" />} disabled onClick={() => undefined} />
        <Row>
          {(['none', 'small', 'medium', 'large'] as const).map((p) => (
            <span key={p} style={{ fontSize: 12, color: adaptive.grey500 }}>
              {p}
            </span>
          ))}
        </Row>
      </Section>

      <Border type="height16" />

      <Section name="ListHeader / ListFooter / BadgeNavRow / StepperRow">
        <ListHeader title="ListHeader title" description="description" right={<TextButton size="small">더보기</TextButton>} />
        <ListFooter title="ListFooter title" onClick={() => undefined} />
        <BadgeNavRow badgeLabel="NEW" badgeColor="red" onClick={() => undefined}>
          BadgeNavRow
        </BadgeNavRow>
        <StepperRow step={1} title="접수" description="분실물이 접수돼요" />
        <StepperRow step={2} title="보관" description="일정 기간 보관해요" done />
        <StepperRow step={3} title="반환" description="본인 확인 후 돌려드려요" isLast />
      </Section>

      <Border type="height16" />

      <Section name="Border">
        <span style={{ fontSize: 12, color: adaptive.grey500 }}>full</span>
        <Border type="full" />
        <span style={{ fontSize: 12, color: adaptive.grey500 }}>padding24</span>
        <Border type="padding24" />
        <span style={{ fontSize: 12, color: adaptive.grey500 }}>height16</span>
        <Border type="height16" />
      </Section>

      <Border type="height16" />

      <Section name="AccordionList">
        <AccordionList>
          <AccordionList.Item title="운행 시간이 어떻게 되나요?" defaultOpen>
            <Paragraph typography="t7">학기 중과 방학 중이 달라요.</Paragraph>
          </AccordionList.Item>
          <AccordionList.Item title="요금은 얼마인가요?">
            <Paragraph typography="t7">400원이에요.</Paragraph>
          </AccordionList.Item>
          <AccordionList.Item title="비활성" disabled>
            <Paragraph typography="t7">열리지 않아요.</Paragraph>
          </AccordionList.Item>
        </AccordionList>
      </Section>

      <Border type="height16" />

      <Section name="Tab / SegmentedControl">
        <Tab value={tab} onChange={setTab}>
          <Tab.Item value="one">하나</Tab.Item>
          <Tab.Item value="two" redBean>
            둘
          </Tab.Item>
          <Tab.Item value="three">셋</Tab.Item>
        </Tab>
        <SegmentedControl value={segment} onChange={setSegment}>
          <SegmentedControl.Item value="a">학기중</SegmentedControl.Item>
          <SegmentedControl.Item value="b">방학중</SegmentedControl.Item>
        </SegmentedControl>
      </Section>

      <Border type="height16" />

      <Section name="Form controls">
        <Row>
          <Checkbox checked={checked} onCheckedChange={setChecked} />
          <span style={{ fontSize: 13 }}>Checkbox — {String(checked)}</span>
        </Row>
        <Row>
          <Switch checked={switched} onChange={() => setSwitched((v) => !v)} />
          <span style={{ fontSize: 13 }}>Switch — {String(switched)}</span>
        </Row>
        <Radio value={radio} onChange={setRadio}>
          <Radio.Option value="x">엑스</Radio.Option>
          <Radio.Option value="y">와이</Radio.Option>
        </Radio>
        <Dropdown value={dropdown} onChange={setDropdown} placeholder="캠퍼스">
          <Dropdown.Item value="kr">인사캠</Dropdown.Item>
          <Dropdown.Item value="nsc">자과캠</Dropdown.Item>
        </Dropdown>
        <NumericSpinner value={count} onChange={setCount} min={0} max={10} />
        <Rating value={stars} onChange={setStars} editable />
        <SearchField placeholder="검색" hasClearButton />
        <TextField variant="box" label="이름" help="도움말" />
        <TextField variant="line" label="이메일" hasError help="형식이 올바르지 않아요" />
        <TextField.Clearable variant="box" label="지울 수 있는 입력" />
      </Section>

      <Border type="height16" />

      <Section name="Feedback">
        <Loader size="small" />
        <Loader size="medium" label="불러오는 중" />
        <ProgressBar progress={0.35} />
        <ProgressBar progress={0.7} size="bold" />
        <Skeleton pattern="topList" />
        <Result title="결과가 없어요" description="조건을 바꿔서 다시 찾아보세요." />
      </Section>

      <Border type="height16" />

      <Section name="ErrorPage">
        <ErrorPage statusCode={404} />
      </Section>

      <Border type="height16" />

      <Section name="Gradient / Shadow">
        <Gradient colors={[adaptive.blue400, adaptive.teal500]} degree={90} style={{ height: 64, borderRadius: 12 }} />
        <Row>
          {(['weak', 'medium', 'strong'] as const).map((s) => (
            <Shadow key={s} shadow={s}>
              <div
                style={{
                  width: 84,
                  height: 56,
                  borderRadius: 12,
                  background: adaptive.background,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                }}
              >
                {s}
              </div>
            </Shadow>
          ))}
        </Row>
      </Section>

      <Border type="height16" />

      <Section name="Overlays">
        <Row>
          <Button onClick={() => setSheetOpen(true)}>BottomSheet</Button>
          <Button onClick={() => setAlertOpen(true)}>Dialog.Alert</Button>
          <Button onClick={() => setConfirmOpen(true)}>Dialog.Confirm</Button>
          <Button onClick={() => setToastOpen(true)}>Toast</Button>
        </Row>
      </Section>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <BottomSheet.Header description="바텀시트 설명">바텀시트</BottomSheet.Header>
        <div style={{ padding: 16 }}>
          <Paragraph typography="t7">내용이 들어갑니다.</Paragraph>
        </div>
      </BottomSheet>

      <Dialog.Alert
        open={alertOpen}
        title="알림"
        description="확인 버튼 하나만 있는 다이얼로그예요."
        onClose={() => setAlertOpen(false)}
        alertButton={<Dialog.AlertButton onClick={() => setAlertOpen(false)}>확인</Dialog.AlertButton>}
      />

      <Dialog.Confirm
        open={confirmOpen}
        title="정말 진행할까요?"
        description="되돌릴 수 없어요."
        onClose={() => setConfirmOpen(false)}
        cancelButton={<Dialog.CancelButton onClick={() => setConfirmOpen(false)}>닫기</Dialog.CancelButton>}
        confirmButton={<Dialog.ConfirmButton onClick={() => setConfirmOpen(false)}>진행</Dialog.ConfirmButton>}
      />

      {toastOpen ? (
        <Toast message="복사했어요" icon="check" open onClose={() => setToastOpen(false)} />
      ) : null}

      <BottomCTA>
        <Button display="full" size="xlarge">
          BottomCTA
        </Button>
      </BottomCTA>
    </div>
  );
}
