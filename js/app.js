import {
  calcSaju, analyze, yearFortune, STEMS, BRANCHES, STEMS_KO, BRANCHES_KO, ELEMENTS, ELEMENTS_KO, ELEMENTS_HANJA,
  BRANCH_ELEMENT, ZODIAC, TEN_GODS, stemElement, tenGod, branchTenGod, twelveStage,
} from './core.js';
import { buildReading, currentDaewoon, koreanAge, QUESTIONS, answer, pillarName } from './interpret.js';

const CITIES = [
  ['seoul', '서울', 126.98], ['busan', '부산', 129.08], ['daegu', '대구', 128.60], ['incheon', '인천', 126.70],
  ['gwangju', '광주', 126.85], ['daejeon', '대전', 127.38], ['ulsan', '울산', 129.31], ['sejong', '세종', 127.29],
  ['suwon', '수원', 127.03], ['chuncheon', '춘천', 127.73], ['gangneung', '강릉', 128.90], ['cheongju', '청주', 127.49],
  ['jeonju', '전주', 127.15], ['changwon', '창원', 128.68], ['pohang', '포항', 129.37], ['jeju', '제주', 126.53],
  ['none', '보정하지 않음 (표준시 그대로)', null],
];
const TABS = [
  ['overall', '전체운'], ['daewoon', '대운'], ['year', '올해운'], ['wealth', '재물운'],
  ['love', '연애운'], ['marriage', '결혼운'], ['career', '직업운'], ['health', '건강운'],
];

const $ = (id) => document.getElementById(id);
const form = $('form');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

$('city').innerHTML = CITIES.map(([v, label]) => `<option value="${v}">${label}</option>`).join('');
$('time-unknown').addEventListener('change', (e) => { $('time').disabled = e.target.checked; });

let state = null;

/* ---------- 입력 ---------- */
function readForm() {
  const birth = $('birth').value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) return { error: '생년월일을 입력해 주세요.' };
  const [year, month, day] = birth.split('-').map(Number);
  if (year < 1912 || year > 2049) return { error: '1912년부터 2049년 사이의 날짜만 계산할 수 있습니다.' };
  const timeUnknown = $('time-unknown').checked;
  let hour = 12, minute = 0;
  if (!timeUnknown) {
    const t = $('time').value;
    if (!/^\d{2}:\d{2}$/.test(t)) return { error: '태어난 시각을 입력하거나 "시각을 몰라요"를 선택해 주세요.' };
    [hour, minute] = t.split(':').map(Number);
  }
  const city = CITIES.find((c) => c[0] === $('city').value) || CITIES[0];
  return {
    name: $('name').value.trim().slice(0, 20),
    year, month, day, hour, minute, timeUnknown,
    gender: form.gender.value,
    ziMode: form.zi.value,
    city: city[0], cityLabel: city[1], longitude: city[2],
  };
}

function toHash(inp) {
  const p = new URLSearchParams({
    d: `${inp.year}-${String(inp.month).padStart(2, '0')}-${String(inp.day).padStart(2, '0')}`,
    t: inp.timeUnknown ? 'x' : `${String(inp.hour).padStart(2, '0')}:${String(inp.minute).padStart(2, '0')}`,
    g: inp.gender, c: inp.city, z: inp.ziMode,
  });
  if (inp.name) p.set('n', inp.name);
  return p.toString();
}

function fromHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  if (!p.get('d')) return false;
  $('birth').value = p.get('d');
  const t = p.get('t');
  $('time-unknown').checked = t === 'x';
  $('time').disabled = t === 'x';
  if (t && t !== 'x') $('time').value = t;
  form.gender.value = p.get('g') === 'F' ? 'F' : 'M';
  form.zi.value = p.get('z') === 'same' ? 'same' : 'next';
  if (CITIES.some((c) => c[0] === p.get('c'))) $('city').value = p.get('c');
  $('name').value = p.get('n') || '';
  return true;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const inp = readForm();
  const err = $('form-error');
  if (inp.error) { err.textContent = inp.error; err.hidden = false; return; }
  err.hidden = true;
  try { history.replaceState(null, '', `#${toHash(inp)}`); } catch { /* 샌드박스 환경 */ }
  run(inp, true);
});

