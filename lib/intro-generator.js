/**
 * 상품소개 블록 전용 AI 카피 생성기 (세로 페이지용)
 *
 * 흐름:
 *   1. 카테고리별 레시피에서 블록 목록 조회
 *   2. Claude API로 블록별 데이터 생성
 *   3. introBlocks 배열 형태로 반환
 */

import Anthropic from '@anthropic-ai/sdk';
import { getIntroRecipe, getIntroRequiredBlocks } from '../recipes/intro-recipes.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── 공개 API ────────────────────────────────────────────────

export async function generateIntroBlocks({ rawData, category, recipe: customRecipe }) {
  const recipe = customRecipe || getIntroRecipe(category);

  const prompt = buildIntroPrompt(rawData, category, recipe);

  const message = await client.messages.create({
    model: process.env.AI_MODEL_COPY || 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0]?.text || '';
  const parsedBlocks = parseIntroResponse(responseText, recipe);

  return {
    success: true,
    category,
    introData: { category, introBlocks: parsedBlocks },
    usage: {
      model: message.model,
      inputTokens: message.usage?.input_tokens || 0,
      outputTokens: message.usage?.output_tokens || 0,
    },
    warnings: [],
  };
}

// ─── 프롬프트 빌드 ──────────────────────────────────────────

function buildIntroPrompt(rawData, category, recipe) {
  const categoryTone = getCategoryTone(category);
  const productJSON = JSON.stringify(rawData, null, 2);

  const blockEntries = recipe.map((item, i) => ({
    index: i,
    block: item.block,
    required: item.required,
    label: item.label || item.block,
  }));

  const blockSchemas = blockEntries
    .map((entry) => getIntroBlockSchema(entry))
    .join('\n\n');

  return `너는 마이리얼트립의 수석 카피라이터야. 여행 상품 PDP의 "상품소개" 탭에 들어갈 **세로 스크롤 페이지** 카피를 생성하는 역할이야.

## 상품소개란?
- PDP(상품 상세 페이지) 안의 "상품소개" 탭에 들어가는 **세로 스크롤 콘텐츠 페이지**
- 히어로 이미지 → 텍스트 섹션 → 아이콘 그리드 → 이미지 → 단계별 안내 등 다양한 모듈이 세로로 쌓여 자연스럽게 스크롤되는 구조
- 각 블록은 독립적인 섹션으로, 제각기 다른 레이아웃을 가짐
- PDP에 이미 있는 정보(가격, 리뷰, FAQ, 주의사항, 포함/불포함)와 중복 금지

## 브랜드 보이스
"여행자의 현명한 친구" — 솔직하고, 구체적이고, 편안하고, 행동지향적.
~해요체 기본 (딱딱한 ~습니다체 지양, 자연스러운 흐름 우선).

## 카피 원칙
1. **구체적 숫자 우선**: "다양한 체험" (X) → "7가지 어트랙션" (O)
2. **행동 동사 포함**: "아름다운 전망" (X) → "한라산 전경을 한눈에 담아보세요" (O)
3. **한 문장 최대 50자**: 길면 쪼개기
4. **구어체 자연스러움**: "~할 수 있어요", "~이에요" 느낌
5. **팩트만 사용**: 상품 데이터에 있는 정보만. 없으면 언급 안 함.

## 절대 금지
- 검증 불가 최상급: "최고의", "완벽한", "압도적인", "독보적인"
- 가짜 긴급성: "마감 임박!", "한정 수량!"
- 번역체: "~을 경험하실 수 있습니다", "~가 제공됩니다"
- 과장: "꿈같은", "환상적인", "일생일대의"
- 허위정보: 상품 데이터에 없는 내용을 만들어내기
- 본문 텍스트에 이모지 (아이콘 필드에만 사용)
- 뻔한 문장: "지금 바로 예약하세요", "놓치지 마세요"

## 카테고리별 톤
${categoryTone}

## 상품 원본 데이터
\`\`\`json
${productJSON}
\`\`\`

## 카테고리
${category}

## 생성해야 할 블록들

각 블록의 JSON 스키마에 맞춰 카피를 생성해줘. required가 false인 블록도 데이터가 충분하면 생성해.
데이터가 부족하면 선택(required: false) 블록은 빈 객체 {}로.

${blockSchemas}

## 출력 형식

반드시 아래 형식의 JSON 배열만 출력해. 설명 없이 순수 JSON만.
블록 순서는 위의 순서를 그대로 유지해.

\`\`\`json
[
${blockEntries.map((e) => `  { "blockType": "${e.block}", "index": ${e.index}, "data": { ... } }`).join(',\n')}
]
\`\`\``;
}

function getCategoryTone(category) {
  const tones = {
    TOUR: '따뜻하고 신뢰감 있는 톤. "현지 12년차 가이드가 숨은 이야기까지 들려줘요" 느낌. 가이드 전문성, 현지 깊이, 이동 편의, 소그룹 친밀감 강조.',
    TICKET: '밝고 설득적인 톤. "입장권 1장으로 어트랙션 무제한, 이용방법 간단" 느낌. 즉시 입장, 이용방법 명확성, 옵션 비교, 절약 금액 강조.',
    ACTIVITY: '역동적이고 용기를 주는 톤. "초보도 OK, 장비 전부 포함" 느낌. 안전 보장, 초보 가능, 장비 포함, 현장 분위기 강조.',
    CLASS: '따뜻하고 성장 지향적인 톤. "전문 강사와 함께하는 진짜 배움" 느낌. 커리큘럼 체계, 강사 전문성, 소규모 수업, 실습 중심 강조.',
    SNAPS: '감성적이고 프리미엄한 톤. "당신만의 순간을 빛으로 담다" 느낌. 결과물 품질, 촬영 장소, 소요시간, 포함 컷수 강조.',
    CONVENIENCE: '간결하고 안심시키는 톤. "탭 한 번이면 끝, 걱정 없이 떠나세요" 느낌. 사용 편의성, 커버리지, 가격 절약, 절차 단순함 강조.',
  };
  return tones[category] || tones.TOUR;
}

function getIntroBlockSchema(entry) {
  const schemas = {
    'intro-hook': `### [${entry.index}] intro-hook (히어로) — ${entry.required ? '필수' : '선택'}
상품 핵심 매력을 한 문장으로 전달하는 히어로 섹션. 풀폭 이미지 배경 + 오버레이 텍스트.
규칙:
- title: 질문형("~해보셨나요?") 또는 수치 포함("3시간 만에 ~") 문장. **반드시 15자 이내, 한 줄로 끝나야 함.** 줄바꿈 절대 금지. "이 상품은"으로 시작 금지.
- subtitle: 상품 핵심 가치 한 줄. **반드시 20자 이내.** 구체적 장소명/숫자 포함 권장.
- textAlign: "left"
- imagePrompt: AI 이미지 생성용 영어 프롬프트 (선택)
좋은 예: title="로마 하루 완전정복", subtitle="가이드와 함께하는 핵심 코스"
나쁜 예: title="콜로세움부터 바티칸까지 현지 가이드와 함께하는 로마 하루 투어", subtitle="완벽한 체험을 제공합니다"
\`\`\`json
{ "title": "string (15자 이내)", "subtitle": "string (20자 이내)", "textAlign": "left", "imagePrompt": "english prompt" }
\`\`\``,

    'intro-text': `### [${entry.index}] intro-text (텍스트 섹션) — ${entry.required ? '필수' : '선택'}${entry.label ? ` (${entry.label})` : ''}
상품 설명, 팁, 주의사항 등 텍스트 중심 섹션.
규칙:
- title: 섹션 제목, 최대 20자 (선택). 행동 유도형 권장 ("알아두면 좋은 팁")
- paragraphs: 정확히 2~3개 문단
  - 1문단 (최대 80자): 핵심 한 문장. "이 상품은"으로 시작 금지. 구체적 차별점부터.
  - 2문단 (최대 150자): 차별점 또는 핵심 경험 상세. 숫자/장소명 포함.
  - 3문단 (최대 150자, 선택): 추가 상세 또는 팁.
- background: "white" 또는 "gray"
- 한 문장 최대 50자. 길면 쪼개기.
\`\`\`json
{ "title": "string", "paragraphs": ["string", "string"], "background": "white" }
\`\`\``,

    'intro-image': `### [${entry.index}] intro-image (풀폭 이미지) — ${entry.required ? '필수' : '선택'}${entry.label ? ` (${entry.label})` : ''}
텍스트 섹션 사이에 시각적 변화를 주는 풀폭 이미지 1장.
규칙:
- caption: 이미지 캡션. 사진 속 장면을 구체적으로 묘사. 최대 40자 (선택). "아름다운 풍경" 금지.
- imagePrompt: AI 이미지 생성용 영어 프롬프트 (필수). 구체적 장소/상황/시간대 포함.
좋은 예: caption="석양빛 아래 센소지 5층 탑", imagePrompt="Sensoji temple pagoda at golden hour, Tokyo"
나쁜 예: caption="멋진 사진", imagePrompt="beautiful photo"
\`\`\`json
{ "caption": "string", "imagePrompt": "english prompt for image generation" }
\`\`\``,

    'intro-highlights': `### [${entry.index}] intro-highlights (핵심 포인트) — ${entry.required ? '필수' : '선택'}
상품의 핵심 매력을 아이콘 + 라벨로 2열 그리드 배치.
규칙:
- title: "핵심 포인트" 또는 맞춤 제목, 최대 15자 (선택)
- items: 4~6개. 각각:
  - icon: 적절한 이모지 1개
  - label: 구체적 대상(장소/혜택)으로 시작, 최대 10자. 숫자 포함 권장.
  - description: 행동 동사 포함, 최대 25자.
- columns: 2
- 우선순위: 독점 차별점 → 핵심 포함 혜택 → 편의 요소 → 감성 경험
- 모호한 표현 금지: "다양한 체험" (X) → "7가지 어트랙션" (O)
좋은 예: { "icon": "🎢", "label": "7대 어트랙션", "description": "패스트트랙으로 빠르게" }
나쁜 예: { "icon": "✨", "label": "특별한 경험", "description": "멋진 시간을 보내세요" }
\`\`\`json
{ "title": "핵심 포인트", "items": [{ "icon": "🎢", "label": "7대 놀이기구", "description": "대표 어트랙션 무제한" }], "columns": 2 }
\`\`\``,

    'intro-stat': `### [${entry.index}] intro-stat (핵심 수치) — ${entry.required ? '필수' : '선택'}
큰 숫자로 임팩트를 주는 통계 섹션.
규칙:
- items: 2~4개, 각각:
  - value: 숫자 (문자열). 임팩트 있는 크기. "4.8", "1,200+", "98" 등.
  - unit: 단위. "점", "명", "%" 등.
  - label: 이 수치가 뭔지 설명. 최대 15자.
- background: "white" 또는 "gray"
- **데이터에 있는 실제 수치만 사용** — 리뷰 수, 평점, 참여자 수 등
- 데이터에 충분한 수치가 없으면 빈 객체 {} 반환
\`\`\`json
{ "items": [{ "value": "4.8", "unit": "점", "label": "평균 평점" }, { "value": "1,200+", "unit": "명", "label": "참여 여행자" }], "background": "gray" }
\`\`\``,

    'intro-experience': `### [${entry.index}] intro-experience (경험 하이라이트) — ${entry.required ? '필수' : '선택'}${entry.label ? ` (${entry.label})` : ''}
핵심 경험 1개를 텍스트 + 이미지로 소개하는 섹션.
규칙:
- title: 경험 핵심 키워드. 구체적 장소명/활동명 포함. 최대 20자. "특별한 경험" 같은 모호한 표현 금지.
- description: 그 경험의 매력을 구체적으로. 숫자/시간/감각 포함 권장. 최대 80자.
- imagePrompt: AI 이미지 생성용 영어 프롬프트 (선택)
좋은 예: title="콜로세움 지하 통로 탐험", description="일반 입장으로는 볼 수 없는 검투사 대기실을 전문 가이드와 함께 둘러봐요"
나쁜 예: title="특별한 체험", description="멋진 경험을 할 수 있어요"
\`\`\`json
{ "title": "string", "description": "string", "imagePrompt": "english prompt for image generation" }
\`\`\``,

    'intro-course': `### [${entry.index}] intro-course (코스/동선) — ${entry.required ? '필수' : '선택'}
코스 흐름을 장소 + 시간으로 타임라인 시각화.
규칙:
- title: 기본 "코스 미리보기", 최대 15자
- stops: 3~6개, 각각:
  - name: 정확한 장소명. 원본 데이터 그대로.
  - description: 그 장소에서의 핵심 경험 1~2문장. 최대 80자. 구체적 활동/볼거리 포함.
  - duration: 소요시간. 원본에 없으면 "약 ~분" 형태로 합리적 추정.
- totalDuration: 전체 소요시간
- **데이터에 없는 장소 추가 절대 금지** — 원본 데이터의 장소명 그대로 사용
좋은 예: { "name": "콜로세움", "description": "지하 검투사 통로와 아레나를 전문 가이드와 함께 둘러봐요", "duration": "약 1시간" }
나쁜 예: { "name": "콜로세움", "description": "", "duration": "1일차" }
\`\`\`json
{ "title": "코스 미리보기", "stops": [{ "name": "장소명", "description": "그 장소에서의 경험", "duration": "50분" }], "totalDuration": "약 5시간" }
\`\`\``,

    'intro-provider': `### [${entry.index}] intro-provider (제공자 소개) — ${entry.required ? '필수' : '선택'}
가이드/포토그래퍼/셰프 등 서비스 제공자 프로필 카드.
규칙:
- name: 이름 (데이터에 있는 그대로)
- role: 역할. "한국어 전문 가이드" 같은 구체적 한 줄 타이틀, 최대 20자
- experience: 구체적 경력 요약, 최대 30자. "경력 10년" 같은 숫자 포함.
- badges: 1~3개 차별화 태그 (예: "현지 거주 8년", "한국어 능통")
- introduction: 가이드 매력을 1인칭으로 자연스럽게, 최대 100자. "안녕하세요" 시작 금지.
- **데이터에 가이드/제공자 정보가 없으면 반드시 빈 객체 {} 반환** — 만들어내기 금지
\`\`\`json
{ "name": "string", "role": "string", "experience": "string", "badges": ["string"], "introduction": "string" }
\`\`\``,

    'intro-howto': `### [${entry.index}] intro-howto (이용방법) — ${entry.required ? '필수' : '선택'}${entry.label ? ` (${entry.label})` : ''}
사용 단계를 번호 스텝으로 안내.
규칙:
- title: 기본 "이용 방법", 최대 15자
- steps: 3~5개, 각각:
  - step: 번호
  - title: 행동 중심 (예: "바우처 확인하기"), 최대 15자. "~하기" 패턴 권장.
  - description: 구체적 방법 설명, 최대 50자. 장소/앱/링크 등 실용 정보 포함.
  - icon: 이모지 1개 (선택)
- **데이터에 없는 절차 만들어내기 금지**
좋은 예: { "step": 1, "title": "바우처 확인하기", "description": "결제 후 이메일로 QR코드가 발송돼요", "icon": "📧" }
나쁜 예: { "step": 1, "title": "준비", "description": "준비를 해주세요" }
\`\`\`json
{ "title": "이용 방법", "steps": [{ "step": 1, "title": "바우처 확인하기", "description": "결제 후 이메일로 QR코드가 발송돼요", "icon": "📧" }] }
\`\`\``,

    'intro-spot': `### [${entry.index}] intro-spot (스팟/장소) — ${entry.required ? '필수' : '선택'}
특정 장소 1개를 풀폭 이미지로 소개.
규칙:
- name: 정확한 장소명, 최대 20자. 데이터에 있는 이름 그대로.
- description: 장소의 매력을 구체적으로. 감각(시각/청각) + 활동 포함 권장. 최대 80자.
- imagePrompt: AI 이미지 생성용 프롬프트 (선택)
좋은 예: name="센소지 나카미세도리", description="200m 전통 상점가를 걸으며 현지 간식과 기념품을 구경해보세요"
나쁜 예: name="유명한 곳", description="멋진 장소예요"
\`\`\`json
{ "name": "string", "description": "string", "imagePrompt": "english prompt" }
\`\`\``,

    'intro-comparison': `### [${entry.index}] intro-comparison (절약/비교) — ${entry.required ? '필수' : '선택'}
개별 구매 대비 패키지 절약 시각화.
규칙:
- title: "개별 구매보다 ₩{절약액} 절약" 패턴. 구체적 금액 포함.
- items: 포함 항목 + 개별 가격. **가격은 원본 데이터에서 정확히 추출** (추측 금지)
- totalIndividual, packagePrice, savings, savingsPercent 모두 계산해서 제공
- **가격 데이터가 없으면 반드시 빈 객체 {} 반환** — 가격 추측 절대 금지
\`\`\`json
{ "title": "개별 구매보다 ₩31,000 절약", "items": [{ "name": "string", "price": 22000, "included": true }], "totalIndividual": 120000, "packagePrice": 89000, "savings": 31000, "savingsPercent": 26 }
\`\`\``,

    'intro-safety': `### [${entry.index}] intro-safety (안전/장비) — ${entry.required ? '필수' : '선택'}
안전 장비와 안심 메시지 전달.
규칙:
- title: 기본 "안전 장비 완비", 최대 15자. 초보자 안심 키워드 권장.
- equipment: 구체적 장비 목록 1~5개. 데이터에 있는 것만.
- description: 안심 메시지. "초보도 OK" 느낌. 전문 강사/인증 정보 포함 권장. 최대 80자.
좋은 예: description="전원 구명조끼 착용, PADI 인증 강사가 1:4로 케어해요"
나쁜 예: description="안전합니다"
\`\`\`json
{ "title": "안전 장비 완비", "equipment": ["구명조끼", "헬멧"], "description": "전원 구명조끼 착용, PADI 인증 강사가 1:4로 케어해요" }
\`\`\``,

    'intro-accommodation': `### [${entry.index}] intro-accommodation (숙소 소개) — ${entry.required ? '필수' : '선택'}
호텔/숙소 정보 카드.
규칙:
- name: 정확한 호텔명 (데이터에 있는 그대로)
- starRating: 별 등급 (1~5). 데이터에 있는 것만.
- location: 위치 한 줄. 주요 랜드마크와의 거리 포함 권장.
- amenities: 주요 편의시설 3~5개. 데이터에 있는 것만.
- **숙소 데이터가 없으면 반드시 빈 객체 {} 반환** — 호텔 정보 만들어내기 금지
\`\`\`json
{ "name": "string", "starRating": 4, "location": "시내 중심, 지하철 5분", "amenities": ["조식포함", "수영장", "무료 Wi-Fi"] }
\`\`\``,

    'intro-schedule': `### [${entry.index}] intro-schedule (일정 미리보기) — ${entry.required ? '필수' : '선택'}
Day별 일정 타임라인.
규칙:
- title: "N박 N일 일정 한눈에" 패턴. 구체적 기간 포함. 최대 20자.
- days: 각각:
  - day: 번호
  - title: 일정 제목. 핵심 장소명 포함. 최대 15자.
  - summary: 주요 활동/장소를 "·"로 연결. 최대 40자.
  - type: "guided" | "free" | "travel"
- totalDuration: 전체 기간
- **데이터에 없는 장소/일정 추가 금지**
\`\`\`json
{ "title": "3박 5일 일정 한눈에", "days": [{ "day": 1, "title": "방콕 핵심 투어", "summary": "왕궁 · 왓포 · 왓아룬", "type": "guided" }], "totalDuration": "3박 5일" }
\`\`\``,

    'intro-cta': `### [${entry.index}] intro-cta (마무리 CTA) — ${entry.required ? '필수' : '선택'}
상품소개 마지막 섹션. 감성 문구 + CTA 버튼.
규칙:
- headline: 감성적이되 구체적인 문구. 도시명/경험 키워드 포함 필수. 최대 20자.
- buttonText: **저압박 CTA**. "일정 확인하기", "날짜 보기", "옵션 살펴보기" 중 택1. "지금 바로 예약" 금지.
- subText: 안심 문구 (예: "48시간 전 무료 취소"). 데이터에 취소 정책이 있으면 반영.
- imagePrompt: AI 이미지 생성용 프롬프트 (선택)
좋은 예: headline="파리의 밤, 함께 걸어요", buttonText="날짜 보기", subText="48시간 전 무료 취소"
나쁜 예: headline="지금 바로!", buttonText="예약하기", subText=""
\`\`\`json
{ "headline": "string", "buttonText": "일정 확인하기", "subText": "48시간 전 무료 취소", "imagePrompt": "english prompt" }
\`\`\``,

    'intro-program': `### [${entry.index}] intro-program (프로그램 상세) — ${entry.required ? '필수' : '선택'}${entry.label ? ` (${entry.label})` : ''}
이미지 + 텍스트가 풍부한 프로그램/코스/맛집/스팟 상세 섹션.
용도: 투어 코스 상세, 맛집 가이드, 방문 스팟 소개, 체험 프로그램 등.
규칙:
- title: 섹션 제목. "프로그램", "현지 맛집 가이드", "주요 방문지" 등. 최대 15자.
- items: 2~5개 항목, 각각:
  - label: 상위 분류 라벨. "1일차 석식", "Day 2 중식", "코스 1" 등. 최대 15자. (선택)
  - title: 항목명. 장소명/레스토랑명/활동명 포함. "동북인가 - 꿔바로우, 지삼선" 처럼 구체적으로. 최대 30자.
  - duration: 소요시간. "15분 내외", "약 1시간" 등. (선택)
  - description: 그 장소/경험의 매력 상세. 2~3문장. 최대 150자. 구체적이고 생동감 있게. 감각(맛/시각) + 실용 정보 포함 권장.
  - images: 빈 배열 [] (이미지는 사용자가 직접 추가)
- **상품 데이터에 있는 정보만 사용**. 데이터에 없는 장소/레스토랑 만들어내기 금지.
좋은 예: { "label": "1일차 석식", "title": "동북인가 - 꿔바로우, 지삼선", "description": "한국인이 중국 요리에 처음 입문하기 좋은 동북요리 맛집! 인민광장 근처 특선요리", "images": [] }
\`\`\`json
{ "title": "현지 맛집 가이드", "items": [{ "label": "1일차 석식", "title": "레스토랑명 - 대표 메뉴", "duration": "", "description": "설명 텍스트", "images": [] }] }
\`\`\``,

    'intro-card-grid': `### [${entry.index}] intro-card-grid (카드 그리드) — ${entry.required ? '필수' : '선택'}
2열 이미지 카드 그리드. 주요 스팟/어트랙션/옵션을 시각적으로 나열.
규칙:
- title: 섹션 제목. "하이라이트 스팟", "주요 어트랙션" 등. 최대 15자. (선택)
- items: 2~6개 카드, 각각:
  - title: 카드 제목. 장소명/어트랙션명. 최대 15자.
  - subtitle: 부가 정보. "인기 1위", "필수 방문" 등. 최대 15자. (선택)
  - tag: 카드 위 태그 뱃지. "인기", "추천", 카테고리명 등. 최대 8자. (선택)
  - image: 빈 객체 {} (이미지는 사용자가 직접 추가)
- **상품 데이터에 여러 장소/옵션이 있을 때 사용**
\`\`\`json
{ "title": "하이라이트 스팟", "items": [{ "title": "콜로세움", "subtitle": "필수 방문", "tag": "인기", "image": {} }] }
\`\`\``,
  };

  return schemas[entry.block] || '';
}

// ─── 응답 파싱 ──────────────────────────────────────────────

function parseIntroResponse(text, recipe) {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : text;

  try {
    const parsed = JSON.parse(jsonStr.trim());
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => item.blockType && item.data && Object.keys(item.data).length > 0)
        .map((item) => ({
          blockType: item.blockType,
          data: item.data,
        }));
    }
  } catch {
    // 폴백
  }

  return recipe
    .filter((item) => item.required)
    .map((item) => ({
      blockType: item.block,
      data: buildFallbackData(item.block),
    }));
}

function buildFallbackData(blockType) {
  const fallbacks = {
    'intro-hook': { title: '이 상품이 특별한 이유', subtitle: '상세 정보를 확인해보세요', textAlign: 'center' },
    'intro-text': { paragraphs: ['상품 상세 정보를 확인해보세요.'], background: 'white' },
    'intro-highlights': { title: '핵심 포인트', items: [{ icon: '✨', label: '특별한 경험' }], columns: 2 },
    'intro-experience': { title: '핵심 경험', description: '이 상품만의 특별한 경험을 만나보세요' },
    'intro-cta': { headline: '지금 확인해보세요', buttonText: '일정 확인하기', subText: '' },
    'intro-howto': { title: '이용 방법', steps: [{ step: 1, title: '예약', description: '원하는 날짜에 예약하세요' }] },
  };
  return fallbacks[blockType] || {};
}
