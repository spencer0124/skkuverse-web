import { useEffect, useState } from 'react';
import { Badge, Border, ListRow, Loader, Paragraph, Result, useAdaptive } from '@skkuverse/ui';
import { api } from '../../api/client';
import type { SendRecord, SendStatus } from '../../api/types';
import { Panel } from '../../components/Shell';

/**
 * What was sent, to whom, by whom.
 *
 * The sender's email is here because a push is irreversible and unattributed
 * sends make "who sent this" unanswerable. ADR 0006 puts the same value in the
 * server log; this is the copy a person can read.
 */

const STATUS: Record<SendStatus, { label: string; color: 'green' | 'yellow' | 'red' | 'elephant' }> = {
  sending: { label: '보내는 중', color: 'elephant' },
  sent: { label: '전송됨', color: 'green' },
  partial: { label: '일부 실패', color: 'yellow' },
  failed: { label: '실패', color: 'red' },
};

function when(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function History() {
  const adaptive = useAdaptive();
  const [records, setRecords] = useState<SendRecord[] | null>(null);

  useEffect(() => {
    void (async () => setRecords(await (await api()).listSends()))();
  }, []);

  return (
    <Panel
      title="발송 내역"
      description="되돌릴 수 없는 작업이라, 누가 무엇을 보냈는지 남겨둬요."
    >
      {/*
        Stated once, plainly, rather than left as an empty column that implies
        the data is on its way. Nothing logs a notification tap today — every
        handler writes to a dev-only buffer — so an open count would have to be
        invented, and an invented number here would outlive the person who
        invented it.
      */}
      <div
        style={{
          background: adaptive.grey100,
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 16,
        }}
      >
        <Paragraph typography="t7" color={adaptive.grey600}>
          열어본 사람 수는 아직 셀 수 없어요. 앱이 알림 탭을 기록하지 않아서, 지금은 보낸 수까지만 알 수 있어요.
        </Paragraph>
      </div>

      {!records ? (
        <Loader size="medium" label="불러오는 중" />
      ) : records.length === 0 ? (
        <Result title="아직 보낸 알림이 없어요" description="첫 알림을 보내면 여기에 쌓여요." />
      ) : (
        records.map((r, i) => {
          // `failed` is dominated by the dead tokens the send garbage-collects.
          // Reporting it raw makes every healthy send look broken, so the
          // routine part is separated out and only the residue is called
          // failure.
          const residue = Math.max(0, r.failed - r.cleanedUp);
          const isTest = r.mode === 'test';
          return (
            <div key={r.id} style={{ opacity: isTest ? 0.55 : 1 }}>
              <ListRow
                contents={
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                      <Paragraph typography="t6" fontWeight="bold" numberOfLines={1}>
                        {r.title_ko}
                      </Paragraph>
                      <Badge color={STATUS[r.status].color} variant="weak" size="xsmall">
                        {STATUS[r.status].label}
                      </Badge>
                      {isTest && (
                        <Badge color="elephant" variant="weak" size="xsmall">
                          테스트
                        </Badge>
                      )}
                      {r.purpose === 'promotion' && (
                        <Badge color="yellow" variant="fill" size="xsmall">
                          광고
                        </Badge>
                      )}
                    </div>
                    <Paragraph typography="t7" color={adaptive.grey600} numberOfLines={1}>
                      {r.body_ko}
                    </Paragraph>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {r.topics.map((t) => (
                        <Badge key={t} color="elephant" variant="weak" size="xsmall">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    {r.dismissedWarnings.length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        {/* Kept so the choice is auditable rather than silent. */}
                        <Paragraph typography="t7" color={adaptive.grey500}>
                          무시한 경고 {r.dismissedWarnings.length}건
                        </Paragraph>
                      </div>
                    )}
                  </div>
                }
                right={
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <Paragraph typography="t7" fontWeight="bold">
                      보낸 기기 {r.delivered.toLocaleString()}
                    </Paragraph>
                    {r.cleanedUp > 0 && (
                      <Paragraph typography="t7" color={adaptive.grey500}>
                        정리한 기기 {r.cleanedUp.toLocaleString()}
                      </Paragraph>
                    )}
                    {residue > 0 && (
                      <Paragraph typography="t7" color={adaptive.red500}>
                        실패 {residue.toLocaleString()}
                      </Paragraph>
                    )}
                    <Paragraph typography="t7" color={adaptive.grey400}>
                      {when(r.sentAt)}
                    </Paragraph>
                    <Paragraph typography="t7" color={adaptive.grey400}>
                      {r.sentBy}
                    </Paragraph>
                  </div>
                }
              />
              {i < records.length - 1 && <Border />}
            </div>
          );
        })
      )}
    </Panel>
  );
}
