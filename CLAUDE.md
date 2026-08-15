# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

## What this repository is

Every browser surface in the SKKUverse ecosystem. `apps/webview` serves the public pages
the mobile app loads in a web view; `apps/console` is the private admin console. Both are
static single-page applications on Cloudflare Pages, and neither has a server of its own —
the console's API is `skkuverse-server`.

React Native lives in `skkuverse-app` and does not cross into this repository. Its design
system imports `react-native` in nearly every component, so what travels between the two is
design token values and a message contract, not components.

## Language

English everywhere: code comments, commit messages, PR and issue text, docs, log messages,
and JSON `note` fields. The one carve-out is Korean product copy, meaning strings the
product itself displays. Those paths are declared in `.conventions.json` and the umbrella's
`exported/lint_conventions.py` enforces the rest.

## Branching

Commit to `dev`. `main` is merge-only and updated by a pull request from `dev`. Cut
`feat/<topic>` from `dev` only when the change is large enough that a reviewable diff before
it reaches `dev` is worth the round trip, or when asked. Canonical text:
[conventions/branching.md](https://github.com/spencer0124/skkuverse/blob/main/conventions/branching.md).

Start every session with `git fetch --prune origin` then `git status -sb`. CI runs on pull
requests into `main`, so work on `dev` reaches a gate when it is proposed rather than when it
is written — run the commands above locally before pushing.

## Cross-repository references

Issues for this work live in the umbrella repository, so every reference out of this repo
needs the owner segment: `spencer0124/skkuverse#22`, and `spencer0124/skkuverse-app@8ea6bc7`
for a commit. A bare `#22` resolves to *this* repo's number 22, which is a wrong link rather
than a missing one. Never wrap a reference in backticks — code spans are not autolinked.
Canonical text:
[conventions/cross-repo-references.md](https://github.com/spencer0124/skkuverse/blob/main/conventions/cross-repo-references.md).

## Commands

```bash
pnpm install
pnpm build       # turbo run build
pnpm lint        # turbo run lint
pnpm typecheck   # turbo run typecheck
pnpm lint:md     # markdownlint-cli2
```

## Invariants

**Vendored packages have one upstream owner.** `packages/bridge` and `packages/tokens` are
copies of files owned by `skkuverse-app`, registered in the umbrella's
`contracts/manifest.json` and hash-checked in CI. Change them upstream and let the contract
sync bring the change here. Editing the copy makes CI red and is not the fix.

**Both apps route by path, and `base` must stay `'/'`.** A relative base emits
`./assets/index-<hash>.js`, which the browser resolves against the current path — so
`/bus/hssc/info` requests `/bus/hssc/assets/…`, Pages answers with `index.html` at HTTP 200
and `text/html`, and the module script dies on the MIME check. A blank page with every
status code green, invisible to any HTTP-level check. CI asserts the built `index.html`
references `/assets/`, and both apps ship `public/_redirects` so a deep link and a reload
reach the router.

**Web view routes are append-only.** The mobile app ships hardcoded web view URLs inside
released binaries, so a route that exists today has to keep existing. Adding routes is safe;
renaming or removing one breaks installed apps that cannot be updated. Hash routing was
nonetheless dropped in
[skkuverse#46](https://github.com/spencer0124/skkuverse/issues/46), because the URL a
released binary carries addresses `webview.skkuuniverse.com` — a separate deployment that
still serves it — so no shipped client was asking this host for a `#/` route.

**The console runs on mock data unless told otherwise.** `VITE_API_MODE` defaults to `mock`,
and `http` throws without `VITE_API_BASE`. Setting `http` before `skkuverse-server`
implements `/console/notifications/*` gives empty lists that read as empty data, which is
worse than a console that refuses to start.

**The native bridge is gated by exact origin, server-side.** The mobile app resolves web
view capabilities per message against an allowlist owned by `skkuverse-server`, and it
fails closed. A new origin grants nothing until that allowlist is updated and deployed, so
preview deployments cannot exercise the bridge.

**Colors come from `packages/tokens`.** A hex literal in a component is drift from the
design system by definition, since the token file is the only place a color is decided.

**`packages/ui` components answer to Toss's docs, not to `@skkuverse/sds`.** They implement
the `@toss/tds-mobile` v2 contract — `color` / `variant` / `size` / `onClick` — which is the
same design system's web branch. They are not conversions of the app's React Native
components and do not track them, so a change in `skkuverse-app/packages/sds` implies
nothing here. The prop tables are at <https://tossmini-docs.toss.im/tds-mobile/>, indexed in
the local docs-mcp-server as `tds-mobile`.

**Three parts of `packages/ui` do carry silent-drift risk**, because they are copies with no
gate. `src/core/*`, `src/foundation/typography.ts` and `src/utils/*` are byte-identical to
`skkuverse-app/packages/sds`; `src/foundation/colors.ts` and `src/core/ThemeProvider.tsx`
differ by one import line each. Unlike `packages/tokens` and `packages/bridge`, none is
registered in the umbrella's contract registry, so an upstream change reaches them only by
hand. Register them if the theming layer starts moving.

**Icons are Phosphor, emoji are Tossface** — the same choices the app makes.
`@phosphor-icons/react` is the React build of the app's `phosphor-react-native` and shares
its API, including the `*Icon` suffix and the `weight` prop. Import glyphs through
`src/internal/icons.ts`, which uses per-icon paths: the package barrel re-exports over 1,500
icons and makes a dev server transform every one of them.

**The console trusts no token by itself.** Sign-in mints an identity for any email that
asks for one, so authorization is an explicit claim checked server-side, and every query is
scoped by owner in `skkuverse-server`. See
[umbrella ADR 0006](https://github.com/spencer0124/skkuverse/blob/main/docs/decisions/0006-console-identity.md).

## Related

- [umbrella ADR 0005](https://github.com/spencer0124/skkuverse/blob/main/docs/decisions/0005-web-surfaces-dedicated-repo.md) — why this repository exists
- [umbrella ADR 0006](https://github.com/spencer0124/skkuverse/blob/main/docs/decisions/0006-console-identity.md) — console identity model
- [umbrella docs](https://github.com/spencer0124/skkuverse/tree/main/docs) — cross-repo architecture, contracts, conventions
