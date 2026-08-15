/**
 * The festival artwork, each with its intrinsic size.
 *
 * The dimensions are not decoration. An `<img>` with no `width`/`height`
 * attributes occupies zero height until it decodes, so everything below it jumps
 * down the moment it arrives — measured at ~593 px on the entry page. Supplying
 * both attributes alongside CSS `height: auto` lets the browser reserve the box
 * from the aspect ratio before a single byte lands, which is the whole fix.
 *
 * Keep these in step with the files. `sips -g pixelWidth -g pixelHeight <file>`
 * prints them; a wrong pair does not fail a build, it silently reserves the
 * wrong box and reintroduces the shift it was added to remove.
 */
import festivalMapDay1 from '../../../assets/eskara/festival-map-day1.webp';
import festivalMapDay2 from '../../../assets/eskara/festival-map-day2.webp';
import stadiumGates from '../../../assets/eskara/stadium-gates.webp';
import ticketBooths from '../../../assets/eskara/ticket-booths.webp';
import timetableImg from '../../../assets/eskara/timetable.webp';

export interface FestivalImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export const IMAGES = {
  timetable: { src: timetableImg, width: 1050, height: 1400, alt: '양일 타임테이블' },
  festivalMapDay1: { src: festivalMapDay1, width: 1050, height: 1400, alt: '1일차 페스티벌 맵' },
  festivalMapDay2: { src: festivalMapDay2, width: 1050, height: 1400, alt: '2일차 페스티벌 맵' },
  ticketBooths: { src: ticketBooths, width: 580, height: 545, alt: '티켓부스 위치 안내도' },
  stadiumGates: { src: stadiumGates, width: 472, height: 412, alt: '대운동장 게이트 위치 안내도' },
} satisfies Record<string, FestivalImage>;
