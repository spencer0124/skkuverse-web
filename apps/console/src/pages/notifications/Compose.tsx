import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Border,
  Button,
  Checkbox,
  Dialog,
  Loader,
  Paragraph,
  TextField,
  Toast,
  useAdaptive,
} from '@skkuverse/ui';
import { api } from '../../api/client';
import type { Topic } from '../../api/types';
import { Panel } from '../../components/Shell';

/**
 * A push is not undoable.
 *
 * Everything on this screen exists to make the moment before sending
 * informative: what it will look like on a phone, how many phones, and a
 * confirmation that repeats both. The Naver/Kakao-style character counters are
 * not decoration — Android collapses a long title in the tray, and the counts
 * are where that becomes visible before rather than after.
 */

/** Past this, Android's tray truncates. Not a hard limit, a warning line. */
const TITLE_SOFT_LIMIT = 40;
const BODY_SOFT_LIMIT = 120;

export default function Compose() {
  const adaptive = useAdaptive();

  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [titleKo, setTitleKo] = useState('');
  const [bodyKo, setBodyKo] = useState('');
  const [link, setLink] = useState('');

  const [reach, setReach] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  /**
   * The reach as it was when the confirm opened.
   *
   * Not the live value. Sending clears the form, which drops reach to zero
   * while the dialog is still fading out, so a live binding reads "0대에 바로
   * 전송되고" at the exact moment 5,000 phones were buzzing. It should also be
   * the number the decision was made against rather than one that can move
   * underneath it.
   */
  const [confirmReach, setConfirmReach] = useState(0);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void (async () => setTopics(await (await api()).listTopics()))();
  }, []);

  // Recomputed whenever the selection changes, because reach is the number
  // people actually weigh, and a stale one is worse than none.
  useEffect(() => {
    let cancelled = false;
    if (selected.length === 0) {
      setReach(0);
      return;
    }
    setReach(null);
    void (async () => {
      const n = await (await api()).estimateReach(selected);
      if (!cancelled) setReach(n);
    })();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const grouped = useMemo(() => {
    const out = new Map<string, Topic[]>();
    for (const t of topics ?? []) {
      const list = out.get(t.group) ?? [];
      list.push(t);
      out.set(t.group, list);
    }
    return [...out.entries()];
  }, [topics]);

  const ready = selected.length > 0 && titleKo.trim() !== '' && bodyKo.trim() !== '';

  const doSend = async () => {
    setSending(true);
    try {
      const record = await (await api()).send({
        topics: selected,
        title_ko: titleKo,
        body_ko: bodyKo,
        link: link.trim() || null,
      });
      setToast(`${record.delivered.toLocaleString()}대에 보냈어요`);
      setSelected([]);
      setTitleKo('');
      setBodyKo('');
      setLink('');
    } catch (e) {
      setToast(e instanceof Error ? e.message : '보내지 못했어요');
    } finally {
      setSending(false);
      setConfirming(false);
    }
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 20, alignItems: 'start' }}>
        <div>
          <Panel title="받을 사람" description="토픽을 고르면 구독 중인 기기 수를 합산해서 보여줘요.">
            {!topics ? (
              <Loader size="medium" label="토픽 불러오는 중" />
            ) : (
              grouped.map(([group, list]) => (
                <div key={group} style={{ marginBottom: 20 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Paragraph typography="t7" fontWeight="semibold" color={adaptive.grey500}>
                      {group}
                    </Paragraph>
                  </div>
                  {list.map((t) => (
                    <div key={t.id}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 0',
                          cursor: 'pointer',
                        }}
                      >
                        <Checkbox
                          checked={selected.includes(t.id)}
                          onCheckedChange={(next) =>
                            setSelected((prev) =>
                              next ? [...prev, t.id] : prev.filter((id) => id !== t.id),
                            )
                          }
                        />
                        <span style={{ flex: 1 }}>
                          <Paragraph typography="t6" fontWeight="medium">
                            {t.label.ko}
                          </Paragraph>
                        </span>
                        {/* The wire value, shown on purpose. A topic string is
                            what the server sends and what FCM matches, and a
                            silent mismatch delivers to nobody. */}
                        <Paragraph typography="t7" color={adaptive.grey400}>
                          {t.id}
                        </Paragraph>
                        <Paragraph typography="t7" color={adaptive.grey500}>
                          {t.subscriberCount.toLocaleString()}
                        </Paragraph>
                      </label>
                      <Border />
                    </div>
                  ))}
                </div>
              ))
            )}
          </Panel>

          <Panel title="내용" description="한국어만 채워도 보낼 수 있어요. 영어는 비워두면 한국어 문구가 그대로 나가요.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <TextField
                  variant="box"
                  label="제목"
                  value={titleKo}
                  onChange={(e) => setTitleKo((e.target as HTMLInputElement).value)}
                  hasError={titleKo.length > TITLE_SOFT_LIMIT}
                  help={
                    titleKo.length > TITLE_SOFT_LIMIT
                      ? `${titleKo.length}자 — 안드로이드 알림함에서 잘려요`
                      : `${titleKo.length} / ${TITLE_SOFT_LIMIT}`
                  }
                />
              </div>
              <div>
                <TextField
                  variant="box"
                  label="내용"
                  value={bodyKo}
                  onChange={(e) => setBodyKo((e.target as HTMLInputElement).value)}
                  hasError={bodyKo.length > BODY_SOFT_LIMIT}
                  help={
                    bodyKo.length > BODY_SOFT_LIMIT
                      ? `${bodyKo.length}자 — 펼치기 전에는 잘려요`
                      : `${bodyKo.length} / ${BODY_SOFT_LIMIT}`
                  }
                />
              </div>
              <div>
                <TextField
                  variant="box"
                  label="눌렀을 때 열 곳 (선택)"
                  value={link}
                  onChange={(e) => setLink((e.target as HTMLInputElement).value)}
                  help="예: /notices/skku-main/12345 · 비우면 앱 홈이 열려요"
                />
              </div>
            </div>
          </Panel>
        </div>

        {/* Preview, pinned so it stays beside the fields while they are edited. */}
        <div style={{ position: 'sticky', top: 96 }}>
          <Panel title="미리보기">
            <div
              style={{
                background: adaptive.grey100,
                borderRadius: 14,
                padding: 14,
                display: 'flex',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#1f3d2e',
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Paragraph typography="t7" fontWeight="bold" color="#FFFFFF">
                  스
                </Paragraph>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <Paragraph typography="t7" fontWeight="bold" numberOfLines={1}>
                  {titleKo || '제목이 여기에 표시돼요'}
                </Paragraph>
                <Paragraph typography="t7" color={adaptive.grey600} numberOfLines={2}>
                  {bodyKo || '내용이 여기에 표시돼요'}
                </Paragraph>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <Paragraph typography="t7" color={adaptive.grey500}>
                받는 기기
              </Paragraph>
              <div style={{ marginTop: 4 }}>
                {reach === null ? (
                  <Loader size="small" />
                ) : (
                  <Paragraph typography="t3" fontWeight="bold">
                    {reach.toLocaleString()}
                  </Paragraph>
                )}
              </div>
              {selected.length > 1 && reach !== null && (
                <div style={{ marginTop: 6 }}>
                  <Paragraph typography="t7" color={adaptive.grey500}>
                    토픽이 겹치는 기기는 한 번만 세요
                  </Paragraph>
                </div>
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <Button display="full" size="large" disabled={!ready} onClick={() => {
                  setConfirmReach(reach ?? 0);
                  setConfirming(true);
                }}>
                보내기
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <Dialog.Confirm
        open={confirming}
        title={<Dialog.Title>지금 보낼까요?</Dialog.Title>}
        description={
          <Dialog.Description>
            {`${confirmReach.toLocaleString()}대에 바로 전송되고, 취소할 수 없어요.`}
          </Dialog.Description>
        }
        onClose={() => setConfirming(false)}
        cancelButton={<Dialog.CancelButton onClick={() => setConfirming(false)}>닫기</Dialog.CancelButton>}
        confirmButton={
          <Dialog.ConfirmButton onClick={() => void doSend()}>
            {sending ? '보내는 중' : '보내기'}
          </Dialog.ConfirmButton>
        }
      />

      {toast && <Toast message={toast} icon="check" open onClose={() => setToast(null)} />}
    </>
  );
}
