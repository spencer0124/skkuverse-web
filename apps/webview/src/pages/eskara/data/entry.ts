/** Content for `/eskara/entry`. Replace wholesale for a new year. */

export const LEAD =
  '축제 둘째 날에는 입장 티켓 소지자만 대운동장에 들어갈 수 있어요. 티켓은 현장에서 받아요.';

export const TICKET_HOURS: { who: string; time: string }[] = [
  { who: '성균인 사전예약자', time: '10:00 – 14:00' },
  { who: '성균인 (예약 여부 무관)', time: '14:00 – 22:00' },
  { who: '외부인', time: '15:00 – 22:00' },
];

export const TICKET_BOOTHS: { who: string; place: string }[] = [
  { who: '성균인', place: '복지회관 앞 티켓부스' },
  { who: '외부인', place: '삼성학술정보관 앞 글로벌 광장 티켓부스' },
];

export const EARLY_CHECK_IN = {
  time: '10:00 – 14:00',
  place: '복지회관 앞 티켓부스',
  notes: [
    '사전예약을 마친 성균인은 외부인보다 먼저 입장할 수 있어요.',
    '14:00 이후 도착하면 사전예약이 자동으로 취소되고, 현장 접수와 동일하게 진행돼요.',
  ],
};

export const DOCUMENTS: { who: string; need: string }[] = [
  { who: '재학생 · 휴학생', need: '신분증 + 학생증 (또는 KINGO-M)' },
  { who: '수료생', need: '신분증 + 학생증 (또는 KINGO-M)' },
  { who: '졸업생', need: '신분증 + 졸업증명서' },
];

export const DOCUMENT_NOTES = [
  '사진이나 캡처본은 인정되지 않을 수 있어요.',
  '졸업생은 현장에서 졸업증명서 확인이 반드시 진행돼요.',
];

export const GRADUATION_CERT_PLACES = [
  '학생회관 1층 종합행정실 입구',
  '제2공학관 26동 1층 26108호 맞은편',
];

/** `null` renders as an em dash; the source table uses O/X. */
export const GATES: { name: string; enter: boolean; exit: boolean }[] = [
  { name: '메인 게이트', enter: true, exit: true },
  { name: '구령대 게이트', enter: true, exit: false },
  { name: '퇴장 게이트', enter: false, exit: true },
];

export const OUTSIDER_FEE = {
  amount: '1인 18,000원',
  label: '시설 이용료 및 환경부담금',
  payment: '현장 계좌이체 (입금계좌는 현장에서 안내)',
};
