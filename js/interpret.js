// 해석 규칙: 전통 명리 개념을 단순화해 쉬운 말로 풀어낸 규칙 기반 해석
import {
  STEMS, BRANCHES, STEMS_KO, BRANCHES_KO, ELEMENTS_KO, ELEMENTS_HANJA, BRANCH_ELEMENT, TEN_GODS, TEN_GOD_GROUP, ZODIAC,
  stemElement, tenGod, branchTenGod, isClash, isHarmony, harmonyOf, sinsal, collectSinsal, yearFortune, mod,
} from './core.js';

export const pillarName = (p) => `${STEMS[p.stem]}${BRANCHES[p.branch]}`;
export const pillarKo = (p) => `${STEMS_KO[p.stem]}${BRANCHES_KO[p.branch]}`;

// 조사: 마지막 한글 글자의 받침 여부로 선택 ('이/가', '과/와', '은/는', '을/를')
export function josa(word, pair) {
  const [withB, withoutB] = pair.split('/');
  const hangul = [...word].reverse().find((ch) => ch >= '가' && ch <= '힣');
  if (!hangul) return word + withB;
  return word + ((hangul.charCodeAt(0) - 0xac00) % 28 ? withB : withoutB);
}

/* ---------------- 쉬운 말 사전 ---------------- */

const ELEMENT_PLAIN = ['나무(성장)', '불(열정)', '흙(안정)', '쇠(결단)', '물(지혜)'];
const ELEMENT_KEYWORD = ['성장', '열정', '안정', '결단', '지혜'];
const STEM_COLOR = ['푸른', '푸른', '붉은', '붉은', '누런', '누런', '흰', '흰', '검은', '검은'];

const DAY_MASTER = [
  { image: '큰 나무', key: '곧은 리더', text: '곧게 위로 자라려는 기운입니다. 원칙과 자존심이 강하고 한번 정한 방향은 끝까지 밀고 나갑니다. 리더 역할이 잘 맞지만 굽히는 데 서툴러 충돌이 생기기도 합니다.' },
  { image: '꽃과 넝쿨', key: '유연한 생존가', text: '부드럽게 휘어지며 결국 원하는 곳까지 뻗어가는 기운입니다. 적응력과 생활력이 뛰어나고 사람 사이의 흐름을 잘 읽습니다. 겉은 유연해도 속은 끈질깁니다.' },
  { image: '태양', key: '밝은 분위기 메이커', text: '모두를 비추는 밝은 기운입니다. 솔직하고 표현이 크며 주변을 끌어당깁니다. 열정이 빨리 붙고 빨리 식는 편이라 꾸준함을 의식하면 좋습니다.' },
  { image: '촛불', key: '섬세한 몰입가', text: '어둠 속을 밝히는 섬세한 불입니다. 감수성과 집중력이 높고 한 사람, 한 분야에 깊이 몰입합니다. 겉보다 속이 뜨거운 타입입니다.' },
  { image: '큰 산', key: '믿음직한 중심', text: '움직이지 않는 산의 기운입니다. 신뢰감과 포용력이 있고 중심을 잡아줍니다. 변화에 느리게 반응하는 만큼 결정 전에 고민이 깁니다.' },
  { image: '기름진 땅', key: '실속 있는 살림꾼', text: '무엇이든 길러내는 밭의 기운입니다. 실속 있고 세심하며 사람을 챙깁니다. 걱정이 많아지기 쉬우니 스스로를 돌보는 일도 챙겨야 합니다.' },
  { image: '바위와 쇠', key: '의리의 결단가', text: '단단한 원석의 기운입니다. 결단력과 의리가 강하고 옳고 그름이 분명합니다. 말이 직설적이라 의도보다 강하게 전달될 수 있습니다.' },
  { image: '보석', key: '기준 높은 완벽주의자', text: '다듬어진 보석의 기운입니다. 섬세하고 깔끔하며 자기 기준이 높습니다. 인정받을 때 빛나고, 비판에는 예민한 편입니다.' },
  { image: '바다와 강', key: '자유로운 전략가', text: '넓게 흐르는 큰 물의 기운입니다. 생각의 폭이 넓고 지혜롭고 자유를 중시합니다. 한곳에 묶이는 것을 답답해합니다.' },
  { image: '비와 이슬', key: '조용한 직관가', text: '스며드는 작은 물의 기운입니다. 직관이 좋고 배려심이 깊으며 조용히 상황을 바꿉니다. 생각이 많아 결정을 미루기도 합니다.' },
];

