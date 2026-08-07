# skkuverse-web

Every browser surface in the SKKUverse ecosystem: the public pages the mobile app loads
in a web view, and the private admin console.

Native code lives in [`skkuverse-app`](https://github.com/spencer0124/skkuverse-app), and
the two repositories share a message contract rather than a component library. The design
system there is React Native and does not render in a browser, so this repository carries
its own web components built on the same design tokens. The reasoning is in
[umbrella ADR 0005](https://github.com/spencer0124/skkuverse/blob/main/docs/decisions/0005-web-surfaces-dedicated-repo.md).

## Layout

| Path | What it is | Deploys to |
| --- | --- | --- |
| `apps/webview` | Public pages loaded inside the app's web view | `webview.skkuuniverse.com` |
| `apps/console` | Private admin console | `console.skkuverse.com` |
| `packages/tokens` | Design token values, vendored from `skkuverse-app` | — |
| `packages/ui` | Web components built on those tokens | — |
| `packages/bridge` | Web to native message contract, vendored from `skkuverse-app` | — |

## Commands

```bash
pnpm install
pnpm build       # turbo run build
pnpm lint        # turbo run lint
pnpm typecheck   # turbo run typecheck
pnpm lint:md     # markdownlint-cli2
```

Node is pinned in `.nvmrc`. The package manager is pinned in `package.json`.

## Conventions

English everywhere except product copy, which is declared in `.conventions.json`. The
policy and its enforcement live in the
[umbrella repository](https://github.com/spencer0124/skkuverse).

`packages/bridge` and `packages/tokens` are vendored copies with a single upstream owner,
registered in the umbrella's `contracts/manifest.json` and hash-checked in CI. Edit them
upstream in `skkuverse-app`, never here.

## Related

- [skkuverse](https://github.com/spencer0124/skkuverse) — umbrella: ADRs, contracts, conventions
- [skkuverse-app](https://github.com/spencer0124/skkuverse-app) — React Native app, upstream of the vendored packages
- [skkuverse-server](https://github.com/spencer0124/skkuverse-server) — NestJS API, including the console API
- [skkuverse.com](https://github.com/spencer0124/skkuverse.com) — marketing site and deep-link landing pages
