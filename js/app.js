import {
  calcSaju, analyze, yearFortune, lunarToSolar, solarToLunar, STEMS, BRANCHES, STEMS_KO, BRANCHES_KO, ELEMENTS, ELEMENTS_KO,
  BRANCH_ELEMENT, ZODIAC, TEN_GODS, stemElement, tenGod, branchTenGod, twelveStage,
} from './core.js';
import { buildReading, QUESTIONS, answer, scoreWord, SINSAL, POS_AREA, ELEMENT_PLAIN, GLOSSARY } from './interpret.js';
import { buildDomains } from './domains.js';

const CITIES = [
  ['seoul', '서울', 126.98], ['busan', '부산', 129.08], ['daegu', '대구', 128.60], ['incheon', '인천', 126.70],
  ['gwangju', '광주', 126.85], ['daejeon', '대전', 127.38], ['ulsan', '울산', 129.31], ['sejong', '세종', 127.29],
  ['suwon', '수원', 127.03], ['chuncheon', '춘천', 127.73], ['gangneung', '강릉', 128.90], ['cheongju', '청주', 127.49],
  ['jeonju', '전주', 127.15], ['changwon', '창원', 128.68], ['pohang', '포항', 129.37], ['jeju', '제주', 126.53],
  ['none', '보정하지 않음 (표준시 그대로)', null],
];
const TABS = [
  ['overall', '종합'], ['love', '연애운'], ['marriage', '결혼운'], ['wealth', '재물운'],
  ['career', '직업운'], ['health', '건강운'], ['year', '올해운'],
];

const $ = (id) => document.getElementById(id);
const form = $('form');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');

$('city').innerHTML = CITIES.map(([v, label]) => `<option value="${v}">${label}</option>`).join('');

/* ---------- 숫자 입력 자동 서식 ---------- */
function formatDigits(el, groups, sep) {
  const digits = el.value.replace(/\D/g, '').slice(0, groups.reduce((a, b) => a + b, 0));
  const out = [];
  let i = 0;
  for (const g of groups) {
    if (i >= digits.length) break;
    out.push(digits.slice(i, i + g));
    i += g;
  }
  el.value = out.join(sep);
}
$('birth').addEventListener('input', (e) => {
  formatDigits(e.target, [4, 2, 2], '.');
  if (e.target.value.length === 10 && !$('time-unknown').checked) $('time').focus();
});
$('time').addEventListener('input', (e) => formatDigits(e.target, [2, 2], ':'));
$('time-unknown').addEventListener('change', (e) => { $('time').disabled = e.target.checked; });
const syncCal = () => { const lunar = form.cal.value === 'lunar'; $('leap').disabled = !lunar; if (!lunar) $('leap').checked = false; };
for (const r of form.cal) r.addEventListener('change', syncCal);

let state = null;

/* ---------- 입력 ---------- */
function readForm() {
  const bd = $('birth').value.replace(/\D/g, '');
  if (bd.length !== 8) return { error: '생년월일을 숫자 8자리로 입력해 주세요. 예: 19900515' };
  const lunar = form.cal.value === 'lunar';
  const leap = lunar && $('leap').checked;
  const iy = +bd.slice(0, 4), im = +bd.slice(4, 6), id = +bd.slice(6, 8);
  if (iy < 1912 || iy > 2049) return { error: '1912년부터 2049년 사이의 날짜만 계산할 수 있습니다.' };
  let year = iy, month = im, day = id;
  if (lunar) {
    if (im < 1 || im > 12 || id < 1 || id > 30) return { error: '음력 날짜를 다시 확인해 주세요. 월은 1~12, 일은 1~30입니다.' };
    const s = lunarToSolar(iy, im, id, leap);
    if (s.error) return { error: s.error };
    ({ year, month, day } = s);
  } else {
    const d = new Date(Date.UTC(year, month - 1, day));
    if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
      return { error: `${year}년 ${month}월 ${day}일은 없는 날짜입니다. 다시 확인해 주세요.` };
    }
  }
  if (year < 1912 || year > 2049) return { error: '1912년부터 2049년 사이의 날짜만 계산할 수 있습니다.' };
  const timeUnknown = $('time-unknown').checked;
  let hour = 12, minute = 0;
  if (!timeUnknown) {
    const t = $('time').value.replace(/\D/g, '');
    if (t.length !== 4) return { error: '태어난 시각을 숫자 4자리로 입력하거나 "시각을 몰라요"를 선택해 주세요. 예: 0930' };
    hour = +t.slice(0, 2); minute = +t.slice(2, 4);
    if (hour > 23 || minute > 59) return { error: '시각은 0000부터 2359 사이로 입력해 주세요.' };
  }
  const city = CITIES.find((c) => c[0] === $('city').value) || CITIES[0];
  return {
    name: $('name').value.trim().slice(0, 20),
    year, month, day, hour, minute, timeUnknown,
    lunar, leap, raw: { y: iy, m: im, d: id },
    gender: form.gender.value,
    ziMode: form.zi.value,
    city: city[0], cityLabel: city[1], longitude: city[2],
  };
}