// 십성 그룹을 쉬운 말로
const GROUP = {
  비겁: {
    theme: '자립과 경쟁', key: '독립심',
    flow: '독립심이 커지고 동료, 경쟁자와 부딪히며 내 자리를 만드는 흐름',
    strength: '스스로 일어서는 힘과 끝까지 버티는 근성이 있습니다.',
    over: '고집과 경쟁심이 지나치면 사람과 돈을 함께 잃기 쉽습니다.',
    lack: '혼자 밀어붙이는 힘이 약해 주변 분위기에 휩쓸리기 쉽습니다. 내 편이 되어줄 사람을 꾸준히 만들어 두세요.',
  },
  식상: {
    theme: '표현과 도전', key: '창의력',
    flow: '하고 싶은 것을 드러내고 새로운 일을 벌이며 재능을 시험하는 흐름',
    strength: '아이디어와 표현력, 손재주가 좋아 무언가를 만들어내는 힘이 있습니다.',
    over: '말이 앞서거나 일을 너무 많이 벌이면 마무리가 어렵습니다.',
    lack: '생각을 밖으로 드러내는 데 서툴러 실력만큼 인정받지 못할 수 있습니다. 결과물을 자주 보여주는 습관이 필요합니다.',
  },
  재성: {
    theme: '돈과 현실', key: '현실 감각',
    flow: '돈, 일의 성과, 현실적인 문제가 삶의 중심이 되는 흐름',
    strength: '현실 감각과 계산이 빠르고 기회를 돈으로 바꾸는 감각이 있습니다.',
    over: '돈과 결과에 매이면 사람과 건강을 놓치기 쉽습니다.',
    lack: '돈 관리와 손익 계산에 약할 수 있습니다. 자동 저축처럼 구조로 보완하세요.',
  },
  관성: {
    theme: '책임과 성취', key: '책임감',
    flow: '조직, 직장, 사회적 책임이 커지고 평가와 승진이 걸린 흐름',
    strength: '책임감이 강하고 규칙을 지켜 조직에서 신뢰를 얻습니다.',
    over: '부담과 압박을 스스로 키워 쉽게 지칠 수 있습니다.',
    lack: '틀에 얽매이는 것을 싫어해 조직 생활이 답답할 수 있습니다. 자율성이 보장되는 환경이 맞습니다.',
  },
  인성: {
    theme: '배움과 준비', key: '학습력',
    flow: '공부, 자격, 문서, 도와주는 사람이 중심이 되는 흐름',
    strength: '이해력과 학습 능력이 좋고 주변의 도움을 잘 끌어옵니다.',
    over: '생각과 준비가 길어져 실행이 늦어지기 쉽습니다.',
    lack: '꾸준히 배우는 힘이 약하고 도움을 청하는 데 서툽니다. 믿을 만한 조언자를 두면 큰 힘이 됩니다.',
  },
};

const POS_LABEL = { year: '연주', month: '월주', day: '일주', hour: '시주' };
const POS_AREA = { year: '어린 시절과 집안', month: '사회생활과 부모', day: '나 자신과 배우자', hour: '자녀와 노년' };

// 신살 쉬운 설명
const SINSAL = {
  천을귀인: { name: '귀인의 별', good: true, text: '어려울 때 도와주는 사람이 나타나는 복이 있습니다. 위기에서도 결국 길이 열리는 편입니다.' },
  문창귀인: { name: '글과 학문의 별', good: true, text: '머리가 좋고 글, 말, 공부로 인정받기 쉽습니다. 시험과 자격에 유리합니다.' },
  도화: { name: '매력의 별', good: true, text: '사람을 끄는 매력과 인기가 있습니다. 대중 앞에 서는 일, 사람을 상대하는 일에서 빛납니다. 이성 문제로 구설이 생기지 않게 주의하세요.' },
  홍염: { name: '은은한 매력', good: true, text: '꾸미지 않아도 풍기는 분위기가 있어 이성에게 호감을 얻기 쉽습니다.' },
  역마: { name: '움직임의 별', good: true, text: '한곳에 머물기보다 이동하고 돌아다닐 때 일이 풀립니다. 출장, 해외, 이사, 이동이 많은 일과 인연이 있습니다.' },
  화개: { name: '예술과 사색의 별', good: true, text: '예술적 감각과 깊은 사색을 즐기는 성향입니다. 종교, 철학, 예술, 연구에 끌리며 혼자만의 시간이 필요합니다.' },
  양인: { name: '강한 칼날', good: false, text: '추진력과 승부욕이 매우 강합니다. 잘 쓰면 큰일을 해내지만 다툼, 부상, 성급한 결정은 조심해야 합니다.' },
  괴강: { name: '우두머리 기질', good: false, text: '카리스마와 결단력이 강해 큰 조직을 이끄는 힘이 있습니다. 대신 기복이 크고 고집이 세다는 평을 듣기 쉽습니다.' },
  백호: { name: '강한 기운', good: false, text: '에너지가 강하고 일을 밀어붙이는 힘이 있습니다. 급한 성격과 사고, 건강 관리에 주의가 필요합니다.' },
  공망: { name: '비어 있는 자리', good: false, text: '이 자리에 해당하는 일은 기대만큼 채워지지 않거나 마음을 비울 때 오히려 풀립니다.' },
  원진: { name: '미묘한 갈등', good: false, text: '이 자리와 나 사이에 이유 없는 서운함, 오해가 생기기 쉽습니다. 말로 확인하는 습관이 필요합니다.' },
  충: { name: '부딪힘', good: false, text: '이 자리와 내가 부딪히는 구조라 변화와 이동이 많습니다. 갈등이 있지만 그만큼 정체되지 않습니다.' },
};

