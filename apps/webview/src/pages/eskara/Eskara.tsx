import { Link } from 'react-router-dom';
import { ListRow, Paragraph, useAdaptive } from '@skkuverse/ui';
import { Card, Page, Section } from '../../components/page';
import { FESTIVAL, PAGES } from './data/festival';
import { ArchiveNotice } from './shared';

/**
 * The index at `/eskara`.
 *
 * It exists for two callers that are not the map: the mini-app registry's
 * `startUrl` points here, and a share link to `/eskara` has to land somewhere.
 * The map's sheet buttons deep-link straight to a leaf page instead, so nobody
 * arriving from a pin passes through this.
 *
 * Navigation uses react-router `Link`, not the native bridge. These pages have
 * to render standalone — the mini-app shell is not in play — and an in-SPA route
 * change needs nothing from the app.
 */
function Eskara() {
  const adaptive = useAdaptive();

  return (
    <Page>
      <ArchiveNotice />

      <div style={{ padding: '28px 20px 4px' }}>
        <Paragraph typography="t7" fontWeight="semibold" color={adaptive.grey500}>
          {FESTIVAL.campus}
        </Paragraph>
        <div style={{ marginTop: 6 }}>
          <Paragraph typography="t2" fontWeight="bold">
            {`${FESTIVAL.year} ${FESTIVAL.name}`}
          </Paragraph>
        </div>
        <div style={{ marginTop: 4 }}>
          <Paragraph typography="t4" fontWeight="bold" color={adaptive.grey600}>
            {FESTIVAL.subtitle}
          </Paragraph>
        </div>
        <div style={{ marginTop: 10 }}>
          <Paragraph typography="t6" color={adaptive.grey600}>
            {FESTIVAL.dates}
          </Paragraph>
        </div>
      </div>

      <Section label="안내" title="무엇이 궁금하세요?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PAGES.map((p) => (
            <Link key={p.path} to={p.path} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card style={{ padding: '4px 16px' }}>
                <ListRow
                  left={<ListRow.AssetIcon>{p.icon}</ListRow.AssetIcon>}
                  contents={
                    <ListRow.Texts type="2RowTypeA" top={p.title} bottom={p.description} />
                  }
                  right={<Chevron />}
                />
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </Page>
  );
}

/* Inline rather than imported: @phosphor-icons/react is a dependency of
   packages/ui and pnpm does not hoist it, so pages cannot resolve it. */
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

export default Eskara;
