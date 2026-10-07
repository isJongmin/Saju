// 일주 풀이와 분야별(연애, 결혼, 재물, 직업, 건강, 올해) 상세 해석
import {
  STEMS, BRANCHES, STEMS_KO, BRANCHES_KO, ZODIAC, BRANCH_ELEMENT, TEN_GODS,
  stemElement, tenGod, branchTenGod, isClash, isHarmony, isWonjin, harmonyOf, sinsal, twelveStage, yearFortune, mod,
} from './core.js';
import {
  josa, luckScore, scoreWord, koreanAge, elementEffect, groupOfStem, groupOfBranch,
  ELEMENT_PLAIN, ELEMENT_KEYWORD, STEM_COLOR, GROUP, HEALTH, LUCKY, CAREER, yearName, scoreAdj,
} from './interpret.js';

/* ---------------- 일주 ---------------- */

const BRANCH_NATURE = [
  '한겨울 깊은 밤의 물', '얼어붙은 겨울 땅', '이른 봄 숲의 큰 나무', '봄날의 꽃과 풀', '봄비에 젖은 흙', '초여름의 따뜻한 불',
  '한여름 한낮의 태양', '한여름의 뜨겁고 마른 흙', '초가을의 단단한 바위', '가을걷이 무렵의 보석', '늦가을의 메마른 흙', '초겨울의 넓은 바다',
];
const STEM_NATURE = ['큰 나무', '꽃과 넝쿨', '태양', '촛불', '큰 산', '기름진 땅', '바위와 쇠', '보석', '큰 물', '이슬비'];
const SIT = {
  비겁: '자기 기반 위에 서 있는 모습이라 자존심과 독립심이 강하고, 남에게 기대기보다 스스로 해결하려 합니다.',
  식상: '재능과 표현의 기운 위에 앉아 있어 말과 손재주가 좋고, 하고 싶은 일을 해야 직성이 풀립니다.',
  재성: '현실과 재물의 기운 위에 앉아 있어 생활력이 강하고 실속을 챙기며, 배우자의 덕을 보는 경우가 많습니다.',
  관성: '절제와 책임의 기운 위에 앉아 있어 반듯하고 자기관리가 철저하지만, 스스로를 몰아붙이기 쉽습니다.',
  인성: '배움과 보호의 기운 위에 앉아 있어 생각이 깊고 이해심이 많으며, 마음의 만족을 중요하게 여깁니다.',
};
const STAGE_PLAIN = {
  장생: '새로 태어나는 기운이라 밝고 순수하며 배우려는 의지가 강합니다.',
  목욕: '씻고 단장하는 기운이라 감각적이고 멋을 알며 변화를 즐깁니다.',
  관대: '성인이 되어 옷을 갖춰 입는 기운이라 자신감과 의욕이 넘칩니다.',
  건록: '스스로 녹봉을 받는 기운이라 자립심이 강하고 자기 힘으로 일어섭니다.',
  제왕: '기운이 정점에 오른 자리라 리더십이 강하고 남 밑에 있기를 싫어합니다.',
  쇠: '정점을 지나 노련해진 기운이라 신중하고 경험에서 지혜를 얻습니다.',
  병: '기운이 잦아드는 자리라 감수성이 풍부하고 남의 아픔을 잘 이해합니다.',
  사: '멈춰 서서 깊이 생각하는 기운이라 집중력과 탐구심이 깊습니다.',
  묘: '창고에 거두어들이는 기운이라 알뜰하고 모으고 지키는 힘이 있습니다.',
  절: '끊어지고 새로 시작하는 기운이라 변화가 많고 새 출발에 강합니다.',
  태: '새 생명이 잉태되는 기운이라 아이디어와 꿈이 크지만 현실로 옮기는 데 시간이 걸립니다.',
  양: '보살핌 속에 자라는 기운이라 온화하고 주변의 도움을 잘 받습니다.',
};
const SAME_ELEMENT = new Set(['0-2', '1-3', '2-6', '3-5', '4-4', '4-10', '5-1', '5-7', '6-8', '7-9', '8-0', '9-11']);
const KUIGANG = new Set(['6-4', '6-10', '8-4', '8-10', '4-10']);
const BAEKHO = new Set(['0-4', '1-7', '2-10', '3-1', '4-4', '8-10', '9-1']);

export function iljuReading(P) {
  const { stem: s, branch: b } = P.day;
  const g = groupOfBranch(s, b);
  const stage = twelveStage(s, b);
  const key = `${s}-${b}`;
  const paras = [
    `${josa(STEM_NATURE[s], '이/가')} ${BRANCH_NATURE[b]} 위에 놓인 모습입니다. ${SIT[g]}`,
    `자리의 힘으로 보면 ${STAGE_PLAIN[stage]}`,
  ];
  const special = [];
  if (SAME_ELEMENT.has(key)) special.push('위아래가 같은 기운으로 겹쳐 있어 주관이 매우 뚜렷하고 한번 정하면 쉽게 바꾸지 않습니다. 배우자와 주도권을 두고 부딪히지 않도록 양보의 기술이 필요합니다.');
  if (KUIGANG.has(key)) special.push('우두머리 기질의 일주로 꼽힙니다. 결단력과 카리스마가 강해 큰일을 맡을수록 빛나지만, 기복이 크고 자존심이 세다는 평을 듣기 쉽습니다.');
  if (BAEKHO.has(key)) special.push('기운이 강하게 뭉친 일주입니다. 추진력이 뛰어나지만 성격이 급해질 수 있어 운전, 건강, 감정 조절에 신경 쓰면 좋습니다.');
  if (stage === '건록' || stage === '제왕') special.push('스스로 일어서는 힘이 커서 자수성가형이 많습니다.');
  return {
    title: `${STEMS_KO[s]}${BRANCHES_KO[b]}(${STEMS[s]}${BRANCHES[b]})일주`,
    nick: `${STEM_COLOR[s]} ${ZODIAC[b]}`,
    paras: [...paras, ...special],
  };
}