const HEALTH = ['간, 눈, 근육과 관절', '심장, 혈압, 혈액순환', '위장과 소화기', '폐, 기관지, 피부', '신장, 방광, 허리'];
const LUCKY = [
  { color: '초록, 청록', dir: '동쪽', num: '3, 8', season: '봄', act: '산책, 식물 키우기, 새로운 공부' },
  { color: '빨강, 보라', dir: '남쪽', num: '2, 7', season: '여름', act: '운동, 햇볕 쬐기, 사람들 앞에 나서기' },
  { color: '노랑, 갈색', dir: '중앙', num: '5, 10', season: '환절기', act: '규칙적인 생활, 등산, 정리정돈' },
  { color: '흰색, 은색', dir: '서쪽', num: '4, 9', season: '가을', act: '정리, 계획 세우기, 악기 연주' },
  { color: '검정, 남색', dir: '북쪽', num: '1, 6', season: '겨울', act: '독서, 명상, 물가 산책' },
];
const CAREER = {
  비겁: '개인 사업, 프리랜서, 스포츠, 영업처럼 스스로 성과를 내는 일',
  식상: '기획, 콘텐츠, 디자인, 개발, 교육, 요리처럼 결과물이 보이는 일',
  재성: '사업, 유통, 금융, 마케팅, 관리처럼 숫자와 성과가 분명한 일',
  관성: '공공기관, 대기업, 법률, 관리직처럼 체계 있는 조직의 일',
  인성: '연구, 교육, 의료, 상담처럼 전문 지식과 자격이 중요한 일',
};

/* ---------------- 공통 계산 ---------------- */

export const groupOfStem = (ds, s) => TEN_GOD_GROUP[tenGod(ds, s)];
export const groupOfBranch = (ds, b) => TEN_GOD_GROUP[branchTenGod(ds, b)];

// 운의 오행이 용신/기신과 맞는지 (-2 ~ +2)
export function luckScore(an, stem, branch) {
  let s = 0;
  const se = stemElement(stem), be = BRANCH_ELEMENT[branch];
  if (se === an.yongsin) s += 1; if (be === an.yongsin) s += 1;
  if (se === an.gisin) s -= 1; if (be === an.gisin) s -= 1;
  return s;
}
export const scoreWord = (s) => (s >= 2 ? '아주 좋음' : s === 1 ? '좋음' : s === 0 ? '보통' : s === -1 ? '주의' : '신중');
const scoreAdj = (s) => (s >= 2 ? '아주 좋은' : s === 1 ? '좋은' : s === 0 ? '무난한' : s === -1 ? '조심이 필요한' : '신중해야 할');
const moodOf = (s) => (s >= 1 ? '순탄하고 기회가 많은' : s === 0 ? '좋고 나쁨이 섞인' : '애쓰는 만큼 고단함도 따르는');

export function koreanAge(saju, year) { return year - saju.input.year + 1; }

export function currentDaewoon(saju, year) {
  const age = koreanAge(saju, year);
  let cur = null;
  for (const d of saju.daewoon.list) if (age >= d.age) cur = d;
  return cur;
}

const yearName = (p) => `${STEM_COLOR[p.stem]} ${ZODIAC[p.branch]}의 해`;
const ageRange = (d) => `${d.age}~${d.age + 9}세`;
const yearRange = (d) => `${d.startYear}~${d.startYear + 9}년`;

// 운에 들어오는 오행이 내 사주에 미치는 영향 (이유 설명)
export function elementEffect(an, stem, branch, tense = 'present') {
  const se = stemElement(stem), be = BRANCH_ELEMENT[branch];
  const els = [...new Set([se, be])];
  const v = { past: ['들어와', '풀렸을', '했을'], present: ['들어와', '풀리기', '하기'], future: ['들어와', '풀리기', '하기'] }[tense];
  const out = [];
  const yong = els.filter((e) => e === an.yongsin);
  const gi = els.filter((e) => e === an.gisin);
  if (yong.length) out.push(`내게 부족한 ${ELEMENT_PLAIN[an.yongsin]}의 기운이 ${v[0]} 막혀 있던 일이 ${tense === 'past' ? '풀렸을 가능성이 큽니다' : '풀리기 쉽습니다'}.`);
  if (gi.length) out.push(`이미 넉넉한 ${ELEMENT_PLAIN[an.gisin]}의 기운이 더해져 ${tense === 'past' ? '무리하거나 한쪽으로 치우쳤을 수 있습니다' : '무리하거나 한쪽으로 치우치기 쉽습니다'}.`);
  if (!yong.length && !gi.length) out.push(`${els.length === 2 ? `${josa(ELEMENT_PLAIN[els[0]], '과/와')} ${ELEMENT_PLAIN[els[1]]}` : ELEMENT_PLAIN[els[0]]}의 기운이 들어오지만 내 사주의 균형을 크게 흔들지는 않습니다.`);
  return out.join(' ');
}

const PERIOD_ADVICE = {
  비겁: '사람을 가려 사귀고 돈 거래와 보증은 피하는 것이 좋습니다.',
  식상: '하고 싶은 일을 작게라도 시작해 결과물로 남기는 것이 좋습니다.',
  재성: '들어오는 만큼 지출 계획을 세우고 무리한 투자는 나눠서 하는 것이 좋습니다.',
  관성: '책임을 피하지 말고 자격과 평판을 쌓는 데 힘을 쓰는 것이 좋습니다.',
  인성: '배움과 자격에 투자하고 도와주는 사람과의 관계를 소중히 하는 것이 좋습니다.',
};

