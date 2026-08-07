import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorPage from './pages/error';
import HSSCMap from './pages/hsscmap/hsscmap';
import NSCMap from './pages/nscmap/nscmap';
import HSSCBusInfo from './pages/bus/HSSCBusInfo';
import CampusBusInfo from './pages/bus/CampusBusInfo';
import LostAndFound from './pages/lostandfound/LostAndFound';

/**
 * The component gallery, in development only.
 *
 * The guard has to wrap the `import()` itself, not just the `<Route>`. Vite
 * replaces `import.meta.env.DEV` with a literal `false` in a production build,
 * which makes this whole expression dead code and lets Rollup drop the chunk. A
 * top-level `lazy(() => import(...))` with only the route guarded still emits
 * the chunk and everything it pulls in — verified: that arrangement built a
 * 37 kB `Preview-*.js` plus a 317 kB sibling into a production bundle nothing
 * could ever fetch.
 *
 * Unreachable is the point, not just unloaded. Every page on this origin
 * inherits the native bridge's first-party capabilities, `Linking.openURL`
 * among them, so a shipped-but-unrouted gallery would still widen the app's
 * trusted surface.
 */
const Preview = import.meta.env.DEV ? lazy(() => import('./pages/preview/Preview')) : null;

function App() {
  useEffect(() => {
    const setScreenSize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setScreenSize();
    window.addEventListener('resize', setScreenSize);
    return () => window.removeEventListener('resize', setScreenSize);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<ErrorPage />} />
      <Route path="map">
        <Route path="hssc" element={<HSSCMap />} />
        <Route path="nsc" element={<NSCMap />} />
      </Route>
      <Route path="bus">
        <Route path="hssc/info" element={<HSSCBusInfo />} />
        <Route path="campus/info" element={<CampusBusInfo />} />
      </Route>
      <Route path="skku">
        <Route path="lostandfound" element={<LostAndFound />} />
      </Route>
      {Preview && (
        <Route
          path="preview"
          element={
            <Suspense fallback={null}>
              <Preview />
            </Suspense>
          }
        />
      )}
      {/*
        Routes renders null when nothing matches, which was invisible under hash
        routing: a bad fragment produced a blank screen nobody arrived at by
        accident. Paths are typed, shared and mistyped, so an unmatched one now
        has to render something. Note the host answers it 200 rather than 404 —
        the SPA fallback serves the shell for any path — so the app's webview
        shell, which only shows its error overlay above status 400, will not
        offer a retry here.
      */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
