import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorPage from './pages/error';
import HSSCMap from './pages/hsscmap/hsscmap';
import NSCMap from './pages/nscmap/nscmap';
import HSSCBusInfo from './pages/bus/HSSCBusInfo';
import CampusBusInfo from './pages/bus/CampusBusInfo';
import LostAndFound from './pages/lostandfound/LostAndFound';

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