// 대운 한 구간 해석 (tense: past | present | future)
function periodText(saju, an, d, tense) {
  const ds = saju.pillars.day.stem, db = saju.pillars.day.branch;
  const g1 = groupOfStem(ds, d.stem), g2 = groupOfBranch(ds, d.branch);
  const sc = luckScore(an, d.stem, d.branch);
  const end = { past: '이었습니다', present: '입니다', future: '이 될 것입니다' }[tense];
  const themes = g1 === g2 ? GROUP[g1].theme : `${GROUP[g1].theme}, ${GROUP[g2].theme}`;
  const parts = [`${themes}의 시기. ${GROUP[g2].flow}${end}.`];
  if (g1 !== g2) parts.push(`앞 5년은 ${GROUP[g1].theme}, 뒤 5년은 ${GROUP[g2].theme}의 색이 더 짙${tense === 'past' ? '었습니다' : '습니다'}.`);
  const mood = { past: `전반적으로 ${moodOf(sc)} 시기였습니다.`, present: `전반적으로 ${moodOf(sc)} 시기입니다.`, future: `전반적으로 ${moodOf(sc)} 시기로 보입니다.` }[tense];
  parts.push(mood, elementEffect(an, d.stem, d.branch, tense));
  if (isClash(d.branch, db)) parts.push({ past: '나와 부딪히는 기운이라 거주지, 직장, 관계에 큰 변화가 있었을 가능성이 높습니다.', present: '나와 부딪히는 기운이라 거주지, 직장, 관계에 큰 변화가 생기기 쉬운 때입니다.', future: '나와 부딪히는 기운이라 거주지, 직장, 관계에 큰 변화가 올 수 있습니다.' }[tense]);
  if (isHarmony(d.branch, db)) parts.push({ past: '나와 잘 맞는 기운이라 좋은 인연이나 협력자를 만났을 가능성이 높습니다.', present: '나와 잘 맞는 기운이라 좋은 인연과 협력자가 들어오는 때입니다.', future: '나와 잘 맞는 기운이라 좋은 인연과 협력자가 들어올 것입니다.' }[tense]);
  const advice = tense === 'past' ? null : PERIOD_ADVICE[g2];
  return { range: ageRange(d), years: yearRange(d), title: themes, text: parts.join(' '), advice, score: sc, tense };
}

/* ---------------- 종합 해석 ---------------- */