function toHash(inp) {
  const p = new URLSearchParams({
    d: `${inp.raw.y}${pad(inp.raw.m)}${pad(inp.raw.d)}`,
    t: inp.timeUnknown ? 'x' : `${pad(inp.hour)}${pad(inp.minute)}`,
    g: inp.gender, c: inp.city, z: inp.ziMode,
  });
  if (inp.name) p.set('n', inp.name);
  if (inp.lunar) p.set('l', inp.leap ? '2' : '1');
  return p.toString();
}

function fromHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  const d = (p.get('d') || '').replace(/\D/g, '');
  if (d.length !== 8) return false;
  $('birth').value = `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`;
  const t = (p.get('t') || '').replace(/[^\dx]/g, '');
  $('time-unknown').checked = t === 'x';
  $('time').disabled = t === 'x';
  if (t.length === 4) $('time').value = `${t.slice(0, 2)}:${t.slice(2)}`;
  form.gender.value = p.get('g') === 'F' ? 'F' : 'M';
  form.zi.value = p.get('z') === 'same' ? 'same' : 'next';
  if (CITIES.some((c) => c[0] === p.get('c'))) $('city').value = p.get('c');
  $('name').value = p.get('n') || '';
  form.cal.value = p.get('l') ? 'lunar' : 'solar';
  syncCal();
  $('leap').checked = p.get('l') === '2';
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
  const R = buildReading(saju, an, year, now);
  const D = buildDomains(saju, an, R, year, now);
  state = { inp, saju, an, R, D, year, now, tab: 'overall', lifeExpanded: false };

  renderHead();
  renderChart();
  renderTabs();
  renderChips();

  form.hidden = true;
  const res = $('result');
  res.hidden = false;
  res.classList.toggle('reveal', animate);
  res.scrollIntoView({ behavior: animate ? 'smooth' : 'auto', block: 'start' });
}

const pillCls = (s) => (s > 0 ? 'up' : s < 0 ? 'down' : 'mid');
const pill = (s) => `<span class="pill ${pillCls(s)}">${scoreWord(s)}</span>`;
const list = (items) => items.map((t) => `<li>${esc(t)}</li>`).join('');

function renderHead() {
  const { inp, saju } = state;
  $('r-title').textContent = inp.name ? `${inp.name}님의 사주` : '나의 사주';
  const st = saju.solarTime;
  const timeTxt = inp.timeUnknown ? '시각 모름' : `${pad(inp.hour)}:${pad(inp.minute)}`;
  const lu = solarToLunar(inp.year, inp.month, inp.day);
  const luTxt = lu ? `음력 ${lu.year}년 ${lu.leap ? '윤' : ''}${lu.month}월 ${lu.day}일` : '';
  let meta = [`양력 ${inp.year}년 ${inp.month}월 ${inp.day}일 ${timeTxt} (${luTxt})`, inp.gender === 'M' ? '남성' : '여성', `${ZODIAC[saju.pillars.year.branch]}띠`].join(', ');
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
    warn.textContent = `계절이 바뀌는 시각인 ${near} 근처에 태어났습니다. 출생 시각이 조금만 달라도 결과가 바뀔 수 있으니 정확한 시각을 확인해 보세요.`;
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
  const P = state.saju.pillars, ds = P.day.stem;
  const cols = [['hour', '시주'], ['day', '일주'], ['month', '월주'], ['year', '연주']];
  $('chart').innerHTML = cols.map(([key, label]) => {
    const p = P[key];
    if (!p) {
      return `<div class="col" role="row"><div class="col-label">${label}</div><div class="col-god"></div>
        <div class="glyph empty"><span class="k">모름</span></div><div class="glyph empty"><span class="k">모름</span></div><div class="col-foot"></div></div>`;
    }
    const sg = key === 'day' ? '나' : TEN_GODS[tenGod(ds, p.stem)];
    return `<div class="col ${key}" role="row">
      <div class="col-label">${label}</div>
      <div class="col-god">${sg}</div>
      ${glyph('stem', p.stem)}
      ${glyph('branch', p.branch)}
      <div class="col-foot">${TEN_GODS[branchTenGod(ds, p.branch)]}<br>${twelveStage(ds, p.branch)}</div>
    </div>`;
  }).join('');
}

