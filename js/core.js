// 사주 계산 엔진: 순수 함수만 포함 (브라우저/Node 공용)

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const STEMS_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const BRANCHES_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
export const ZODIAC = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
export const ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'];
export const ELEMENTS_KO = ['목', '화', '토', '금', '수'];
export const ELEMENTS_HANJA = ['木', '火', '土', '金', '水'];

// 지지 오행
export const BRANCH_ELEMENT = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
// 지장간 (여기, 중기, 본기 순서가 아니라 [본기, ...나머지]). 본기를 십성 판단에 사용
export const HIDDEN_STEMS = [
  [9], [5, 9, 7], [0, 2, 4], [1], [4, 1, 9], [2, 6, 4],
  [3, 5], [5, 3, 1], [6, 8, 4], [7], [4, 7, 3], [8, 0],
];

export const stemElement = (s) => Math.floor(s / 2);
export const stemYang = (s) => s % 2 === 0;
export const mod = (n, m) => ((n % m) + m) % m;

// 60갑자 인덱스 <-> 천간/지지
export const toCycle = (s, b) => mod(6 * s - 5 * b, 60);
export const fromCycle = (i) => ({ stem: mod(i, 10), branch: mod(i, 12) });

/* ---------------- 천문 계산 ---------------- */

const DAY_MS = 86400000;
export const jdFromMs = (ms) => ms / DAY_MS + 2440587.5;
export const msFromJd = (jd) => (jd - 2440587.5) * DAY_MS;

// ΔT (초), Espenak & Meeus 다항식 근사
function deltaT(year) {
  let t;
  if (year < 1920) { t = year - 1900; return -2.79 + 1.494119 * t - 0.0598939 * t ** 2 + 0.0061966 * t ** 3 - 0.000197 * t ** 4; }
  if (year < 1941) { t = year - 1920; return 21.2 + 0.84493 * t - 0.0761 * t ** 2 + 0.0020936 * t ** 3; }
  if (year < 1961) { t = year - 1950; return 29.07 + 0.407 * t - t ** 2 / 233 + t ** 3 / 2547; }
  if (year < 1986) { t = year - 1975; return 45.45 + 1.067 * t - t ** 2 / 260 - t ** 3 / 718; }
  if (year < 2005) { t = year - 2000; return 63.86 + 0.3345 * t - 0.060374 * t ** 2 + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5; }
  if (year < 2050) { t = year - 2000; return 62.92 + 0.32217 * t + 0.005589 * t ** 2; }
  t = (year - 1820) / 100; return -20 + 32 * t * t - 0.5628 * (2150 - year);
}

const rad = (d) => (d * Math.PI) / 180;

// 태양 시황경 (도). Meeus 25장 저정밀 공식, 오차 약 0.01도(약 15분)
export function sunLongitude(jdUT) {
  const year = 2000 + (jdUT - 2451545) / 365.25;
  const jde = jdUT + deltaT(year) / 86400;
  const T = (jde - 2451545) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(rad(M))
    + (0.019993 - 0.000101 * T) * Math.sin(rad(2 * M))
    + 0.000289 * Math.sin(rad(3 * M));
  const omega = 125.04 - 1934.136 * T;
  return mod(L0 + C - 0.00569 - 0.00478 * Math.sin(rad(omega)), 360);
}

// 태양 황경이 target(도)이 되는 시각(JD, UT). guess 근처에서 뉴턴 반복
export function findSunLongitude(target, guessJd) {
  let jd = guessJd;
  for (let i = 0; i < 20; i++) {
    let diff = mod(target - sunLongitude(jd) + 180, 360) - 180;
    jd += diff / 0.98565;
    if (Math.abs(diff) < 1e-6) break;
  }
  return jd;
}

// 절기 이름 (황경 0도=춘분부터 15도 간격)
const TERM_NAMES = ['춘분', '청명', '곡우', '입하', '소만', '망종', '하지', '소서', '대서', '입추', '처서', '백로',
  '추분', '한로', '상강', '입동', '소설', '대설', '동지', '소한', '대한', '입춘', '우수', '경칩'];
export const termName = (lng) => TERM_NAMES[mod(Math.round(lng / 15), 24)];

