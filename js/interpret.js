// 해석 규칙: 전통 명리 개념을 단순화해 쉬운 말로 풀어낸 규칙 기반 해석
import {
  STEMS, BRANCHES, STEMS_KO, BRANCHES_KO, ELEMENTS_KO, ELEMENTS_HANJA, BRANCH_ELEMENT, TEN_GODS, TEN_GOD_GROUP, ZODIAC,
  stemElement, tenGod, branchTenGod, isClash, isHarmony, harmonyOf, sinsal, collectSinsal, yearFortune, mod,
  twelveStage, samjae, NOBLE,
} from './core.js';

export const pillarName = (p) => `${STEMS[p.stem]}${BRANCHES[p.branch]}`;
export const pillarKo = (p) => `${STEMS_KO[p.stem]}${BRANCHES_KO[p.branch]}`;

// 조사: 마지막 한글 글자의 받침 여부로 선택 ('이/가', '과/와', '은/는', '을/를')
export function josa(word, pair) {
  const [withB, withoutB] = pair.split('/');
  const hangul = [...word].reverse().find((ch) => ch >= '가' && ch <= '힣');
  if (!hangul) return word + withB;
  const jong = (hangul.charCodeAt(0) - 0xac00) % 28;
  if (pair === '으로/로' && jong === 8) return word + withoutB; // ㄹ 받침은 '로'
  return word + (jong ? withB : withoutB);
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
  { color: '초록, 청록', dir: '동쪽', num: '3, 8', season: '봄', act: '산책, 식물 키우기, 새로운 공부',
    food: '푸른 채소, 신맛 나는 과일', place: '숲, 공원, 식물이 많은 곳', item: '나무 소재 소품, 화분', habit: '아침 일찍 일어나 하루 계획 세우기' },
  { color: '빨강, 보라', dir: '남쪽', num: '2, 7', season: '여름', act: '운동, 햇볕 쬐기, 사람들 앞에 나서기',
    food: '쓴맛 나는 차, 붉은 과일', place: '햇볕이 잘 드는 곳, 사람이 모이는 곳', item: '조명, 향초', habit: '하루 30분 땀 흘리는 운동' },
  { color: '노랑, 갈색', dir: '중앙', num: '5, 10', season: '환절기', act: '규칙적인 생활, 등산, 정리정돈',
    food: '곡물, 단맛 나는 뿌리채소', place: '산, 고향, 넓은 들', item: '도자기, 흙빛 소품', habit: '정해진 시간에 먹고 자기' },
  { color: '흰색, 은색', dir: '서쪽', num: '4, 9', season: '가을', act: '정리, 계획 세우기, 악기 연주',
    food: '매운맛, 무와 배 같은 흰 음식', place: '잘 정돈된 공간, 서쪽 창가', item: '금속 액세서리, 시계', habit: '물건 정리와 일정 기록' },
  { color: '검정, 남색', dir: '북쪽', num: '1, 6', season: '겨울', act: '독서, 명상, 물가 산책',
    food: '검은콩, 해조류, 해산물', place: '바다, 강, 호수 근처', item: '유리 소품, 작은 수조', habit: '자기 전 10분 독서나 명상' },
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

/* ---------------- 판단 기준 (모든 탭이 같은 값을 참조) ---------------- */

// 오행 개수 -> 단계. 과다/부족 표현은 반드시 이 함수를 거친다
export const elemLevel = (n) => (n === 0 ? '없음' : n === 1 ? '적음' : n === 2 ? '보통' : n === 3 ? '많음' : '아주 많음');
// 용신/기신을 개수에 맞는 말로 부른다 (개수가 많은데 '부족한'이라고 하는 모순 방지)
export const yongName = (an) => `${an.elemCount[an.yongsin] <= 1 ? '부족한' : '나를 돕는'} ${ELEMENT_PLAIN[an.yongsin]}`;
export const giName = (an) => `${an.elemCount[an.gisin] >= 3 ? '이미 넘치는' : '균형을 흔드는'} ${ELEMENT_PLAIN[an.gisin]}`;

// 가장 약한/강한 오행 (동률이면 용신, 기신을 우선해 다른 탭의 설명과 맞춘다)
export function weakestElement(an) {
  const min = Math.min(...an.elemCount);
  return an.elemCount[an.yongsin] === min ? an.yongsin : an.elemCount.indexOf(min);
}
export function strongestElement(an) {
  const max = Math.max(...an.elemCount);
  return an.elemCount[an.gisin] === max ? an.gisin : an.elemCount.indexOf(max);
}

// 결정적 변형 선택: 같은 사주는 항상 같은 문장, 다른 사주는 다른 문장
export const pick = (arr, seed) => arr[mod(seed, arr.length)];

// 운에 들어오는 오행이 내 사주에 미치는 영향 (variant로 표현을 바꿔 반복을 줄인다)
export function elementEffect(an, stem, branch, tense = 'present', variant = 0) {
  const se = stemElement(stem), be = BRANCH_ELEMENT[branch];
  const els = [...new Set([se, be])];
  const past = tense === 'past';
  const out = [];
  if (els.includes(an.yongsin)) {
    out.push(pick([
      `${yongName(an)}의 기운이 들어와 막혀 있던 일이 ${past ? '풀렸을 가능성이 큽니다' : '풀리기 쉽습니다'}.`,
      `내게 필요한 ${ELEMENT_PLAIN[an.yongsin]}의 기운이 채워져 ${past ? '숨통이 트였을 것입니다' : '숨통이 트입니다'}.`,
      `${ELEMENT_PLAIN[an.yongsin]}의 기운이 균형을 잡아줘 ${past ? '애쓴 만큼 결과가 따랐을 것입니다' : '애쓴 만큼 결과가 따릅니다'}.`,
    ], variant));
  }
  if (els.includes(an.gisin)) {
    out.push(pick([
      `${giName(an)}의 기운이 더해져 ${past ? '무리하거나 한쪽으로 치우쳤을 수 있습니다' : '무리하거나 한쪽으로 치우치기 쉽습니다'}.`,
      `${ELEMENT_PLAIN[an.gisin]}의 기운이 겹쳐 ${past ? '욕심이나 고집이 일을 그르쳤을 수 있습니다' : '욕심이나 고집이 앞서기 쉽습니다'}.`,
      `기울어진 쪽으로 ${ELEMENT_PLAIN[an.gisin]}의 기운이 더 실려 ${past ? '피로가 쌓였을 수 있습니다' : '피로가 쌓이기 쉽습니다'}.`,
    ], variant));
  }
  if (!out.length) {
    const names = els.length === 2 ? `${josa(ELEMENT_PLAIN[els[0]], '과/와')} ${ELEMENT_PLAIN[els[1]]}` : ELEMENT_PLAIN[els[0]];
    out.push(`${names}의 기운이 들어오지만 내 사주의 균형을 크게 흔들지는 않습니다.`);
  }
  return out.join(' ');
}

// 12운성: 기운의 세기를 시기 단위로 풀어 쓴 말 (연도, 대운마다 달라져 문장 반복을 줄인다)
export const STAGE_PHASE = {
  장생: '새 출발의 기운이 싹트는', 목욕: '변화와 시행착오가 잦은', 관대: '의욕이 넘치고 나를 드러내는',
  건록: '내 힘으로 자리를 잡는', 제왕: '힘이 정점에 오르는', 쇠: '속도를 줄이고 경험으로 버티는',
  병: '마음이 여려지고 쉼이 필요한', 사: '한 가지를 깊이 파고드는', 묘: '모은 것을 거두고 지키는',
  절: '하나를 끊고 새로 시작하는', 태: '새로운 계획을 품는', 양: '도움 속에 천천히 힘을 기르는',
};

const PERIOD_ADVICE = {
  비겁: ['사람을 가려 사귀고 돈 거래와 보증은 피하는 것이 좋습니다.', '내 편을 만드는 데 힘을 쓰되, 동업은 계약서로 선을 그어두세요.'],
  식상: ['하고 싶은 일을 작게라도 시작해 결과물로 남기는 것이 좋습니다.', '아이디어를 머릿속에 두지 말고 밖으로 꺼내 시험해 보세요.'],
  재성: ['들어오는 만큼 지출 계획을 세우고 무리한 투자는 나눠서 하는 것이 좋습니다.', '기회가 많을수록 우선순위를 정해 한두 가지에 집중하세요.'],
  관성: ['책임을 피하지 말고 자격과 평판을 쌓는 데 힘을 쓰는 것이 좋습니다.', '맡은 자리에서 신뢰를 쌓되, 혼자 짊어지지 않도록 일을 나누세요.'],
  인성: ['배움과 자격에 투자하고 도와주는 사람과의 관계를 소중히 하는 것이 좋습니다.', '준비가 끝나기를 기다리기보다 배운 것을 바로 써보는 연습을 하세요.'],
};

// 대운 한 구간 해석 (tense: past | present | future)
function periodText(saju, an, d, tense, idx = 0) {
  const ds = saju.pillars.day.stem, db = saju.pillars.day.branch;
  const g1 = groupOfStem(ds, d.stem), g2 = groupOfBranch(ds, d.branch);
  const sc = luckScore(an, d.stem, d.branch);
  const stage = twelveStage(ds, d.branch);
  const end = { past: '이었습니다', present: '입니다', future: '이 될 것입니다' }[tense];
  const themes = g1 === g2 ? GROUP[g1].theme : `${GROUP[g1].theme}, ${GROUP[g2].theme}`;
  const parts = [`${GROUP[g2].flow}${end}.`];
  if (g1 !== g2) parts.push(`앞 5년은 ${GROUP[g1].theme}, 뒤 5년은 ${GROUP[g2].theme}의 색이 더 짙${tense === 'past' ? '었습니다' : '습니다'}.`);
  parts.push({ past: `에너지로 보면 ${STAGE_PHASE[stage]} 시기였고, 전반적으로 ${moodOf(sc)} 10년이었습니다.`,
    present: `에너지로 보면 ${STAGE_PHASE[stage]} 시기이고, 전반적으로 ${moodOf(sc)} 10년입니다.`,
    future: `에너지로 보면 ${STAGE_PHASE[stage]} 시기이며, 전반적으로 ${moodOf(sc)} 10년으로 보입니다.` }[tense]);
  parts.push(elementEffect(an, d.stem, d.branch, tense, idx));
  if (isClash(d.branch, db)) parts.push({ past: '나와 부딪히는 기운이라 거주지, 직장, 관계에 큰 변화가 있었을 가능성이 높습니다.', present: '나와 부딪히는 기운이라 거주지, 직장, 관계에 큰 변화가 생기기 쉬운 때입니다.', future: '나와 부딪히는 기운이라 거주지, 직장, 관계에 큰 변화가 올 수 있습니다.' }[tense]);
  if (isHarmony(d.branch, db)) parts.push({ past: '나와 잘 맞는 기운이라 좋은 인연이나 협력자를 만났을 가능성이 높습니다.', present: '나와 잘 맞는 기운이라 좋은 인연과 협력자가 들어오는 때입니다.', future: '나와 잘 맞는 기운이라 좋은 인연과 협력자가 들어올 것입니다.' }[tense]);
  const advice = tense === 'past' ? null : pick(PERIOD_ADVICE[g2], idx);
  return { range: ageRange(d), years: yearRange(d), title: themes, text: parts.join(' '), advice, score: sc, tense, stage };
}

/* ---------------- 성향 사전 ---------------- */

const PERSONA_OUT = {
  비겁: '밖에서는 당당하고 자기 주장이 분명한 사람으로 보입니다.',
  식상: '밖에서는 말이 잘 통하고 재치 있는 사람으로 보입니다.',
  재성: '밖에서는 현실적이고 일 처리가 빠른 사람으로 보입니다.',
  관성: '밖에서는 반듯하고 믿을 만한 사람으로 보입니다.',
  인성: '밖에서는 차분하고 생각이 깊은 사람으로 보입니다.',
};
const PERSONA_IN = {
  비겁: '속으로는 남에게 지기 싫어하고 내 영역을 지키려는 마음이 강합니다.',
  식상: '속으로는 하고 싶은 말과 해보고 싶은 일이 늘 많습니다.',
  재성: '속으로는 손해 보지 않으려는 계산이 빠르고 실속을 챙깁니다.',
  관성: '속으로는 스스로에게 엄격하고 남의 평가를 신경 씁니다.',
  인성: '속으로는 인정받고 이해받고 싶은 마음이 큽니다.',
};
const PERSONA_PEOPLE = {
  비겁: '사람들 사이에서는 동료이자 경쟁자로, 함께 뛰는 관계를 편하게 여깁니다.',
  식상: '사람들 사이에서는 분위기를 띄우고 아이디어를 내는 역할을 맡기 쉽습니다.',
  재성: '사람들 사이에서는 일을 정리하고 실속을 챙기는 역할을 맡습니다.',
  관성: '사람들 사이에서는 규칙을 지키고 책임을 지는 맏이 역할을 맡기 쉽습니다.',
  인성: '사람들 사이에서는 이야기를 들어주고 조언하는 역할을 맡기 쉽습니다.',
};
const PERSONA_STRESS = {
  신강: '스트레스를 받으면 더 강하게 밀어붙이거나 혼자 해결하려 듭니다. 한 박자 쉬어가는 연습이 필요합니다.',
  신약: '스트레스를 받으면 혼자 끌어안고 지치기 쉽습니다. 털어놓을 사람이 곁에 있을 때 회복이 빠릅니다.',
  중화: '스트레스를 받아도 비교적 빨리 균형을 되찾는 편입니다. 다만 참는 것이 습관이 되지 않게 하세요.',
};
// 보완점과 짝을 이루는 보강 방법
const GROUP_BOOST = {
  비겁: '혼자 버티기보다 같은 목표를 가진 사람과 함께하세요. 운동 모임이나 스터디처럼 꾸준히 만나는 관계가 힘이 됩니다.',
  식상: '생각을 결과물로 꺼내는 습관을 들이세요. 글, 기록, 발표처럼 밖으로 보여주는 활동이 운을 엽니다.',
  재성: '돈 관리를 의지가 아닌 구조로 만드세요. 자동 저축, 지출 기록 앱처럼 저절로 굴러가는 장치가 효과적입니다.',
  관성: '스스로 정한 규칙과 마감을 만들어 보세요. 작은 약속을 지키는 경험이 쌓이면 사회적 신뢰로 돌아옵니다.',
  인성: '믿을 만한 조언자와 꾸준히 배우는 습관을 만드세요. 책 한 권, 강의 하나를 끝까지 마치는 경험이 중요합니다.',
};

export const GLOSSARY = [
  ['일간', '태어난 날의 위 글자로, 사주에서 "나"를 뜻합니다.'],
  ['일주', '태어난 날의 두 글자입니다. 나 자신과 배우자 자리를 함께 봅니다.'],
  ['오행', '나무, 불, 흙, 쇠, 물 다섯 기운입니다. 서로 돕거나 누르며 균형을 이룹니다.'],
  ['신강, 신약', '나를 돕는 기운이 많으면 신강, 적으면 신약, 비슷하면 중화입니다. 좋고 나쁨이 아니라 성향의 차이입니다.'],
  ['용신', '내 사주의 균형을 맞춰주는 가장 필요한 기운입니다. 이 기운이 들어오는 시기가 대체로 좋습니다.'],
  ['기신', '이미 기울어진 쪽을 더 기울게 해 부담이 되는 기운입니다.'],
  ['십성', '나와 다른 글자의 관계를 열 가지로 나눈 것입니다. 이 풀이에서는 자립(비겁), 표현(식상), 재물(재성), 책임(관성), 배움(인성) 다섯 묶음으로 씁니다.'],
  ['대운', '10년마다 바뀌는 큰 운의 흐름입니다.'],
  ['세운, 월운', '해마다, 달마다 들어오는 운입니다. 대운이 계절이라면 세운은 날씨에 가깝습니다.'],
  ['12운성', '기운의 세기를 탄생부터 휴식까지 사람의 일생에 빗댄 열두 단계입니다.'],
  ['신살', '특정 글자 조합이 만드는 특별한 기운입니다. 매력, 이동, 귀인 같은 성향을 나타냅니다.'],
  ['합, 충', '서로 끌어당기는 관계(합)와 부딪히는 관계(충)입니다. 충은 나쁘기보다 변화가 크다는 뜻입니다.'],
  ['삼재', '띠를 기준으로 12년마다 돌아오는 3년의 조심할 시기입니다. 들어오는 해, 머무는 해, 나가는 해로 나뉩니다.'],
];

/* ---------------- 종합 해석 ---------------- */

export function buildReading(saju, an, nowYear, nowMs = Date.now()) {
  const P = saju.pillars;
  const ds = P.day.stem, db = P.day.branch;
  const de = stemElement(ds);
  const dm = DAY_MASTER[ds];
  const sins = collectSinsal(P);
  const groups = Object.entries(an.groupScore).sort((a, b) => b[1] - a[1]);
  const topGroup = groups[0][0];
  const maxE = strongestElement(an);
  const lacksE = an.elemCount.map((c, i) => (c === 0 ? i : -1)).filter((i) => i >= 0);
  const yf = yearFortune(nowYear);
  const cur = currentDaewoon(saju, nowYear);
  const seed = P.day.cycle * 7 + P.month.cycle;
  const R = { yearFortune: yf, sinsal: sins, seed };

  /* 한눈에 보기 */
  const goodSins = [...new Set(sins.filter((s) => SINSAL[s.key].good).map((s) => SINSAL[s.key].name))];
  R.keywords = [dm.key, `${josa(GROUP[topGroup].key, '이/가')} 강함`, `${josa(ELEMENT_KEYWORD[an.yongsin], '이/가')} 필요함`, ...goodSins.slice(0, 2)];
  R.summary = `당신은 ${dm.image}의 기운을 타고났습니다. ${dm.text}`;

  /* 성향 */
  R.persona = [
    PERSONA_OUT[groupOfStem(ds, P.month.stem)],
    PERSONA_IN[groupOfBranch(ds, db)],
    PERSONA_PEOPLE[topGroup],
    PERSONA_STRESS[an.strength],
  ];

  /* 판단 근거: 이후 모든 탭이 이 값을 그대로 쓴다 */
  const monthSupports = [de, mod(de - 1, 5)].includes(BRANCH_ELEMENT[P.month.branch]);
  const elStr = an.elemCount.map((n, i) => `${ELEMENTS_KO[i]} ${n}`).join(', ');
  R.basis = [
    ['나를 뜻하는 글자', `${STEMS_KO[ds]}${ELEMENTS_KO[de]}(${STEMS[ds]}), ${dm.image}`],
    ['힘의 세기', `${an.strength}. 나를 돕는 기운의 비중 ${Math.round(an.ratio * 100)}%, 태어난 달의 기운이 나를 ${monthSupports ? '돕습니다' : '돕지 않습니다'}`],
    ['오행 분포', `${elStr}${saju.pillars.hour ? '' : ' (시각을 몰라 여섯 글자 기준)'}`],
    ['가장 많은 기운', `${ELEMENT_PLAIN[maxE]} ${an.elemCount[maxE]}개 (${elemLevel(an.elemCount[maxE])})`],
    ['없는 기운', lacksE.length ? lacksE.map((e) => ELEMENT_PLAIN[e]).join(', ') : '없음. 다섯 기운을 모두 갖췄습니다'],
    ['가장 필요한 기운', `${ELEMENT_PLAIN[an.yongsin]}. ${an.strength === '신약' ? '힘이 약한 편이라 나를 돕는 기운 중 가장 적은 것을 골랐습니다' : '힘이 충분한 편이라 기운을 밖으로 쓰게 하는 것 중 가장 적은 것을 골랐습니다'}`],
    ['조심할 기운', `${ELEMENT_PLAIN[an.gisin]}. ${an.strength === '신약' ? '힘을 빼는 기운 중 가장 많은 것입니다' : '나를 더 강하게 만드는 기운 중 가장 많은 것입니다'}`],
  ];

  /* 강점, 보완점, 보강법 */
  const strengths = [], weaknesses = [], boosts = [];
  strengths.push(GROUP[topGroup].strength);
  if (groups[1][1] >= 2) strengths.push(GROUP[groups[1][0]].strength);
  if (an.strength === '신강') strengths.push('기본 체력과 정신력이 강해 위기에서 쉽게 무너지지 않습니다.');
  else if (an.strength === '신약') strengths.push('주변과 협력하고 도움을 받아들이는 유연함이 있어 사람을 통해 성장합니다.');
  else strengths.push('기운이 고르게 균형 잡혀 있어 어느 환경에서든 무난하게 적응합니다.');
  for (const s of sins) if (SINSAL[s.key].good && !strengths.some((t) => t.startsWith(SINSAL[s.key].name))) {
    strengths.push(`${SINSAL[s.key].name}: ${SINSAL[s.key].text.split('.')[0]}.`);
  }
  if (groups[0][1] >= 4) { weaknesses.push(GROUP[topGroup].over); boosts.push(`${GROUP[topGroup].theme}에 쏠린 힘을 나누세요. 잘하는 것만 반복하기보다 반대 성향의 일, 사람과 일부러 섞이는 것이 균형을 잡아줍니다.`); }
  for (const [g, v] of groups) if (v === 0) { weaknesses.push(GROUP[g].lack); boosts.push(GROUP_BOOST[g]); }
  if (an.elemCount[maxE] >= 4) weaknesses.push(`${josa(ELEMENT_PLAIN[maxE], '이/가')} ${an.elemCount[maxE]}개로 아주 많아 ${ELEMENT_KEYWORD[maxE]}의 성향이 극단으로 흐르기 쉽습니다.`);
  for (const e of lacksE) {
    // 없는 기운이 기신이면 '채우라'고 하지 않는다 (기신 설명과 모순 방지)
    if (e === an.gisin) continue;
    weaknesses.push(`${josa(ELEMENT_PLAIN[e], '이/가')} 없어 ${ELEMENT_KEYWORD[e]}의 면이 잘 드러나지 않습니다.`);
  }
  if (an.strength === '신약') { weaknesses.push('혼자 많은 것을 짊어지면 쉽게 지칩니다.'); boosts.push('일과 관계에서 경계를 정하세요. 거절해도 관계가 무너지지 않는다는 경험이 힘이 됩니다.'); }
  if (an.strength === '신강' && topGroup === '비겁') { weaknesses.push('내 방식이 옳다는 확신이 강해 다른 의견을 놓치기 쉽습니다.'); boosts.push('결정 전에 반대 의견을 한 번 들어보는 규칙을 만드세요.'); }
  for (const s of sins) if (['양인', '백호', '괴강'].includes(s.key) && !weaknesses.some((t) => t.startsWith(SINSAL[s.key].name))) {
    weaknesses.push(`${SINSAL[s.key].name}: ${SINSAL[s.key].text.split('.').slice(1).join('.').trim()}`);
  }
  const L = LUCKY[an.yongsin];
  boosts.unshift(`가장 필요한 기운은 ${ELEMENT_PLAIN[an.yongsin]}입니다. ${L.act} 같은 활동과 ${L.habit} 같은 습관이 이 기운을 채워줍니다.`);
  R.strengths = strengths.slice(0, 5);
  R.weaknesses = weaknesses.length ? weaknesses.slice(0, 5) : ['크게 치우친 부분이 없습니다. 지금의 균형을 유지하는 생활 습관이 가장 중요합니다.'];
  R.boosts = [...new Set(boosts)].slice(0, 4);

  /* 개운법 */
  R.remedy = [
    ['색', L.color], ['방향', L.dir], ['숫자', L.num], ['좋은 계절', L.season],
    ['음식', L.food], ['장소', L.place], ['소품', L.item], ['습관', L.habit],
  ];

  /* 귀인 */
  const noble = NOBLE[ds];
  R.noble = [
    `${noble.map((b) => `${ZODIAC[b]}띠`).join(', ')} 사람이 결정적인 순간에 도움을 주는 귀인이 되기 쉽습니다.`,
    `${ELEMENT_PLAIN[an.yongsin]}의 기운이 강한 사람, 즉 ${['성장하려는 의지가 강하고 곧은', '밝고 표현이 풍부한', '믿음직하고 차분한', '단호하고 정리를 잘하는', '생각이 깊고 유연한'][an.yongsin]} 사람이 곁에 있으면 내 부족한 면이 채워집니다.`,
    sins.some((s) => s.key === '천을귀인')
      ? `사주에 귀인의 별이 ${[...new Set(sins.filter((s) => s.key === '천을귀인').map((s) => POS_AREA[s.pos]))].join(', ')} 자리에 있어, 그 영역에서 특히 도움받을 일이 많습니다.`
      : '사주에 귀인의 별이 직접 드러나 있지 않아, 도움은 스스로 맺은 관계에서 옵니다. 평소 쌓은 신뢰가 곧 귀인입니다.',
  ];

  /* 과거, 현재, 미래 */
  const list = saju.daewoon.list;
  const curIdx = cur ? list.indexOf(cur) : -1;
  const past = [];
  if (saju.daewoon.startAge > 1) past.push({
    range: saju.daewoon.startAge === 2 ? '1세' : `1~${saju.daewoon.startAge - 1}세`,
    years: saju.daewoon.startAge === 2 ? `${saju.input.year}년` : `${saju.input.year}~${saju.input.year + saju.daewoon.startAge - 2}년`,
    title: '타고난 환경',
    text: `어린 시절은 ${GROUP[groupOfStem(ds, P.year.stem)].theme}의 분위기 속에서 자랐습니다. ${sins.some((s) => s.pos === 'year' && ['충', '원진', '공망'].includes(s.key)) ? '집안 환경에 변화가 있었거나 일찍 독립심을 길렀을 가능성이 큽니다.' : '집안의 기운과 크게 부딪히지 않고 비교적 안정적으로 자랐을 가능성이 큽니다.'}`,
    score: 0, tense: 'past',
  });
  for (let i = 0; i < curIdx; i++) past.push(periodText(saju, an, list[i], 'past', i));
  R.present = cur ? periodText(saju, an, cur, 'present', curIdx) : null;
  R.timeline = [...past, ...(R.present ? [R.present] : []), ...list.slice(curIdx + 1).map((d, i) => periodText(saju, an, d, 'future', curIdx + 1 + i))];

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

  /* 월별 흐름 */
  R.months = buildMonths(saju, an, yf, nowYear, nowMs);
  return R;
}

/* ---------------- 월별 ---------------- */

const MONTH_GOD = {
  비견: ['나와 같은 기운이 들어와 자신감이 붙고 혼자 움직이고 싶어지는 달입니다.', '중요한 결정은 혼자 내리기 전에 믿는 한 사람에게만 의견을 물어보세요.'],
  겁재: ['경쟁심이 커지고 돈이 사람을 따라 나가기 쉬운 달입니다.', '돈 빌려주기와 충동 결제는 이달만큼은 미루세요.'],
  식신: ['여유와 즐거움이 생기고 손에 잡히는 결과물이 나오는 달입니다.', '미뤄둔 취미나 작은 프로젝트를 하나 끝내 보세요.'],
  상관: ['말과 아이디어가 넘치고 기존 틀을 바꾸고 싶어지는 달입니다.', '윗사람과의 대화나 공개적인 글은 한 번 더 다듬어서 내놓으세요.'],
  편재: ['예상 밖의 돈 기회와 바깥 활동이 늘어나는 달입니다.', '기회가 와도 쓸 돈의 한도를 먼저 정하고 움직이세요.'],
  정재: ['꾸준히 일한 만큼 수입과 성과가 정리되는 달입니다.', '가계부와 고정 지출을 점검하고 새는 돈을 막기 좋은 때입니다.'],
  편관: ['갑작스러운 압박과 책임이 몰려오는 달입니다.', '일정에 여유분을 두고 무리한 부탁은 정중히 거절하세요.'],
  정관: ['평가와 인정, 공식적인 일이 진행되는 달입니다.', '서류, 보고, 면접처럼 공식적인 일을 이달에 잡으세요.'],
  편인: ['생각이 깊어지고 새로운 분야에 끌리는 달입니다.', '배우고 싶던 것을 짧게 맛보기로 시작해 보세요.'],
  정인: ['도움과 지지를 받고 문서와 계약 운이 따르는 달입니다.', '자격증, 계약서, 신청서 같은 문서 일을 처리하세요.'],
};
const MONTH_HINT = {
  money: { 비겁: '지출과 경쟁 늘어남', 식상: '일한 만큼 수입', 재성: '수입 기회 뚜렷', 관성: '고정 수입 안정', 인성: '계약, 문서로 이득' },
  love: (male) => ({ 비겁: '친구 사이에서 인연', 식상: '표현이 매력이 됨', 재성: male ? '새 인연의 기운' : '현실적인 고민', 관성: male ? '관계에 책임감' : '새 인연의 기운', 인성: '소개로 편안한 만남' }),
  work: { 비겁: '협업과 경쟁', 식상: '아이디어 발휘', 재성: '성과로 평가받음', 관성: '책임과 승진', 인성: '공부와 자격' },
};

function buildMonths(saju, an, yf, nowYear, nowMs) {
  const P = saju.pillars;
  const ds = P.day.stem, db = P.day.branch;
  const male = saju.input.gender === 'M';
  const love = MONTH_HINT.love(male);
  return yf.months.map((m, i) => {
    let s = luckScore(an, m.stem, m.branch);
    const clash = isClash(m.branch, db), harm = isHarmony(m.branch, db);
    if (clash) s -= 1;
    if (harm) s += 1;
    const end = i < 11 ? yf.months[i + 1].start : yearFortune(nowYear + 1).months[0].start;
    const sg = TEN_GODS[tenGod(ds, m.stem)], bg = TEN_GODS[branchTenGod(ds, m.branch)];
    const mg = groupOfBranch(ds, m.branch);
    const note = clash ? '변화와 다툼 주의' : harm ? '인연과 협력' : GROUP[mg].theme;
    const why = [MONTH_GOD[bg][0]];
    if (TEN_GOD_GROUP[tenGod(ds, m.stem)] !== mg) why.push(`달 초반에는 ${MONTH_GOD[sg][0].replace(' 달입니다.', ' 흐름이 먼저 옵니다.')}`);
    const se = stemElement(m.stem), be = BRANCH_ELEMENT[m.branch];
    if ([se, be].includes(an.yongsin)) why.push(pick([`필요한 ${ELEMENT_PLAIN[an.yongsin]}의 기운이 들어와 일이 수월하게 풀립니다.`, '부족한 기운이 채워져 몸과 마음이 가벼워집니다.', '균형을 잡아주는 기운이 와서 애쓴 만큼 결과가 보입니다.'], i));
    if ([se, be].includes(an.gisin)) why.push(pick([`${ELEMENT_PLAIN[an.gisin]}의 기운이 겹쳐 무리하거나 고집을 부리기 쉽습니다.`, '기울어진 쪽이 더 기울어 피로가 쌓이기 쉽습니다.', '욕심이 앞서기 쉬우니 속도를 조절하세요.'], i));
    if (clash) why.push('나와 부딪히는 달이라 계약, 이사, 다툼에 특히 신중하세요.');
    if (harm) why.push('나와 잘 맞는 달이라 만남과 협력, 중요한 약속을 잡기 좋습니다.');
    const sj = samjae(P.year.branch, yf.branch);
    return {
      start: m.start, end, score: Math.max(-2, Math.min(2, s)), note,
      why: why.join(' '),
      hints: [['재물', MONTH_HINT.money[mg]], ['연애', love[mg]], ['일', MONTH_HINT.work[mg]]],
      action: MONTH_GOD[bg][1],
      samjae: sj,
      current: nowMs >= m.start && nowMs < end,
    };
  });
}

/* ---------------- 추가 질문 ---------------- */
const md = (ms) => { const d = new Date(ms + 9 * 3600e3); return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`; };
const monthSpan = (m) => `${md(m.start)}~${md(m.end - 86400000)}`;

export const QUESTIONS = [
  { id: 'caution', q: '올해 조심해야 할 달은?' },
  { id: 'good', q: '올해 가장 좋은 달은?' },
  { id: 'move', q: '이직이나 창업하기 좋은 시기는?' },
  { id: 'match', q: '나와 잘 맞는 사람은?' },
  { id: 'samjae', q: '삼재는 언제인가요?' },
  { id: 'money', q: '돈을 모으려면 어떻게 해야 하나요?' },
];

export function answer(id, saju, an, R, nowYear) {
  const ds = saju.pillars.day.stem, db = saju.pillars.day.branch;
  switch (id) {
    case 'caution': {
      const bad = [...R.months].sort((a, b) => a.score - b.score).slice(0, 2);
      return [`${josa(bad.map((m) => `${monthSpan(m)}(${m.note})`).join(', '), '이/가')} 상대적으로 부담이 큰 시기입니다.`,
        ...bad.map((m) => `${md(m.start)}부터: ${m.action}`)];
    }
    case 'good': {
      const good = [...R.months].sort((a, b) => b.score - a.score).slice(0, 2);
      return [`${josa(good.map((m) => `${monthSpan(m)}(${m.note})`).join(', '), '이/가')} 흐름이 좋은 시기입니다.`, '중요한 발표, 계약, 만남은 이 시기에 잡아보세요.',
        ...good.map((m) => `${md(m.start)}부터: ${m.action}`)];
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
        R.noble[1],
        `반대로 ${ZODIAC[clash]}의 기운이 강한 사람과는 부딪히기 쉬워 서로 이해하려는 노력이 더 필요합니다.`];
    }
    case 'samjae': {
      const yb = saju.pillars.year.branch;
      const out = [];
      for (let y = nowYear; y < nowYear + 12; y++) { const s = samjae(yb, yearFortune(y).branch); if (s) out.push(`${y}년: ${s}`); }
      return [`${ZODIAC[yb]}띠의 삼재는 아래 해입니다.`, ...out, '삼재는 무조건 나쁜 해가 아니라 큰 변화를 서두르지 말라는 신호입니다. 실제 운의 좋고 나쁨은 해별 흐름과 함께 보세요.'];
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
