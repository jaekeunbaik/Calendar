import { Holiday } from '../types';

// 양력 고정 공휴일
const solarHolidays: Record<string, string> = {
  '01-01': '신정',
  '03-01': '삼일절',
  '05-05': '어린이날',
  '06-06': '현충일',
  '08-15': '광복절',
  '10-03': '개천절',
  '10-09': '한글날',
  '12-25': '성탄절',
};

// 2024 ~ 2028년 음력 명절 및 변동/대체 공휴일 매핑
const variableHolidays: Record<string, { name: string; isSubstitute?: boolean }> = {
  // 2024
  '2024-02-09': { name: '설날 연휴' },
  '2024-02-10': { name: '설날' },
  '2024-02-11': { name: '설날 연휴' },
  '2024-02-12': { name: '대체공휴일', isSubstitute: true },
  '2024-04-10': { name: '제22대 국회의원 선거' },
  '2024-05-06': { name: '대체공휴일(어린이날)', isSubstitute: true },
  '2024-05-15': { name: '부처님 오신 날' },
  '2024-09-16': { name: '추석 연휴' },
  '2024-09-17': { name: '추석' },
  '2024-09-18': { name: '추석 연휴' },
  '2024-10-01': { name: '임시공휴일(국군의 날)' },

  // 2025
  '2025-01-28': { name: '설날 연휴' },
  '2025-01-29': { name: '설날' },
  '2025-01-30': { name: '설날 연휴' },
  '2025-03-03': { name: '대체공휴일(삼일절)', isSubstitute: true },
  '2025-05-05': { name: '어린이날 / 부처님 오신 날' },
  '2025-05-06': { name: '대체공휴일', isSubstitute: true },
  '2025-10-05': { name: '추석 연휴' },
  '2025-10-06': { name: '추석' },
  '2025-10-07': { name: '추석 연휴' },
  '2025-10-08': { name: '대체공휴일', isSubstitute: true },

  // 2026
  '2026-02-16': { name: '설날 연휴' },
  '2026-02-17': { name: '설날' },
  '2026-02-18': { name: '설날 연휴' },
  '2026-03-02': { name: '대체공휴일(삼일절)', isSubstitute: true },
  '2026-05-24': { name: '부처님 오신 날' },
  '2026-05-25': { name: '대체공휴일(부처님오신날)', isSubstitute: true },
  '2026-08-17': { name: '대체공휴일(광복절)', isSubstitute: true },
  '2026-09-24': { name: '추석 연휴' },
  '2026-09-25': { name: '추석' },
  '2026-09-26': { name: '추석 연휴' },
  '2026-10-05': { name: '대체공휴일(개천절)', isSubstitute: true },

  // 2027
  '2027-02-06': { name: '설날 연휴' },
  '2027-02-07': { name: '설날' },
  '2027-02-08': { name: '설날 연휴' },
  '2027-02-09': { name: '대체공휴일', isSubstitute: true },
  '2027-05-13': { name: '부처님 오신 날' },
  '2027-09-14': { name: '추석 연휴' },
  '2027-09-15': { name: '추석' },
  '2027-09-16': { name: '추석 연휴' },
  '2027-10-04': { name: '대체공휴일(개천절)', isSubstitute: true },
  '2027-10-11': { name: '대체공휴일(한글날)', isSubstitute: true },
  '2027-12-27': { name: '대체공휴일(성탄절)', isSubstitute: true },
};

/**
 * 특정 날짜(YYYY-MM-DD)의 공휴일 정보 반환
 */
export function getHoliday(dateStr: string): Holiday | null {
  // 변동 공휴일 확인
  if (variableHolidays[dateStr]) {
    return {
      date: dateStr,
      name: variableHolidays[dateStr].name,
      isSubstitute: variableHolidays[dateStr].isSubstitute,
    };
  }

  // 양력 고정 공휴일 확인 (MM-DD)
  const monthDay = dateStr.slice(5);
  if (solarHolidays[monthDay]) {
    return {
      date: dateStr,
      name: solarHolidays[monthDay],
      isSubstitute: false,
    };
  }

  return null;
}