/* ---------------- 한국 표준시 이력 (IANA tzdata Asia/Seoul) ---------------- */
// [UTC 전환 시각, UTC 오프셋(분), 서머타임 여부]
const SEOUL_TZ = [
  ['1908-03-31T16:00Z', 510, 0], ['1911-12-31T16:00Z', 540, 0],
  ['1948-05-31T15:00Z', 600, 1], ['1948-09-12T14:00Z', 540, 0],
  ['1949-04-02T15:00Z', 600, 1], ['1949-09-10T14:00Z', 540, 0],
  ['1950-03-31T15:00Z', 600, 1], ['1950-09-09T14:00Z', 540, 0],
  ['1951-05-05T15:00Z', 600, 1], ['1951-09-08T14:00Z', 540, 0],
  ['1954-03-20T15:00Z', 510, 0],
  ['1955-05-04T16:00Z', 570, 1], ['1955-09-08T15:00Z', 510, 0],
  ['1956-05-19T16:00Z', 570, 1], ['1956-09-29T15:00Z', 510, 0],
  ['1957-05-04T16:00Z', 570, 1], ['1957-09-21T15:00Z', 510, 0],
  ['1958-05-03T16:00Z', 570, 1], ['1958-09-20T15:00Z', 510, 0],
  ['1959-05-02T16:00Z', 570, 1], ['1959-09-19T15:00Z', 510, 0],
  ['1960-04-30T16:00Z', 570, 1], ['1960-09-17T15:00Z', 510, 0],
  ['1961-08-09T16:00Z', 540, 0],
  ['1987-05-09T17:00Z', 600, 1], ['1987-10-10T17:00Z', 540, 0],
  ['1988-05-07T17:00Z', 600, 1], ['1988-10-08T17:00Z', 540, 0],
].map(([t, off, dst]) => ({ t: Date.parse(t), off, dst: !!dst }));

export function seoulOffsetAt(utcMs) {
  let cur = { off: 540, dst: false };
  for (const e of SEOUL_TZ) { if (utcMs >= e.t) cur = e; else break; }
  return cur;
}

// 한국 벽시계 시각 -> UTC ms
export function seoulLocalToUtc(y, mo, d, h, mi) {
  const naive = Date.UTC(y, mo - 1, d, h, mi);
  let o = seoulOffsetAt(naive - 540 * 60000);
  let utc = naive - o.off * 60000;
  const o2 = seoulOffsetAt(utc);
  if (o2.off !== o.off) { o = o2; utc = naive - o.off * 60000; }
  return { utc, offset: o.off, dst: o.dst };
}

/* ---------------- 사주 계산 ---------------- */

// 십성
export const TEN_GODS = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
export const TEN_GOD_GROUP = ['비겁', '비겁', '식상', '식상', '재성', '재성', '관성', '관성', '인성', '인성'];
export function tenGod(dayStem, otherStem) {
  const rel = mod(stemElement(otherStem) - stemElement(dayStem), 5);
  const same = stemYang(dayStem) === stemYang(otherStem);
  return rel * 2 + (same ? 0 : 1);
}
export const branchTenGod = (dayStem, branch) => tenGod(dayStem, HIDDEN_STEMS[branch][0]);

// 12운성
const TWELVE_STAGES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
const STAGE_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3]; // 각 천간의 장생 지지
export function twelveStage(stem, branch) {
  const k = stemYang(stem) ? mod(branch - STAGE_START[stem], 12) : mod(STAGE_START[stem] - branch, 12);
  return TWELVE_STAGES[k];
}

// 지지 관계
const SIX_HARMONY = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
export const isClash = (a, b) => mod(a - b, 12) === 6;
export const isHarmony = (a, b) => SIX_HARMONY[a] === b;
export const harmonyOf = (b) => SIX_HARMONY[b];

// 삼합 그룹 기반 신살
const TRINE_GROUP = (b) => mod(b, 4); // 0:申子辰 1:巳酉丑 2:寅午戌 3:亥卯未
const PEACH = [9, 6, 3, 0];   // 도화
const HORSE = [2, 11, 8, 5];  // 역마
const CANOPY = [4, 1, 10, 7]; // 화개
export function sinsal(baseBranch, target) {
  const g = TRINE_GROUP(baseBranch);
  const out = [];
  if (PEACH[g] === target) out.push('도화');
  if (HORSE[g] === target) out.push('역마');
  if (CANOPY[g] === target) out.push('화개');
  return out;
}

