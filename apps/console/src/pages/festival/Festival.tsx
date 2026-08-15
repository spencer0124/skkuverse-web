import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Border,
  BottomSheet,
  Button,
  Dialog,
  Dropdown,
  ListRow,
  Loader,
  Paragraph,
  SegmentedControl,
  Switch,
  TextField,
  Toast,
  useAdaptive,
} from '@skkuverse/ui';
import { api } from '../../api/client';
import type { LayerSet, Place, Session, SessionLifecycle } from '../../api/types';
import { Panel } from '../../components/Shell';

/**
 * Editing what the campus map shows during a festival.
 *
 * The model is the server's, and the split matters: `places` are the fixed
 * plots and `sessions` are who occupies one and when. A booth moving to a
 * different slot is a session edit; the plot itself does not change. So this
 * screen edits sessions and only ever reads places.
 *
 * Editing is not publishing. The app reads a materialized snapshot, so an edit
 * changes nothing on any phone until a new version is published — which is why
 * the pending count is on the header rather than buried, and why publish has a
 * confirmation that names the version.
 */

const LIFECYCLE: Record<SessionLifecycle, { label: string; color: 'green' | 'yellow' | 'elephant' | 'red' }> = {
  published: { label: '게시', color: 'green' },
  draft: { label: '초안', color: 'yellow' },
  hidden: { label: '숨김', color: 'elephant' },
  cancelled: { label: '취소', color: 'red' },
};

