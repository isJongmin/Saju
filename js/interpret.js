// 해석 규칙: 전통 명리 개념을 단순화한 규칙 기반 해석
import {
  STEMS, BRANCHES, STEMS_KO, BRANCHES_KO, ELEMENTS_KO, ELEMENTS_HANJA, BRANCH_ELEMENT, TEN_GODS, TEN_GOD_GROUP,
  stemElement, tenGod, branchTenGod, isClash, isHarmony, harmonyOf, sinsal, twelveStage, yearFortune, mod,
} from './core.js';

export const pillarName = (p) => `${STEMS[p.stem]}${BRANCHES[p.branch]}`;
export const pillarKo = (p) => `${STEMS_KO[p.stem]}${BRANCHES_KO[p.branch]}`;
const el = (i) => `${ELEMENTS_KO[i]}(${ELEMENTS_HANJA[i]})`;
// 조사: 마지막 한글 글자의 받침 여부로 선택 ('이/가', '과/와', '은/는', '을/를')
export function josa(word, pair) {
  const [withB, withoutB] = pair.split('/');
  const hangul = [...word].reverse().find((ch) => ch >= '가' && ch <= '힣');
  if (!hangul) return word + withB;
  return word + ((hangul.charCodeAt(0) - 0xac00) % 28 ? withB : withoutB);
}

const DAY_MASTER = [
  { image: '큰 나무', text: '곧게 위로 자라려는 기운입니다. 원칙과 자존심이 강하고 한번 정한 방향은 끝까지 밀고 나갑니다. 리더 역할이 잘 맞지만 굽히는 데 서툴러 충돌이 생기기도 합니다.' },
  { image: '꽃과 넝쿨', text: '부드럽게 휘어지며 결국 원하는 곳까지 뻗어가는 기운입니다. 적응력과 생활력이 뛰어나고 사람 사이의 흐름을 잘 읽습니다. 겉은 유연해도 속은 끈질깁니다.' },
  { image: '태양', text: '모두를 비추는 밝은 기운입니다. 솔직하고 표현이 크며 주변을 끌어당깁니다. 열정이 빨리 붙고 빨리 식는 편이라 꾸준함을 의식하면 좋습니다.' },
  { image: '촛불', text: '어둠 속을 밝히는 섬세한 불입니다. 감수성과 집중력이 높고 한 사람, 한 분야에 깊이 몰입합니다. 겉보다 속이 뜨거운 타입입니다.' },
  { image: '큰 산', text: '움직이지 않는 산의 기운입니다. 신뢰감과 포용력이 있고 중심을 잡아줍니다. 변화에 느리게 반응하는 만큼 결정 전에 고민이 깁니다.' },
  { image: '기름진 땅', text: '무엇이든 길러내는 밭의 기운입니다. 실속 있고 세심하며 사람을 챙깁니다. 걱정이 많아지기 쉬우니 스스로를 돌보는 일도 챙겨야 합니다.' },
  { image: '바위와 쇠', text: '단단한 원석의 기운입니다. 결단력과 의리가 강하고 옳고 그름이 분명합니다. 말이 직설적이라 의도보다 강하게 전달될 수 있습니다.' },
  { image: '보석', text: '다듬어진 보석의 기운입니다. 섬세하고 깔끔하며 자기 기준이 높습니다. 인정받을 때 빛나고, 비판에는 예민한 편입니다.' },
  { image: '바다와 강', text: '넓게 흐르는 큰 물의 기운입니다. 생각의 폭이 넓고 지혜롭고 자유를 중시합니다. 한곳에 묶이는 것을 답답해합니다.' },
  { image: '비와 이슬', text: '스며드는 작은 물의 기운입니다. 직관이 좋고 배려심이 깊으며 조용히 상황을 바꿉니다. 생각이 많아 결정을 미루기도 합니다.' },
];

