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
| `apps/webview` | Public pages loaded inside the app's web view | `webview.skkuverse.com` |
| `apps/console` | Private admin console | `console.skkuverse.com` |
| `packages/tokens` | Design token values, vendored from `skkuverse-app` | — |
| `packages/ui` | Web components built on those tokens | — |
| `packages/bridge` | Web to native message contract, vendored from `skkuverse-app` | — |

## Deployment

Two Cloudflare Pages projects against this one repository. Nothing here configures them —
the settings live in the Cloudflare dashboard — so they are written down because otherwise
the only way to answer "how is this built" is to open the dashboard or guess.

| | `apps/webview` | `apps/console` |
| --- | --- | --- |
| Pages project | `skkuverse-webview` | `skkuverse-console` |
| Production branch | `main` | `main` |
| Root directory | empty, `/` | empty, `/` |
| Build command | `pnpm install --frozen-lockfile && pnpm build --filter @skkuverse/webview` | same, `--filter @skkuverse/console` |
| Output directory | `apps/webview/dist` | `apps/console/dist` |
| Environment | `NODE_VERSION=22`, `PNPM_VERSION=11.20.0` | same |
| Custom domain | `webview.skkuverse.com` | `console.skkuverse.com` |
| Watch paths | `apps/webview/*` plus the shared set | `apps/console/*` plus the shared set |

Shared watch paths, needed by both: `packages/*`, `package.json`, `pnpm-lock.yaml`,
`pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`.

Four things that are easy to get wrong:

- **Root directory stays `/`.** Both apps depend on workspace packages as `workspace:*`, and
  those resolve only when pnpm installs from the directory holding `pnpm-workspace.yaml`.
  Pointing it at the app is the intuitive setting and it breaks the install. `--filter`
  narrows what gets built, not where the build runs.
- **`packages/*` belongs in both watch paths.** Both apps consume `packages/ui` and
  `packages/tokens`. If only one watched them, a token change would deploy to one surface and
  leave the other on the old palette without saying so.
- **A Pages project name is permanent.** It is the `*.pages.dev` subdomain, and the only way
  to change it is to delete and recreate the project. Name it before attaching a domain.
- **The console has no application-level auth yet.** Firebase email-link sign-in is unbuilt,
  so the mock admits any address. Until it exists, Cloudflare Access has to cover the custom
  domain and not only the preview URLs — the "Enable access policy" toggle inside Pages
  protects `*.pages.dev` alone.

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

Work happens on `dev`; `main` is merge-only and updated by pull request. English everywhere
except product copy, which is declared in `.conventions.json`. References to another
repository carry the owner segment, as in `spencer0124/skkuverse#22`. The policies and their
enforcement live in the
[umbrella repository](https://github.com/spencer0124/skkuverse/tree/main/conventions).

`packages/bridge` and `packages/tokens` are vendored copies with a single upstream owner,
registered in the umbrella's `contracts/manifest.json` and hash-checked in CI. Edit them
upstream in `skkuverse-app`, never here.

## Related

- [skkuverse](https://github.com/spencer0124/skkuverse) — umbrella: ADRs, contracts, conventions
- [skkuverse-app](https://github.com/spencer0124/skkuverse-app) — React Native app, upstream of the vendored packages
- [skkuverse-server](https://github.com/spencer0124/skkuverse-server) — NestJS API, including the console API
- [skkuverse.com](https://github.com/spencer0124/skkuverse.com) — marketing site and deep-link landing pages
