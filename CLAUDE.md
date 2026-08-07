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

**Web view hash routes are load-bearing.** The mobile app ships hardcoded web view URLs
inside released binaries, so a route that exists today has to keep existing. Adding routes
is safe; renaming or removing one breaks installed apps that cannot be updated.

**The native bridge is gated by exact origin, server-side.** The mobile app resolves web
view capabilities per message against an allowlist owned by `skkuverse-server`, and it
fails closed. A new origin grants nothing until that allowlist is updated and deployed, so
preview deployments cannot exercise the bridge.

**Colors come from `packages/tokens`.** A hex literal in a component is drift from the
design system by definition, since the token file is the only place a color is decided.

**The console trusts no token by itself.** Sign-in mints an identity for any email that
asks for one, so authorization is an explicit claim checked server-side, and every query is
scoped by owner in `skkuverse-server`. See
[umbrella ADR 0006](https://github.com/spencer0124/skkuverse/blob/main/docs/decisions/0006-console-identity.md).

## Related

- [umbrella ADR 0005](https://github.com/spencer0124/skkuverse/blob/main/docs/decisions/0005-web-surfaces-dedicated-repo.md) — why this repository exists
- [umbrella ADR 0006](https://github.com/spencer0124/skkuverse/blob/main/docs/decisions/0006-console-identity.md) — console identity model
- [umbrella docs](https://github.com/spencer0124/skkuverse/tree/main/docs) — cross-repo architecture, contracts, conventions
