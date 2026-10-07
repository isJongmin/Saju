// 일주 풀이와 분야별(연애, 결혼, 재물, 직업, 건강, 올해) 상세 해석
import {
  STEMS, BRANCHES, STEMS_KO, BRANCHES_KO, ZODIAC, BRANCH_ELEMENT, TEN_GODS,
  stemElement, tenGod, branchTenGod, isClash, isHarmony, isWonjin, harmonyOf, sinsal, twelveStage, yearFortune, mod, samjae,
} from './core.js';
import {
  josa, luckScore, scoreWord, koreanAge, elementEffect, groupOfStem, groupOfBranch, currentDaewoon,
  yongName, giName, weakestElement, strongestElement, pick, STAGE_PHASE,
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

/* ---------------- 연도·대운 공통 ---------------- */

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

// 대운(10년) 흐름용: 시제를 붙일 수 있도록 '~하는' 꼴
const PERIOD_PHRASE = {
  love: (male) => ({
    비겁: '친구, 동료 사이에서 인연이 생기지만 경쟁자도 함께 나타나는',
    식상: '표현이 늘고 매력이 잘 드러나 먼저 다가가기 좋은',
    재성: male ? '이성 인연이 직접 들어오는' : '연애보다 현실과 실속을 챙기게 되는',
    관성: male ? '일과 책임 때문에 연애가 뒤로 밀리기 쉬운' : '이성 인연이 직접 들어오는',
    인성: '소개나 주변의 추천으로 편안한 인연이 닿는',
  }),
  marriage: (male) => ({
    비겁: '결혼보다 내 삶의 독립이 먼저가 되는',
    식상: male ? '가정과 자녀 계획이 구체화되는' : '자녀 인연이 들고 관계에서 내 목소리가 커지는',
    재성: male ? '배우자 인연이 들어오는' : '집, 살림 같은 현실적인 준비가 진행되는',
    관성: male ? '가정에 대한 책임감이 커지는' : '배우자 인연이 들어오는',
    인성: '집안 어른의 도움이나 집, 혼인 같은 문서 일이 생기는',
  }),
  wealth: () => ({
    비겁: '돈이 사람을 통해 나가고 지출과 경쟁이 늘어나는',
    식상: '재능과 기술을 팔아 수입을 만들기 좋은',
    재성: '수입과 재물의 기회가 직접 들어오는',
    관성: '조직을 통한 안정된 수입과 승진의 보상이 따르는',
    인성: '현금보다 계약, 문서, 부동산 같은 자산 일이 생기는',
  }),
  career: () => ({
    비겁: '독립이나 동업을 꿈꾸고 경쟁이 치열해지는',
    식상: '새 프로젝트와 창작으로 능력을 보여주는',
    재성: '실적과 성과로 평가받는',
    관성: '승진, 자리 이동, 책임이 커지는',
    인성: '공부와 자격, 윗사람의 도움이 따르는',
  }),
};
const FLOW_SUBJ = { love: '연애의 흐름', marriage: '가정의 흐름', wealth: '돈의 흐름', career: '일의 흐름', health: '몸의 흐름' };
const FLOW_PRED = {
  up: { past: '순탄한 편이었습니다', present: '순탄한 편입니다', future: '순탄할 것으로 보입니다' },
  mid: { past: '좋고 나쁨이 섞여 있었습니다', present: '좋고 나쁨이 섞여 있습니다', future: '좋고 나쁨이 섞일 것으로 보입니다' },
  down: { past: '다소 무거웠습니다', present: '다소 무거운 편입니다', future: '다소 무거워질 수 있습니다' },
};
const CLASH_PH = {
  love: '관계가 크게 흔들리거나 바뀌는', marriage: '이사, 거리두기처럼 가정에 변화가 생기는', wealth: '수입 구조가 크게 바뀌는',
  career: '직장이나 맡은 자리가 바뀌는', health: '사고나 갑작스러운 몸의 변화가 생기는',
};
const HARM_PH = {
  love: '마음 맞는 사람과 자연스럽게 가까워지는', marriage: '인연이 맺어지고 가정이 안정되는', wealth: '좋은 협력자를 통해 돈이 들어오는',
  career: '좋은 동료와 윗사람을 만나는', health: '몸과 마음이 편안해지는',
};
// 같은 묶음이라도 열 가지 십성마다 기운이 펼쳐지는 방식이 다르다
const GOD_TONE = {
  비견: '내 힘으로 차근차근', 겁재: '경쟁 속에서 거칠게', 식신: '여유 있게 즐기며', 상관: '틀을 깨며 날카롭게', 편재: '크고 불규칙하게',
  정재: '꾸준하고 안정적으로', 편관: '압박 속에서 급하게', 정관: '규칙과 절차를 따라', 편인: '남다른 방식으로', 정인: '도움을 받으며 편안하게',
};
const EVENT_END = { past: '일이 있었을 가능성이 큽니다', present: '일이 생기기 쉽습니다', future: '일이 생길 수 있습니다' };
const PERIOD_END = { past: '시기였습니다', present: '시기입니다', future: '시기가 옵니다' };

const TIPS = {
  love: { good: ['모임과 소개 자리를 적극적으로 늘려보세요. 마음이 있다면 먼저 표현하는 쪽이 유리합니다.', '오래 알던 사람을 새로운 눈으로 다시 보세요. 가까운 곳에 인연이 있습니다.', '새로운 취미 모임처럼 평소와 다른 곳에 발을 들이면 인연이 닿습니다.'],
    bad: ['감정적인 말은 하루 미루고, 관계에 대한 큰 결정은 서두르지 마세요.', '서운한 일은 쌓아두지 말고 짧게 그때그때 말로 푸세요.', '새 인연보다 지금 곁의 관계를 돌보는 데 힘을 쓰세요.'] },
  marriage: { good: ['결혼 이야기를 꺼내거나 양가 인사, 집 계약 같은 일을 진행하기 좋습니다.', '함께 살 집과 돈 관리 방식을 구체적으로 이야기해 보세요.', '미뤄둔 가족 행사나 인사를 챙기면 관계가 단단해집니다.'],
    bad: ['서로의 생활 방식 차이가 드러나기 쉽습니다. 결정 전에 충분히 대화하세요.', '큰 지출이나 이사는 한 번 더 상의하고 결정하세요.', '서로에게 혼자만의 시간을 허락하는 것이 갈등을 줄입니다.'] },
  wealth: { good: ['수입을 늘릴 기회를 적극적으로 잡되 들어온 돈의 일부는 바로 묶어두세요.', '부업이나 새로운 수입원을 시험해 보기 좋은 해입니다.', '모아둔 돈의 쓰임을 점검하고 불릴 계획을 세우세요.'],
    bad: ['큰 투자, 보증, 돈 거래는 피하고 고정 지출부터 점검하세요.', '지출 기록을 시작하고 충동 구매를 줄이세요.', '수익보다 원금을 지키는 쪽으로 자산을 정리하세요.'] },
  career: { good: ['이직, 승진 도전, 새 프로젝트 제안을 해볼 만한 때입니다.', '평소 미뤄둔 자격 취득이나 포트폴리오 정리에 힘을 쏟으세요.', '내 성과를 숫자와 결과물로 정리해 보여주세요.'],
    bad: ['자리를 옮기기보다 지금 자리에서 실력을 다지고 평판을 지키세요.', '윗사람과의 마찰을 피하고 맡은 일의 마감을 지키세요.', '무리한 확장보다 지금 하는 일의 완성도를 높이세요.'] },
  health: { good: ['컨디션이 회복되기 쉬운 때입니다. 운동 습관을 새로 들이기 좋습니다.', '미뤄둔 치료나 검진을 받기 좋은 해입니다.', '식습관을 바꾸면 효과가 잘 나타나는 해입니다.'],
    bad: ['과로를 피하고 정기 검진을 챙기세요. 운전과 운동 중 부상에도 주의하세요.', '잠과 식사 시간을 일정하게 지키는 것을 최우선으로 하세요.', '몸의 작은 신호를 무시하지 말고 일찍 병원을 찾으세요.'] },
  overall: { good: ['미뤄두었던 계획을 실행에 옮기기 좋은 때입니다.', '새로운 시작에 힘을 실어도 좋은 해입니다.', '사람을 만나고 기회를 넓히는 데 힘을 쓰세요.'],
    bad: ['새로 벌이기보다 정리하고 점검하는 데 힘을 쓰세요.', '큰 결정은 한 번 더 확인하고 속도를 늦추세요.', '건강과 가까운 관계를 먼저 챙기는 해로 삼으세요.'] },
};

function pillarInfo(ctx, stem, branch) {
  const { ds, db, P, an } = ctx;
  const ss = [...sinsal(P.year.branch, branch), ...sinsal(db, branch)];
  return {
    stem, branch,
    g1: groupOfStem(ds, stem), g2: groupOfBranch(ds, branch),
    base: luckScore(an, stem, branch),
    clash: isClash(branch, db), harm: isHarmony(branch, db), wonjin: isWonjin(branch, db),
    peach: ss.includes('도화'), horse: ss.includes('역마'),
    stage: twelveStage(ds, branch),
    god: TEN_GODS[branchTenGod(ds, branch)],
  };
}
function yearInfo(ctx, y) {
  const f = yearFortune(y);
  return { y, f, name: yearName(f), samjae: samjae(ctx.P.year.branch, f.branch), ...pillarInfo(ctx, f.stem, f.branch) };
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

// 연도 해석 문장 목록 (중복 제거를 위해 문장 단위 배열로 반환)
function whySentences(ctx, info, domain) {
  const { male, an } = ctx;
  const out = [];
  const els = [stemElement(info.stem), BRANCH_ELEMENT[info.branch]];
  const variant = (info.y || 0) + domain.length;
  if (domain === 'health') {
    if (els.includes(an.gisin)) out.push(`${giName(an)}의 기운이 더해져 ${HEALTH[an.gisin]}에 무리가 오기 쉽습니다.`);
    if (els.includes(an.yongsin)) out.push(`${yongName(an)}의 기운이 채워져 ${HEALTH[an.yongsin]} 쪽이 편안해지고 회복이 빠릅니다.`);
    if (!out.length) out.push('기운의 균형이 크게 흔들리지 않는 해입니다.');
    if (info.clash) out.push('나와 부딪히는 기운이라 사고, 부상, 갑작스러운 몸의 변화에 주의가 필요합니다.');
  } else {
    const map = DOMAIN_GROUP[domain](male);
    if (info.g1 !== info.g2 && map[info.g1] !== map[info.g2]) out.push(`상반기에는 ${map[info.g1]} 하반기에는 ${map[info.g2]}`);
    else out.push(map[info.g2]);
    out.push(`변화는 ${GOD_TONE[info.god]} 찾아옵니다.`);
    if (domain === 'love') {
      if (info.peach) out.push('매력이 드러나 사람들의 시선이 모이는 해입니다.');
      if (info.harm) out.push('배우자 자리와 잘 맞는 기운이 들어와 관계가 자연스럽게 깊어집니다.');
      if (info.clash) out.push('배우자 자리와 부딪히는 기운이라 다툼이나 이별, 관계의 큰 변화가 생기기 쉽습니다.');
      if (info.wonjin) out.push('서운함과 오해가 쌓이기 쉬운 기운이 있습니다.');
    } else if (domain === 'marriage') {
      if (info.harm) out.push('배우자 자리와 합이 드는 해라 결혼 인연이 맺어지기 쉬운 대표적인 시기입니다.');
      if (info.clash) out.push('배우자 자리가 흔들리는 해라 이사, 별거, 갈등처럼 가정에 변화가 생기기 쉽습니다.');
      if (info.wonjin) out.push('배우자와 이유 없는 서운함이 생기기 쉽습니다.');
    }
    out.push(elementEffect(an, info.stem, info.branch, 'future', variant));
    {
      if (domain === 'career' && info.horse) out.push('이동의 기운이 있어 부서 이동, 출장, 이직처럼 자리가 바뀌기 쉽습니다.');
      if (domain === 'overall' && info.clash) out.push('나와 부딪히는 기운이라 이사, 이직, 관계 변화가 생기기 쉽습니다.');
      if (domain === 'overall' && info.harm) out.push('나와 잘 맞는 기운이라 좋은 인연과 협력이 들어옵니다.');
    }
  }
  out.push(`한 해의 에너지는 ${STAGE_PHASE[info.stage]} 흐름입니다.`);
  if (info.samjae && (domain === 'overall' || domain === 'health')) out.push(`${ZODIAC[ctx.P.year.branch]}띠의 ${info.samjae} 해라 큰 변화는 서두르지 않는 것이 좋습니다.`);
  return out.filter(Boolean);
}

// 여러 연도 카드에서 이미 나온 문장은 빼서 해마다 다른 설명이 보이게 한다
function dedupeCards(cards) {
  const seen = new Set();
  for (const c of cards) {
    // 첫 문장(그 해의 주제)은 빼지 않고, 이미 나온 주제면 '다시 이어진다'로 바꿔 말한다
    if (seen.has(c.sentences[0])) c.sentences[0] = c.themeAgain;
    const fresh = c.sentences.filter((s) => !seen.has(s));
    const kept = fresh.length >= 2 ? fresh : [...fresh, ...c.sentences.filter((s) => seen.has(s))].slice(0, Math.max(2, fresh.length));
    kept.forEach((s) => seen.add(s));
    c.why = kept.join(' ');
    delete c.sentences;
  }
  // 조언도 겹치지 않게
  const tipSeen = new Map();
  for (const c of cards) {
    const n = tipSeen.get(c.tipKey) || 0;
    c.tip = c.tips[n % c.tips.length];
    tipSeen.set(c.tipKey, n + 1);
    delete c.tips; delete c.tipKey;
  }
  return cards;
}

function yearCard(ctx, y, domain) {
  const info = yearInfo(ctx, y);
  const score = scoreFor(ctx, info, domain);
  const kind = score >= 0 ? 'good' : 'bad';
  return {
    y, name: info.name, age: koreanAge(ctx.saju, y), score,
    theme: GROUP[info.g2].theme, samjae: info.samjae,
    themeAgain: info.g1 === info.g2 ? `${GROUP[info.g2].theme}의 기운이 앞서 본 해처럼 다시 들어옵니다.` : `${GROUP[info.g1].theme}에서 ${josa(GROUP[info.g2].theme, '으로/로')} 넘어가는 흐름이 앞서 본 해처럼 다시 나타납니다.`,
    sentences: whySentences(ctx, info, domain),
    tips: TIPS[domain][kind].map((t, i, a) => a[(i + ctx.seed) % a.length]), tipKey: kind,
  };
}

function timing(ctx, domain, { years = 10, from = ctx.nowYear, minAge = 0 } = {}) {
  const all = [];
  for (let y = from; y < from + years; y++) {
    if (koreanAge(ctx.saju, y) < minAge) continue;
    all.push(yearCard(ctx, y, domain));
  }
  const good = all.filter((a) => a.score > 0).sort((a, b) => b.score - a.score || a.y - b.y).slice(0, 3).sort((a, b) => a.y - b.y);
  const caution = all.filter((a) => a.score < 0).sort((a, b) => a.score - b.score || a.y - b.y).slice(0, 2).sort((a, b) => a.y - b.y);
  dedupeCards([...good, ...caution].sort((a, b) => a.y - b.y));
  return { good, caution };
}

// 분야별 과거, 현재, 미래 (대운 기준)
function domainFlow(ctx, domain) {
  const { saju, nowYear, male } = ctx;
  const list = saju.daewoon.list;
  const cur = currentDaewoon(saju, nowYear);
  const idx = cur ? list.indexOf(cur) : -1;
  const picks = [];
  if (idx > 0) picks.push([list[idx - 1], 'past', '지나온 10년']);
  if (cur) picks.push([cur, 'present', '지금의 10년']);
  if (list[idx + 1]) picks.push([list[idx + 1], 'future', '다가올 10년']);
  if (!cur && list[1]) picks.push([list[1], 'future', '그다음 10년']);
  const phrase = domain === 'health' ? null : PERIOD_PHRASE[domain](male);
  let prevFirst = null;
  return picks.map(([p, tense, label]) => {
    const info = pillarInfo(ctx, p.stem, p.branch);
    const score = scoreFor(ctx, info, domain);
    const end = PERIOD_END[tense];
    const parts = [];
    if (domain === 'health') {
      parts.push(`몸의 에너지로 보면 ${STAGE_PHASE[info.stage]} ${end}.`);
      const els = [stemElement(p.stem), BRANCH_ELEMENT[p.branch]];
      if (els.includes(ctx.an.gisin)) parts.push(`${HEALTH[ctx.an.gisin]}에 무리가 가기 쉬운 ${end}.`);
      else if (els.includes(ctx.an.yongsin)) parts.push(`약했던 ${HEALTH[ctx.an.yongsin]} 쪽이 힘을 얻는 ${end}.`);
    } else {
      const first = info.g1 !== info.g2 && phrase[info.g1] !== phrase[info.g2]
        ? `앞 5년은 ${phrase[info.g1]} 시기, 뒤 5년은 ${phrase[info.g2]} ${end}.`
        : `${phrase[info.g2]} ${end}.`;
      const key = `${info.g1}|${info.g2}`;
      parts.push(key === prevFirst ? `앞선 10년과 같은 주제가 이어지지만, 이번에는 기운이 ${GOD_TONE[info.god]} 흘러가는 ${end}.` : first);
      prevFirst = key;
      parts.push(`에너지로 보면 ${STAGE_PHASE[info.stage]} 때입니다.`);
    }
    const sign = score > 0 ? 'up' : score < 0 ? 'down' : 'mid';
    parts.push(`${josa(FLOW_SUBJ[domain], '이/가')} ${FLOW_PRED[sign][tense]}.`);
    if (info.clash) parts.push(`${CLASH_PH[domain]} ${EVENT_END[tense]}.`);
    if (info.harm) parts.push(`${HARM_PH[domain]} ${EVENT_END[tense]}.`);
    return { label, range: `${p.age}~${p.age + 9}세`, years: `${p.startYear}~${p.startYear + 9}년`, tense, score, text: parts.join(' ') };
  });
}

// 약점과 보강법을 짝으로 관리해 '약점은 있는데 처방이 없는' 상태를 막는다
const pairs = (arr) => ({ weak: arr.map((x) => x[0]), boost: [...new Set(arr.map((x) => x[1]).filter(Boolean))] });

/* ---------------- 분야별 사전 ---------------- */

const LOVE_STYLE = [
  { key: '직진형 연애', text: '당신은 좋아하면 곧게 직진하는 사람입니다. 상대를 키워주고 함께 성장하는 연애를 하며, 한번 마음을 주면 오래갑니다.' },
  { key: '열정형 연애', text: '당신은 감정 표현이 크고 뜨거운 연애를 하는 사람입니다. 첫눈에 반하기 쉽고 설렘과 이벤트를 중요하게 여깁니다.' },
  { key: '신뢰형 연애', text: '당신은 천천히 믿음을 쌓는 연애를 하는 사람입니다. 화려함보다 편안함과 안정감을 중요하게 여기고, 한번 맺은 관계는 끝까지 책임지려 합니다.' },
  { key: '확신형 연애', text: '당신은 좋고 싫음이 분명하고 확실한 관계를 원하는 사람입니다. 의리 있고 약속을 잘 지키며 애매한 관계를 오래 두지 않습니다.' },
  { key: '교감형 연애', text: '당신은 자유롭고 깊은 교감을 원하는 연애를 하는 사람입니다. 대화가 통하는 사람에게 끌리고 상대의 마음을 잘 읽습니다.' },
];
const LOVE_STRENGTH = [
  '한번 마음을 주면 오래가고, 상대가 성장하도록 곁에서 밀어주는 연인이 됩니다.',
  '감정 표현이 솔직하고 따뜻해 상대가 사랑받고 있다고 느끼게 합니다.',
  '믿음과 안정감을 주는 사람이라 오래 함께하고 싶은 상대가 됩니다.',
  '약속을 지키고 의리가 있어 신뢰받는 연인이 됩니다.',
  '상대의 마음을 잘 읽고 대화가 깊어 정서적 교감이 뛰어납니다.',
];
const LOVE_WEAK = [
  '내 방식이 옳다는 고집이 갈등의 씨앗이 되기 쉽습니다.',
  '빨리 달아오른 만큼 빨리 식을 수 있습니다.',
  '표현이 적어 상대가 서운해하기 쉽습니다.',
  '상대의 작은 실수에도 실망이 크게 남을 수 있습니다.',
  '구속받는 느낌을 싫어하고 속마음을 다 드러내지 않아 상대가 불안해할 수 있습니다.',
];
const LOVE_FIX = [
  '연애에서는 이기는 것보다 맞춰가는 것이 남는다는 점을 의식하세요. 상대의 방식을 한 번 따라가 보는 것도 방법입니다.',
  '설렘이 줄어드는 시기를 위기가 아닌 다음 단계로 보세요. 함께하는 새로운 경험이 관계를 다시 데웁니다.',
  '말이 어렵다면 작은 행동으로라도 마음을 자주 보여주세요. 짧은 메시지 하나가 큰 차이를 만듭니다.',
  '실망스러운 일은 결론부터 내리지 말고 상대의 사정을 먼저 물어보세요.',
  '혼자만의 시간이 필요하다는 것을 미리 말해두면 상대의 불안이 줄어듭니다.',
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
  비겁: { key: '친구 같은 배우자', text: '친구 같은 동등한 관계를 원합니다. 서로 독립적인 영역을 존중할 때 오래갑니다.', good: '배우자와 친구처럼 대등하게 지내며 함께 도전하는 부부가 됩니다.' },
  식상: { key: '다정한 배우자', text: '편안하고 다정한 관계를 만듭니다. 함께 먹고 즐기는 일상이 관계의 중심입니다.', good: '함께 먹고 웃는 시간이 많은 다정한 가정을 만듭니다.' },
  재성: { key: '생활력 있는 배우자', text: '현실적이고 생활력 있는 배우자 인연입니다. 함께 경제적 기반을 쌓아가는 결혼입니다.', good: '살림과 재테크에서 배우자와 손발이 잘 맞습니다.' },
  관성: { key: '반듯한 배우자', text: '반듯하고 책임감 있는 배우자 인연입니다. 서로의 역할과 예의를 지킬 때 안정됩니다.', good: '서로의 역할을 존중하는 반듯한 가정을 꾸리고, 사회적으로 인정받는 배우자를 만나기 쉽습니다.' },
  인성: { key: '마음이 통하는 배우자', text: '정신적 교감을 중시하고 서로 의지하는 관계입니다.', good: '서로 의지하고 보살피는 따뜻한 관계를 만들고, 배우자에게 보살핌을 받기 쉽습니다.' },
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
  const ctx = { saju, an, P, ds, db, male, nowYear, seed: R.seed };
  const g = an.groupScore;
  const sins = R.sinsal;
  const hasSin = (k) => sins.some((s) => s.key === k);
  const loveG = male ? '재성' : '관성';
  const L = LUCKY[an.yongsin];
  const pillarsArr = [['year', P.year], ['month', P.month], ['day', P.day], ['hour', P.hour]].filter(([, p]) => p);
  const loveStarPos = [];
  for (const [pos, p] of pillarsArr) {
    if (pos !== 'day' && groupOfStem(ds, p.stem) === loveG) loveStarPos.push(pos);
    if (groupOfBranch(ds, p.branch) === loveG) loveStarPos.push(pos);
  }
  const others = [P.year, P.month, P.hour].filter(Boolean);
  const dayClash = others.some((p) => isClash(p.branch, db));
  const dayHarm = others.some((p) => isHarmony(p.branch, db));
  const dayWonjin = others.some((p) => isWonjin(p.branch, db));
  const spouseG = groupOfBranch(ds, db);
  const D = {};

  /* 연애운 */
  {
    const style = LOVE_STYLE[de];
    const cnt = g[loveG];
    const strengths = [LOVE_STRENGTH[de]];
    if (hasSin('도화')) strengths.push('매력의 별이 있어 첫인상과 분위기로 호감을 얻습니다. 본인은 모르게 관심받는 경우가 많습니다.');
    if (hasSin('홍염')) strengths.push('꾸미지 않아도 풍기는 은은한 분위기가 있어 이성에게 오래 기억됩니다.');
    if (g.식상 >= 2) strengths.push('표현력이 좋아 말로 마음을 잘 전합니다.');
    if (g.인성 >= 2) strengths.push('상대를 세심하게 챙기고 배려하는 마음이 깊습니다.');
    if (loveStarPos.includes('day')) strengths.push('인연의 별이 배우자 자리에 있어 진지한 연애가 결혼으로 이어지기 쉽습니다.');
    const wp = [[LOVE_WEAK[de], LOVE_FIX[de]]];
    if (cnt === 0) wp.push(['이성 인연을 뜻하는 기운이 드러나 있지 않아 인연이 저절로 찾아오지 않습니다.', '사람을 만나는 자리를 정기적으로 만드세요. 취미 모임처럼 자연스럽게 반복되는 만남이 가장 효과적입니다.']);
    if (cnt >= 3) wp.push(['인연이 많은 만큼 관계가 겹치거나 정리가 흐려지기 쉽습니다.', '나에게 맞는 사람의 기준 세 가지를 정해두고 그에 맞춰 고르세요.']);
    if (male && g.비겁 >= 3) wp.push(['연애에서 경쟁자가 생기기 쉽고 친구 관계가 끼어들 수 있습니다.', '연인과 친구 모임의 경계를 분명히 하세요.']);
    if (!male && g.비겁 >= 3) wp.push(['자존심이 강해 먼저 사과하거나 양보하기 어렵습니다.', '"나는 이렇게 느꼈어"로 말을 시작하면 다툼이 대화로 바뀝니다.']);
    if (dayClash) wp.push(['배우자 자리가 흔들리는 구조라 연애 초반의 뜨거움이 오래가기 어렵습니다.', '감정의 기복을 혼자 삭이지 말고 대화로 풀어야 관계가 오래갑니다.']);
    if (dayWonjin) wp.push(['사소한 일로 서운함이 쌓이기 쉽습니다.', '서운함은 그날 안에 짧게 말로 푸는 규칙을 만드세요.']);
    if (g.인성 >= 3) wp.push(['생각이 많아 마음이 있어도 먼저 다가가기를 망설입니다.', '확신이 들 때까지 기다리지 말고 가벼운 약속부터 먼저 제안해 보세요.']);
    if (g.식상 >= 3 && !male) wp.push(['솔직한 표현이 지나쳐 상대가 상처받을 수 있습니다.', '불만은 요청으로 바꿔 말해 보세요.']);
    if (male && g.관성 >= 3) wp.push(['일과 책임이 앞서 연애가 뒤로 밀리기 쉽습니다.', '바빠도 연인을 위한 고정 시간을 일정표에 먼저 넣으세요.']);
    const { weak, boost } = pairs(wp);
    boost.push(`${L.color} 계열의 옷이나 소품, ${L.place} 같은 데이트 장소가 인연의 기운을 돕습니다.`);
    const meet = [...new Set(loveStarPos)].map((pos) => POS_LOVE[pos]);
    if (!meet.length) meet.push('정해진 만남의 길이 뚜렷하지 않아, 운에서 인연의 기운이 들어오는 해에 예상치 못한 곳에서 만나기 쉽습니다.');
    if (hasSin('역마')) meet.push('여행, 출장, 이사처럼 이동하는 중에 인연이 닿기 쉽습니다.');
    const h = harmonyOf(db);
    D.love = {
      keywords: [style.key, cnt === 0 ? '늦게 피는 인연' : cnt >= 3 ? '인연이 많은 편' : '자연스러운 인연', hasSin('도화') || hasSin('홍염') ? '타고난 매력' : null, g.식상 >= 2 ? '표현이 풍부함' : g.인성 >= 3 ? '신중한 연애' : null].filter(Boolean),
      summary: style.text,
      pair: { strengths, weak },
      boost,
      sections: [
        { title: '인연을 만나는 곳', kind: 'list', items: meet },
        { title: '나와 잘 맞는 사람', kind: 'list', items: [
          `${ELEMENT_PERSON[an.yongsin]}에게 끌리고, 함께 있을 때 내 부족한 부분이 채워집니다.`,
          `띠로 보면 ${ZODIAC[h]}띠와 정서적으로 잘 통하고, ${ZODIAC[mod(db + 6, 12)]}띠와는 부딪히기 쉬워 더 많은 대화가 필요합니다.`,
          `상대의 일간이 ${[an.yongsin * 2, an.yongsin * 2 + 1].map((x) => `${STEMS_KO[x]}(${STEMS[x]})`).join(', ')}이면 서로에게 힘이 되는 궁합입니다.`,
        ] },
      ],
      flow: domainFlow(ctx, 'love'),
      timing: { title: '앞으로 10년 연애 흐름', ...timing(ctx, 'love') },
      advice: cnt === 0 ? '기다리기보다 사람을 만나는 자리에 꾸준히 나가는 것이 인연을 부르는 가장 확실한 방법입니다.' : '좋은 인연은 이미 주변에 있을 가능성이 큽니다. 서두르기보다 오래 본 사람을 다시 보세요.',
    };
  }

  /* 결혼운 */
  {
    const sp = SPOUSE[spouseG];
    const stage = twelveStage(ds, db);
    const strengths = [sp.good];
    if (dayHarm) strengths.push('가정을 안정시키려는 힘이 있어 결혼 후 생활이 차분해지고 내조, 외조를 받기 쉽습니다.');
    if (['장생', '관대', '건록', '제왕'].includes(stage)) strengths.push('배우자 자리에 힘이 있어 배우자가 제 몫을 해내는 사람이기 쉽습니다.');
    if (sins.some((s) => s.key === '천을귀인' && s.pos === 'day')) strengths.push('배우자 자리에 귀인의 별이 있어 배우자 덕을 보기 쉽습니다.');
    if (de === 2) strengths.push('가족을 끝까지 책임지려는 마음이 커 집안의 중심이 됩니다.');
    const wp = [];
    if (dayClash) wp.push(['배우자 자리가 부딪히는 구조라 주말부부, 잦은 이사처럼 거리가 생기기 쉽습니다.', '각자의 시간과 공간을 인정하세요. 떨어져 있는 시간이 오히려 관계를 지켜줍니다.']);
    if (dayWonjin) wp.push(['작은 서운함이 쌓이기 쉬운 구조입니다.', '한 달에 한 번은 둘만의 대화 시간을 정해두세요.']);
    if (g[loveG] === 0) wp.push(['배우자를 뜻하는 기운이 약해 결혼 결심이 늦어지기 쉽습니다.', '서두르기보다 충분히 알아보고 하는 결혼이 더 안정적입니다.']);
    if (g[loveG] >= 3) wp.push(['배우자를 뜻하는 기운이 많아 결혼 전 여러 인연을 거치거나 이성 문제로 오해받기 쉽습니다.', '이성 관계의 선을 배우자가 먼저 알 수 있게 투명하게 하세요.']);
    if (male && g.비겁 >= 3) wp.push(['집안의 주도권 다툼이 생기기 쉽습니다.', '돈 관리와 집안일의 역할을 결혼 전에 미리 정해두세요.']);
    if (!male && g.식상 >= 3) wp.push(['배우자에게 바라는 것이 많아질 수 있습니다.', '칭찬과 감사의 표현을 의식적으로 늘리세요.']);
    if (g.인성 >= 3) wp.push(['배우자에게 정서적으로 기대는 마음이 큽니다.', '배우자가 지칠 때 한 걸음 물러서 주는 배려가 필요합니다.']);
    if (['병', '사', '묘', '절'].includes(stage)) wp.push(['배우자 자리의 기운이 약해 배우자의 건강이나 일에 신경 쓸 일이 생기기 쉽습니다.', '배우자의 컨디션을 살피고 서로의 짐을 나누세요.']);
    if (!wp.length) wp.push(['결혼 생활에 크게 부딪히는 구조는 없지만, 무난함이 무관심으로 바뀌지 않게 해야 합니다.', '기념일과 작은 이벤트를 챙기는 습관이 관계의 온도를 지켜줍니다.']);
    const { weak, boost } = pairs(wp);
    boost.push(`집 안에 ${josa(L.item, '을/를')} 두거나 ${L.color} 계열로 꾸미면 가정의 기운이 편안해집니다.`);
    const late = g[loveG] === 0 || dayClash;
    const t = age < 20 ? null : timing(ctx, 'marriage', { minAge: 24 });
    D.marriage = {
      keywords: [sp.key, late ? '늦은 결혼이 유리' : '인연이 오면 빠른 결정', dayHarm ? '안정된 가정' : dayClash ? '변화가 많은 결혼' : '무난한 결혼 생활'],
      summary: `당신의 배우자 자리에는 ${BRANCH_NATURE[db]}의 기운이 있습니다. ${sp.text}`,
      pair: { strengths, weak },
      boost,
      sections: [
        { title: '배우자의 모습', kind: 'list', items: [
          `${SPOUSE_LOOK[BRANCH_ELEMENT[db]]}의 배우자와 인연이 있습니다.`,
          `배우자 자리의 힘으로 보면 ${STAGE_PLAIN[stage]}`,
          `${male ? '아내' : '남편'}의 ${josa(GROUP[spouseG].key, '이/가')} 결혼 생활의 중심이 되고, 나도 그 점에 끌립니다.`,
        ] },
      ],
      flow: age < 20 ? [] : domainFlow(ctx, 'marriage'),
      timing: age < 20
        ? { title: '결혼 시기', note: '아직 결혼을 논하기 이른 나이입니다. 위 내용은 타고난 배우자 성향으로 참고하세요.', good: [], caution: [] }
        : { title: '결혼하기 좋은 해', ...t },
      advice: late ? '조건보다 생활 방식이 맞는지를 먼저 보세요. 함께 여행을 다녀보는 것이 좋은 시험이 됩니다.' : '좋은 인연이 오면 오래 재기보다 결정하는 쪽이 유리한 사주입니다.',
    };
  }

  /* 재물운 */
  {
    let type, typeText;
    if (g.재성 >= 2 && an.strength !== '신약') { type = '사업가형 재물운'; typeText = '당신은 돈을 다루는 감각이 있고 그만큼 감당할 힘도 있어, 직접 사업을 하거나 투자로 재산을 불리는 데 소질이 있습니다.'; }
    else if (g.재성 >= 2) { type = '관리형 재물운'; typeText = '당신에게는 돈이 들어올 기회가 많지만 한 번에 감당하기 벅찰 수 있습니다. 크게 벌이기보다 안정적으로 지키고 불려가는 전략이 맞습니다.'; }
    else if (g.식상 >= 2) { type = '재능형 재물운'; typeText = '당신에게는 재능과 기술이 곧 돈입니다. 잘하는 일을 상품으로 만들거나 부업, 콘텐츠, 전문 기술로 수입원을 늘리는 데 강합니다.'; }
    else if (g.관성 >= 2) { type = '월급형 재물운'; typeText = '당신은 안정적인 조직 소득을 기반으로 꾸준히 모아가는 재물운입니다. 직급이 오를수록 수입도 함께 커집니다.'; }
    else if (g.인성 >= 2) { type = '자산형 재물운'; typeText = '당신의 재물은 현금 흐름보다 문서, 자격, 부동산 같은 자산으로 쌓이는 구조입니다. 오래 보유할수록 가치가 커지는 것에 투자하세요.'; }
    else { type = '성실형 재물운'; typeText = '당신은 한 번의 큰돈보다 성실하게 모으는 재물운입니다. 꾸준한 수입 구조와 자동 저축이 가장 큰 무기입니다.'; }
    const strengths = [];
    if (g.재성 >= 2 && an.strength !== '신약') strengths.push('돈을 다루는 감각과 감당할 힘을 함께 갖췄습니다. 판을 키우는 것을 두려워하지 않아도 됩니다.');
    if (g.재성 === 0) strengths.push('돈을 쫓지 않아도 실력과 이름값이 돈을 불러오는 구조입니다.');
    if (g.식상 >= 1 && g.재성 >= 1) strengths.push('재능이 돈으로 이어지는 흐름이 있어 일한 만큼 보상이 따라옵니다.');
    if (g.관성 >= 1 && g.재성 >= 1) strengths.push('직장과 조직이 재물을 지켜주는 울타리가 됩니다.');
    if (g.인성 >= 2) strengths.push('계약, 문서, 부동산과 인연이 있어 자산을 지키는 힘이 있습니다.');
    if (hasSin('역마')) strengths.push('움직이고 이동할수록 돈이 생기는 사주입니다. 영업, 유통, 해외와 관련된 일이 재물과 연결됩니다.');
    if (de === 2 || de === 3) strengths.push('알뜰하고 계산이 정확해 모은 돈을 쉽게 흘리지 않습니다.');
    if (!strengths.length) strengths.push('한 가지 수입원에 집중해 꾸준히 키우는 힘이 있습니다.');
    const wp = [];
    if (g.비겁 >= 3) wp.push(['사람을 통해 돈이 나가기 쉽습니다.', '지인과의 돈 거래, 보증, 동업은 피하고 수입이 들어오면 바로 다른 계좌로 옮기세요.']);
    if (g.재성 >= 3 && an.strength === '신약') wp.push(['욕심을 내 한 번에 크게 벌이면 감당하지 못하기 쉽습니다.', '투자는 감당 가능한 금액을 나누어 여러 번에 하세요.']);
    if (g.식상 >= 3) wp.push(['즐기고 표현하는 데 돈을 아끼지 않아 충동 지출이 생깁니다.', '사고 싶은 것은 장바구니에 넣고 사흘 뒤에 결정하세요.']);
    if (g.인성 >= 3) wp.push(['준비만 하다 기회를 놓치기 쉽습니다.', '일정 금액은 실행에 쓰는 원칙을 정하세요.']);
    if (g.재성 === 0) wp.push(['돈 관리와 손익 계산에 관심이 적어 모르는 사이에 새는 돈이 생깁니다.', '한 달에 한 번 지출을 점검하는 날을 정하세요.']);
    if (!wp.length) wp.push(['크게 새는 구멍은 없지만, 들어오는 만큼 쓰는 습관이 들기 쉽습니다.', '고정 지출을 주기적으로 점검하면 더 빨리 모입니다.']);
    const { weak, boost } = pairs(wp);
    boost.push(an.strength === '신강' ? '위험을 감당할 힘이 있어 적극적인 투자도 가능하지만, 한 곳에 몰지 말고 나누어 투자하세요.'
      : an.strength === '신약' ? '적금, 연금, 우량 자산처럼 안정적인 방식이 맞습니다. 남의 말만 믿고 하는 투자는 피하세요.'
        : '안정 자산을 중심으로 일부만 공격적으로 운용하는 균형형이 맞습니다.');
    boost.push(`${josa(ELEMENT_PLAIN[an.yongsin], '과/와')} 관련된 분야, ${L.dir} 방향의 일터나 거래처가 재물운을 돕습니다.`);
    D.wealth = {
      keywords: [type, g.재성 >= 2 && an.strength !== '신약' ? '큰 그릇' : g.재성 === 0 ? '실력이 곧 돈' : '꾸준히 쌓는 돈', g.비겁 >= 3 ? '지출 주의' : null, g.인성 >= 2 ? '문서와 부동산 인연' : null].filter(Boolean),
      summary: typeText,
      pair: { strengths, weak },
      boost,
      sections: [],
      flow: domainFlow(ctx, 'wealth'),
      timing: { title: '앞으로 10년 재물 흐름', ...timing(ctx, 'wealth') },
      advice: pick(['수입이 들어오는 날 일정 비율을 바로 다른 계좌로 옮기는 습관 하나가 이 사주의 재물운을 가장 크게 키웁니다.',
        '돈의 흐름을 눈으로 볼 수 있게 기록하세요. 이 사주는 보이는 만큼 모입니다.',
        '큰 기회보다 작은 원칙이 재산을 지킵니다. 투자 한도와 비상금 규칙부터 정해두세요.'], R.seed),
    };
  }

  /* 직업운 */
  {
    const groups = Object.entries(g).sort((a, b) => b[1] - a[1]);
    const top = groups[0][0], second = groups[1][0];
    const fit = [`가장 잘 맞는 일: ${CAREER[top]}`, `함께 살리면 좋은 재능: ${CAREER[second]}`];
    const strengths = [`${WORK_STYLE[de]} 역할에서 가장 능력을 발휘합니다.`];
    if (hasSin('문창귀인')) strengths.push('글, 기획, 강의처럼 머리를 쓰는 일에서 두각을 나타냅니다.');
    if (hasSin('역마')) strengths.push('이동이 많거나 해외, 무역, 여행과 관련된 일에서 기회가 큽니다.');
    if (hasSin('화개')) strengths.push('예술, 연구, 상담처럼 깊이 파고드는 일에서 남다른 집중력을 보입니다.');
    if (hasSin('도화')) strengths.push('사람을 상대하거나 대중 앞에 서는 일에서 매력이 빛납니다.');
    if (hasSin('양인') || hasSin('괴강')) strengths.push('위기 상황을 지휘하거나 결단이 필요한 자리에서 능력이 드러납니다.');
    strengths.push(an.strength === '신강' ? '스스로 결정권을 가질 때 성과가 좋습니다.' : an.strength === '신약' ? '좋은 상사, 선배, 팀을 만날 때 크게 성장합니다.' : '어떤 환경에서도 무난하게 적응합니다.');
    const wp = [];
    if (g.식상 >= 3) wp.push(['윗사람에게 바른말을 하다 미움받기 쉽습니다.', '옳은 말도 타이밍과 장소를 고르세요. 공개 석상보다 일대일 대화가 효과적입니다.']);
    if (g.비겁 >= 3) wp.push(['동료와 경쟁 구도가 생기기 쉽습니다.', '공을 나누면 오히려 내 평판이 올라갑니다.']);
    if (g.인성 >= 3) wp.push(['계획과 준비가 길어 실행이 늦다는 평을 듣기 쉽습니다.', '완벽보다 속도를 의식하고 중간 결과를 자주 공유하세요.']);
    if (g.관성 >= 3) wp.push(['압박을 혼자 견디다 지치기 쉽습니다.', '일과 휴식의 경계를 분명히 하고, 도움을 요청하는 것도 실력으로 여기세요.']);
    if (g.관성 === 0) wp.push(['조직의 틀과 규칙에 답답함을 느끼기 쉽습니다.', '자율성이 보장되는 환경이나 성과 중심의 조직을 고르세요.']);
    if (g.식상 === 0) wp.push(['실력에 비해 자기 홍보가 약해 인정이 늦을 수 있습니다.', '한 일을 기록하고 정리해 보여주는 습관을 들이세요.']);
    if (an.strength === '신강' && g.관성 >= 1) wp.push(['위에서 시키는 일만 하는 자리는 오래 버티기 어렵습니다.', '맡은 일 안에서 내가 결정할 수 있는 영역을 먼저 확보하세요.']);
    if (!wp.length) wp.push(['직장에서 크게 부딪히는 구조는 없지만, 무난함에 머물러 성장이 더딜 수 있습니다.', '1년에 한 번은 새로운 기술이나 역할에 도전하세요.']);
    const { weak, boost } = pairs(wp);
    boost.push(`${L.dir} 방향의 일터, ${L.color} 계열의 업무 소품이 일의 기운을 돕습니다. 면접이나 발표 날에도 활용해 보세요.`);
    D.career = {
      keywords: [CAREER_KEY[top], hasSin('역마') ? '움직이는 일' : null, hasSin('문창귀인') ? '두뇌 직군' : null, an.strength === '신강' ? '결정권이 필요함' : an.strength === '신약' ? '사람 복으로 성장' : '적응력 좋음'].filter(Boolean),
      summary: `당신은 ${GROUP[top].strength.replace(/습니다\.$/, '는 사람입니다.')} 여기에 ${josa(GROUP[second].key, '이/가')} 더해져, 두 가지를 함께 쓸 수 있는 일에서 가장 크게 성장합니다.`,
      pair: { strengths, weak },
      boost,
      sections: [{ title: '잘 맞는 일', kind: 'list', items: fit }],
      flow: domainFlow(ctx, 'career'),
      timing: { title: '앞으로 10년 일과 진로 흐름', ...timing(ctx, 'career') },
      advice: '사주에서 가장 강한 기운을 쓰는 일을 할 때 운이 가장 크게 열립니다. 지금 하는 일이 그 방향과 맞는지 점검해 보세요.',
    };
  }

  /* 건강운 */
  {
    const weakE = weakestElement(an);
    const maxE = strongestElement(an);
    const strengths = [an.strength === '신강' ? '기본 체력이 좋아 웬만한 무리에도 잘 버팁니다.' : an.strength === '신약' ? '몸의 신호에 예민해 이상을 빨리 알아차리는 편입니다.' : '기운이 고르게 퍼져 크게 치우친 약점이 없습니다.'];
    if (an.elemCount.every((n) => n > 0)) strengths.push('다섯 기운을 모두 갖춰 회복력이 좋은 편입니다.');
    if (an.elemCount[an.yongsin] >= 2) strengths.push(`필요한 ${ELEMENT_PLAIN[an.yongsin]}의 기운이 어느 정도 있어 균형을 되찾는 힘이 있습니다.`);
    const wp = [[`${ELEMENT_PLAIN[weakE]}의 기운이 ${an.elemCount[weakE]}개로 가장 적어 ${josa(HEALTH[weakE], '이/가')} 약해지기 쉽습니다.`, HEALTH_DETAIL[weakE]]];
    if (an.elemCount[maxE] >= 3) wp.push([`${ELEMENT_PLAIN[maxE]}의 기운이 ${an.elemCount[maxE]}개로 몰려 ${HEALTH[maxE]}도 과로하기 쉽습니다.`, HEALTH_DETAIL[maxE]]);
    if (hasSin('양인') || hasSin('백호')) wp.push(['급하게 움직이다 다치기 쉬운 기운이 있습니다.', '운전과 격한 운동에서 안전을 먼저 챙기세요.']);
    if (g.관성 >= 3 || g.인성 >= 3) wp.push(['스트레스와 생각이 몸으로 가기 쉽습니다.', '머리를 비우는 취미를 하나 두세요.']);
    if (an.strength === '신강') wp.push(['체력이 좋아 무리해도 티가 덜 나 더 위험합니다.', '쉬는 날을 정해두고 지키세요.']);
    if (an.strength === '신약') wp.push(['체력이 쉽게 떨어지는 편입니다.', '잠과 식사를 규칙적으로 챙기는 것만으로도 큰 차이가 납니다.']);
    const { weak, boost } = pairs(wp);
    boost.push(`${L.food} 같은 음식과 ${L.act} 같은 활동이 몸과 마음의 균형을 잡아줍니다.`);
    D.health = {
      keywords: [`${ELEMENT_KEYWORD[weakE]}의 기운 보충`, an.strength === '신강' ? '체력 좋음' : an.strength === '신약' ? '규칙적인 생활이 중요' : '무난한 체질', hasSin('양인') || hasSin('백호') ? '안전 주의' : null].filter(Boolean),
      summary: `당신의 타고난 기운 중 ${josa(ELEMENT_PLAIN[weakE], '이/가')} ${an.elemCount[weakE]}개로 가장 적고 ${josa(ELEMENT_PLAIN[maxE], '이/가')} ${an.elemCount[maxE]}개로 가장 많습니다. 적은 쪽은 채우고 많은 쪽은 무리하지 않는 것이 건강 관리의 핵심입니다.`,
      pair: { strengths, weak },
      boost,
      sections: [],
      flow: domainFlow(ctx, 'health'),
      timing: { title: '앞으로 10년 건강 흐름', ...timing(ctx, 'health') },
      note: '명리학의 전통 해석이며 의학적 진단을 대신하지 않습니다. 증상이 있으면 병원을 찾으세요.',
      advice: '아픈 곳이 생기기 전에 약한 곳을 미리 챙기는 것이 이 사주의 건강 비결입니다.',
    };
  }

  /* 올해운 */
  {
    const yi = yearInfo(ctx, nowYear);
    const areaDefs = [['wealth', '재물'], ['love', '연애'], ...(age >= 24 ? [['marriage', '결혼']] : []), ['career', '일과 진로'], ['health', '건강']];
    // 분야끼리 같은 문장(오행 영향, 변화의 방식)을 반복하지 않게 첫 분야에서만 말한다
    const seenArea = new Set();
    const areas = areaDefs.map(([dm, label]) => {
      const s = scoreFor(ctx, yi, dm);
      // 연도 공통 문장(에너지, 삼재)은 '올해의 흐름'에서 한 번만 말한다
      const txt = whySentences(ctx, yi, dm).filter((t) => !t.startsWith('한 해의 에너지') && !t.includes('삼재') && !seenArea.has(t));
      txt.forEach((t) => seenArea.add(t));
      return { label, score: s, text: txt.join(' ') };
    });
    const flow = [];
    if (yi.g1 !== yi.g2) flow.push(`상반기에는 ${GROUP[yi.g1].theme}, 하반기에는 ${GROUP[yi.g2].theme}의 기운이 더 강하게 작용합니다.`);
    flow.push(`${GROUP[yi.g2].flow}의 해입니다.`, `올해 나의 에너지는 ${STAGE_PHASE[yi.stage]} 상태입니다.`, elementEffect(an, yi.stem, yi.branch, 'present', nowYear + 1));
    if (yi.clash) flow.push('나와 부딪히는 해라 이사, 이직, 관계 변화가 생기기 쉽습니다. 변화를 피하기보다 준비된 변화를 선택하세요.');
    if (yi.harm) flow.push('나와 잘 맞는 해라 좋은 인연과 협력이 들어오기 쉽습니다.');
    if (yi.peach) flow.push('사람의 시선이 모이고 인기가 오르는 해입니다.');
    if (yi.horse) flow.push('이동, 출장, 이사, 해외와 관련된 일이 생기기 쉬운 해입니다.');
    if (yi.samjae) flow.push(`${ZODIAC[P.year.branch]}띠의 ${yi.samjae} 해입니다. 삼재는 큰 변화를 서두르지 말라는 신호일 뿐, 실제 좋고 나쁨은 위 흐름과 함께 보세요.`);
    const ys = luckScore(an, yi.stem, yi.branch);
    const five = [];
    for (let y = nowYear; y < nowYear + 5; y++) five.push(yearCard(ctx, y, 'overall'));
    dedupeCards(five);
    D.year = {
      title: `${nowYear}년, ${yi.name}`,
      keywords: [yi.name, `${scoreAdj(ys)} 해`, GROUP[yi.g1].theme, yi.g2 !== yi.g1 ? GROUP[yi.g2].theme : null, yi.samjae].filter(Boolean),
      summary: R.now.slice(1).join(' '),
      sections: [
        { title: '올해의 흐름', kind: 'list', items: flow },
        { title: '분야별로 보면', kind: 'areas', items: areas },
        { title: '월별 흐름', kind: 'months', items: R.months },
        { title: '앞으로 5년, 한 해씩', kind: 'years', items: five },
      ],
      advice: pick(TIPS.overall[ys >= 1 ? 'good' : 'bad'], R.seed),
    };
  }

  /* 종합 (앞으로 10년) */
  D.overallTiming = { title: '앞으로 10년, 좋은 해와 조심할 해', ...timing(ctx, 'overall') };
  D.ilju = iljuReading(P);
  return D;
}

export { scoreWord };
