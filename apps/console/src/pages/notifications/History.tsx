import { useEffect, useState } from 'react';
import { Badge, Border, ListRow, Loader, Paragraph, Result, useAdaptive } from '@skkuverse/ui';
import { api } from '../../api/client';
import type { SendRecord, SendStatus } from '../../api/types';
import { Panel } from '../../components/Shell';

/**
 * What was sent, to whom, by whom.
 *
 * The sender's email is here because a push is irreversible and unattributed
 * sends are how "who sent this" becomes unanswerable. ADR 0006 puts the same
 * value in the server log; this is the copy a person can actually read.
 */

const STATUS: Record<SendStatus, { label: string; color: 'green' | 'yellow' | 'red' }> = {
  sent: { label: '전송됨', color: 'green' },
  partial: { label: '일부 실패', color: 'yellow' },
  failed: { label: '실패', color: 'red' },
};

function when(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function History() {
  const adaptive = useAdaptive();
  const [records, setRecords] = useState<SendRecord[] | null>(null);

  useEffect(() => {
    void (async () => setRecords(await (await api()).listSends()))();
  }, []);

  return (
    <Panel title="발송 내역" description="되돌릴 수 없는 작업이라, 누가 무엇을 보냈는지 남겨둬요.">
      {!records ? (
        <Loader size="medium" label="불러오는 중" />
      ) : records.length === 0 ? (
        <Result title="아직 보낸 알림이 없어요" description="첫 알림을 보내면 여기에 쌓여요." />
      ) : (
        records.map((r, i) => (
          <div key={r.id}>
            <ListRow
              contents={
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <Paragraph typography="t6" fontWeight="bold" numberOfLines={1}>
                      {r.title_ko}
                    </Paragraph>
                    <Badge color={STATUS[r.status].color} variant="weak" size="xsmall">
                      {STATUS[r.status].label}
                    </Badge>
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
                </div>
              }
              right={
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Paragraph typography="t7" fontWeight="bold">
                    {r.delivered.toLocaleString()}
                  </Paragraph>
                  {r.failed > 0 && (
                    <Paragraph typography="t7" color={adaptive.red500}>
                      실패 {r.failed.toLocaleString()}
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
        ))
      )}
    </Panel>
  );
}