export default function Festival() {
  const adaptive = useAdaptive();

  const [layerSets, setLayerSets] = useState<LayerSet[] | null>(null);
  const [layerSetId, setLayerSetId] = useState<string>('eskara-2026');
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);

  const [campus, setCampus] = useState<'all' | 'hssc' | 'nsc'>('all');
  const [editing, setEditing] = useState<Session | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const current = layerSets?.find((l) => l.id === layerSetId) ?? null;

  const load = useCallback(async () => {
    const client = await api();
    const [sets, sess, pls] = await Promise.all([
      client.listLayerSets(),
      client.listSessions(layerSetId),
      client.listPlaces(layerSetId),
    ]);
    setLayerSets(sets);
    setSessions(sess);
    setPlaces(pls);
  }, [layerSetId]);

  useEffect(() => {
    void load();
  }, [load]);

  const placeName = useMemo(
    () => new Map(places.map((p) => [p.id, `${p.zone ? `${p.zone} · ` : ''}${p.name.ko}`])),
    [places],
  );

  const visible = useMemo(() => {
    const list = (sessions ?? []).filter((s) => campus === 'all' || s.campus === campus);
    // Day first, then the server's own `order` — the same ordering the
    // materializer applies, so the console shows the app's sequence rather than
    // an arbitrary one.
    return list.sort((a, b) => (a.dayIndex ?? 99) - (b.dayIndex ?? 99) || a.order - b.order);
  }, [sessions, campus]);

  const save = async (patch: Partial<Session>) => {
    if (!editing) return;
    try {
      await (await api()).updateSession(editing.id, patch);
      setEditing(null);
      await load();
      setToast('저장했어요. 발행해야 앱에 반영돼요.');
    } catch (e) {
      setToast(e instanceof Error ? e.message : '저장하지 못했어요');
    }
  };

  const doPublish = async () => {
    try {
      const r = await (await api()).publish(layerSetId);
      await load();
      setToast(`v${r.version} 발행 완료 — 세션 ${r.sessionCount}개`);
    } catch (e) {
      setToast(e instanceof Error ? e.message : '발행하지 못했어요');
    } finally {
      setPublishing(false);
    }
  };

  const toggleActivation = async (enabled: boolean) => {
    await (await api()).setActivation(layerSetId, enabled);
    await load();
    setToast(enabled ? '레이어를 켰어요' : '레이어를 껐어요');
  };

  return (
    <>
      <Panel
        title="레이어셋"
        description="앱 지도에 어떤 축제를 띄울지 고르고, 켜고 끄고, 발행해요."
        right={
          current && (
            <Button
              size="medium"
              disabled={current.pendingChanges === 0}
              onClick={() => setPublishing(true)}
            >
              {current.pendingChanges > 0 ? `발행 (${current.pendingChanges}건 대기)` : '발행할 변경 없음'}
            </Button>
          )
        }
      >
        {!layerSets ? (
          <Loader size="medium" label="불러오는 중" />
        ) : (
          <>
            <Dropdown value={layerSetId} onChange={setLayerSetId}>
              {layerSets.map((l) => (
                <Dropdown.Item key={l.id} value={l.id}>
                  {l.label.ko}
                </Dropdown.Item>
              ))}
            </Dropdown>

            {current && (
              <div style={{ marginTop: 20, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                <div>
                  <Paragraph typography="t7" color={adaptive.grey500}>
                    앱에 보이는 버전
                  </Paragraph>
                  <Paragraph typography="t5" fontWeight="bold">
                    {current.publishedVersion ? `v${current.publishedVersion}` : '발행 안 됨'}
                  </Paragraph>
                </div>
                <div>
                  <Paragraph typography="t7" color={adaptive.grey500}>
                    발행 대기
                  </Paragraph>
                  <Paragraph typography="t5" fontWeight="bold">
                    {current.pendingChanges}건
                  </Paragraph>
                </div>
                <div>
                  <Paragraph typography="t7" color={adaptive.grey500}>
                    레이어 노출
                  </Paragraph>
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Switch
                      checked={current.activation.enabled}
                      onChange={() => void toggleActivation(!current.activation.enabled)}
                    />
                    <Paragraph typography="t7" color={adaptive.grey600}>
                      {current.activation.enabled ? '켜짐' : '꺼짐'}
                    </Paragraph>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>

      <Panel
        title="세션"
        description="장소는 고정이고, 세션은 그 장소에 누가 언제 들어오는지예요. 행을 눌러서 고쳐요."
        right={
          <SegmentedControl value={campus} onChange={(v) => setCampus(v as typeof campus)} size="small">
            <SegmentedControl.Item value="all">전체</SegmentedControl.Item>
            <SegmentedControl.Item value="hssc">인사캠</SegmentedControl.Item>
            <SegmentedControl.Item value="nsc">자과캠</SegmentedControl.Item>
          </SegmentedControl>
        }
      >
        {!sessions ? (
          <Loader size="medium" label="불러오는 중" />
        ) : (
          visible.map((s, i) => (
            <div key={s.id}>
              <ListRow
                onClick={() => setEditing(s)}
                contents={
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Paragraph typography="t6" fontWeight="bold" numberOfLines={1}>
                        {s.title.ko}
                      </Paragraph>
                      <Badge color={LIFECYCLE[s.lifecycle].color} variant="weak" size="xsmall">
                        {LIFECYCLE[s.lifecycle].label}
                      </Badge>
                      <Badge color="elephant" variant="weak" size="xsmall">
                        {s.category}
                      </Badge>
                    </div>
                    <Paragraph typography="t7" color={adaptive.grey600} numberOfLines={1}>
                      {s.tenant.name.ko} · {placeName.get(s.placeId) ?? s.placeId}
                    </Paragraph>
                  </div>
                }
                right={
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <Paragraph typography="t7" fontWeight="medium">
                      {s.dayIndex ? `${s.dayIndex}일차` : '날짜 미정'}
                    </Paragraph>
                    <Paragraph typography="t7" color={adaptive.grey500}>
                      {s.hoursLabel?.ko ?? '시간 미정'}
                    </Paragraph>
                  </div>
                }
              />
              {i < visible.length - 1 && <Border />}
            </div>
          ))
        )}
      </Panel>

      {editing && <SessionEditor session={editing} places={places} onClose={() => setEditing(null)} onSave={save} />}

      <Dialog.Confirm
        open={publishing}
        title={<Dialog.Title>발행할까요?</Dialog.Title>}
        description={
          <Dialog.Description>
            {`새 스냅샷 v${(current?.publishedVersion ?? 0) + 1}을 만들고, 앱이 다음 조회 때 받아가요.`}
          </Dialog.Description>
        }
        onClose={() => setPublishing(false)}
        cancelButton={<Dialog.CancelButton onClick={() => setPublishing(false)}>닫기</Dialog.CancelButton>}
        confirmButton={<Dialog.ConfirmButton onClick={() => void doPublish()}>발행</Dialog.ConfirmButton>}
      />

      {toast && <Toast message={toast} icon="check" open onClose={() => setToast(null)} />}
    </>
  );
}

/**
 * The edit form, in a sheet rather than a route.
 *
 * A session is small enough to hold in one view, and keeping the list behind it
 * means the row being edited stays visible — which matters when the thing being
 * corrected is "this one is in the wrong slot".
 */
function SessionEditor({
  session,
  places,
  onClose,
  onSave,
}: {
  session: Session;
  places: Place[];
  onClose: () => void;
  onSave: (patch: Partial<Session>) => Promise<void>;
}) {
  const adaptive = useAdaptive();
  const [title, setTitle] = useState(session.title.ko);
  const [subtitle, setSubtitle] = useState(session.subtitle?.ko ?? '');
  const [category, setCategory] = useState(session.category);
  const [placeId, setPlaceId] = useState(session.placeId);
  const [hours, setHours] = useState(session.hoursLabel?.ko ?? '');
  const [lifecycle, setLifecycle] = useState<SessionLifecycle>(session.lifecycle);
  const [saving, setSaving] = useState(false);

  return (
    <BottomSheet open onClose={onClose}>
      <BottomSheet.Header description={`${session.tenant.name.ko} · ${session.id}`}>
        세션 고치기
      </BottomSheet.Header>
      <div style={{ padding: '4px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextField variant="box" label="제목" value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} />
        <TextField variant="box" label="부제 (선택)" value={subtitle} onChange={(e) => setSubtitle((e.target as HTMLInputElement).value)} />
        {/* Free text, not a select. `category` is an open string on the server
            so next year's new kind of programme is a data edit rather than a
            deploy; constraining it here would undo that. */}
        <TextField variant="box" label="분류" value={category} onChange={(e) => setCategory((e.target as HTMLInputElement).value)} help="자유 입력 — 부스, 주점, 공연, 먹거리 등" />
        <TextField variant="box" label="운영 시간 표기" value={hours} onChange={(e) => setHours((e.target as HTMLInputElement).value)} help="앱에 그대로 보이는 문구예요" />

        <div>
          <Paragraph typography="t7" color={adaptive.grey500}>
            장소
          </Paragraph>
          <div style={{ marginTop: 6 }}>
            <Dropdown value={placeId} onChange={setPlaceId}>
              {places.map((p) => (
                <Dropdown.Item key={p.id} value={p.id}>
                  {`${p.zone ? `${p.zone} · ` : ''}${p.name.ko}`}
                </Dropdown.Item>
              ))}
            </Dropdown>
          </div>
        </div>

        <div>
          <Paragraph typography="t7" color={adaptive.grey500}>
            상태
          </Paragraph>
          <div style={{ marginTop: 6 }}>
            <SegmentedControl value={lifecycle} onChange={(v) => setLifecycle(v as SessionLifecycle)} size="small">
              <SegmentedControl.Item value="draft">초안</SegmentedControl.Item>
              <SegmentedControl.Item value="published">게시</SegmentedControl.Item>
              <SegmentedControl.Item value="hidden">숨김</SegmentedControl.Item>
              <SegmentedControl.Item value="cancelled">취소</SegmentedControl.Item>
            </SegmentedControl>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <Button variant="weak" color="dark" display="block" onClick={onClose} style={{ flex: 1 }}>
            취소
          </Button>
          <Button
            display="block"
            loading={saving}
            style={{ flex: 2 }}
            onClick={() => {
              setSaving(true);
              void onSave({
                title: { ...session.title, ko: title },
                subtitle: subtitle ? { ko: subtitle } : null,
                category,
                placeId,
                hoursLabel: hours ? { ko: hours } : null,
                lifecycle,
              }).finally(() => setSaving(false));
            }}
          >
            저장
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