/* ---------------- 연도별 해석 ---------------- */

const DOMAIN_GROUP = {
  love: (male) => ({
    비겁: '친구, 동료 사이에서 인연이 생기기 쉽지만 경쟁자도 함께 나타납니다.',
    식상: '표현이 늘고 매력이 잘 드러나 먼저 다가가기 좋습니다.',
    재성: male ? '이성 인연이 직접 들어오는 기운입니다.' : '현실적인 조건을 따지게 되어 연애보다 실속을 챙기게 됩니다.',
    관성: male ? '책임감 있는 관계로 발전하기 쉽지만 일 때문에 연애가 뒤로 밀릴 수 있습니다.' : '이성 인연이 직접 들어오는 기운입니다.',
    인성: '소개나 주변의 추천으로 편안한 인연을 만나기 쉽습니다.',
  }),
  marriage: (male) => ({
    비겁: '결혼보다 내 삶의 독립이 우선이 되기 쉽습니다.',
    식상: male ? '자녀나 가정의 계획을 구체화하기 좋습니다.' : '자녀 인연이 들어오거나 관계에서 내 목소리가 커집니다.',
    재성: male ? '배우자 인연이 들어오는 대표적인 기운입니다.' : '집, 살림 같은 현실적인 결혼 준비가 진행되기 쉽습니다.',
    관성: male ? '가정에 대한 책임감이 커지고 안정을 찾게 됩니다.' : '배우자 인연이 들어오는 대표적인 기운입니다.',
    인성: '집안 어른의 도움이나 혼인신고, 집 계약 같은 문서 일이 생깁니다.',
  }),
  wealth: () => ({
    비겁: '돈이 사람을 통해 나가기 쉽습니다. 지출과 경쟁이 늘어납니다.',
    식상: '일을 벌이고 재능을 팔아 수입을 만들기 좋습니다.',
    재성: '수입과 재물의 기회가 직접 들어옵니다.',
    관성: '직장이나 조직을 통한 안정적인 수입, 승진에 따른 보상이 기대됩니다.',
    인성: '당장의 수입보다 계약, 문서, 부동산 같은 자산 관련 일이 생깁니다.',
  }),
  career: () => ({
    비겁: '독립하거나 동업, 협업을 시도하고 싶어지며 경쟁이 치열해집니다.',
    식상: '새 프로젝트, 창작, 기획에서 능력을 보여주기 좋고 이직 욕구가 커집니다.',
    재성: '실적과 성과로 평가받습니다. 결과를 숫자로 보여주세요.',
    관성: '승진, 자리 이동, 책임이 커지는 기운입니다.',
    인성: '공부, 자격 취득, 윗사람의 도움이 따릅니다.',
  }),
  overall: () => Object.fromEntries(Object.entries(GROUP).map(([k, v]) => [k, `${v.flow}입니다.`])),
};

const TIPS = {
  love: { good: '모임과 소개 자리를 적극적으로 늘려보세요. 마음이 있다면 먼저 표현하는 쪽이 유리합니다.', bad: '감정적인 말은 하루 미루고, 관계에 대한 큰 결정은 서두르지 마세요.' },
  marriage: { good: '결혼 이야기를 꺼내거나 양가 인사, 집 계약 같은 일을 진행하기 좋습니다.', bad: '서로의 생활 방식 차이가 드러나기 쉽습니다. 결정 전에 충분히 대화하세요.' },
  wealth: { good: '수입을 늘릴 기회를 적극적으로 잡되 들어온 돈의 일부는 바로 묶어두세요.', bad: '큰 투자, 보증, 돈 거래는 피하고 고정 지출부터 점검하세요.' },
  career: { good: '이직, 승진 도전, 새 프로젝트 제안을 해볼 만한 때입니다.', bad: '자리를 옮기기보다 지금 자리에서 실력을 다지고 평판을 지키세요.' },
  health: { good: '컨디션이 회복되기 쉬운 때입니다. 운동 습관을 새로 들이기 좋습니다.', bad: '과로를 피하고 정기 검진을 챙기세요. 운전과 운동 중 부상에도 주의하세요.' },
  overall: { good: '미뤄두었던 계획을 실행에 옮기기 좋은 때입니다.', bad: '새로 벌이기보다 정리하고 점검하는 데 힘을 쓰세요.' },
};

function yearInfo(ctx, y) {
  const { ds, db, P } = ctx;
  const f = yearFortune(y);
  return {
    y, f, name: yearName(f),
    g1: groupOfStem(ds, f.stem), g2: groupOfBranch(ds, f.branch),
    base: luckScore(ctx.an, f.stem, f.branch),
    clash: isClash(f.branch, db), harm: isHarmony(f.branch, db), wonjin: isWonjin(f.branch, db),
    peach: [...sinsal(P.year.branch, f.branch), ...sinsal(db, f.branch)].includes('도화'),
    horse: [...sinsal(P.year.branch, f.branch), ...sinsal(db, f.branch)].includes('역마'),
  };
}