/* ---------- 탭 패널 ---------- */
const block = (title, body, cls = '') => `<section class="block ${cls}">${title ? `<h3>${title}</h3>` : ''}${body}</section>`;
const ul = (items, cls = '') => `<ul class="points ${cls}">${list(items)}</ul>`;
const chips = (kw) => `<ul class="keywords">${list(kw)}</ul>`;

function yearCards(arr, empty) {
  if (!arr.length) return `<p class="sub">${empty}</p>`;
  return `<ul class="ycards">${arr.map((a) => `
    <li class="ycard ${pillCls(a.score)}">
      <div class="yc-head"><span class="y">${a.y}</span><span class="yc-name">${esc(a.name)}${a.age ? `, ${a.age}세` : ''}</span>${pill(a.score)}${a.samjae ? `<span class="badge">${a.samjae}</span>` : ''}</div>
      ${a.showTheme ? `<p class="yc-theme">${esc(a.theme)}</p>` : ''}
      <p>${esc(a.why)}</p>
      <p class="yc-tip">${esc(a.tip)}</p>
    </li>`).join('')}</ul>`;
}

function timingBlock(t) {
  if (!t) return '';
  if (t.note) return block(t.title, `<p>${esc(t.note)}</p>`);
  return block(t.title, `
    <div class="two-col">
      <div><h4>기회의 해</h4>${yearCards(t.good, '두드러지게 좋은 해는 없습니다. 꾸준함이 답인 10년입니다.')}</div>
      <div><h4>조심할 해</h4>${yearCards(t.caution, '크게 조심할 해는 보이지 않습니다.')}</div>
    </div>`);
}

function timelineHtml() {
  const items = state.R.timeline;
  const curIdx = items.findIndex((t) => t.tense === 'present');
  const limit = state.lifeExpanded ? items.length : (curIdx >= 0 ? curIdx + 3 : 3);
  return `<ol class="timeline">${items.slice(0, limit).map((t) => `
    <li class="t-item ${t.tense}"${t.tense === 'present' ? ' aria-current="true"' : ''}>
      <div class="t-head">
        <span class="t-range">${t.range}</span>
        <span class="t-years">${t.years}</span>
        ${t.tense === 'present' ? '<span class="t-now">지금</span>' : ''}
        ${t.title !== '타고난 환경' ? pill(t.score) : ''}
      </div>
      <div class="t-body">
        <div class="t-title">${esc(t.title)}</div>
        <p>${esc(t.text.replace(/^[^.]*의 시기\. /, ''))}</p>
        ${t.advice ? `<p class="t-advice">${esc(t.advice)}</p>` : ''}
      </div>
    </li>`).join('')}</ol>
    ${limit < items.length ? '<button type="button" class="ghost" data-action="more-life">이후 흐름 더 보기</button>' : ''}`;
}

function sinsalHtml() {
  const byKey = new Map();
  for (const s of state.R.sinsal) {
    if (!byKey.has(s.key)) byKey.set(s.key, []);
    byKey.get(s.key).push(POS_AREA[s.pos]);
  }
  const order = [...byKey.keys()].sort((a, b) => Number(SINSAL[b].good) - Number(SINSAL[a].good));
  if (!order.length) return '<p>특별히 두드러지는 기운 없이 고르게 타고났습니다. 운의 흐름을 따라 무난하게 풀리는 사주입니다.</p>';
  return `<ul class="sinsal">${order.map((k) => `<li class="${SINSAL[k].good ? 'good' : 'bad'}">
    <span class="s-name">${SINSAL[k].name}</span>
    <span class="s-where">${byKey.get(k).join(', ')} 자리에 있음</span>
    <span>${esc(SINSAL[k].text)}</span></li>`).join('')}</ul>`;
}