const ELEMENT_EXCESS = [
  '목이 많아 추진력과 고집이 함께 강합니다. 시작은 잘하나 마무리를 의식해야 합니다.',
  '화가 많아 감정 표현이 크고 성격이 급할 수 있습니다. 쉬는 시간을 일부러 확보하세요.',
  '토가 많아 신중하지만 생각이 막히면 오래 고여 있습니다. 작은 변화부터 시도해 보세요.',
  '금이 많아 판단이 날카롭고 기준이 엄격합니다. 스스로와 남에게 조금 너그러워져도 됩니다.',
  '수가 많아 생각이 깊고 감수성이 풍부하지만 걱정이 늘기 쉽습니다. 몸을 움직이는 활동이 균형을 잡아줍니다.',
];
const ELEMENT_LACK = [
  '목이 없어 새 일을 벌이는 동력이 약할 수 있습니다.',
  '화가 없어 자신을 드러내고 알리는 데 소극적일 수 있습니다.',
  '토가 없어 생활의 기반, 루틴을 만드는 데 의식적인 노력이 필요합니다.',
  '금이 없어 결단을 내리고 정리하는 일이 어려울 수 있습니다.',
  '수가 없어 쉬어가며 생각을 정리하는 시간이 부족해지기 쉽습니다.',
];

const GOD_MEANING = {
  비견: '독립심, 동료, 경쟁', 겁재: '승부욕, 경쟁, 재물 분산', 식신: '여유, 재능, 먹고사는 복', 상관: '표현력, 반골, 창의',
  편재: '큰돈, 사업, 활동 무대', 정재: '안정된 수입, 성실, 저축', 편관: '압박, 도전, 권위', 정관: '명예, 직장, 규칙',
  편인: '직관, 특수 분야, 고독', 정인: '학문, 문서, 보살핌',
};
const GROUP_YEAR = {
  비겁: '주변 사람과 함께 움직이는 해입니다. 협업과 동료가 힘이 되지만 돈이 나가는 일, 경쟁도 늘어납니다. 보증이나 동업 조건은 문서로 분명히 해두세요.',
  식상: '하고 싶은 것을 드러내는 해입니다. 창작, 기획, 새 프로젝트에 유리하고 말과 표현으로 기회를 얻습니다. 윗사람과의 마찰, 말실수는 조심하세요.',
  재성: '현실적인 성과와 돈이 움직이는 해입니다. 수입 기회와 투자 유혹이 함께 옵니다. 들어오는 만큼 지출 계획도 세워야 남습니다.',
  관성: '책임과 평가가 따르는 해입니다. 승진, 자격, 소속의 변화가 생기기 쉽고 부담도 커집니다. 규칙을 지키면 인정으로 돌아옵니다.',
  인성: '배우고 준비하는 해입니다. 공부, 자격증, 계약 문서, 도움 주는 사람이 들어옵니다. 생각만 하다 실행이 늦어지지 않게 하세요.',
};
const SPOUSE_PALACE = {
  비견: '배우자와 친구 같은 동등한 관계를 원합니다. 서로 독립적인 영역을 존중할 때 오래갑니다.',
  겁재: '배우자 자리에 경쟁의 기운이 있어 주도권 다툼이 생기기 쉽습니다. 돈 관리 방식을 미리 합의하세요.',
  식신: '편안하고 다정한 관계를 만듭니다. 함께 먹고 즐기는 일상이 관계의 중심입니다.',
  상관: '표현이 솔직해 연애는 뜨겁지만 말로 상처를 주고받기 쉽습니다. 말투가 관계의 열쇠입니다.',
  편재: '활동적이고 자유로운 배우자 인연입니다. 연애 경험이 다양할 수 있습니다.',
  정재: '성실하고 현실적인 배우자 인연입니다. 안정적인 가정을 꾸리는 힘이 있습니다.',
  편관: '카리스마 있는 상대에게 끌립니다. 긴장감 있는 관계가 될 수 있어 서로의 영역 존중이 중요합니다.',
  정관: '반듯하고 책임감 있는 배우자 인연입니다. 격식과 신뢰를 중시하는 결혼 생활입니다.',
  편인: '정신적 교감을 중시합니다. 혼자만의 시간이 필요해 이를 이해해 주는 상대가 맞습니다.',
  정인: '배우자에게 보살핌을 받거나 서로 의지하는 관계입니다. 지나친 의존은 경계하세요.',
};
const CAREER = {
  비겁: '독립적으로 움직이는 일: 개인 사업, 프리랜서, 스포츠, 영업처럼 스스로 성과를 내는 분야',
  식상: '만들고 표현하는 일: 기획, 콘텐츠, 디자인, 개발, 교육, 요리 등 결과물이 보이는 분야',
  재성: '돈과 사람을 다루는 일: 사업, 유통, 금융, 마케팅, 관리처럼 숫자와 성과가 분명한 분야',
  관성: '조직과 규칙 속의 일: 공무원, 대기업, 법률, 군경, 관리직처럼 체계 있는 분야',
  인성: '배우고 가르치는 일: 연구, 교육, 의료, 상담, 문서와 자격이 중요한 분야',
};
const HEALTH = ['간과 담, 근육과 눈', '심장과 혈관, 소장', '위장과 소화기', '폐와 대장, 호흡기와 피부', '신장과 방광, 생식기'];
const LUCKY = [
  { color: '초록, 청록', dir: '동쪽', num: '3, 8', season: '봄' },
  { color: '빨강, 보라', dir: '남쪽', num: '2, 7', season: '여름' },
  { color: '노랑, 갈색', dir: '중앙', num: '5, 10', season: '환절기' },
  { color: '흰색, 은색', dir: '서쪽', num: '4, 9', season: '가을' },
  { color: '검정, 남색', dir: '북쪽', num: '1, 6', season: '겨울' },
];