function scoreFor(ctx, info, domain) {
  const { male, an } = ctx;
  const has = (g) => info.g1 === g || info.g2 === g;
  const loveG = male ? '재성' : '관성';
  let s = info.base;
  switch (domain) {
    case 'love': s += (has(loveG) ? 1 : 0) + (info.peach ? 1 : 0) + (info.harm ? 1 : 0) - (info.clash ? 1 : 0) - (info.wonjin ? 1 : 0) - (male && has('비겁') ? 1 : 0); break;
    case 'marriage': s += (has(loveG) ? 1 : 0) + (info.harm ? 2 : 0) - (info.clash ? 1 : 0) - (info.wonjin ? 1 : 0); break;
    case 'wealth': s += (has('재성') && an.strength !== '신약' ? 1 : 0) + (has('식상') ? 1 : 0) - (has('비겁') ? 1 : 0); break;
    case 'career': s += (has('관성') ? 1 : 0) + (has(an.strength === '신약' ? '인성' : '식상') ? 1 : 0); break;
    case 'health': s -= (info.clash ? 1 : 0); break;
    default: s += (info.harm ? 1 : 0) - (info.clash ? 1 : 0);
  }
  return Math.max(-2, Math.min(2, s));
}

function whyFor(ctx, info, domain, score) {
  const { male, an } = ctx;
  const out = [];
  if (domain === 'health') {
    const els = [stemElement(info.f.stem), BRANCH_ELEMENT[info.f.branch]];
    if (els.includes(an.gisin)) out.push(`이미 넘치는 ${ELEMENT_PLAIN[an.gisin]}의 기운이 더해져 ${HEALTH[an.gisin]}에 무리가 오기 쉽습니다.`);
    if (els.includes(an.yongsin)) out.push(`부족한 ${ELEMENT_PLAIN[an.yongsin]}의 기운이 채워져 ${HEALTH[an.yongsin]} 쪽이 편안해지고 회복이 빠릅니다.`);
    if (!out.length) out.push('기운의 균형이 크게 흔들리지 않는 해입니다.');
    if (info.clash) out.push('나와 부딪히는 기운이라 사고, 부상, 갑작스러운 몸의 변화에 주의가 필요합니다.');
  } else {
    const map = DOMAIN_GROUP[domain](male);
    if (info.g1 !== info.g2 && map[info.g1] !== map[info.g2]) out.push(`상반기에는 ${map[info.g1]}`, `하반기에는 ${map[info.g2]}`);
    else out.push(map[info.g2]);
    if (domain === 'love') {
      if (info.peach) out.push('매력이 드러나 사람들의 시선이 모이는 해입니다.');
      if (info.harm) out.push('배우자 자리와 잘 맞는 기운이 들어와 관계가 자연스럽게 깊어집니다.');
      if (info.clash) out.push('배우자 자리와 부딪히는 기운이라 다툼이나 이별, 관계의 큰 변화가 생기기 쉽습니다.');
      if (info.wonjin) out.push('서운함과 오해가 쌓이기 쉬운 기운이 있습니다.');
    } else if (domain === 'marriage') {
      if (info.harm) out.push('배우자 자리와 합이 드는 해라 결혼 인연이 맺어지기 쉬운 대표적인 시기입니다.');
      if (info.clash) out.push('배우자 자리가 흔들리는 해라 이사, 별거, 갈등처럼 가정에 변화가 생기기 쉽습니다.');
      if (info.wonjin) out.push('배우자와 이유 없는 서운함이 생기기 쉽습니다.');
    } else {
      out.push(elementEffect(an, info.f.stem, info.f.branch, 'future'));
      if (domain === 'career' && info.horse) out.push('이동의 기운이 있어 부서 이동, 출장, 이직처럼 자리가 바뀌기 쉽습니다.');
      if (domain === 'overall' && info.clash) out.push('나와 부딪히는 기운이라 이사, 이직, 관계 변화가 생기기 쉽습니다.');
      if (domain === 'overall' && info.harm) out.push('나와 잘 맞는 기운이라 좋은 인연과 협력이 들어옵니다.');
    }
  }
  return { why: out.filter(Boolean).join(' '), tip: score >= 0 ? TIPS[domain].good : TIPS[domain].bad };
}

function timing(ctx, domain, { years = 10, from = ctx.nowYear, minAge = 0 } = {}) {
  const all = [];
  for (let y = from; y < from + years; y++) {
    if (koreanAge(ctx.saju, y) < minAge) continue;
    const info = yearInfo(ctx, y);
    const score = scoreFor(ctx, info, domain);
    all.push({ y, name: info.name, age: koreanAge(ctx.saju, y), score, ...whyFor(ctx, info, domain, score) });
  }
  const good = [...all].filter((a) => a.score > 0).sort((a, b) => b.score - a.score || a.y - b.y).slice(0, 3).sort((a, b) => a.y - b.y);
  const caution = [...all].filter((a) => a.score < 0).sort((a, b) => a.score - b.score || a.y - b.y).slice(0, 2).sort((a, b) => a.y - b.y);
  return { good, caution };
}

/* ---------------- 분야별 ---------------- */