export function buildReading(saju, an, nowYear, nowMs = Date.now()) {
  const P = saju.pillars;
  const ds = P.day.stem, db = P.day.branch;
  const de = stemElement(ds);
  const dm = DAY_MASTER[ds];
  const male = saju.input.gender === 'M';
  const sins = collectSinsal(P);
  const groups = Object.entries(an.groupScore).sort((a, b) => b[1] - a[1]);
  const topGroup = groups[0][0];
  const maxE = an.elemCount.indexOf(Math.max(...an.elemCount));
  const lacksE = an.elemCount.map((c, i) => (c === 0 ? i : -1)).filter((i) => i >= 0);
  const yf = yearFortune(nowYear);
  const cur = currentDaewoon(saju, nowYear);
  const R = { yearFortune: yf, sinsal: sins };

  /* 한눈에 보기 */
  const goodSins = [...new Set(sins.filter((s) => SINSAL[s.key].good).map((s) => SINSAL[s.key].name))];
  R.keywords = [dm.key, `${josa(GROUP[topGroup].key, '이/가')} 강함`, `${josa(ELEMENT_KEYWORD[an.yongsin], '이/가')} 필요함`, ...goodSins.slice(0, 2)];
  R.summary = `${dm.image}의 기운을 타고난 사람입니다. ${dm.text}`;

  /* 강점과 보완점 */
  const strengths = [], weaknesses = [];
  strengths.push(GROUP[topGroup].strength);
  if (groups[1][1] >= 2) strengths.push(GROUP[groups[1][0]].strength);
  if (an.strength === '신강') strengths.push('기본 체력과 정신력이 강해 위기에서 쉽게 무너지지 않습니다.');
  else if (an.strength === '신약') strengths.push('주변과 협력하고 도움을 받아들이는 유연함이 있어 사람을 통해 성장합니다.');
  else strengths.push('기운이 고르게 균형 잡혀 있어 어느 환경에서든 무난하게 적응합니다.');
  for (const s of sins) if (SINSAL[s.key].good && !strengths.some((t) => t.startsWith(SINSAL[s.key].name))) {
    strengths.push(`${SINSAL[s.key].name}: ${SINSAL[s.key].text.split('.')[0]}.`);
  }
  if (groups[0][1] >= 4) weaknesses.push(GROUP[topGroup].over);
  for (const [g, v] of groups) if (v === 0) weaknesses.push(GROUP[g].lack);
  if (an.elemCount[maxE] >= 4) weaknesses.push(`${josa(ELEMENT_PLAIN[maxE], '이/가')} 지나치게 많아 그 성향이 극단으로 흐르기 쉽습니다. 반대 성향의 사람, 활동으로 균형을 맞추세요.`);
  for (const e of lacksE) weaknesses.push(`${josa(ELEMENT_PLAIN[e], '이/가')} 없어 ${ELEMENT_KEYWORD[e]}의 힘을 의식적으로 채워야 합니다.`);
  if (an.strength === '신약') weaknesses.push('혼자 많은 것을 짊어지면 쉽게 지칩니다. 일과 관계에서 경계를 정해두는 것이 중요합니다.');
  if (an.strength === '신강' && groups[0][0] === '비겁') weaknesses.push('내 방식이 옳다는 확신이 강해 다른 의견을 놓치기 쉽습니다.');
  for (const s of sins) if (['양인', '백호', '괴강'].includes(s.key) && !weaknesses.some((t) => t.startsWith(SINSAL[s.key].name))) {
    weaknesses.push(`${SINSAL[s.key].name}: ${SINSAL[s.key].text.split('.').slice(1).join('.').trim()}`);
  }
  R.strengths = strengths.slice(0, 5);
  R.weaknesses = weaknesses.length ? weaknesses.slice(0, 5) : ['크게 치우친 부분이 없습니다. 지금의 균형을 유지하는 생활 습관이 가장 중요합니다.'];
  R.yongsinTip = `나에게 가장 필요한 기운은 ${ELEMENT_PLAIN[an.yongsin]}입니다. ${LUCKY[an.yongsin].act} 같은 활동이 운을 돕습니다.`;

  /* 과거, 현재, 미래 */
  const list = saju.daewoon.list;
  const curIdx = cur ? list.indexOf(cur) : -1;
  const past = [];
  const yearChar = { year: P.year, month: P.month };
  if (saju.daewoon.startAge > 1) past.push({
    range: saju.daewoon.startAge === 2 ? '1세' : `1~${saju.daewoon.startAge - 1}세`,
    years: saju.daewoon.startAge === 2 ? `${saju.input.year}년` : `${saju.input.year}~${saju.input.year + saju.daewoon.startAge - 2}년`,
    title: '타고난 환경',
    text: `어린 시절은 ${GROUP[groupOfStem(ds, yearChar.year.stem)].theme}의 분위기 속에서 자랐습니다. ${sins.some((s) => s.pos === 'year' && ['충', '원진', '공망'].includes(s.key)) ? '집안 환경에 변화가 있었거나 일찍 독립심을 길렀을 가능성이 큽니다.' : '집안의 기운과 크게 부딪히지 않고 비교적 안정적으로 자랐을 가능성이 큽니다.'}`,
    score: 0, tense: 'past',
  });
  for (let i = 0; i < curIdx; i++) past.push(periodText(saju, an, list[i], 'past'));
  R.past = past;
  R.present = cur ? periodText(saju, an, cur, 'present') : null;
  R.future = list.slice(curIdx + 1, curIdx + 3).map((d) => periodText(saju, an, d, 'future'));
  R.timeline = [...past, ...(R.present ? [R.present] : []), ...list.slice(curIdx + 1).map((d) => periodText(saju, an, d, 'future'))];

  // 현재 상황 종합
  const yg1 = groupOfStem(ds, yf.stem), yg2 = groupOfBranch(ds, yf.branch);
  const ysc = luckScore(an, yf.stem, yf.branch);
  const nowLines = [];
  if (cur) nowLines.push(`지금은 ${ageRange(cur)}의 10년 흐름 안에 있습니다. 이 시기의 중심 주제는 ${R.present.title}입니다.`);
  else nowLines.push(`아직 첫 번째 큰 흐름(${saju.daewoon.startAge}세 시작)에 들어서기 전입니다. 타고난 기운이 그대로 드러나는 시기입니다.`);
  nowLines.push(`${nowYear}년은 ${yearName(yf)}입니다. 나에게는 ${GROUP[yg1].theme}${yg2 !== yg1 ? `, ${GROUP[yg2].theme}` : ''}의 기운이 들어오는 ${scoreAdj(ysc)} 해입니다.`);
  if (cur) {
    const big = luckScore(an, cur.stem, cur.branch);
    if (big >= 1 && ysc >= 1) nowLines.push('큰 흐름과 올해 흐름이 모두 좋습니다. 미뤄두었던 일을 실행에 옮기기 좋은 때입니다.');
    else if (big >= 1 && ysc < 1) nowLines.push('큰 흐름은 좋지만 올해는 숨 고르기가 필요합니다. 무리한 확장보다 다음 해를 준비하세요.');
    else if (big < 1 && ysc >= 1) nowLines.push('큰 흐름은 다소 무겁지만 올해는 숨통이 트이는 해입니다. 이때 기반을 다져두면 좋습니다.');
    else if (big < 0 && ysc < 0) nowLines.push('큰 흐름과 올해 모두 힘을 아껴야 하는 때입니다. 큰 결정은 신중하게, 건강과 관계를 먼저 챙기세요.');
    else nowLines.push('큰 흐름이 다소 무거운 가운데 올해는 무리만 하지 않으면 큰 탈이 없는 해입니다. 새로 벌이기보다 기반을 다지는 데 집중하세요.');
  }
  R.now = nowLines;

  // 앞으로 10년 중 좋은 해, 조심할 해
  const ahead = [];
  for (let y = nowYear; y < nowYear + 10; y++) {
    const f = yearFortune(y);
    let s = luckScore(an, f.stem, f.branch);
    if (isClash(f.branch, db)) s -= 1;
    if (isHarmony(f.branch, db)) s += 1;
    ahead.push({ y, s, f });
  }
  R.goodYears = [...ahead].sort((a, b) => b.s - a.s || a.y - b.y).slice(0, 3).sort((a, b) => a.y - b.y);
  R.cautionYears = [...ahead].filter((a) => a.s < 0).sort((a, b) => a.s - b.s || a.y - b.y).slice(0, 2).sort((a, b) => a.y - b.y);
  R.yearReason = (a) => {
    const g = groupOfBranch(ds, a.f.branch);
    if (isClash(a.f.branch, db)) return a.s >= 0 ? '변화 속에서 기회가 오는 해' : '변화와 이동이 많은 해';
    if (isHarmony(a.f.branch, db)) return '좋은 인연과 협력이 들어오는 해';
    return `${GROUP[g].theme}의 해`;
  };

  /* 분야별 */
  const T = {};
  T.overall = [
    R.summary,
    an.strength === '신강'
      ? '타고난 힘이 강한 사주입니다. 자기 주관이 뚜렷하고 버티는 힘이 좋아, 그 에너지를 밖으로 써서 성과로 바꿀 때 운이 풀립니다.'
      : an.strength === '신약'
        ? '타고난 힘이 섬세한 사주입니다. 혼자 다 짊어지기보다 사람, 공부, 조직의 도움을 받을 때 오히려 크게 성장합니다.'
        : '기운이 고르게 균형 잡힌 사주입니다. 큰 굴곡 없이 상황에 맞게 중심을 잡는 힘이 있습니다.',
    `삶에서 자주 반복되는 주제는 ${GROUP[topGroup].theme}입니다.`,
    R.yongsinTip,
  ];

  T.year = [...nowLines.slice(1)];
  if (yg1 !== yg2) T.year.push(`상반기에는 ${GROUP[yg1].theme}, 하반기에는 ${GROUP[yg2].theme}의 기운이 더 강하게 작용합니다.`);
  T.year.push(`${GROUP[yg2].flow}의 해입니다.`);
  if (isClash(yf.branch, db)) T.year.push('나와 부딪히는 해라 이사, 이직, 관계 변화가 생기기 쉽습니다. 큰 결정은 서두르지 마세요.');
  if (isClash(yf.branch, P.year.branch)) T.year.push('집안이나 바깥 환경에 변화가 생겨 신경 쓸 일이 늘어납니다.');
  if (isHarmony(yf.branch, db)) T.year.push('나와 잘 맞는 해라 좋은 인연과 협력이 들어오기 쉽습니다.');
  const ys = [...sinsal(P.year.branch, yf.branch), ...sinsal(db, yf.branch)];
  if (ys.includes('도화')) T.year.push('사람의 시선이 모이고 이성 인연이 늘어나는 해입니다.');
  if (ys.includes('역마')) T.year.push('이동, 출장, 이사, 해외와 관련된 일이 생기기 쉬운 해입니다.');

  const g = an.groupScore;
  const wl = [];
  if (g.재성 === 0) wl.push('돈을 직접 쫓기보다 실력과 전문성을 쌓으면 돈이 따라오는 구조입니다. 이름값이 곧 수입이 되는 사주입니다.');
  else if (g.재성 >= 3 && an.strength === '신약') wl.push('돈이 보이는 기회는 많지만 그만큼 감당할 체력과 관리가 관건입니다. 크게 벌이기보다 지키는 전략이 맞습니다.');
  else if (g.재성 >= 2 && an.strength !== '신약') wl.push('재물을 감당할 힘이 있어 돈의 그릇이 큰 편입니다. 적극적으로 기회를 잡을 때 성과가 납니다.');
  else wl.push('성실하게 모으는 재물운입니다. 꾸준한 수입 구조를 만드는 것이 핵심입니다.');
  if (g.식상 >= 2 && g.재성 > 0) wl.push('재능과 기술이 돈으로 이어지는 흐름이 있어 부업, 콘텐츠, 전문 기술로 버는 데 유리합니다.');
  if (g.비겁 >= 3) wl.push('돈이 들어와도 사람을 통해 나가기 쉽습니다. 동업, 보증, 돈 거래는 피하세요.');
  wl.push(`올해 재물 흐름: ${[yg1, yg2].includes('재성') ? '수입 기회가 뚜렷한 해입니다.' : [yg1, yg2].includes('식상') ? '일을 벌일수록 돈으로 이어지는 해입니다.' : [yg1, yg2].includes('비겁') ? '지출과 경쟁이 늘어나는 해입니다. 큰돈은 묶어두세요.' : '큰 변화보다 유지와 관리에 집중할 해입니다.'}`);
  T.wealth = wl;

  const loveGroup = male ? '재성' : '관성';
  const lv = [];
  lv.push(g[loveGroup] === 0
    ? '연애에 늦게 눈을 뜨거나, 인연이 저절로 오기보다 스스로 찾아나서야 하는 편입니다. 운에서 인연의 기운이 들어올 때가 기회입니다.'
    : g[loveGroup] >= 3
      ? '이성 인연이 많은 편입니다. 선택지가 많은 만큼 신중하게 고르는 것이 과제입니다.'
      : '인연이 자연스럽게 이어지는 편입니다.');
  if (sins.some((s) => s.key === '도화' || s.key === '홍염')) lv.push('사람을 끄는 매력이 있어 첫인상과 분위기로 호감을 얻습니다.');
  if (g.식상 >= 2) lv.push('표현이 풍부하고 연애에서 적극적인 편입니다.');
  if (g.인성 >= 3) lv.push('생각이 많아 먼저 다가가기를 망설이는 편입니다.');
  const yearLove = yg1 === loveGroup || yg2 === loveGroup;
  lv.push(`올해 연애 흐름: ${yearLove || ys.includes('도화') ? '새로운 만남의 가능성이 높은 해입니다.' : '새 인연보다 지금 관계를 깊게 하는 데 맞는 해입니다.'}`);
  T.love = lv;

  const SPOUSE = {
    비겁: '친구 같은 동등한 관계를 원합니다. 서로 독립적인 영역을 존중할 때 오래갑니다.',
    식상: '편안하고 다정한 관계를 만들지만, 솔직한 말이 상처가 되지 않게 말투를 챙기세요.',
    재성: '현실적이고 생활력 있는 배우자 인연입니다. 함께 경제적 기반을 쌓는 결혼입니다.',
    관성: '반듯하고 책임감 있는 배우자 인연입니다. 서로의 역할을 존중할 때 안정됩니다.',
    인성: '정신적 교감을 중시하고 서로 의지하는 관계입니다. 지나친 기대는 내려놓는 것이 좋습니다.',
  };
  const mr = [SPOUSE[groupOfBranch(ds, db)]];
  const others = [P.year, P.month, P.hour].filter(Boolean);
  if (others.some((p) => isClash(p.branch, db))) mr.push('결혼 생활에 변동이나 거리감이 생기기 쉬운 구조입니다. 각자의 시간과 공간을 인정하는 것이 오히려 도움이 됩니다.');
  if (others.some((p) => isHarmony(p.branch, db))) mr.push('가정을 안정시키려는 힘이 있어 결혼 후 생활이 차분해지는 편입니다.');
  const marriageYears = ahead.filter((a) => groupOfStem(ds, a.f.stem) === loveGroup || groupOfBranch(ds, a.f.branch) === loveGroup || isHarmony(a.f.branch, db)).map((a) => a.y);
  if (koreanAge(saju, nowYear) < 20) mr.push('아직 결혼을 논하기 이른 나이입니다. 위 내용은 타고난 배우자 성향으로 참고하세요.');
  else if (marriageYears.length) mr.push(`앞으로 10년 중 배우자 인연이 강해지는 해: ${marriageYears.join(', ')}년`);
  T.marriage = mr;

  T.career = [
    `가장 잘 맞는 방향은 ${CAREER[topGroup]}입니다.`,
    `여기에 ${josa(GROUP[groups[1][0]].key, '을/를')} 함께 쓰면 ${CAREER[groups[1][0]]}의 성격을 더할 수 있습니다.`,
    g.관성 === 0 ? '조직의 틀보다 자율성이 보장되는 환경에서 능력이 더 잘 드러납니다.' : '조직 안에서 책임 있는 자리를 맡을 때 인정받습니다.',
    sins.some((s) => s.key === '역마') ? '이동이 많거나 해외와 관련된 일에서 기회가 큽니다.' : null,
    sins.some((s) => s.key === '문창귀인') ? '글, 기획, 강의처럼 머리를 쓰는 일에서 두각을 나타냅니다.' : null,
  ].filter(Boolean);

  const weakE = an.elemCount.indexOf(Math.min(...an.elemCount));
  T.health = [
    `기운이 약한 쪽인 ${HEALTH[weakE]} 관리에 신경 쓰는 것이 좋습니다.`,
    an.elemCount[maxE] >= 4 ? `기운이 몰린 ${HEALTH[maxE]}에도 무리가 오기 쉽습니다.` : '기운이 한쪽으로 크게 치우치지 않아 기본 체력은 무난한 편입니다.',
    '명리학의 전통 해석이며 의학적 진단을 대신하지 않습니다.',
  ];
  R.tabs = T;

  /* 월별 흐름 (쉬운 말) */
  R.months = yf.months.map((m, i) => {
    let s = luckScore(an, m.stem, m.branch);
    if (isClash(m.branch, db)) s -= 1;
    if (isHarmony(m.branch, db)) s += 1;
    const end = i < 11 ? yf.months[i + 1].start : yearFortune(nowYear + 1).months[0].start;
    const mg = groupOfBranch(ds, m.branch);
    const note = isClash(m.branch, db) ? '변화와 다툼 주의' : isHarmony(m.branch, db) ? '인연과 협력' : GROUP[mg].theme;
    const se = stemElement(m.stem), be = BRANCH_ELEMENT[m.branch];
    const why = [GROUP[mg].flow + '이 강한 달입니다.'];
    if ([se, be].includes(an.yongsin)) why.push('부족한 기운이 채워져 일이 수월하게 풀립니다.');
    if ([se, be].includes(an.gisin)) why.push('넘치는 기운이 더해져 무리하거나 고집을 부리기 쉽습니다.');
    if (isClash(m.branch, db)) why.push('나와 부딪히는 달이라 계약, 이사, 다툼에 특히 신중하세요.');
    if (isHarmony(m.branch, db)) why.push('나와 잘 맞는 달이라 만남과 협력, 중요한 약속을 잡기 좋습니다.');
    return { start: m.start, end, score: Math.max(-2, Math.min(2, s)), note, why: why.join(' '), current: nowMs >= m.start && nowMs < end };
  });

  return R;
}

