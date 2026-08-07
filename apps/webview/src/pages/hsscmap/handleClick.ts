import availableLines, { type LineEntry } from './data/AvailableLines';

/*
건물끼리 연결하는 연결통로(connect)는 그룹으로 이루어져 있음 -> groupId로 구분
건물 내부의 층들은 각각 원으로 이루어져 있음 -> id로 구분

터치를 쉽게 하기 위해 각각의 도형 위에는
크기가 더 큰 투명도 1% 도형을 그려놓음
따라서 실제로 정보를 가져오기 위해는 이름에서 "_clickarea"를 제거해야 함
*/

export interface OverlayInfo {
  itemtype: string;
  placename: string;
  buildingname: string;
  previousplace: string | null;
  afterplace: string | null;
  placeinfo: string | null;
  time: string | null;
  leftColor: string;
  rightColor: string;
  x: number;
  y: number;
}

export const handleSVGClick = (event: MouseEvent): OverlayInfo | null => {
  const target = event.target as SVGElement;
  let { id: clickedId, groupId } = extractIds(target);

  clickedId = processClickArea(clickedId);
  groupId = groupId ? processClickArea(groupId) : groupId;

  const actualId = groupId || clickedId;
  const line = findAvailableLine(actualId);
  if (line) {
    return createOverlayInfo(line, actualId);
  }

  return null;
};

const extractIds = (element: SVGElement): { id: string; groupId: string | null } => {
  return {
    id: element.id,
    groupId: element.getAttribute('data-group'),
  };
};

const processClickArea = (id: string): string => {
  return id && id.endsWith('_clickarea') ? id.replace('_clickarea', '') : id;
};

/**
 * Returns the entry rather than a boolean, so the caller can narrow it.
 * `availableLines` is a `Record<string, LineEntry>`, so an index access is
 * `LineEntry | undefined`, and a boolean guard cannot tell the compiler which
 * of the two it got.
 *
 * `hasOwnProperty` rather than a truthiness check on the lookup: an SVG element
 * with `id="toString"` resolves through the prototype chain, so
 * `if (availableLines[id])` would accept it. Same runtime behaviour as before.
 */
const findAvailableLine = (id: string): LineEntry | undefined => {
  return Object.prototype.hasOwnProperty.call(availableLines, id)
    ? availableLines[id]
    : undefined;
};

const createOverlayInfo = (line: LineEntry, id: string): OverlayInfo => {
  const element = document.getElementById(id)!;
  const rect = element.getBoundingClientRect();

  return {
    ...line,
    x: rect.left + window.scrollX - 9,
    y: rect.top + window.scrollY - 25,
  };
};