const LOVE_STYLE = [
  { key: '직진형 연애', text: '좋아하면 곧게 직진하는 타입입니다. 상대를 키워주고 함께 성장하는 연애를 하며, 한번 마음을 주면 오래갑니다. 다만 내 방식이 옳다는 고집이 갈등의 씨앗이 되기 쉽습니다.' },
  { key: '열정형 연애', text: '감정 표현이 크고 뜨거운 연애를 합니다. 첫눈에 반하기 쉽고 설렘과 이벤트를 중요하게 여깁니다. 빨리 달아오른 만큼 빨리 식지 않도록 일상의 온도를 지키는 것이 과제입니다.' },
  { key: '신뢰형 연애', text: '천천히 믿음을 쌓는 연애를 합니다. 화려함보다 편안함과 안정감을 중요하게 여기고, 한번 맺은 관계는 끝까지 책임지려 합니다. 표현이 적어 상대가 서운해할 수 있습니다.' },
  { key: '확신형 연애', text: '좋고 싫음이 분명하고 확실한 관계를 원합니다. 의리 있고 약속을 잘 지키지만, 상대의 작은 실수에도 실망이 커질 수 있습니다.' },
  { key: '교감형 연애', text: '자유롭고 깊은 교감을 원하는 연애를 합니다. 대화가 통하는 사람에게 끌리고 상대의 마음을 잘 읽습니다. 구속받는 느낌을 싫어하고 속마음을 다 드러내지 않는 편입니다.' },
];
const ELEMENT_PERSON = ['곧고 성장하려는 의지가 강한 사람', '밝고 표현이 풍부한 사람', '믿음직하고 차분한 사람', '단호하고 정리를 잘하는 사람', '생각이 깊고 유연한 사람'];
const SPOUSE_LOOK = ['키가 크거나 곧은 인상', '밝고 활동적인 인상', '듬직하고 편안한 인상', '깔끔하고 단정한 인상', '부드럽고 유연한 인상'];
const POS_LOVE = {
  year: '어린 시절 친구나 동창처럼 일찍 만난 인연과 연결되기 쉽습니다.',
  month: '직장, 학교, 모임처럼 사회생활 속에서 인연을 만나기 쉽습니다.',
  day: '인연의 별이 배우자 자리에 있어 연애가 결혼으로 이어지기 쉽습니다.',
  hour: '늦게 만나는 인연이나 나이 차이가 있는 인연과 잘 맞는 편입니다.',
};
const SPOUSE = {
  비겁: { key: '친구 같은 배우자', text: '친구 같은 동등한 관계를 원합니다. 서로 독립적인 영역을 존중할 때 오래갑니다. 배우자와 경쟁 구도가 생기지 않도록 역할을 나누는 것이 좋습니다.' },
  식상: { key: '다정한 배우자', text: '편안하고 다정한 관계를 만듭니다. 함께 먹고 즐기는 일상이 관계의 중심이지만, 솔직한 말이 상처가 되지 않게 말투를 챙겨야 합니다.' },
  재성: { key: '생활력 있는 배우자', text: '현실적이고 생활력 있는 배우자 인연입니다. 함께 경제적 기반을 쌓아가는 결혼이며, 살림과 재테크에서 손발이 잘 맞습니다.' },
  관성: { key: '반듯한 배우자', text: '반듯하고 책임감 있는 배우자 인연입니다. 서로의 역할과 예의를 지킬 때 안정되며, 사회적으로 인정받는 배우자를 만나기 쉽습니다.' },
  인성: { key: '마음이 통하는 배우자', text: '정신적 교감을 중시하고 서로 의지하는 관계입니다. 배우자에게 보살핌을 받기 쉽지만, 지나친 기대와 의존은 내려놓는 것이 좋습니다.' },
};
const WORK_STYLE = [
  '방향을 정하고 사람을 이끄는', '아이디어를 내고 분위기를 띄우는', '중심을 잡고 사람 사이를 조율하는', '결정하고 정리하며 마무리하는', '전략을 세우고 정보를 모으는',
];
const CAREER_KEY = { 비겁: '독립형', 식상: '창작형', 재성: '사업형', 관성: '조직형', 인성: '전문가형' };
const HEALTH_DETAIL = [
  '간 기능과 눈의 피로, 근육 뭉침에 신경 쓰세요. 스트레칭과 충분한 수면이 도움이 됩니다.',
  '심장과 혈압, 혈액순환을 챙기세요. 과로와 흥분을 피하고 유산소 운동을 꾸준히 하면 좋습니다.',
  '위장과 소화기가 약해지기 쉽습니다. 규칙적인 식사와 과식, 야식을 피하는 습관이 중요합니다.',
  '폐와 기관지, 피부가 예민해지기 쉽습니다. 건조한 환경을 피하고 호흡 운동을 해보세요.',
  '신장과 방광, 허리를 챙기세요. 몸을 차갑게 하지 말고 물을 충분히 마시는 것이 좋습니다.',
];

