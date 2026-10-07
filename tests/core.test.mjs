// 실행: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcSaju, analyze, yearFortune, dayPillarOfDate, STEMS, BRANCHES } from '../js/core.js';

const name = (p) => (p ? STEMS[p.stem] + BRANCHES[p.branch] : null);
const kst = (ms) => new Date(ms + 9 * 3600e3);

test('일주: 알려진 날짜', () => {
  assert.equal(name(dayPillarOfDate(2000, 1, 1)), '戊午');
  assert.equal(name(dayPillarOfDate(2024, 1, 1)), '甲子');
  assert.equal(name(dayPillarOfDate(1900, 1, 1)), '甲戌');
});

test('세운: 연도 간지', () => {
  assert.equal(name(yearFortune(2024)), '甲辰');
  assert.equal(name(yearFortune(2026)), '丙午');
});

test('입춘 시각이 공표값과 20분 이내', () => {
  // 한국천문연구원 공표 입춘 시각(KST)
  const known = [[2024, 2, 4, 17, 27], [2025, 2, 3, 23, 10], [2026, 2, 4, 5, 2]];
  for (const [y, m, d, h, mi] of known) {
    const calc = yearFortune(y).months[0].start;
    const ref = Date.UTC(y, m - 1, d, h - 9, mi);
    assert.ok(Math.abs(calc - ref) < 20 * 60000, `${y} 입춘 오차 ${(calc - ref) / 60000}분`);
  }
});

test('입춘 전후로 연주와 월주가 바뀐다', () => {
  const before = calcSaju({ year: 2024, month: 2, day: 4, hour: 15, minute: 0, gender: 'M' });
  const after = calcSaju({ year: 2024, month: 2, day: 4, hour: 19, minute: 0, gender: 'M' });
  assert.equal(name(before.pillars.year), '癸卯');
  assert.equal(name(before.pillars.month), '乙丑');
  assert.equal(name(after.pillars.year), '甲辰');
  assert.equal(name(after.pillars.month), '丙寅');
});

test('시주와 경도 보정', () => {
  // 12:00 KST 서울 = 지방시 약 11:28, 오시
  const s = calcSaju({ year: 2024, month: 1, day: 1, hour: 12, minute: 0, gender: 'M' });
  assert.equal(name(s.pillars.hour), '庚午');
  // 13:10 KST: 보정하면 오시(12:38), 보정하지 않으면 미시
  const a = calcSaju({ year: 2024, month: 1, day: 1, hour: 13, minute: 10, gender: 'M' });
  const b = calcSaju({ year: 2024, month: 1, day: 1, hour: 13, minute: 10, gender: 'M', longitude: null });
  assert.equal(BRANCHES[a.pillars.hour.branch], '午');
  assert.equal(BRANCHES[b.pillars.hour.branch], '未');
});

test('자시 기준: 23시대 출생', () => {
  const next = calcSaju({ year: 1990, month: 5, day: 15, hour: 23, minute: 50, gender: 'M' });
  const same = calcSaju({ year: 1990, month: 5, day: 15, hour: 23, minute: 50, gender: 'M', ziMode: 'same' });
  assert.notEqual(name(next.pillars.day), name(same.pillars.day));
  assert.equal(BRANCHES[next.pillars.hour.branch], '子');
});

test('서머타임(1987) 1시간 제외', () => {
  const s = calcSaju({ year: 1987, month: 7, day: 1, hour: 0, minute: 20, gender: 'F' });
  assert.equal(s.dst, true);
  assert.equal(s.solarTime.d, 30); // 표준시 6/30 23:20 -> 지방시 22:48
  assert.equal(BRANCHES[s.pillars.hour.branch], '亥');
});

test('대운 방향과 시작 나이', () => {
  const m = calcSaju({ year: 1990, month: 5, day: 15, hour: 9, minute: 30, gender: 'M' }); // 庚(양)년 남자: 순행
  const f = calcSaju({ year: 1990, month: 5, day: 15, hour: 9, minute: 30, gender: 'F' });
  assert.equal(m.daewoon.forward, true);
  assert.equal(f.daewoon.forward, false);
  assert.equal(name(m.daewoon.list[0]), '壬午');
  assert.equal(name(f.daewoon.list[0]), '庚辰');
  for (const s of [m, f]) assert.ok(s.daewoon.startAge >= 1 && s.daewoon.startAge <= 10);
});

test('시각 모름이면 시주 없음', () => {
  const s = calcSaju({ year: 1995, month: 11, day: 2, timeUnknown: true, gender: 'F' });
  assert.equal(s.pillars.hour, null);
});

import { lunarToSolar, solarToLunar, samjae } from '../js/core.js';
import { buildReading, ELEMENT_PLAIN } from '../js/interpret.js';
import { buildDomains } from '../js/domains.js';

test('음력 -> 양력 (윤달 포함, 한국천문연구원 발표값)', () => {
  const cases = [
    [[2024, 1, 1, false], [2024, 2, 10]], [[2023, 2, 1, true], [2023, 3, 22]], [[2020, 4, 1, true], [2020, 5, 23]],
    [[1990, 5, 1, true], [1990, 6, 23]], [[2025, 8, 15, false], [2025, 10, 6]], [[1985, 1, 1, false], [1985, 2, 20]],
    [[2025, 6, 1, true], [2025, 7, 25]], [[1960, 1, 1, false], [1960, 1, 28]],
  ];
  for (const [[y, m, d, l], [ey, em, ed]] of cases) assert.deepEqual(lunarToSolar(y, m, d, l), { year: ey, month: em, day: ed });
  assert.ok(lunarToSolar(2024, 4, 1, true).error, '없는 윤달은 오류');
});

test('양력 <-> 음력 왕복 변환 (1913~2048)', () => {
  for (let t = Date.UTC(1913, 0, 1); t < Date.UTC(2049, 0, 1); t += 86400000 * 7) {
    const d = new Date(t);
    const L = solarToLunar(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    const S = lunarToSolar(L.year, L.month, L.day, L.leap);
    assert.deepEqual(S, { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() });
  }
});

test('삼재: 말띠는 신유술년', () => {
  assert.equal(samjae(6, 8), '들삼재'); assert.equal(samjae(6, 9), '눌삼재'); assert.equal(samjae(6, 10), '날삼재'); assert.equal(samjae(6, 11), null);
});

test('해석 일관성: 오행 과다/부족 표현과 개수가 어긋나지 않음', () => {
  let seed = 7; const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  const strings = (o, out = []) => { if (typeof o === 'string') out.push(o); else if (o && typeof o === 'object') for (const v of Object.values(o)) if (typeof v !== 'function') strings(v, out); return out; };
  for (let i = 0; i < 300; i++) {
    const s = calcSaju({ year: 1930 + rnd(90), month: 1 + rnd(12), day: 1 + rnd(28), hour: rnd(24), minute: rnd(60), gender: rnd(2) ? 'M' : 'F', timeUnknown: rnd(6) === 0 });
    const an = analyze(s);
    const R = buildReading(s, an, 2026, Date.UTC(2026, 9, 7));
    const D = buildDomains(s, an, R, 2026, Date.UTC(2026, 9, 7));
    for (const t of strings({ R, D })) {
      assert.ok(!/undefined|NaN|\[object/.test(t), t);
      ELEMENT_PLAIN.forEach((e, k) => {
        assert.ok(!(t.includes(`부족한 ${e}`) && an.elemCount[k] >= 2), t);
        assert.ok(!(t.includes(`넘치는 ${e}`) && an.elemCount[k] < 3), t);
      });
    }
  }
});