const groupOfStem = (ds, s) => TEN_GOD_GROUP[tenGod(ds, s)];
const groupOfBranch = (ds, b) => TEN_GOD_GROUP[branchTenGod(ds, b)];

// 운의 오행이 용신/기신과 맞는지 점수 (-2 ~ +2)
function luckScore(an, stem, branch) {
  let s = 0;
  const se = stemElement(stem), be = BRANCH_ELEMENT[branch];
  if (se === an.yongsin) s += 1; if (be === an.yongsin) s += 1;
  if (se === an.gisin) s -= 1; if (be === an.gisin) s -= 1;
  return s;
}
const scoreWord = (s) => (s >= 2 ? '매우 좋음' : s === 1 ? '좋음' : s === 0 ? '보통' : s === -1 ? '주의' : '신중');

export function koreanAge(saju, year) { return year - saju.input.year + 1; }

export function currentDaewoon(saju, year) {
  const age = koreanAge(saju, year);
  const list = saju.daewoon.list;
  let cur = null;
  for (const d of list) if (age >= d.age) cur = d;
  return cur;
}

export function buildReading(saju, an, nowYear) {
  const P = saju.pillars;
  const ds = P.day.stem, db = P.day.branch;
  const de = stemElement(ds);
  const dm = DAY_MASTER[ds];
  const male = saju.input.gender === 'M';
  const sections = {};

  /* 전체운 */
  const maxE = an.elemCount.indexOf(Math.max(...an.elemCount));
  const lacks = an.elemCount.map((c, i) => (c === 0 ? i : -1)).filter((i) => i >= 0);
  const topGroup = Object.entries(an.groupScore).sort((a, b) => b[1] - a[1])[0][0];
  const overall = [
    `일간은 ${STEMS[ds]}${ELEMENTS_KO[de]}, ${dm.image}입니다. ${dm.text}`,
    an.strength === '신강'
      ? '일간을 돕는 기운이 강한 신강한 사주입니다. 자기 주관이 뚜렷하고 버티는 힘이 좋아, 에너지를 밖으로 써서 성과로 바꿀 때 운이 풀립니다.'
      : an.strength === '신약'
        ? '일간을 돕는 기운이 약한 신약한 사주입니다. 혼자 다 짊어지기보다 사람, 공부, 조직의 도움을 받을 때 오히려 크게 성장합니다.'
        : '돕는 기운과 빼는 기운이 비슷한 중화된 사주입니다. 큰 굴곡 없이 상황에 맞게 균형을 잡는 힘이 있습니다.',
  ];
  if (an.elemCount[maxE] >= 4) overall.push(ELEMENT_EXCESS[maxE]);
  for (const i of lacks) overall.push(ELEMENT_LACK[i]);
  overall.push(`원국에서 가장 두드러진 십성은 ${topGroup}입니다. ${TEN_GODS.filter((g, i) => TEN_GOD_GROUP[i] === topGroup).map((g) => GOD_MEANING[g]).join(', ')}의 성향이 삶의 패턴으로 자주 나타납니다.`);
  overall.push(`보완하면 좋은 오행(간이 용신)은 ${el(an.yongsin)}, 과하면 부담이 되는 오행은 ${el(an.gisin)}입니다.`);
  sections.overall = overall;

  /* 대운 */
  const cur = currentDaewoon(saju, nowYear);
  const dw = [];
  if (!cur) {
    dw.push(`첫 대운은 ${saju.daewoon.startAge}세에 시작합니다. 그 전까지는 월주(${pillarName(P.month)})의 기운 아래에 있습니다.`);
  } else {
    const g1 = groupOfStem(ds, cur.stem), g2 = groupOfBranch(ds, cur.branch);
    const sc = luckScore(an, cur.stem, cur.branch);
    dw.push(`지금은 ${cur.age}세부터 시작된 ${pillarName(cur)}(${pillarKo(cur)}) 대운입니다. 10년 흐름의 평가는 ${scoreWord(sc)}입니다.`);
    dw.push(`앞 5년은 천간 ${groupOfStemLabel(ds, cur.stem)}, 뒤 5년은 지지 ${groupOfBranchLabel(ds, cur.branch)}의 영향이 큽니다.`);
    dw.push(GROUP_YEAR[g1].replace('해입니다', '시기입니다'));
    if (g2 !== g1) dw.push(GROUP_YEAR[g2].replace('해입니다', '시기입니다'));
    if (isClash(cur.branch, db)) dw.push('대운 지지가 일지와 충하여 거주지, 관계, 직장에 변동이 생기기 쉬운 10년입니다.');
    const next = saju.daewoon.list[saju.daewoon.list.indexOf(cur) + 1];
    if (next) dw.push(`다음 대운 ${josa(`${pillarName(next)}(${pillarKo(next)})`, '은/는')} ${next.age}세(${next.startYear}년)부터이며 평가는 ${scoreWord(luckScore(an, next.stem, next.branch))}입니다.`);
  }
  sections.daewoon = dw;

  /* 올해운 */
  const yf = yearFortune(nowYear);
  const yg1 = groupOfStem(ds, yf.stem), yg2 = groupOfBranch(ds, yf.branch);
  const ysc = luckScore(an, yf.stem, yf.branch);
  const yr = [`${nowYear}년은 ${pillarName(yf)}(${pillarKo(yf)})년, 나에게는 ${josa(TEN_GODS[tenGod(ds, yf.stem)], '과/와')} ${josa(TEN_GODS[branchTenGod(ds, yf.branch)], '이/가')} 들어오는 해입니다. 종합 흐름은 ${scoreWord(ysc)}입니다.`];
  yr.push(GROUP_YEAR[yg1]);
  if (yg2 !== yg1) yr.push(GROUP_YEAR[yg2]);
  if (isClash(yf.branch, db)) yr.push('올해 지지가 일지(배우자 자리)와 충합니다. 이사, 이직, 관계 변화가 생기기 쉬우니 큰 결정은 서두르지 마세요.');
  if (isClash(yf.branch, P.year.branch)) yr.push('올해 지지가 연지와 충합니다. 집안 어른, 바깥 환경의 변화에 신경 쓰게 됩니다.');
  if (isHarmony(yf.branch, db)) yr.push('올해 지지가 일지와 합합니다. 좋은 인연과 협력이 들어오기 쉬운 해입니다.');
  const ys = [...sinsal(P.year.branch, yf.branch), ...sinsal(db, yf.branch)];
  if (ys.includes('도화')) yr.push('도화의 해라 사람의 시선이 모이고 이성 인연이 늘어납니다.');
  if (ys.includes('역마')) yr.push('역마의 해라 이동, 출장, 이사, 해외와 관련된 일이 생기기 쉽습니다.');
  sections.year = yr;
  sections.yearFortune = yf;

  /* 재물운 */
  const wealth = an.groupScore.재성, output = an.groupScore.식상, rival = an.groupScore.비겁;
  const wl = [];
  if (wealth === 0) wl.push('원국에 재성이 드러나지 않습니다. 돈을 직접 쫓기보다 실력, 명예, 전문성을 쌓으면 돈이 따라오는 구조입니다.');
  else if (wealth >= 3 && an.strength === '신약') wl.push('재성이 많은데 일간이 약한 재다신약의 구조입니다. 돈이 보이는 기회는 많지만 감당할 체력과 관리가 관건입니다. 무리한 투자보다 지키는 전략이 맞습니다.');
  else if (wealth >= 2 && an.strength !== '신약') wl.push('재성을 감당할 힘이 있어 재물 그릇이 큰 편입니다. 적극적으로 기회를 잡을 때 성과가 납니다.');
  else wl.push('재성이 적당히 있어 성실하게 모으는 재물운입니다. 꾸준한 수입 구조를 만드는 것이 핵심입니다.');
  if (output >= 2 && wealth > 0) wl.push('식상이 재성을 돕는 식상생재 흐름이 있어 기술, 재능, 콘텐츠로 돈을 버는 데 유리합니다.');
  if (rival >= 3) wl.push('비겁이 강해 돈이 들어와도 사람을 통해 나가기 쉽습니다. 동업, 보증, 돈 거래는 조심하세요.');
  wl.push(`올해 재물 흐름: ${yg1 === '재성' || yg2 === '재성' ? '재성이 들어와 수입 기회가 뚜렷합니다.' : yg1 === '식상' || yg2 === '식상' ? '식상이 들어와 일을 벌일수록 돈으로 이어집니다.' : yg1 === '비겁' || yg2 === '비겁' ? '비겁이 들어와 지출과 경쟁이 늘어납니다. 큰돈은 묶어두세요.' : '큰 변화보다 유지와 관리에 집중할 해입니다.'}`);
  sections.wealth = wl;

  /* 연애운 */
  const loveGroup = male ? '재성' : '관성';
  const lv = [];
  const peach = [P.year.branch, db].flatMap((b) => [P.year, P.month, P.day, P.hour].filter(Boolean).map((p) => p.branch).filter((x) => sinsal(b, x).includes('도화')));
  lv.push(an.groupScore[loveGroup] === 0
    ? `원국에 ${male ? '재성(남성에게 이성을 뜻하는 별)' : '관성(여성에게 이성을 뜻하는 별)'}이 드러나지 않아 연애에 늦게 눈을 뜨거나 인연을 스스로 찾아나서야 하는 편입니다. 운에서 이 별이 들어올 때가 기회입니다.`
    : an.groupScore[loveGroup] >= 3
      ? `${josa(loveGroup, '이/가')} 많아 이성 인연이 많은 편입니다. 선택지가 많은 만큼 신중하게 고르는 것이 과제입니다.`
      : `${josa(loveGroup, '이/가')} 적당히 있어 인연이 자연스럽게 이어지는 편입니다.`);
  if (peach.length) lv.push('원국에 도화가 있어 사람을 끄는 매력이 있습니다. 첫인상과 분위기로 호감을 얻습니다.');
  if (an.groupScore.식상 >= 2) lv.push('식상이 발달해 표현이 풍부하고 연애에서 적극적인 편입니다.');
  if (an.groupScore.인성 >= 3) lv.push('인성이 강해 생각이 많고 먼저 다가가기를 망설이는 편입니다.');
  const yearLove = groupOfStem(ds, yf.stem) === loveGroup || groupOfBranch(ds, yf.branch) === loveGroup;
  lv.push(`올해 연애 흐름: ${yearLove || ys.includes('도화') ? '이성 인연의 별이 들어와 새로운 만남의 가능성이 높습니다.' : '새 인연보다 지금 관계를 깊게 하는 데 맞는 해입니다.'}`);
  sections.love = lv;

  /* 결혼운 */
  const spouseGod = TEN_GODS[branchTenGod(ds, db)];
  const mr = [`배우자 자리인 일지에 ${BRANCHES[db]}, 즉 ${josa(spouseGod, '이/가')} 있습니다. ${SPOUSE_PALACE[spouseGod]}`];
  const others = [P.year, P.month, P.hour].filter(Boolean);
  if (others.some((p) => isClash(p.branch, db))) mr.push('일지가 다른 지지와 충하고 있어 결혼 생활에 변동이나 거리감이 생기기 쉽습니다. 주말부부처럼 각자의 공간이 오히려 도움이 될 수 있습니다.');
  if (others.some((p) => isHarmony(p.branch, db))) mr.push('일지가 다른 지지와 합하여 가정을 안정시키려는 힘이 있습니다.');
  mr.push(`일지의 12운성은 ${twelveStage(ds, db)}입니다.`);
  const marriageYears = [];
  for (let y = nowYear; y < nowYear + 10; y++) {
    const f = yearFortune(y);
    if (groupOfStem(ds, f.stem) === loveGroup || groupOfBranch(ds, f.branch) === loveGroup || isHarmony(f.branch, db)) marriageYears.push(y);
  }
  if (marriageYears.length) mr.push(`앞으로 10년 중 배우자 인연의 기운이 들어오는 해: ${marriageYears.join(', ')}년`);
  sections.marriage = mr;

  /* 직업운 */
  const sorted = Object.entries(an.groupScore).sort((a, b) => b[1] - a[1]);
  sections.career = [
    `가장 강한 ${sorted[0][0]} 기준으로 맞는 방향은 ${CAREER[sorted[0][0]]}입니다.`,
    `두 번째로 강한 ${josa(sorted[1][0], '을/를')} 함께 쓰면 ${CAREER[sorted[1][0]].split(':')[0]}의 성격을 더할 수 있습니다.`,
    an.groupScore.관성 === 0 ? '관성이 약해 조직의 틀보다 자율성이 보장되는 환경에서 능력이 더 잘 드러납니다.' : '관성이 있어 조직 안에서 책임 있는 자리를 맡을 때 인정받습니다.',
  ];

  /* 건강운 */
  const weakE = an.elemCount.indexOf(Math.min(...an.elemCount));
  sections.health = [
    `오행상 약한 ${el(weakE)} 쪽인 ${HEALTH[weakE]} 관리에 신경 쓰는 것이 좋습니다.`,
    an.elemCount[maxE] >= 4 ? `${josa(el(maxE), '이/가')} 과해 ${HEALTH[maxE]}에 무리가 오기 쉽습니다.` : '오행이 한쪽으로 크게 치우치지 않아 기본 체력은 무난한 편입니다.',
    '명리학의 오행 해석이며 의학적 진단을 대신하지 않습니다.',
  ];

  /* 월운 점수 */
  sections.months = yf.months.map((m) => ({
    ...m,
    god: TEN_GODS[tenGod(ds, m.stem)],
    score: luckScore(an, m.stem, m.branch) + (isClash(m.branch, db) ? -1 : 0) + (isHarmony(m.branch, db) ? 1 : 0),
    clash: isClash(m.branch, db),
  }));

  return sections;
}

