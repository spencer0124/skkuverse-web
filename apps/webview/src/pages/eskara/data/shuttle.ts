/**
 * Content for `/eskara/shuttle`.
 *
 * The running timetable is deliberately NOT here. It lives in the server's
 * `bus_overrides` and is already drawn by the app's 교통 tab, so this page
 * explains what changes and sends people there rather than shipping a second
 * copy that goes stale on its own.
 */

export const LEAD = '축제 양일 동안 인자/자인셔틀이 증차되고, 인사캠에는 패스트트랙이 열려요.';

export const SCHEDULE_POINTER = {
  title: '셔틀 시간표는 교통 탭에서',
  body: '증차분을 포함한 실제 운행 시간은 앱의 교통 탭에서 볼 수 있어요. 운행이 바뀌면 그쪽이 먼저 반영돼요.',
};

export const DAYS: { day: string; notes: string[] }[] = [
  {
    day: '1일차 · 9. 11.(목)',
    notes: ['자과캠은 23:00부터 탑승 위치가 N센터 앞에서 수성관 앞으로 바뀌어요.'],
  },
  {
    day: '2일차 · 9. 12.(금)',
    notes: [
      '고명북·창융디 수업을 위해 학부대학에서도 셔틀이 추가 운행되고, 성균인 누구나 탈 수 있어요.',
      '패스트트랙 셔틀버스는 인자셔틀·학부대학 셔틀과 별도로 운영돼요.',
      '자과캠은 22:30부터 탑승 위치가 N센터 앞에서 수성관 앞으로 바뀌어요.',
    ],
  },
];

export const FAST_TRACK = {
  what: '인사캠에서 출발하는 성균인이 인사캠에서 미리 입장 티켓을 받아 두는 제도예요. 자과캠에서는 소지품 검사만 거치면 바로 대운동장에 들어갈 수 있어요.',
  place: '비천당 앞',
  date: '9. 12.(금)',
  hours: [
    { who: '사전예약자 발급', time: '9:30 – 14:00' },
    { who: '현장 발급', time: '14:00 – 16:30' },
  ],
  notes: [
    '티켓 사전예약자에 한해 증차된 패스트트랙 셔틀버스를 탈 수 있어요.',
    '티켓 발급에는 신분증과 학생증(또는 KINGO-M)이 필요해요.',
  ],
};