$('edit').addEventListener('click', () => {
  form.hidden = false;
  $('result').hidden = true;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

$('share').addEventListener('click', async () => {
  const btn = $('share');
  try {
    await navigator.clipboard.writeText(location.href);
    btn.textContent = '링크 복사됨';
  } catch {
    btn.textContent = '주소창의 링크를 복사하세요';
  }
  setTimeout(() => { btn.textContent = '결과 링크 복사'; }, 2000);
});

/* ---------- 계산 및 렌더 ---------- */
function sajuNow() {
  const now = Date.now();
  let y = new Date(now + 9 * 3600e3).getUTCFullYear();
  if (now < yearFortune(y).months[0].start) y -= 1;
  return { now, year: y };
}

function run(inp, animate) {
  const saju = calcSaju(inp);
  const an = analyze(saju);
  const { now, year } = sajuNow();
  const reading = buildReading(saju, an, year);
  state = { inp, saju, an, reading, year, now };

  renderHead();
  renderChart();
  renderElements();
  renderTabs('overall');
  renderDaewoon();
  renderMonths();
  renderChips();

  form.hidden = true;
  const res = $('result');
  res.hidden = false;
  res.classList.toggle('reveal', animate);
  res.scrollIntoView({ behavior: animate ? 'smooth' : 'auto', block: 'start' });
}

const pad = (n) => String(n).padStart(2, '0');

function renderHead() {
  const { inp, saju } = state;
  const who = inp.name ? `${esc(inp.name)}님의 사주` : '나의 사주';
  $('r-title').innerHTML = who;
  const st = saju.solarTime;
  const timeTxt = inp.timeUnknown ? '시각 모름' : `${pad(inp.hour)}:${pad(inp.minute)}`;
  const parts = [
    `양력 ${inp.year}년 ${inp.month}월 ${inp.day}일 ${timeTxt}`,
    inp.gender === 'M' ? '남성' : '여성',
    `${ZODIAC[saju.pillars.year.branch]}띠`,
  ];
  let meta = parts.join(', ');
  if (!inp.timeUnknown) {
    const corr = inp.longitude == null ? '표준시 기준' : `${inp.cityLabel} 경도 보정`;
    meta += `. 계산 기준 시각 ${pad(st.h)}:${pad(st.min)} (${corr}${saju.dst ? ', 서머타임 1시간 제외' : ''})`;
  }
  $('r-meta').textContent = meta;

  const warn = $('boundary');
  if (saju.nearBoundaryHours < 2) {
    const kst = (ms) => { const d = new Date(ms + 9 * 3600e3); return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`; };
    const near = Math.abs(saju.jeol.prev - saju.utc) < Math.abs(saju.jeol.next - saju.utc)
      ? `${saju.jeol.prevName}(${kst(saju.jeol.prev)})` : `${saju.jeol.nextName}(${kst(saju.jeol.next)})`;
    warn.textContent = `절기가 바뀌는 시각 ${near} 근처에 태어났습니다. 출생 시각이 조금만 달라도 월주${saju.monthIdx === 0 || saju.monthIdx === 11 ? '와 연주' : ''}가 바뀔 수 있으니 정확한 출생 시각을 확인해 보세요.`;
    warn.hidden = false;
  } else warn.hidden = true;
}

function glyph(kind, v) {
  const e = kind === 'stem' ? stemElement(v) : BRANCH_ELEMENT[v];
  const h = kind === 'stem' ? STEMS[v] : BRANCHES[v];
  const k = kind === 'stem' ? STEMS_KO[v] : BRANCHES_KO[v];
  return `<div class="glyph ${ELEMENTS[e]}" role="cell" aria-label="${k} ${ELEMENTS_KO[e]}"><span class="h">${h}</span><span class="k">${k} · ${ELEMENTS_KO[e]}</span></div>`;
}

function renderChart() {
  const { saju } = state;
  const P = saju.pillars, ds = P.day.stem;
  const cols = [['hour', '시주'], ['day', '일주'], ['month', '월주'], ['year', '연주']];
  $('chart').innerHTML = cols.map(([key, label]) => {
    const p = P[key];
    if (!p) {
      return `<div class="col" role="row"><div class="col-label">${label}</div><div class="col-god"></div>
        <div class="glyph empty"><span class="k">모름</span></div><div class="glyph empty"><span class="k">모름</span></div><div class="col-foot"></div></div>`;
    }
    const sg = key === 'day' ? '나' : TEN_GODS[tenGod(ds, p.stem)];
    const bg = TEN_GODS[branchTenGod(ds, p.branch)];
    return `<div class="col ${key}" role="row">
      <div class="col-label">${label}</div>
      <div class="col-god">${sg}</div>
      ${glyph('stem', p.stem)}
      ${glyph('branch', p.branch)}
      <div class="col-foot">${bg}<br>${twelveStage(ds, p.branch)}</div>
    </div>`;
  }).join('');
}

function renderElements() {
  const { an, saju } = state;
  const max = Math.max(...an.elemCount, 1);
  $('elements').innerHTML = an.elemCount.map((n, i) => `
    <div class="el-row">
      <span class="name">${ELEMENTS_KO[i]} ${ELEMENTS_HANJA[i]}</span>
      <span class="el-track"><span class="el-fill" style="display:block;width:${(n / max) * 100}%;background:var(--${ELEMENTS[i]})"></span></span>
      <span class="n">${n}</span>
    </div>`).join('');
  const de = stemElement(saju.pillars.day.stem);
  $('strength').textContent = `일간 ${STEMS[saju.pillars.day.stem]}${ELEMENTS_KO[de]} 기준 ${an.strength}${saju.pillars.hour ? '' : ' (시주 제외)'}. 보완할 오행 ${ELEMENTS_KO[an.yongsin]}, 덜어낼 오행 ${ELEMENTS_KO[an.gisin]}.`;
}

function renderTabs(active) {
  $('tabs').innerHTML = TABS.map(([id, label]) =>
    `<button type="button" class="tab" role="tab" id="tab-${id}" aria-selected="${id === active}" data-tab="${id}">${label}</button>`).join('');
  const [, label] = TABS.find((t) => t[0] === active);
  const title = active === 'year' ? `${state.year}년 ${pillarName(state.reading.yearFortune)}년의 운` : label;
  $('panel').setAttribute('aria-labelledby', `tab-${active}`);
  $('panel').innerHTML = `<h3>${title}</h3>${state.reading[active].map((t) => `<p>${esc(t)}</p>`).join('')}`;
}
$('tabs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tab]');
  if (b) renderTabs(b.dataset.tab);
});
$('tabs').addEventListener('keydown', (e) => {
  if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
  const ids = TABS.map((t) => t[0]);
  const cur = ids.indexOf(document.activeElement?.dataset?.tab);
  if (cur < 0) return;
  const next = ids[(cur + (e.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
  renderTabs(next);
  $(`tab-${next}`).focus();
});

const scoreText = (s) => (s >= 2 ? '매우 좋음' : s === 1 ? '좋음' : s === 0 ? '보통' : s === -1 ? '주의' : '신중');
const scoreClass = (s) => (s > 0 ? 'score-good' : s < 0 ? 'score-bad' : '');
function luck(an, stem, branch) {
  let s = 0;
  if (stemElement(stem) === an.yongsin) s++; if (BRANCH_ELEMENT[branch] === an.yongsin) s++;
  if (stemElement(stem) === an.gisin) s--; if (BRANCH_ELEMENT[branch] === an.gisin) s--;
  return s;
}

function renderDaewoon() {
  const { saju, an, year } = state;
  const cur = currentDaewoon(saju, year);
  $('dw-sub').textContent = `${saju.daewoon.forward ? '순행' : '역행'} 대운, ${saju.daewoon.startAge}세 시작. 올해 세는 나이 ${koreanAge(saju, year)}세.`;
  $('dw-list').innerHTML = saju.daewoon.list.map((d) => {
    const s = luck(an, d.stem, d.branch);
    return `<li class="dw-item${d === cur ? ' now' : ''}"${d === cur ? ' aria-current="true"' : ''}>
      <div class="dw-age">${d.age}세</div>
      <div class="dw-glyph">${STEMS[d.stem]}<br>${BRANCHES[d.branch]}</div>
      <div class="dw-score ${scoreClass(s)}">${scoreText(s)}</div>
    </li>`;
  }).join('');
  const nowEl = $('dw-list').querySelector('.now');
  if (nowEl) $('dw-list').scrollLeft = Math.max(0, nowEl.offsetLeft - $('dw-list').offsetLeft - 70);
}

function renderMonths() {
  const { reading, year, now } = state;
  $('months-title').textContent = `${year}년 월별 흐름`;
  const months = reading.months;
  let curIdx = -1;
  months.forEach((m, i) => { if (now >= m.start) curIdx = i; });
  if (now >= yearFortune(year + 1).months[0].start) curIdx = -1;
  $('months').innerHTML = months.map((m, i) => {
    const d = new Date(m.start + 9 * 3600e3);
    const cls = m.score > 0 ? 'good' : m.score < 0 ? 'bad' : '';
    return `<li class="m-item ${cls}${i === curIdx ? ' current' : ''}">
      <div class="m-date">${d.getUTCMonth() + 1}/${d.getUTCDate()}~</div>
      <div class="m-glyph">${pillarName(m)}</div>
      <div class="m-god">${m.god}</div>
      <div class="dw-score ${scoreClass(m.score)}">${scoreText(Math.max(-2, Math.min(2, m.score)))}</div>
    </li>`;
  }).join('');
}

function renderChips() {
  $('answers').innerHTML = '';
  $('chips').innerHTML = QUESTIONS.map((q) => `<button type="button" class="chip" data-q="${q.id}">${q.q}</button>`).join('');
}
$('chips').addEventListener('click', (e) => {
  const b = e.target.closest('[data-q]');
  if (!b || !state) return;
  const q = QUESTIONS.find((x) => x.id === b.dataset.q);
  const lines = answer(q.id, state.saju, state.an, state.reading, state.year);
  const el = document.createElement('div');
  el.className = 'qa';
  el.innerHTML = `<div class="q">${esc(q.q)}</div><div class="a">${lines.map((l) => `<p>${esc(l)}</p>`).join('')}</div>`;
  $('answers').append(el);
  b.disabled = true;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

/* ---------- 시작 ---------- */
if (fromHash()) {
  const inp = readForm();
  if (!inp.error) run(inp, false);
}