const pillar = (stem, branch) => ({ stem, branch, cycle: toCycle(stem, branch) });

export function yearPillarOf(sajuYear) {
  return pillar(mod(sajuYear - 4, 10), mod(sajuYear - 4, 12));
}
export function monthPillarOf(yearStem, monthIdx) { // monthIdx 0=寅월
  return pillar(mod((yearStem % 5) * 2 + 2 + monthIdx, 10), mod(monthIdx + 2, 12));
}

// 그레고리력 날짜 -> 율리우스 일수(정오 기준 정수)
export function jdn(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}
export const dayPillarOfDate = (y, m, d) => { const c = mod(jdn(y, m, d) + 49, 60); return pillar(c % 10, c % 12); };

/**
 * 사주 원국 계산
 * @param {object} input
 *  year, month, day: 양력 생년월일
 *  hour, minute: 출생 시각(한국 벽시계). timeUnknown=true면 시주 생략
 *  gender: 'M' | 'F'
 *  longitude: 출생지 경도 (기본 서울 126.98). null이면 경도 보정 없이 표준시 사용
 *  ziMode: 'next' (23시부터 다음날 일주, 기본) | 'same' (야자시: 자정까지 당일 일주)
 */
export function calcSaju(input) {
  const { year, month, day, gender = 'M', timeUnknown = false, ziMode = 'next' } = input;
  const hour = timeUnknown ? 12 : input.hour;
  const minute = timeUnknown ? 0 : input.minute;
  const longitude = input.longitude === undefined ? 126.98 : input.longitude;

  const { utc, offset, dst } = seoulLocalToUtc(year, month, day, hour, minute);
  const jd = jdFromMs(utc);
  const lng = sunLongitude(jd);

  // 월주: 입춘(315도) 기준 30도 간격
  const monthIdx = Math.floor(mod(lng - 315, 360) / 30);
  // 연주: 입춘 이전이면 전년도
  const sajuYear = month <= 2 && monthIdx >= 10 ? year - 1 : year;
  const yp = yearPillarOf(sajuYear);
  const mp = monthPillarOf(yp.stem, monthIdx);

  // 시주/일주용 기준 시각
  //  경도 보정: 지방평균시 = UTC + 경도*4분
  //  보정 없음: 표준시(서머타임 제외)
  const stdOffset = dst ? offset - 60 : offset;
  const solarMs = longitude == null ? utc + stdOffset * 60000 : utc + longitude * 4 * 60000;
  const sd = new Date(solarMs);
  let dy = sd.getUTCFullYear(), dm = sd.getUTCMonth() + 1, dd = sd.getUTCDate();
  const sh = sd.getUTCHours(), smin = sd.getUTCMinutes();
  if (!timeUnknown && sh === 23 && ziMode === 'next') {
    const n = new Date(Date.UTC(dy, dm - 1, dd + 1));
    dy = n.getUTCFullYear(); dm = n.getUTCMonth() + 1; dd = n.getUTCDate();
  }
  const dp = dayPillarOfDate(dy, dm, dd);

  let hp = null;
  if (!timeUnknown) {
    const hourIdx = Math.floor((sh * 60 + smin + 60) / 120) % 12;
    hp = pillar(mod((dp.stem % 5) * 2 + hourIdx, 10), hourIdx);
  }

  // 절기 경계 근접 여부 (계산 오차 및 시각 기록 오차 고려)
  const prevJeolLng = mod(315 + monthIdx * 30, 360);
  const prevJeol = findSunLongitude(prevJeolLng, jd - mod(lng - prevJeolLng, 360) / 0.98565);
  const nextJeol = findSunLongitude(mod(prevJeolLng + 30, 360), jd + mod(prevJeolLng + 30 - lng, 360) / 0.98565);
  const nearBoundaryHours = Math.min(jd - prevJeol, nextJeol - jd) * 24;

  // 대운
  const forward = (stemYang(yp.stem) && gender === 'M') || (!stemYang(yp.stem) && gender === 'F');
  const days = forward ? nextJeol - jd : jd - prevJeol;
  const startAge = Math.min(10, Math.max(1, Math.round(days / 3)));
  const daewoon = [];
  for (let k = 1; k <= 10; k++) {
    const c = mod(mp.cycle + (forward ? k : -k), 60);
    const { stem, branch } = fromCycle(c);
    daewoon.push({ ...pillar(stem, branch), age: startAge + (k - 1) * 10, startYear: year + startAge + (k - 1) * 10 - 1 });
  }

  return {
    input: { ...input, longitude },
    pillars: { year: yp, month: mp, day: dp, hour: hp },
    sajuYear, monthIdx, sunLng: lng, utc, offset, dst,
    solarTime: { y: dy, m: dm, d: dd, h: sh, min: smin, raw: { y: sd.getUTCFullYear(), m: sd.getUTCMonth() + 1, d: sd.getUTCDate() } },
    jeol: { prev: msFromJd(prevJeol), next: msFromJd(nextJeol), prevName: termName(prevJeolLng), nextName: termName(prevJeolLng + 30) },
    nearBoundaryHours,
    daewoon: { forward, startAge, days, list: daewoon },
  };
}