function groupOfStemLabel(ds, s) { return `${STEMS[s]}(${TEN_GODS[tenGod(ds, s)]})`; }
function groupOfBranchLabel(ds, b) { return `${BRANCHES[b]}(${TEN_GODS[branchTenGod(ds, b)]})`; }

/* ---------------- 추가 질문 ---------------- */
const monthLabel = (ms) => { const d = new Date(ms + 9 * 3600e3); return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`; };

export const QUESTIONS = [
  { id: 'caution', q: '올해 조심해야 할 달은?' },
  { id: 'good', q: '올해 가장 좋은 달은?' },
  { id: 'move', q: '이직이나 창업하기 좋은 시기는?' },
  { id: 'match', q: '나와 잘 맞는 사람은?' },
  { id: 'lucky', q: '행운의 색, 방향, 숫자는?' },
  { id: 'money', q: '돈을 모으려면 어떻게 해야 하나요?' },
];

export function answer(id, saju, an, reading, nowYear) {
  const ds = saju.pillars.day.stem, db = saju.pillars.day.branch;
  const months = reading.months;
  const fmt = (m) => `${BRANCHES_KO[m.branch]}월(${monthLabel(m.start)}부터, ${pillarName(m)} ${m.god})`;
  switch (id) {
    case 'caution': {
      const bad = [...months].sort((a, b) => a.score - b.score).slice(0, 2);
      return [`${nowYear}년 기준으로 ${bad.map(fmt).join(', ')}이 상대적으로 부담이 큰 달입니다.`,
        ...bad.filter((m) => m.clash).map((m) => `${BRANCHES_KO[m.branch]}월은 일지와 충하는 달이라 계약, 이사, 다툼에 특히 신중하세요.`),
        '이 시기에는 새로 벌이기보다 정리하고 점검하는 데 쓰는 것이 좋습니다.'];
    }
    case 'good': {
      const good = [...months].sort((a, b) => b.score - a.score).slice(0, 2);
      return [`${good.map(fmt).join(', ')}이 흐름이 좋은 달입니다.`, '중요한 발표, 계약, 만남은 이 시기에 잡아보세요.'];
    }
    case 'move': {
      const out = [];
      for (let y = nowYear; y < nowYear + 5; y++) {
        const f = yearFortune(y);
        const gs = [groupOfStem(ds, f.stem), groupOfBranch(ds, f.branch)];
        const sc = luckScore(an, f.stem, f.branch);
        const tag = gs.includes('관성') ? '이직, 승진' : gs.includes('식상') || gs.includes('재성') ? '창업, 독립' : null;
        if (tag && sc >= 0) out.push(`${y}년 ${pillarName(f)}: ${tag}에 유리 (흐름 ${scoreWord(sc)})`);
      }
      return out.length ? ['앞으로 5년 중 변화를 시도하기 좋은 해입니다.', ...out] : ['앞으로 5년은 큰 이동보다 내실을 다지는 흐름입니다. 준비를 충분히 한 뒤 대운이 바뀌는 시기를 노려보세요.'];
    }
    case 'match': {
      const h = harmonyOf(db);
      const yongStems = [an.yongsin * 2, an.yongsin * 2 + 1].map((s) => `${STEMS[s]}(${STEMS_KO[s]})`).join(', ');
      return [`일지 ${josa(`${BRANCHES[db]}(${BRANCHES_KO[db]})`, '과/와')} 합하는 ${BRANCHES[h]}(${BRANCHES_KO[h]}) 일지를 가진 사람과 정서적으로 잘 맞습니다.`,
        `일간이 ${yongStems}인 사람은 나에게 부족한 ${el(an.yongsin)} 기운을 채워줍니다.`,
        `반대로 일지가 ${BRANCHES[mod(db + 6, 12)]}(${BRANCHES_KO[mod(db + 6, 12)]})인 사람과는 부딪히기 쉬워 서로 이해하려는 노력이 더 필요합니다.`];
    }
    case 'lucky': {
      const l = LUCKY[an.yongsin];
      return [`나에게 힘이 되는 오행은 ${el(an.yongsin)}입니다.`, `색: ${l.color}`, `방향: ${l.dir}`, `숫자: ${l.num}`, `기운이 좋은 계절: ${l.season}`];
    }
    case 'money': {
      const g = an.groupScore;
      const tips = [];
      if (g.비겁 >= 3) tips.push('돈 거래와 동업을 피하고, 수입이 들어오면 바로 분리된 계좌로 옮기세요.');
      if (g.식상 >= 2) tips.push('재능을 상품화하는 부업이나 콘텐츠가 가장 확실한 돈길입니다.');
      if (g.재성 >= 3 && an.strength === '신약') tips.push('한 번에 크게 벌려 하지 말고 감당 가능한 규모로 나누어 굴리세요.');
      if (g.인성 >= 3) tips.push('자격증, 전문 지식 같은 문서의 힘이 수입으로 연결됩니다.');
      if (g.관성 >= 2) tips.push('안정적인 조직 소득을 기반으로 장기 저축이 맞습니다.');
      if (!tips.length) tips.push('수입과 지출의 흐름을 기록하는 습관이 재물운을 키웁니다.');
      return tips;
    }
    default: return [];
  }
}
