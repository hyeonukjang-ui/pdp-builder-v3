/**
 * Claude API로 블록별 카피를 생성한다.
 *
 * 구조:
 *   1. 직접 매핑 블록 — AI 없이 rawData에서 바로 변환 (hero, trustBadges, imageGrid, optionTable)
 *   2. AI 생성 블록 — Claude API 호출이 필요한 블록 (highlights, overview, itinerary 등)
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// AI가 생성해야 하는 블록 목록
const AI_GENERATED_BLOCKS = [
  'highlights',
  'overview',
  'itinerary',
  'inclusions',
  'usageGuide',
  'faq',
  'recommendFor',
  'guideProfile',
  'comparison',
  'notice',
  'meetingPoint',
  'hotelInfo',
];

// ─── 공개 API ────────────────────────────────────────────────

export async function generateBlockCopy({ rawData, category, targetBlocks }) {
  // 1. 직접 매핑 블록 (AI 불필요)
  const directMappedBlocks = buildDirectMappedBlocks(rawData);

  // 2. AI 생성 대상 블록 필터
  const blocksToGenerate = targetBlocks
    ? targetBlocks.filter((b) => AI_GENERATED_BLOCKS.includes(b))
    : AI_GENERATED_BLOCKS;

  // 3. AI 프롬프트 구성 + 호출
  const prompt = buildPrompt(rawData, category, blocksToGenerate);

  const message = await client.messages.create({
    model: process.env.AI_MODEL_COPY || 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0]?.text || '';
  const aiBlocks = parseAIResponse(responseText);

  // 4. 직접 매핑 + AI 생성 블록 병합
  const mergedBlocks = { ...directMappedBlocks, ...aiBlocks };

  return {
    success: true,
    category,
    productData: { category, blocks: mergedBlocks },
    usage: {
      model: message.model,
      inputTokens: message.usage?.input_tokens || 0,
      outputTokens: message.usage?.output_tokens || 0,
      estimatedCost: estimateCost(message.usage),
    },
    warnings: [],
  };
}

// ─── 직접 매핑 블록 ──────────────────────────────────────────

function buildDirectMappedBlocks(rawData) {
  const blocks = {};

  // hero
  blocks.hero = buildHeroBlock(rawData);

  // trustBadges
  blocks.trustBadges = buildTrustBadgesBlock(rawData);

  // imageGrid
  blocks.imageGrid = buildImageGridBlock(rawData);

  // optionTable
  if (rawData.options && rawData.options.length > 0) {
    blocks.optionTable = buildOptionTableBlock(rawData);
  }

  return blocks;
}

function buildHeroBlock(rawData) {
  const image =
    rawData.images && rawData.images.length > 0
      ? { url: rawData.images[0].url, alt: rawData.images[0].alt || rawData.title || '' }
      : { url: '/placeholder.jpg', alt: '' };

  const badges = (rawData.tags || [])
    .slice(0, 3)
    .map((tag) => ({
      type: tagToType(tag),
      label: tag,
    }))
    .filter((b) => b.label);

  const price = rawData.price?.amount
    ? {
        current: rawData.price.amount,
        original: rawData.price.originalAmount || null,
        currency: rawData.price.currency || '₩',
        unit: '1인',
      }
    : undefined;

  const rating =
    rawData.rating?.score != null
      ? { score: rawData.rating.score, count: rawData.rating.reviewCount || 0 }
      : undefined;

  return {
    image,
    title: rawData.title || '',
    subtitle: '',
    badges,
    rating,
    price,
  };
}

function buildTrustBadgesBlock(rawData) {
  const badges = [];
  const tags = (rawData.tags || []).map((t) => t.toLowerCase());
  const allText = [rawData.title || '', rawData.description || '', ...tags]
    .join(' ')
    .toLowerCase();

  // 무료 취소
  if (
    allText.includes('무료 취소') ||
    allText.includes('free cancel') ||
    allText.includes('무료취소')
  ) {
    badges.push({ type: 'free_cancel', label: '무료 취소', icon: '✓' });
  }

  // 즉시 확정
  if (
    allText.includes('즉시 확정') ||
    allText.includes('instant') ||
    allText.includes('즉시확정')
  ) {
    badges.push({ type: 'instant_confirm', label: '즉시 확정', icon: '✓' });
  }

  // e-티켓
  if (
    allText.includes('e-티켓') ||
    allText.includes('모바일 티켓') ||
    allText.includes('e-ticket') ||
    allText.includes('전자 티켓') ||
    allText.includes('eticket')
  ) {
    badges.push({ type: 'e_ticket', label: 'e-티켓', icon: '✓' });
  }

  // 한국어 가이드
  if (
    allText.includes('한국어') ||
    allText.includes('korean') ||
    (rawData.guideLanguages || []).some((l) =>
      l.toLowerCase().includes('한국어') || l.toLowerCase().includes('korean'),
    )
  ) {
    badges.push({ type: 'korean_guide', label: '한국어 가이드', icon: '✓' });
  }

  // 최저가 보장
  if (
    allText.includes('최저가') ||
    allText.includes('best price') ||
    allText.includes('가격 보장')
  ) {
    badges.push({ type: 'best_price', label: '최저가 보장', icon: '✓' });
  }

  return { badges: badges.slice(0, 4) };
}

function buildImageGridBlock(rawData) {
  const images = (rawData.images || []).map((img) => ({
    url: img.url || '',
    alt: img.alt || rawData.title || '',
    caption: '',
  }));

  return {
    title: '포토 갤러리',
    images,
    layout: 'carousel',
  };
}

function buildOptionTableBlock(rawData) {
  const options = (rawData.options || []).map((opt, index) => ({
    name: opt.name || `옵션 ${index + 1}`,
    description: opt.description || '',
    price: {
      amount: opt.price || 0,
      currency: rawData.price?.currency || '₩',
      unit: '1인',
    },
    originalPrice: opt.originalPrice || null,
    badges: index === 0 ? ['인기'] : [],
    available: true,
  }));

  return {
    title: '옵션 선택',
    options,
  };
}

// ─── AI 프롬프트 빌드 ────────────────────────────────────────

function buildPrompt(rawData, category, blocksToGenerate) {
  const categoryTone = getCategoryTone(category);
  const productJSON = JSON.stringify(rawData, null, 2);

  const blockSchemas = blocksToGenerate
    .map((block) => getBlockSchema(block, category))
    .filter(Boolean)
    .join('\n\n');

  return `너는 마이리얼트립의 수석 카피라이터야. 여행 상품 PDP(상품 상세 페이지)에 들어갈 블록별 카피를 생성하는 역할이야.

## 브랜드 보이스
"여행자의 현명한 친구" — 솔직하고, 구체적이고, 편안하고, 행동지향적.
~해요체 기본 (딱딱한 ~습니다체 지양, 자연스러운 흐름 우선).

## 절대 금지
- 검증 불가 최상급: "최고의", "완벽한", "압도적인", "독보적인"
- 가짜 긴급성: "마감 임박!", "한정 수량!"
- 번역체: "~을 경험하실 수 있습니다", "~가 제공됩니다"
- 과장: "꿈같은", "환상적인", "일생일대의"
- 허위정보: 상품 데이터에 없는 내용을 만들어내기
- 본문 텍스트에 이모지 (아이콘 필드에만 사용)

## 카테고리별 톤
${categoryTone}

## 상품 원본 데이터
\`\`\`json
${productJSON}
\`\`\`

## 카테고리
${category}

## 생성해야 할 블록들

아래 각 블록의 JSON 스키마에 맞춰 카피를 생성해줘.
모든 카피는 상품 데이터에 존재하는 팩트만 사용해야 해.

${blockSchemas}

## 출력 형식

반드시 아래 형식의 JSON만 출력해. 설명이나 다른 텍스트 없이 순수 JSON만.

\`\`\`json
{
${blocksToGenerate.map((b) => `  "${b}": { ... }`).join(',\n')}
}
\`\`\``;
}

function getCategoryTone(category) {
  const tones = {
    TOUR: '따뜻하고 신뢰감 있는 톤. "현지 12년차 가이드가 숨은 이야기까지 들려줘요" 느낌. 가이드 전문성, 현지 깊이, 이동 편의, 소그룹 친밀감 강조.',
    TICKET_THEME:
      '밝고 에너지 넘치는 톤. "입장권 1장으로 40개 어트랙션 무제한" 느낌. 즉시 입장, 옵션 비교, 어트랙션 수, 편의 시설 강조.',
    TICKET_TRANSPORT:
      '간결하고 명확한 톤. "공항에서 시내까지, 탭 한 번이면 끝" 느낌. 사용 편의성, 노선 범위, 가격 절약, 이용방법 강조.',
    TICKET_CITYPASS:
      '계산적이고 설득적인 톤. "3곳만 방문해도 32,000원 절약" 느낌. 절약 금액, 포함 시설 수, 유효기간, 자유로운 동선 강조.',
    TICKET_EXPERIENCE:
      '감각적이고 몰입적인 톤. "도쿄 야경이 발아래 펼쳐지는 90분" 느낌. 독특한 경험, 분위기/감성, 시간대, 소요시간 강조.',
    ACTIVITY:
      '역동적이고 용기를 주는 톤. "초보도 OK, 장비 전부 포함" 느낌. 안전 보장, 초보 가능, 장비 포함, 사진/영상 제공 강조.',
    SERVICE:
      '감성적이고 프리미엄한 톤. "제주의 빛으로 담아내는 당신만의 순간" 느낌. 결과물 품질, 전문가 포트폴리오, 맞춤화 강조.',
    SEMI_PACKAGE:
      '실용적이고 안심시키는 톤. "항공+숙박+투어, 이 가격에 다 포함" 느낌. 포함 항목, 가격 대비 가치, 일정 편의, 가성비 강조.',
  };

  return tones[category] || tones.TOUR;
}

function getBlockSchema(block, category) {
  const schemas = {
    highlights: `### highlights 블록
규칙:
- 3~5개 항목
- 구체적 대상(장소/혜택)으로 시작하고 행동 동사 포함
- 최대 40자/항목
- 구체적 숫자/장소명 포함
- 적절한 이모지 아이콘 1개
- 우선순위: 독점 차별점 → 핵심 포함 혜택 → 편의 요소 → 감성 경험
\`\`\`json
{
  "title": "이 상품의 매력",
  "items": [
    { "icon": "이모지", "text": "구체적 대상 + 행동 동사, 40자 이내" }
  ]
}
\`\`\``,

    overview: `### overview 블록
규칙:
- 정확히 3개 단락
- 1단락 (최대 80자): 핵심 한 문장. 접힌 상태에서 보임. "이 상품은"으로 시작 금지.
- 2단락 (최대 200자): 차별점 또는 핵심 경험.
- 3단락 (최대 300자): 추가 상세. "더 보기"로 펼쳐야 보임.
- 한 문장 최대 50자
- 숫자는 아라비아 숫자
\`\`\`json
{
  "title": "상품 소개",
  "paragraphs": [
    "첫 번째 단락 (핵심 한 문장)",
    "두 번째 단락 (차별점/핵심 경험)",
    "세 번째 단락 (추가 상세)"
  ]
}
\`\`\``,

    itinerary: `### itinerary 블록
규칙:
- 각 stop의 title: 정확한 장소명
- 각 stop의 description: 그 장소에서의 경험 1~2문장, 최대 80자
- time: 데이터에 있으면 포함, 없으면 생략 (만들어내지 마)
- type: 반나절~1일은 "timeline", 2일 이상은 "day_by_day"
- 데이터에 없는 장소 추가 금지
\`\`\`json
{
  "title": "일정 안내",
  "type": "timeline",
  "totalDuration": "총 소요시간",
  "stops": [
    { "time": "09:00", "day": 1, "title": "장소명", "description": "경험 설명 (80자)", "duration": "약 1시간" }
  ]
}
\`\`\``,

    inclusions: `### inclusions 블록
규칙:
- 포함 항목: "왜 좋은지" detail 추가 (예: "한국어 전문 가이드 — 12년 경력")
- 불포함 항목: 대안/팁 추가 (예: "점심 식사 — 가이드가 현지 맛집 안내")
- 가격 추측 금지, 데이터에 없는 항목 추가 금지
\`\`\`json
{
  "included": [
    { "text": "포함 항목", "detail": "혜택 설명 (선택)" }
  ],
  "excluded": [
    { "text": "불포함 항목", "tip": "대안 팁 (선택)" }
  ]
}
\`\`\``,

    usageGuide: `### usageGuide 블록
규칙:
- 3~5단계
- title: 행동 중심 (예: "바우처 확인하기")
- description: 구체적 방법 설명, 최대 80자
- 데이터에 없는 절차 만들어내기 금지
\`\`\`json
{
  "title": "이용 방법",
  "steps": [
    { "step": 1, "title": "단계 제목 (15자)", "description": "구체적 방법 (80자)" }
  ]
}
\`\`\``,

    faq: `### faq 블록
규칙:
- 3~5개 Q&A
- 실제 상품 데이터에서 자주 궁금해할 내용 추출
- 질문: "~인가요?" 패턴
- 답변: 구체적 팩트 + 편안한 톤
- 데이터에 없는 정보 답변 금지
\`\`\`json
{
  "title": "자주 묻는 질문",
  "items": [
    { "question": "질문?", "answer": "답변" }
  ]
}
\`\`\``,

    recommendFor: `### recommendFor 블록
규칙:
- 3~5개 추천 대상
- 이모지 + 대상명 + 이유를 한 줄로, 최대 40자
- 구체적인 여행자 유형 (모호한 "모든 분" 금지)
- 대상 간 중복 없음
- 상품 데이터에 근거한 추천만
\`\`\`json
{
  "title": "이런 분께 추천해요",
  "targets": [
    { "icon": "이모지", "text": "대상 + 이유 (40자)" }
  ]
}
\`\`\``,

    guideProfile: `### guideProfile 블록
규칙:
- introduction: 가이드 매력을 1인칭으로, 최대 150자
- title: "한국어 전문 가이드" 같은 한 줄 타이틀, 최대 20자
- experience: 구체적 경력, 최대 30자
- 데이터에 없는 경력 만들어내기 금지
- 가이드 데이터가 없으면 이 블록을 빈 객체 {}로 반환
\`\`\`json
{
  "name": "가이드 이름",
  "title": "한 줄 타이틀",
  "experience": "경력 요약",
  "languages": ["한국어"],
  "introduction": "가이드 소개 (1인칭, 150자)",
  "certifications": []
}
\`\`\``,

    comparison: `### comparison 블록
규칙:
- 시티패스/패키지에만 해당. 해당 안 되면 빈 객체 {} 반환.
- title: "개별 구매보다 ₩{절약액} 절약" 패턴
- 가격은 원본 데이터에서 정확히 추출 (추측 금지)
\`\`\`json
{
  "title": "개별 구매보다 ₩N 절약",
  "items": [
    { "name": "시설명", "individualPrice": 0, "included": true }
  ],
  "totalIndividual": 0,
  "packagePrice": 0,
  "savings": 0
}
\`\`\``,

    notice: `### notice 블록
규칙:
- 상품 이용 시 알아야 할 주의사항/안내사항
- 데이터에 notices가 있으면 정리, 없으면 카테고리 기본 안내
- 각 항목 최대 80자
\`\`\`json
{
  "title": "안내사항",
  "items": [
    { "type": "info | warning | tip", "text": "안내 내용 (80자)" }
  ]
}
\`\`\``,

    meetingPoint: `### meetingPoint 블록
규칙:
- type: "meeting" (직접 이동) 또는 "pickup" (픽업 서비스)
- address: 정확한 주소 (데이터에 있는 것만)
- description: 도착 방법 1~2문장
- tips: 유용한 팁 1~3개
- 데이터에 없는 주소나 위치 만들어내기 금지
\`\`\`json
{
  "title": "만나는 장소",
  "type": "meeting",
  "address": "정확한 주소",
  "description": "도착 방법 설명",
  "tips": ["팁1", "팁2"]
}
\`\`\``,

    hotelInfo: `### hotelInfo 블록
규칙:
- 세미패키지에만 해당. 해당 안 되면 빈 객체 {} 반환.
- 호텔 데이터에 있는 정보만 사용
- amenities: 주요 편의시설 3~5개
\`\`\`json
{
  "title": "숙소 안내",
  "hotels": [
    { "name": "호텔명", "stars": 4, "location": "위치", "amenities": ["편의시설"] }
  ]
}
\`\`\``,
  };

  return schemas[block] || null;
}

// ─── AI 응답 파싱 ────────────────────────────────────────────

function parseAIResponse(responseText) {
  // ```json ... ``` 블록 추출
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  let jsonStr = jsonMatch ? jsonMatch[1] : responseText;

  // JSON 앞뒤의 비-JSON 텍스트 제거
  jsonStr = jsonStr.trim();

  // 첫 번째 { 부터 마지막 } 까지 추출
  const firstBrace = jsonStr.indexOf('{');
  const lastBrace = jsonStr.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // 빈 객체인 블록 필터링 (AI가 해당 없다고 판단한 블록)
    const filtered = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value && typeof value === 'object' && Object.keys(value).length > 0) {
        filtered[key] = value;
      }
    }

    return filtered;
  } catch (e) {
    console.warn('[generator] AI 응답 JSON 파싱 실패:', e.message);
    console.warn('[generator] 원본 응답:', responseText.slice(0, 500));

    // 블록별로 개별 파싱 시도
    return tryParseBlockByBlock(responseText);
  }
}

function tryParseBlockByBlock(responseText) {
  const blocks = {};
  const blockNames = AI_GENERATED_BLOCKS;

  for (const blockName of blockNames) {
    // "blockName": { ... } 패턴 찾기
    const regex = new RegExp(
      `"${blockName}"\\s*:\\s*(\\{[\\s\\S]*?\\})(?=\\s*[,}]\\s*(?:"[a-zA-Z]|$))`,
    );
    const match = responseText.match(regex);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Object.keys(parsed).length > 0) {
          blocks[blockName] = parsed;
        }
      } catch {
        // 이 블록은 파싱 실패, 건너뜀
      }
    }
  }

  return blocks;
}

// ─── 비용 추정 ───────────────────────────────────────────────

function estimateCost(usage) {
  if (!usage) return 0;

  // Claude Sonnet 4 기준: input $3/1M, output $15/1M
  const inputCost = ((usage.input_tokens || 0) / 1_000_000) * 3;
  const outputCost = ((usage.output_tokens || 0) / 1_000_000) * 15;

  return Math.round((inputCost + outputCost) * 10000) / 10000; // 소수 4자리
}

// ─── 태그 → 타입/아이콘 매핑 유틸리티 ────────────────────────

function tagToType(tag) {
  if (!tag || typeof tag !== 'string') return 'default';

  const lower = tag.toLowerCase();

  const typeMap = {
    한국어: 'korean_guide',
    korean: 'korean_guide',
    '즉시 확정': 'instant_confirm',
    즉시확정: 'instant_confirm',
    instant: 'instant_confirm',
    '무료 취소': 'free_cancel',
    무료취소: 'free_cancel',
    베스트셀러: 'bestseller',
    bestseller: 'bestseller',
    인기: 'popular',
    hot: 'popular',
    신규: 'new',
    new: 'new',
    할인: 'discount',
    '특가': 'discount',
    sale: 'discount',
    '최저가': 'best_price',
    'e-티켓': 'e_ticket',
    eticket: 'e_ticket',
    '모바일 티켓': 'e_ticket',
  };

  for (const [keyword, type] of Object.entries(typeMap)) {
    if (lower.includes(keyword)) return type;
  }

  return 'default';
}

export function tagToIcon(tag) {
  if (!tag || typeof tag !== 'string') return '🏷️';

  const lower = tag.toLowerCase();

  const iconMap = {
    한국어: '🇰🇷',
    korean: '🇰🇷',
    '즉시 확정': '⚡',
    즉시확정: '⚡',
    '무료 취소': '↩️',
    무료취소: '↩️',
    베스트셀러: '🏆',
    bestseller: '🏆',
    인기: '🔥',
    신규: '✨',
    할인: '💰',
    '최저가': '💰',
    'e-티켓': '📱',
    '모바일 티켓': '📱',
    가이드: '🧑‍🏫',
    픽업: '🚐',
    교통: '🚌',
    입장: '🎟️',
    식사: '🍽️',
  };

  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (lower.includes(keyword)) return icon;
  }

  return '🏷️';
}