// 특정 연도의 세운과 월운 (월 시작일은 절입 시각, 한국시 표시용 UTC ms)
export function yearFortune(y) {
  const yp = yearPillarOf(y);
  const months = [];
  let guess = jdFromMs(Date.UTC(y, 1, 4));
  for (let i = 0; i < 12; i++) {
    const start = findSunLongitude(mod(315 + i * 30, 360), guess);
    months.push({ ...monthPillarOf(yp.stem, i), start: msFromJd(start) });
    guess = start + 30.4;
  }
  return { ...yp, year: y, months };
}

// 오행/십성 분포와 신강약
const POS_WEIGHT = { yearStem: 1, yearBranch: 1, monthStem: 1, monthBranch: 3, dayBranch: 1.5, hourStem: 1, hourBranch: 1 };
export function analyze(saju) {
  const { year, month, day, hour } = saju.pillars;
  const ds = day.stem;
  const items = [
    { pos: 'yearStem', kind: 'stem', v: year.stem },
    { pos: 'yearBranch', kind: 'branch', v: year.branch },
    { pos: 'monthStem', kind: 'stem', v: month.stem },
    { pos: 'monthBranch', kind: 'branch', v: month.branch },
    { pos: 'dayBranch', kind: 'branch', v: day.branch },
  ];
  if (hour) items.push({ pos: 'hourStem', kind: 'stem', v: hour.stem }, { pos: 'hourBranch', kind: 'branch', v: hour.branch });

  const elemCount = [0, 0, 0, 0, 0];
  elemCount[stemElement(ds)] += 1;
  const groupScore = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
  const godCount = Object.fromEntries(TEN_GODS.map((g) => [g, 0]));
  let support = 0, total = 0;

  for (const it of items) {
    const e = it.kind === 'stem' ? stemElement(it.v) : BRANCH_ELEMENT[it.v];
    elemCount[e] += 1;
    const g = it.kind === 'stem' ? tenGod(ds, it.v) : branchTenGod(ds, it.v);
    it.god = TEN_GODS[g];
    godCount[TEN_GODS[g]] += 1;
    const w = POS_WEIGHT[it.pos];
    groupScore[TEN_GOD_GROUP[g]] += w;
    total += w;
    if (g <= 1 || g >= 8) support += w;
  }
  const ratio = support / total;
  const strength = ratio >= 0.55 ? '신강' : ratio <= 0.4 ? '신약' : '중화';

  // 간이 억부 용신: 신강/중화는 일간 기운을 빼는 오행 중 가장 적은 것, 신약은 돕는 오행 중 가장 적은 것
  const de = stemElement(ds);
  const supportEls = [de, mod(de - 1, 5)];               // 비겁, 인성
  const drainEls = [mod(de + 1, 5), mod(de + 2, 5), mod(de + 3, 5)]; // 식상, 재성, 관성
  const pool = strength === '신약' ? supportEls : drainEls;
  const yongsin = pool.reduce((a, b) => (elemCount[b] < elemCount[a] ? b : a));
  const gisin = (strength === '신약' ? drainEls : supportEls).reduce((a, b) => (elemCount[b] > elemCount[a] ? b : a));

  return { items, elemCount, groupScore, godCount, ratio, strength, yongsin, gisin };
}