function elementsHtml() {
  const { an } = state;
  const max = Math.max(...an.elemCount, 1);
  return `<div class="el-bars">${an.elemCount.map((n, i) => `
    <div class="el-row">
      <span class="name">${ELEMENT_PLAIN[i]}</span>
      <span class="el-track"><span class="el-fill" style="display:block;width:${(n / max) * 100}%;background:var(--${ELEMENTS[i]})"></span></span>
      <span class="n">${n}</span>
    </div>`).join('')}</div>`;
}

const defs = (rows, cls = '') => `<dl class="defs ${cls}">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;

function pairHtml(strengths, weak, boost) {
  return block(null, `<div class="two-col">
      <div><h3>강점</h3>${ul(strengths, 'good')}</div>
      <div><h3>약점</h3>${ul(weak, 'weak')}</div>
    </div>
    <div class="boost"><h3>보강하면 좋은 것</h3>${ul(boost, 'fix')}</div>`);
}

function flowHtml(items, title = '과거, 현재, 미래') {
  if (!items || !items.length) return '';
  return block(title, `<ol class="flow">${items.map((f) => `
    <li class="${f.tense}">
      <div class="f-head"><span class="f-label">${esc(f.label)}</span><span class="t-years">${esc(f.range)}, ${esc(f.years)}</span>${pill(f.score)}</div>
      <p>${esc(f.text)}</p>
    </li>`).join('')}</ol>`);
}

function overallHtml() {
  const { R, D } = state;
  return [
    block(null, `<div class="ilju">
      <p class="ilju-nick">${esc(D.ilju.nick)}</p>
      <h3>${esc(D.ilju.title)}</h3>
      ${D.ilju.paras.map((t) => `<p>${esc(t)}</p>`).join('')}
    </div>`),
    block('한눈에 보기', `${chips(R.keywords)}<p class="summary">${esc(R.summary)}</p>`),
    block('당신은 이런 사람입니다', ul(R.persona)),
    pairHtml(R.strengths, R.weaknesses, R.boosts),
    block('인생의 흐름', `<p class="sub">10년 단위로 바뀌는 큰 흐름입니다. 지나온 시기는 돌아보고, 다가올 시기는 미리 준비해 보세요.</p>${timelineHtml()}`),
    block('지금 나의 상황', `<div class="prose">${R.now.map((t) => `<p>${esc(t)}</p>`).join('')}</div>`),
    timingBlock(D.overallTiming),
    block('타고난 특별한 기운', sinsalHtml()),
    block('나를 돕는 귀인', ul(R.noble)),
    block('운을 여는 생활 습관', `<p class="sub">가장 필요한 기운을 생활 속에서 채우는 방법입니다.</p>${defs(R.remedy, 'grid')}`),
    block('기운의 비율과 판단 근거', `${elementsHtml()}${defs(R.basis)}<p class="sub">모든 탭의 풀이는 위 판단을 같은 기준으로 사용합니다.</p>`),
    block(null, `<details class="glossary"><summary>사주 용어 풀이</summary>${defs(GLOSSARY)}</details>`),
  ].join('');
}

function monthsHtml(months) {
  const md = (ms) => { const d = new Date(ms + 9 * 3600e3); return `${d.getUTCMonth() + 1}.${d.getUTCDate()}`; };
  return `<ol class="month-list">${months.map((m) => `
    <li class="${m.current ? 'current' : ''}"${m.current ? ' aria-current="true"' : ''}>
      <div class="m-row">
        <span class="m-span">${md(m.start)} ~ ${md(m.end - 86400000)}${m.current ? '<span class="m-tag">이번 달</span>' : ''}</span>
        <span class="m-note">${esc(m.note)}</span>
        ${pill(m.score)}
      </div>
      <p class="m-why">${esc(m.why)}</p>
      <ul class="m-hints">${m.hints.map(([k, v]) => `<li><span>${k}</span>${esc(v)}</li>`).join('')}</ul>
      <p class="m-action">${esc(m.action)}</p>
    </li>`).join('')}</ol>`;
}

function domainHtml(d) {
  const secs = d.sections.map((sec) => {
    if (sec.kind === 'months') return block(sec.title, `<p class="sub">한 달의 시작은 절기(24절기 중 12절) 기준입니다.</p>${monthsHtml(sec.items)}`);
    if (sec.kind === 'years') return block(sec.title, yearCards(sec.items.map((a) => ({ ...a, showTheme: true })), ''));
    if (sec.kind === 'areas') {
      return block(sec.title, `<ul class="areas">${sec.items.map((a) => `
        <li><div class="area-head"><span class="area-label">${a.label}</span>${pill(a.score)}</div><p>${esc(a.text)}</p></li>`).join('')}</ul>`);
    }
    return block(sec.title, ul(sec.items));
  });
  return [
    block(d.title || null, `${chips(d.keywords)}<p class="summary">${esc(d.summary)}</p>`, 'lead'),
    d.pair ? pairHtml(d.pair.strengths, d.pair.weak, d.boost) : '',
    ...secs,
    flowHtml(d.flow),
    timingBlock(d.timing),
    d.advice ? block(null, `<p class="tip"><strong>조언</strong> ${esc(d.advice)}</p>`) : '',
    d.note ? `<p class="sub">${esc(d.note)}</p>` : '',
  ].join('');
}

function renderTabs() {
  const active = state.tab;
  $('tabs').innerHTML = TABS.map(([id, label]) =>
    `<button type="button" class="tab" role="tab" id="tab-${id}" aria-selected="${id === active}" aria-controls="panel" data-tab="${id}">${label}</button>`).join('');
  $('panel').setAttribute('aria-labelledby', `tab-${active}`);
  $('panel').innerHTML = active === 'overall' ? overallHtml() : domainHtml(state.D[active]);
}
function selectTab(id, focus) {
  state.tab = id;
  renderTabs();
  if (focus) $(`tab-${id}`).focus({ preventScroll: true });
  // 가로로 넘치는 탭 바에서 선택한 탭이 보이게 (세로 스크롤은 건드리지 않음)
  const bar0 = $('tabs'), t = $(`tab-${id}`);
  bar0.scrollTo({ left: t.offsetLeft - (bar0.clientWidth - t.offsetWidth) / 2, behavior: 'smooth' });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 탭 바가 화면 맨 위에 딱 붙도록: .reading 상단(= 탭 바의 원래 위치)을 뷰포트 상단에 맞춘다
  const bar = $('tabs');
  const mt = parseFloat(getComputedStyle(bar).marginTop) || 0;
  const top = window.scrollY + $('panel').parentElement.getBoundingClientRect().top + mt;
  window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
}
$('tabs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tab]');
  if (b && state) selectTab(b.dataset.tab, false);
});
$('tabs').addEventListener('keydown', (e) => {
  if (!['ArrowRight', 'ArrowLeft'].includes(e.key) || !state) return;
  const ids = TABS.map((t) => t[0]);
  const cur = ids.indexOf(state.tab);
  selectTab(ids[(cur + (e.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length], true);
});
$('panel').addEventListener('click', (e) => {
  if (e.target.closest('[data-action="more-life"]')) { state.lifeExpanded = true; renderTabs(); }
});

function renderChips() {
  $('answers').innerHTML = '';
  $('chips').innerHTML = QUESTIONS.map((q) => `<button type="button" class="chip" data-q="${q.id}" aria-pressed="false">${q.q}</button>`).join('');
}
$('chips').addEventListener('click', (e) => {
  const b = e.target.closest('[data-q]');
  if (!b || !state) return;
  const q = QUESTIONS.find((x) => x.id === b.dataset.q);
  const lines = answer(q.id, state.saju, state.an, state.R, state.year);
  // 한 번에 하나의 질문만: 이전 선택과 답변을 지우고 새 답변으로 교체
  for (const c of $('chips').querySelectorAll('[data-q]')) c.setAttribute('aria-pressed', String(c === b));
  const el = document.createElement('div');
  el.className = 'qa';
  el.innerHTML = `<div class="q">${esc(q.q)}</div><div class="a">${lines.map((l) => `<p>${esc(l)}</p>`).join('')}</div>`;
  $('answers').replaceChildren(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

/* ---------- 시작 ---------- */
if (fromHash()) {
  const inp = readForm();
  if (!inp.error) run(inp, false);
}