export function buildDomains(saju, an, R, nowYear, nowMs = Date.now()) {
  const P = saju.pillars;
  const ds = P.day.stem, db = P.day.branch, de = stemElement(ds);
  const male = saju.input.gender === 'M';
  const age = koreanAge(saju, nowYear);
  const ctx = { saju, an, P, ds, db, male, nowYear };
  const g = an.groupScore;
  const sins = R.sinsal;
  const hasSin = (k) => sins.some((s) => s.key === k);
  const loveG = male ? '재성' : '관성';
  const pillarsArr = [['year', P.year], ['month', P.month], ['day', P.day], ['hour', P.hour]].filter(([, p]) => p);
  const loveStarPos = [];
  for (const [pos, p] of pillarsArr) {
    if (pos !== 'day' && groupOfStem(ds, p.stem) === loveG) loveStarPos.push(pos);
    if (groupOfBranch(ds, p.branch) === loveG) loveStarPos.push(pos);
  }
  const others = [P.year, P.month, P.hour].filter(Boolean);
  const spouseG = groupOfBranch(ds, db);
  const D = {};

  /* 연애운 */
  {
    const style = LOVE_STYLE[de];
    const cnt = g[loveG];
    const lines = [];
    lines.push(cnt === 0
      ? '타고난 사주에 이성 인연을 뜻하는 기운이 드러나 있지 않습니다. 인연이 저절로 찾아오기보다 스스로 찾아나서야 하고, 연애에 늦게 눈을 뜨는 편입니다. 대신 운에서 인연의 기운이 들어오는 해에 한 번에 깊은 인연이 맺어지기 쉽습니다.'
      : cnt >= 3
        ? '이성 인연을 뜻하는 기운이 많아 주변에 사람이 끊이지 않습니다. 선택지가 많은 만큼 여러 인연 사이에서 고민이 생기기 쉬우니, 나에게 맞는 사람을 고르는 기준을 분명히 해두세요.'
        : '이성 인연을 뜻하는 기운이 적당히 있어 인연이 자연스럽게 이어지는 편입니다.');
    for (const pos of [...new Set(loveStarPos)]) lines.push(POS_LOVE[pos]);
    if (hasSin('도화')) lines.push('매력의 별이 있어 첫인상과 분위기로 호감을 얻습니다. 본인은 모르게 관심받는 경우가 많습니다.');
    if (hasSin('홍염')) lines.push('꾸미지 않아도 풍기는 은은한 분위기가 있어 이성에게 오래 기억되는 타입입니다.');
    if (g.식상 >= 2) lines.push('표현력이 좋아 연애에서 적극적이고 말로 마음을 잘 전합니다.');
    if (g.인성 >= 3) lines.push('생각이 많아 마음이 있어도 먼저 다가가기를 망설이는 편입니다.');
    const cautions = [];
    if (male && g.비겁 >= 3) cautions.push('나와 비슷한 기운이 많아 연애에서 경쟁자가 생기기 쉽고, 친구 관계가 연애에 끼어들 수 있습니다.');
    if (!male && g.비겁 >= 3) cautions.push('자존심이 강해 먼저 사과하거나 양보하는 일이 어렵습니다. 이기는 연애보다 함께 가는 연애를 의식하세요.');
    if (cnt >= 3) cautions.push('여러 인연이 겹치기 쉬우니 관계를 정리할 때 분명하게 하는 것이 뒤탈이 없습니다.');
    if (others.some((p) => isClash(p.branch, db))) cautions.push('배우자 자리가 흔들리는 구조라 연애 초반의 뜨거움이 오래가기 어렵습니다. 감정의 기복을 대화로 풀어야 합니다.');
    if (others.some((p) => isWonjin(p.branch, db))) cautions.push('사소한 일로 서운함이 쌓이기 쉽습니다. 마음을 말로 확인하는 습관이 관계를 지켜줍니다.');
    if (g.식상 >= 3 && !male) cautions.push('솔직한 표현이 지나치면 상대가 상처받을 수 있습니다.');
    if (!cautions.length) cautions.push('연애에서 크게 꼬이는 구조는 보이지 않습니다. 지금의 자연스러운 흐름을 믿어도 좋습니다.');
    const h = harmonyOf(db);
    D.love = {
      keywords: [style.key, cnt === 0 ? '늦게 피는 인연' : cnt >= 3 ? '인연이 많은 편' : '자연스러운 인연', hasSin('도화') || hasSin('홍염') ? '타고난 매력' : null, g.식상 >= 2 ? '표현이 풍부함' : g.인성 >= 3 ? '신중한 연애' : null].filter(Boolean),
      summary: style.text,
      sections: [
        { title: '나의 연애 성향', kind: 'list', items: lines },
        { title: '나와 잘 맞는 사람', kind: 'list', items: [
          `${ELEMENT_PERSON[an.yongsin]}에게 끌리고, 함께 있을 때 내 부족한 부분이 채워집니다.`,
          `띠로 보면 ${ZODIAC[h]}띠와 정서적으로 잘 통하고, ${ZODIAC[mod(db + 6, 12)]}띠와는 부딪히기 쉬워 더 많은 대화가 필요합니다.`,
          `상대의 일간이 ${[an.yongsin * 2, an.yongsin * 2 + 1].map((x) => `${STEMS_KO[x]}(${STEMS[x]})`).join(', ')}이면 서로에게 힘이 되는 궁합입니다.`,
        ] },
        { title: '연애에서 조심할 점', kind: 'list', items: cautions },
      ],
      timing: { title: '앞으로 10년 연애 흐름', ...timing(ctx, 'love') },
      advice: cnt === 0 ? '기다리기보다 사람을 만나는 자리에 꾸준히 나가는 것이 인연을 부르는 가장 확실한 방법입니다.' : '좋은 인연은 이미 주변에 있을 가능성이 큽니다. 서두르기보다 오래 본 사람을 다시 보세요.',
    };
  }

  /* 결혼운 */
  {
    const sp = SPOUSE[spouseG];
    const stage = twelveStage(ds, db);
    const life = [];
    if (others.some((p) => isHarmony(p.branch, db))) life.push('가정을 안정시키려는 힘이 있어 결혼 후 생활이 차분해지고 내조, 외조를 받기 쉽습니다.');
    if (others.some((p) => isClash(p.branch, db))) life.push('배우자 자리가 부딪히는 구조라 주말부부, 잦은 이사처럼 거리가 생기기 쉽습니다. 각자의 시간과 공간을 인정하는 것이 오히려 관계를 지켜줍니다.');
    if (others.some((p) => isWonjin(p.branch, db))) life.push('작은 서운함이 쌓이기 쉬운 구조입니다. 정기적으로 마음을 나누는 시간을 정해두세요.');
    if (g[loveG] === 0) life.push('배우자를 뜻하는 기운이 약해 결혼을 서두르기보다 충분히 알아보고 늦게 하는 결혼이 더 안정적입니다.');
    if (g[loveG] >= 3) life.push('배우자를 뜻하는 기운이 많아 결혼 전 여러 인연을 거치거나 결혼 후에도 이성 문제로 오해받지 않게 조심해야 합니다.');
    if (male && g.비겁 >= 3) life.push('주도권 다툼이 생기기 쉬우니 돈 관리와 집안일의 역할을 미리 정해두세요.');
    if (!male && g.식상 >= 3) life.push('배우자에게 바라는 것이 많아질 수 있습니다. 칭찬과 감사의 표현을 의식적으로 늘리면 좋습니다.');
    if (g.인성 >= 3) life.push('배우자에게 정서적으로 기대는 마음이 커서, 상대가 지칠 때 한 걸음 물러서 주는 배려가 필요합니다.');
    if (!life.length) life.push('결혼 생활에 크게 부딪히는 구조가 없어 무난하고 평온한 가정을 꾸리는 편입니다.');
    const late = g[loveG] === 0 || others.some((p) => isClash(p.branch, db));
    const t = age < 20
      ? { good: [], caution: [] }
      : timing(ctx, 'marriage', { minAge: 24 });
    D.marriage = {
      keywords: [sp.key, late ? '늦은 결혼이 유리' : '인연이 오면 빠른 결정', others.some((p) => isHarmony(p.branch, db)) ? '안정된 가정' : others.some((p) => isClash(p.branch, db)) ? '변화가 많은 결혼' : '무난한 결혼 생활'],
      summary: `배우자 자리에는 ${BRANCH_NATURE[db]}의 기운이 있습니다. ${sp.text}`,
      sections: [
        { title: '배우자의 모습', kind: 'list', items: [
          `${SPOUSE_LOOK[BRANCH_ELEMENT[db]]}의 배우자와 인연이 있습니다.`,
          `배우자 자리의 힘으로 보면 ${STAGE_PLAIN[stage]}`,
          `${male ? '아내' : '남편'}의 ${josa(GROUP[spouseG].key, '이/가')} 결혼 생활의 중심이 되고, 나도 그 점에 끌립니다.`,
        ] },
        { title: '결혼 생활', kind: 'list', items: life },
      ],
      timing: age < 20
        ? { title: '결혼 시기', note: '아직 결혼을 논하기 이른 나이입니다. 위 내용은 타고난 배우자 성향으로 참고하세요.', good: [], caution: [] }
        : { title: '결혼하기 좋은 해', ...t },
      advice: late ? '조건보다 생활 방식이 맞는지를 먼저 보세요. 함께 여행을 다녀보는 것이 좋은 시험이 됩니다.' : '좋은 인연이 오면 오래 재기보다 결정하는 쪽이 유리한 사주입니다.',
    };
  }

  /* 재물운 */
  {
    let type, typeText;
    if (g.재성 >= 2 && an.strength !== '신약') { type = '사업가형 재물운'; typeText = '돈을 다루는 감각이 있고 그만큼 감당할 힘도 있어, 직접 사업을 하거나 투자로 재산을 불리는 데 소질이 있습니다. 크게 벌 수 있는 사주이므로 판을 키우는 것을 두려워하지 마세요.'; }
    else if (g.재성 >= 2) { type = '관리형 재물운'; typeText = '돈이 들어올 기회는 많지만 한 번에 감당하기 벅찰 수 있습니다. 크게 벌이기보다 안정적으로 지키고 불려가는 전략이 맞습니다.'; }
    else if (g.식상 >= 2) { type = '재능형 재물운'; typeText = '재능과 기술이 곧 돈입니다. 잘하는 일을 상품으로 만들거나 부업, 콘텐츠, 전문 기술로 수입원을 늘리는 데 강합니다.'; }
    else if (g.관성 >= 2) { type = '월급형 재물운'; typeText = '안정적인 조직 소득을 기반으로 꾸준히 모아가는 재물운입니다. 직급이 오를수록 수입도 함께 커집니다.'; }
    else if (g.인성 >= 2) { type = '자산형 재물운'; typeText = '현금 흐름보다 문서, 자격, 부동산 같은 자산으로 재물이 쌓이는 구조입니다. 오래 보유할수록 가치가 커지는 것에 투자하세요.'; }
    else { type = '성실형 재물운'; typeText = '한 번의 큰돈보다 성실하게 모으는 재물운입니다. 꾸준한 수입 구조와 자동 저축이 가장 큰 무기입니다.'; }
    const inflow = [];
    if (g.재성 === 0) inflow.push('돈을 직접 쫓을수록 멀어지고, 실력과 이름값을 쌓으면 돈이 따라오는 구조입니다.');
    if (g.식상 >= 1 && g.재성 >= 1) inflow.push('재능이 돈으로 이어지는 흐름이 있어 일한 만큼 보상이 따라옵니다.');
    if (g.관성 >= 1 && g.재성 >= 1) inflow.push('직장과 조직이 재물을 지켜주는 울타리가 됩니다.');
    if (g.인성 >= 2) inflow.push('계약, 문서, 부동산과 인연이 있어 집이나 땅으로 재산을 지키기 좋습니다.');
    if (hasSin('역마')) inflow.push('움직이고 이동할수록 돈이 생기는 사주입니다. 영업, 유통, 해외와 관련된 일이 재물과 연결됩니다.');
    if (!inflow.length) inflow.push('한 가지 수입원에 집중해 꾸준히 키우는 방식이 잘 맞습니다.');
    const leak = [];
    if (g.비겁 >= 3) leak.push('사람을 통해 돈이 나가기 쉽습니다. 친구나 지인과의 돈 거래, 보증, 동업은 피하세요.');
    if (g.재성 >= 3 && an.strength === '신약') leak.push('욕심을 내 한 번에 크게 벌이면 감당하지 못하고 손실로 이어지기 쉽습니다.');
    if (g.식상 >= 3) leak.push('즐기고 표현하는 데 돈을 아끼지 않는 편이라 충동 지출을 조심해야 합니다.');
    if (g.인성 >= 3) leak.push('준비만 하다 기회를 놓치기 쉽습니다. 일정 금액은 실행에 쓰는 원칙을 정해두세요.');
    if (!leak.length) leak.push('크게 새는 구멍은 없는 편입니다. 다만 고정 지출을 주기적으로 점검하면 더 빨리 모입니다.');
    const invest = [];
    if (an.strength === '신강') invest.push('위험을 감당할 힘이 있어 적극적인 투자도 가능하지만, 한 곳에 몰지 말고 나누어 투자하세요.');
    else if (an.strength === '신약') invest.push('적금, 연금, 우량 자산처럼 안정적인 방식이 맞습니다. 남의 말만 믿고 하는 투자는 피하세요.');
    else invest.push('안정 자산을 중심으로 일부만 공격적으로 운용하는 균형형이 맞습니다.');
    invest.push(`행운의 기운인 ${ELEMENT_PLAIN[an.yongsin]}과 관련된 분야에 관심을 두면 좋습니다.`);
    D.wealth = {
      keywords: [type, g.재성 >= 2 && an.strength !== '신약' ? '큰 그릇' : g.재성 === 0 ? '실력이 곧 돈' : '꾸준히 쌓는 돈', g.비겁 >= 3 ? '지출 주의' : null, g.인성 >= 2 ? '문서와 부동산 인연' : null].filter(Boolean),
      summary: typeText,
      sections: [
        { title: '돈이 들어오는 길', kind: 'list', items: inflow },
        { title: '돈이 새는 곳', kind: 'list', items: leak },
        { title: '나에게 맞는 재테크', kind: 'list', items: invest },
      ],
      timing: { title: '앞으로 10년 재물 흐름', ...timing(ctx, 'wealth') },
      advice: '수입이 들어오는 날 일정 비율을 바로 다른 계좌로 옮기는 습관 하나가 이 사주의 재물운을 가장 크게 키웁니다.',
    };
  }

  /* 직업운 */
  {
    const groups = Object.entries(g).sort((a, b) => b[1] - a[1]);
    const top = groups[0][0], second = groups[1][0];
    const fit = [`가장 잘 맞는 일: ${CAREER[top]}`, `함께 살리면 좋은 재능: ${CAREER[second]}`];
    if (hasSin('역마')) fit.push('이동이 많거나 해외, 무역, 여행과 관련된 일에서 기회가 큽니다.');
    if (hasSin('문창귀인')) fit.push('글, 기획, 강의처럼 머리를 쓰는 일에서 두각을 나타냅니다.');
    if (hasSin('화개')) fit.push('예술, 연구, 종교, 상담처럼 깊이 파고드는 일과 인연이 있습니다.');
    if (hasSin('도화')) fit.push('사람을 상대하거나 대중 앞에 서는 일에서 매력이 빛납니다.');
    if (hasSin('양인') || hasSin('괴강')) fit.push('위기 상황을 지휘하거나 결단이 필요한 자리에서 능력이 드러납니다.');
    const style = [`${WORK_STYLE[de]} 역할에서 가장 능력을 발휘합니다.`];
    style.push(g.관성 === 0 ? '조직의 틀과 규칙에 답답함을 느끼기 쉬워 자율성이 보장되는 환경이 맞습니다.' : g.관성 >= 3 ? '책임감이 강해 맡은 일은 끝까지 해내지만, 일을 혼자 떠안아 번아웃이 오기 쉽습니다.' : '조직 안에서 책임 있는 자리를 맡을 때 인정받습니다.');
    style.push(an.strength === '신강' ? '스스로 결정권을 가질 때 성과가 좋습니다. 위에서 시키는 일만 하는 자리는 오래 버티기 어렵습니다.' : an.strength === '신약' ? '좋은 상사, 선배, 팀을 만날 때 크게 성장합니다. 직장을 고를 때 사람을 먼저 보세요.' : '어떤 환경에서도 무난하게 적응하는 편입니다.');
    const caution = [];
    if (g.식상 >= 3) caution.push('윗사람에게 바른말을 하다 미움받기 쉽습니다. 옳은 말도 타이밍을 고르세요.');
    if (g.비겁 >= 3) caution.push('동료와 경쟁 구도가 생기기 쉽습니다. 공을 나누면 오히려 내 평판이 올라갑니다.');
    if (g.인성 >= 3) caution.push('계획과 준비가 길어 실행이 늦다는 평을 듣기 쉽습니다. 완벽보다 속도를 의식하세요.');
    if (g.관성 >= 3) caution.push('압박을 혼자 견디다 지치기 쉽습니다. 일과 휴식의 경계를 분명히 하세요.');
    if (!caution.length) caution.push('직장 생활에서 크게 부딪히는 구조는 없습니다. 꾸준함이 가장 큰 무기입니다.');
    D.career = {
      keywords: [CAREER_KEY[top], hasSin('역마') ? '움직이는 일' : null, hasSin('문창귀인') ? '두뇌 직군' : null, an.strength === '신강' ? '결정권이 필요함' : an.strength === '신약' ? '사람 복으로 성장' : '적응력 좋음'].filter(Boolean),
      summary: `${GROUP[top].strength} 여기에 ${josa(GROUP[second].key, '이/가')} 더해져, 두 가지를 함께 쓸 수 있는 일에서 가장 크게 성장합니다.`,
      sections: [
        { title: '잘 맞는 일', kind: 'list', items: fit },
        { title: '일하는 스타일', kind: 'list', items: style },
        { title: '직장에서 조심할 점', kind: 'list', items: caution },
      ],
      timing: { title: '앞으로 10년 일과 진로 흐름', ...timing(ctx, 'career') },
      advice: '사주에서 가장 강한 기운을 쓰는 일을 할 때 운이 가장 크게 열립니다. 지금 하는 일이 그 방향과 맞는지 점검해 보세요.',
    };
  }

  /* 건강운 */
  {
    const weakE = an.elemCount.indexOf(Math.min(...an.elemCount));
    const maxE = an.elemCount.indexOf(Math.max(...an.elemCount));
    const items = [`약하기 쉬운 곳은 ${HEALTH[weakE]}입니다. ${HEALTH_DETAIL[weakE]}`];
    if (an.elemCount[maxE] >= 3) items.push(`기운이 몰린 쪽도 과로하기 쉽습니다. ${HEALTH_DETAIL[maxE]}`);
    const habits = [`${LUCKY[an.yongsin].act} 같은 활동이 몸과 마음의 균형을 잡아줍니다.`];
    habits.push(an.strength === '신강' ? '체력이 좋은 편이라 무리해도 티가 덜 나 더 위험합니다. 쉬는 날을 정해두세요.' : an.strength === '신약' ? '체력이 쉽게 떨어지는 편이라 잠과 식사를 규칙적으로 챙기는 것만으로도 큰 차이가 납니다.' : '기본 체력은 무난합니다. 계절이 바뀔 때 컨디션 관리에 신경 쓰세요.');
    if (hasSin('양인') || hasSin('백호')) habits.push('급하게 움직이다 다치기 쉬운 기운이 있습니다. 운전과 격한 운동에서 안전을 먼저 챙기세요.');
    if (g.관성 >= 3 || g.인성 >= 3) habits.push('스트레스와 생각이 몸으로 가기 쉽습니다. 머리를 비우는 취미를 하나 두세요.');
    D.health = {
      keywords: [`${ELEMENT_KEYWORD[weakE]}의 기운 보충`, an.strength === '신강' ? '체력 좋음' : an.strength === '신약' ? '규칙적인 생활이 중요' : '무난한 체질', hasSin('양인') || hasSin('백호') ? '안전 주의' : null].filter(Boolean),
      summary: `타고난 기운 중 ${ELEMENT_PLAIN[weakE]}의 기운이 가장 약하고 ${ELEMENT_PLAIN[maxE]}의 기운이 가장 강합니다. 약한 쪽은 채우고 강한 쪽은 무리하지 않는 것이 건강 관리의 핵심입니다.`,
      sections: [
        { title: '신경 써야 할 곳', kind: 'list', items: items },
        { title: '나에게 맞는 생활 습관', kind: 'list', items: habits },
      ],
      timing: { title: '앞으로 10년 건강 흐름', ...timing(ctx, 'health') },
      note: '명리학의 전통 해석이며 의학적 진단을 대신하지 않습니다. 증상이 있으면 병원을 찾으세요.',
      advice: '아픈 곳이 생기기 전에 약한 곳을 미리 챙기는 것이 이 사주의 건강 비결입니다.',
    };
  }

  /* 올해운 */
  {
    const yi = yearInfo(ctx, nowYear);
    const areas = ['wealth', 'love', 'career', 'health'].map((dm) => {
      const s = scoreFor(ctx, yi, dm);
      const w = whyFor(ctx, yi, dm, s);
      return { label: { wealth: '재물', love: '연애', career: '일과 진로', health: '건강' }[dm], score: s, text: w.why };
    });
    if (age >= 24) {
      const s = scoreFor(ctx, yi, 'marriage');
      areas.splice(2, 0, { label: '결혼', score: s, text: whyFor(ctx, yi, 'marriage', s).why });
    }
    const flow = [];
    if (yi.g1 !== yi.g2) flow.push(`상반기에는 ${GROUP[yi.g1].theme}, 하반기에는 ${GROUP[yi.g2].theme}의 기운이 더 강하게 작용합니다.`);
    flow.push(`${GROUP[yi.g2].flow}의 해입니다.`, elementEffect(an, yi.f.stem, yi.f.branch, 'present'));
    if (yi.clash) flow.push('나와 부딪히는 해라 이사, 이직, 관계 변화가 생기기 쉽습니다. 변화를 피하기보다 준비된 변화를 선택하세요.');
    if (yi.harm) flow.push('나와 잘 맞는 해라 좋은 인연과 협력이 들어오기 쉽습니다.');
    if (yi.peach) flow.push('사람의 시선이 모이고 인기가 오르는 해입니다.');
    if (yi.horse) flow.push('이동, 출장, 이사, 해외와 관련된 일이 생기기 쉬운 해입니다.');
    const ys = luckScore(an, yi.f.stem, yi.f.branch);
    D.year = {
      title: `${nowYear}년, ${yi.name}`,
      keywords: [yi.name, `${scoreAdj(ys)} 해`, GROUP[yi.g1].theme, yi.g2 !== yi.g1 ? GROUP[yi.g2].theme : null].filter(Boolean),
      summary: R.now.slice(1).join(' '),
      sections: [
        { title: '올해의 흐름', kind: 'list', items: flow },
        { title: '분야별로 보면', kind: 'areas', items: areas },
        { title: '월별 흐름', kind: 'months', items: R.months },
      ],
      advice: ys >= 1 ? TIPS.overall.good : TIPS.overall.bad,
    };
  }

  /* 종합 (앞으로 10년) */
  D.overallTiming = { title: '앞으로 10년, 좋은 해와 조심할 해', ...timing(ctx, 'overall') };
  D.ilju = iljuReading(P);
  return D;
}

export { scoreWord };