/* ---------------- 추가 질문 ---------------- */
const md = (ms) => { const d = new Date(ms + 9 * 3600e3); return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`; };
const monthSpan = (m) => `${md(m.start)}~${md(m.end - 86400000)}`;

export const QUESTIONS = [
  { id: 'caution', q: '올해 조심해야 할 달은?' },
  { id: 'good', q: '올해 가장 좋은 달은?' },
  { id: 'move', q: '이직이나 창업하기 좋은 시기는?' },
  { id: 'match', q: '나와 잘 맞는 사람은?' },
  { id: 'lucky', q: '행운의 색, 방향, 숫자는?' },
  { id: 'money', q: '돈을 모으려면 어떻게 해야 하나요?' },
];

export function answer(id, saju, an, R, nowYear) {
  const ds = saju.pillars.day.stem, db = saju.pillars.day.branch;
  switch (id) {
    case 'caution': {
      const bad = [...R.months].sort((a, b) => a.score - b.score).slice(0, 2);
      return [`${bad.map((m) => `${monthSpan(m)}(${m.note})`).join(', ')}이 상대적으로 부담이 큰 시기입니다.`,
        '이 시기에는 새로 벌이기보다 정리하고 점검하는 데 힘을 쓰세요. 계약과 큰 지출은 한 번 더 확인하는 것이 좋습니다.'];
    }
    case 'good': {
      const good = [...R.months].sort((a, b) => b.score - a.score).slice(0, 2);
      return [`${good.map((m) => `${monthSpan(m)}(${m.note})`).join(', ')}이 흐름이 좋은 시기입니다.`, '중요한 발표, 계약, 만남은 이 시기에 잡아보세요.'];
    }
    case 'move': {
      const out = [];
      for (let y = nowYear; y < nowYear + 5; y++) {
        const f = yearFortune(y);
        const gs = [groupOfStem(ds, f.stem), groupOfBranch(ds, f.branch)];
        const sc = luckScore(an, f.stem, f.branch);
        const tag = gs.includes('관성') ? '이직, 승진' : gs.includes('식상') || gs.includes('재성') ? '창업, 독립' : null;
        if (tag && sc >= 0) out.push(`${y}년: ${tag}에 유리 (${scoreWord(sc)})`);
      }
      return out.length ? ['앞으로 5년 중 변화를 시도하기 좋은 해입니다.', ...out] : ['앞으로 5년은 큰 이동보다 실력을 다지는 흐름입니다. 준비를 충분히 하고 다음 큰 흐름이 바뀌는 시기를 노려보세요.'];
    }
    case 'match': {
      const h = harmonyOf(db);
      const clash = mod(db + 6, 12);
      return [`${ZODIAC[h]}띠처럼 ${BRANCHES_KO[h]}(${BRANCHES[h]})의 기운이 강한 사람과 정서적으로 잘 맞습니다.`,
        `${ELEMENT_PLAIN[an.yongsin]}의 기운을 가진 사람, 예를 들어 ${josa(LUCKY[an.yongsin].act.split(',')[0], '을/를')} 즐기는 차분한 성향의 사람이 나에게 부족한 부분을 채워줍니다.`,
        `반대로 ${ZODIAC[clash]}의 기운이 강한 사람과는 부딪히기 쉬워 서로 이해하려는 노력이 더 필요합니다.`];
    }
    case 'lucky': {
      const l = LUCKY[an.yongsin];
      return [`나에게 힘이 되는 기운은 ${ELEMENT_PLAIN[an.yongsin]}입니다.`, `색: ${l.color}`, `방향: ${l.dir}`, `숫자: ${l.num}`, `기운이 좋은 계절: ${l.season}`, `도움이 되는 활동: ${l.act}`];
    }
    case 'money': {
      const g = an.groupScore;
      const tips = [];
      if (g.비겁 >= 3) tips.push('돈 거래와 동업을 피하고, 수입이 들어오면 바로 별도 계좌로 옮기세요.');
      if (g.식상 >= 2) tips.push('재능을 상품으로 만드는 부업이나 콘텐츠가 가장 확실한 돈길입니다.');
      if (g.재성 >= 3 && an.strength === '신약') tips.push('한 번에 크게 벌려 하지 말고 감당할 수 있는 규모로 나누어 굴리세요.');
      if (g.인성 >= 3) tips.push('자격증, 전문 지식이 수입으로 연결됩니다.');
      if (g.관성 >= 2) tips.push('안정적인 직장 소득을 기반으로 한 장기 저축이 맞습니다.');
      if (!tips.length) tips.push('수입과 지출을 기록하는 습관만으로도 재물운이 크게 좋아집니다.');
      return tips;
    }
    default: return [];
  }
}

export { SINSAL, POS_AREA, POS_LABEL, ELEMENT_PLAIN, ELEMENT_KEYWORD, STEM_COLOR, DAY_MASTER, GROUP, HEALTH, LUCKY, CAREER, yearName, scoreAdj };
