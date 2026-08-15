---
title: Webview App (@skkuverse/webview)
type: reference
status: accepted
owner: zoyoong124@gmail.com
last-updated: 2026-08-16
audience: internal
---

# apps/webview

> React 19 + Vite SPA — 모바일 앱이 webview로 여는 화면들. `webview.skkuverse.com`에 Cloudflare
> Pages로 배포된다.

## 실행

```bash
pnpm dev              # Vite dev server
pnpm build            # vite build
pnpm typecheck        # tsc --noEmit
pnpm preview          # 빌드 결과 프리뷰
```

## 라우팅

**경로 기반(`BrowserRouter`)이다.** 예전에는 해시(`#/`)였고, 서버가 넘겨주는 URL도 그 형태였다
([skkuverse#46](https://github.com/spencer0124/skkuverse/issues/46)에서 양쪽 다 옮겼다). 해시 URL이
이 번들에 도착하면 프래그먼트는 서버까지 가지 않으므로 `/`로 해석되고, SPA fallback이 셸을
HTTP 200으로 응답한다. 앱의 webview는 400 이상에서만 오류 오버레이를 띄우므로 **틀린 페이지가
조용히 뜬다.** 서버 쪽에도 같은 이유의 가드가 있다.

| 경로 | 페이지 |
| --- | --- |
| `/map/hssc`, `/map/nsc` | 캠퍼스 도면 |
| `/bus/hssc/info`, `/bus/campus/info` | 버스 안내 |
| `/skku/lostandfound` | 유실물 |
| `/eskara`, `/eskara/{entry,shuttle,timetable,goods}` | 축제 안내 |
| `/preview` | 컴포넌트 갤러리 — **개발 빌드에만 존재** |
| 그 외 · `/` | `ErrorPage` (catch-all) |

**경로는 추가만 가능하다** ([ADR 0005](https://github.com/spencer0124/skkuverse/blob/main/docs/decisions/0005-web-surfaces-dedicated-repo.md)
invariant 3). 출시된 앱 바이너리와 발행된 이벤트맵 스냅샷이 이 문자열들을 들고 있어서, 이름을
바꾸거나 지우면 현장에 나가 있는 클라이언트가 깨진다.

`vite.config.ts`의 `base: '/'`는 건드리지 말 것. 상대 경로로 되돌리면 `/eskara/timetable`이
`/eskara/assets/index-*.js`를 요청하고, SPA fallback이 그것을 `text/html`로 응답해 모듈 스크립트가
MIME 검사에서 죽는다. 상태 코드는 전부 200이고 화면만 백지다. CI의 `grep 'src="/assets/'`가 유일한
방어선이다.

## 구조

- 페이지: `src/pages/` — 각 페이지가 자기 폴더를 갖는다. 긴 페이지는 본문을 `data/` 모듈로 분리한다
- 공용 레이아웃: `src/components/page.tsx` (`Page`, `Section`, `Card`, `NoteRow`, `RouteTimeline` …)
- 컴포넌트: [`@skkuverse/ui`](../../packages/ui) — 색은 전부 `useAdaptive()` 토큰에서 온다. 페이지에
  hex 리터럴을 쓰지 않는다(예외는 3사 브랜드 마크뿐)
- 아이콘: 페이지에서 `@phosphor-icons/react`를 import할 수 없다. `packages/ui`의 의존성이고 pnpm이
  호이스팅하지 않는다. 인라인 `<svg>`를 쓴다
- 네이티브 통신: [`@skkuverse/bridge`](../../packages/bridge)의 `postToApp`을 `src/bridge.ts`가 감싼다.
  **보내기만 한다** — `parseWebMessage`는 앱 쪽에 있다. webview 밖에서는 조용히 no-op이고, 권한은
  서버가 소유한 origin 허용목록으로 메시지마다 다시 판정된다
- 네트워크 요청 없음: 이 앱은 어떤 API도 호출하지 않는다. 서버가 어떤 라우트에도 `Access-Control-*`을
  보내지 않아 브라우저 fetch는 실패한다. 콘텐츠는 번들에 들어간다
- 스타일: 대부분 인라인 + 토큰. Tailwind는 두 지도 페이지의 레이아웃 유틸리티에만 쓰이고,
  `tailwind.config.js`는 색을 선언하지 않는다(토큰이 단일 출처)

## 한국어

`.conventions.json`이 `apps/webview/src/pages/**`만 제품 문구 예외로 둔다. 그 밖의 모든 코드와
주석은 영어다.

**이 예외는 "문구가 어디 있어도 되는가"를 정하는 것이지 "파일이 어디 있어야 하는가"를 정하는 게
아니다.** 공용 컴포넌트는 `components/`에 두고 문구는 prop으로 받는다. 규칙을 피하려고 파일을
`pages/` 밑으로 옮기지 말 것 — 그러면 `components/`가 `pages/`를 import하게 되어 의존 방향이
뒤집힌다. 예외 목록을 넓히는 것도 답이 아니다.
