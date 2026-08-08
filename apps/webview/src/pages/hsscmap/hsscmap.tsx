import { useState } from 'react';
import { Shadow, useAdaptive } from '@skkuverse/ui';
import HSSCMapSVG from '../../assets/fastmap_skkubus.svg?react';
import { handleSVGClick, type OverlayInfo } from './handleClick';
import { sendMapSelect } from '../../bridge';

function HSSCMap() {
  const adaptive = useAdaptive();
  const [overlayInfo, setOverlayInfo] = useState<OverlayInfo | null>(null);

  const onSVGClick = (event: React.MouseEvent) => {
    closeOverlay();

    /*
    event.stopPropagation() is called at the beginning of the onSVGClick function. This stops the click event from bubbling up to parent elements, which should prevent the event handler from being triggered more than once per click.
    This change should resolve the issue of the event handler running twice for each click.
     */
    event.stopPropagation(); // 이거 넣으면 두번씩 터치되는 문제 해결!
    const info = handleSVGClick(event.nativeEvent as MouseEvent);

    // 마커 생성되는 경우
    if (info) {
      setOverlayInfo(info);
      sendMapSelect({
        action: 'add',
        placename: info.placename,
        buildingname: info.buildingname,
        previousplace: info.previousplace,
        afterplace: info.afterplace,
        placeinfo: info.placeinfo,
        time: info.time,
        leftColor: info.leftColor,
        rightColor: info.rightColor,
      });
    }

    // 마커 사라지는 경우
    else {
      sendMapSelect({
        action: 'delete',
        placename: '',
        buildingname: '',
        previousplace: null,
        afterplace: null,
        placeinfo: null,
        time: null,
        leftColor: '',
        rightColor: '',
      });
    }
  };

  const closeOverlay = () => {
    setOverlayInfo(null);
  };

  // overlayInfo가 있으면, 아래의 div(마커 ui)를 보여준다.
  return (
    <div onClick={onSVGClick}>
      <HSSCMapSVG className="h-screen w-auto pb-20 pt-0.5 px-2.5" />
      {overlayInfo && (
        <div
          style={{
            left: overlayInfo.x,
            top: overlayInfo.y,
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* The marker. Colours come from the theme rather than Tailwind's
              default palette: bg-white / border-gray-300 / text-gray-700 named
              greys that no token decides, so the marker drifted from the rest
              of the app whenever the palette did not happen to agree. */}
          <Shadow shadow="medium">
            <div
              style={{
                padding: 4,
                background: adaptive.background,
                borderRadius: 8,
                border: `1px solid ${adaptive.grey200}`,
                fontSize: 12,
                lineHeight: '18px',
              }}
            >
              📍
            </div>
          </Shadow>
          {/* Arrow. A CSS triangle, so its colour is a border colour. */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `5px solid ${adaptive.grey200}`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default HSSCMap;
