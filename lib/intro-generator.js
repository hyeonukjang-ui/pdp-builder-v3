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

export async function generateIntroBlocks({ rawData, category, depth2, recipe: customRecipe }) {
  const fullRecipe = customRecipe || getIntroRecipe(category);
  // depth2가 있으면 해당 depth2에서 '—'인 블록 제외
  const recipe = depth2
    ? fullRecipe.filter((item) => {
        if (!item.d2) return true;
        return item.d2[depth2] && item.d2[depth2] !== '—';
      })
    : fullRecipe;

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
    .map((entry) => getIntroBlockSchema(entry, category))
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
**모든 블록은 필수. 빈 객체 {} 반환 금지. 데이터가 부족해도 합리적으로 추정하여 반드시 생성.**

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

function getIntroBlockSchema(entry, category) {
  const cat = category || 'TOUR';
  const schemas = {
    'intro-hook': `### [${entry.index}] intro-hook (${entry.label || '히어로 + 뱃지'}) — ${entry.required ? '필수' : '선택'}
히어로 이미지 + 뱃지(태그) + 한줄 제목 + 부제목. 왼쪽 정렬.
**시트 규칙: 뱃지는 중복되면 안되고 최대 3개**
규칙:
- title: **반드시 15자 이내, 한 줄.** 줄바꿈 금지. 상품의 핵심을 한마디로. "이 상품은" 시작 금지.
- subtitle: **반드시 20자 이내.** 구체적 장소명/숫자 포함.
- textAlign: "left"
- badges: 뱃지는 코드에서 자동 삽입하므로 생성 불필요.
\`\`\`json
{ "title": "string (15자 이내)", "subtitle": "string (20자 이내)", "textAlign": "left" }
\`\`\``,

    'intro-text': `### [${entry.index}] intro-text (${entry.label || '텍스트'}) — ${entry.required ? '필수' : '선택'}
**섹션명: "${entry.label}"** — 이 섹션명을 title로 사용하거나, 맥락에 맞게 변형.
${entry.label === '투어 소개' ? `**시트 규칙: 제목+텍스트로 짧은 소개, 투어의 핵심. 수향마을이면 수향마을 소개 등.**
- title: 투어 핵심을 담은 제목, 15자 이내. "~투어", "~체험" 등 구체적으로.
- paragraphs: 2~3개 문단. 이 투어만의 차별점/핵심 경험을 소개.` : ''}${entry.label === '소개' ? `**시트 규칙: 상품/서비스의 핵심을 짧게 소개.**
- title: 상품 핵심을 담은 제목, 15자 이내.
- paragraphs: 2~3개 문단. 이 상품의 차별점/핵심 가치.` : ''}${entry.label === '포함·불포함' ? `**시트 규칙: 상품에 포함/불포함된 항목을 나열.**
- title: "포함·불포함"
- paragraphs: 포함 항목과 불포함 항목을 bullet 형태로 정리. 원본 데이터에 있는 것만.` : ''}${entry.label === '집합/픽업' ? `**시트 규칙: 집합 장소, 픽업 정보를 안내.**
- title: "집합/픽업 안내"
- paragraphs: 집합 장소, 시간, 픽업 방법 등. 원본 데이터에 있는 것만.` : ''}${entry.label === '취소환불' ? `**시트 규칙: 취소/환불 정책 안내.**
- title: "취소 및 환불 안내"
- paragraphs: 취소 기한, 환불 조건 등. 원본 데이터에 있는 것만. 없으면 합리적으로 추정하여 반드시 생성.` : ''}${entry.label === 'FAQ' ? `**시트 규칙: 자주 묻는 질문 3~5개. Q&A 구조.**
- title: "자주 묻는 질문"
- faq: 3~5개 배열. 각각 { "q": "질문", "a": "답변" }. paragraphs 대신 faq 사용.
- 상품 데이터에서 예상 가능한 질문만.` : ''}${entry.label === '공지/주의사항' ? `**시트 규칙: 필독 공지, 주의사항.**
- title: "꼭 알아두세요"
- paragraphs: 주의사항/공지 bullet 정리. 원본 데이터에 있는 것만.` : ''}${entry.label === '노선·구간' ? `**시트 규칙: 교통 노선, 구간 정보.**
- title: "노선·구간 안내"
- paragraphs: 노선/구간/정류장 정보. 원본 데이터에 있는 것만. 없으면 합리적으로 추정하여 반드시 생성.` : ''}${entry.label === '위치·교통' ? `**시트 규칙: 위치, 교통 안내.**
- title: "위치·교통"
- paragraphs: 주소, 교통편, 소요시간 등. 원본 데이터에 있는 것만. 없으면 합리적으로 추정하여 반드시 생성.` : ''}${entry.label === '티켓 옵션 비교표' ? `**시트 규칙: 표로 삽입. 옵션명, 이용대상, 특징으로 노출.**
- title: "티켓 옵션 비교"
- paragraphs: 옵션별 이름/이용대상/특징을 표 형태로 정리. 원본 데이터의 옵션 정보에서 추출. 없으면 합리적으로 추정하여 반드시 생성.` : ''}
- background: "white" 또는 "gray"
- 한 문장 최대 50자. 데이터에 해당 정보가 없으면 합리적으로 추정하여 반드시 생성.
${entry.label === 'FAQ' ? `**FAQ는 반드시 faq 배열을 사용. paragraphs 사용 금지.**
JSON: { "title": "자주 묻는 질문", "faq": [{ "q": "질문", "a": "답변" }, { "q": "질문2", "a": "답변2" }] }` : ''}
\`\`\`json
${entry.label === 'FAQ' ? '{ "title": "자주 묻는 질문", "faq": [{ "q": "질문", "a": "답변" }] }' : '{ "title": "string", "paragraphs": ["string", "string"], "background": "white" }'}
\`\`\``,

    'intro-image': `### [${entry.index}] intro-image (풀폭 이미지) — ${entry.required ? '필수' : '선택'}
\`\`\`json
{ "caption": "string", "imagePrompt": "english prompt for image generation" }
\`\`\``,

    'intro-highlights': `### [${entry.index}] intro-highlights (${entry.label || '하이라이트'}) — ${entry.required ? '필수' : '선택'}
**시트 규칙 [${cat}]: 아이콘 + 텍스트 조합. 이미지 없음.**
${cat === 'TOUR' ? '투어의 핵심 매력/차별점을 아이콘+텍스트로 전달. 가이드 전문성, 포함 혜택, 소그룹 등.' : ''}${cat === 'TICKET' ? '티켓의 핵심 매력을 아이콘+텍스트로 전달. 즉시 입장, 어트랙션 수, 절약 금액 등.' : ''}${cat === 'ACTIVITY' ? '액티비티의 핵심 포인트. 안전 장비, 초보 가능, 소요시간 등.' : ''}
규칙:
- title: "하이라이트" 또는 맞춤 제목, 최대 15자
- items: 4~6개. 각각:
  - icon: 적절한 이모지 1개
  - label: 구체적 대상, 최대 10자. 숫자 포함 권장.
  - description: 행동 동사 포함, 최대 25자.
- columns: 2
\`\`\`json
{ "title": "하이라이트", "items": [{ "icon": "🎢", "label": "7대 놀이기구", "description": "대표 어트랙션 무제한" }], "columns": 2 }
\`\`\``,

    'intro-stat': `### [${entry.index}] intro-stat (${entry.label || '핵심 수치'}) — ${entry.required ? '필수' : '선택'}
**시트 규칙 [${cat}]: ${cat === 'TICKET' ? 'AI (리뷰수/평점). 실제 데이터만 사용.' : '핵심 수치. 실제 데이터만 사용.'}**
규칙:
- items: 2~4개, 각각:
  - value: 숫자 (문자열). 임팩트 있는 크기. "4.8", "1,200+", "98" 등.
  - unit: 단위. "점", "명", "%" 등.
  - label: 이 수치가 뭔지 설명. 최대 15자.
- background: "white" 또는 "gray"
- **데이터에 있는 실제 수치만 사용** — 리뷰 수, 평점, 참여자 수 등
- 데이터에 충분한 수치가 없으면 합리적으로 추정하여 반드시 생성
\`\`\`json
{ "items": [{ "value": "4.8", "unit": "점", "label": "평균 평점" }, { "value": "1,200+", "unit": "명", "label": "참여 여행자" }], "background": "gray" }
\`\`\``,

    'intro-experience': `### [${entry.index}] intro-experience (${entry.label || '추천 대상'}) — ${entry.required ? '필수' : '선택'}
**시트 규칙 [${cat}]: 사람 아이콘 + AI 생성. ${cat === 'TOUR' ? '투어 주제에 맞는 추천 대상 노출.' : cat === 'CLASS' ? '대상·연령별 추천.' : '상품 주제에 맞는 추천 대상 노출.'}**
규칙:
- title: "${entry.label === '대상·연령' ? '이런 분께 추천해요' : '이런 분께 추천해요'}" (기본값)
- items: 3~5개. 각각:
  - icon: 사람 관련 이모지 (👨‍👩‍👧‍👦, 👫, 🧑‍💼, 👶, 🎓 등). **반드시 사람 아이콘 사용.**
  - label: 추천 대상. 최대 15자. ${cat === 'TOUR' ? '"역사 좋아하는 커플", "첫 방문 가족" 등' : cat === 'CLASS' ? '"5~10세 아이", "초보 성인 학습자" 등' : '"테마파크 처음인 가족", "사진 좋아하는 커플" 등'}
  - description: 왜 추천하는지. 최대 40자.
\`\`\`json
{ "title": "이런 분께 추천해요", "items": [{ "icon": "👨‍👩‍👧‍👦", "label": "처음 방문하는 가족", "description": "아이와 함께 편하게 즐길 수 있어요" }] }
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

    'intro-provider': `### [${entry.index}] intro-provider (${entry.label || '가이드 소개'}) — ${entry.required ? '필수' : '선택'}
**시트 규칙 [${cat}]: 직접매핑 + AI + 사진 불러와서 넣기. 48px 원형 프로필. ${cat === 'TOUR' ? '투어 가이드 소개.' : '서비스 제공자 소개.'}**
규칙:
- name: 이름 (데이터에 있는 그대로)
- role: 역할. "한국어 전문 가이드" 등 구체적 타이틀, 최대 20자
- experience: 경력 요약, 최대 30자. 숫자 포함.
- badges: 1~3개 태그 (예: "현지 거주 8년")
- introduction: 가이드 소개 1인칭, 최대 100자. "안녕하세요" 시작 금지.
- **데이터에 가이드 정보가 없으면 합리적으로 추정하여 반드시 생성** — 만들어내기 금지
\`\`\`json
{ "name": "string", "role": "string", "experience": "string", "badges": ["string"], "introduction": "string" }
\`\`\``,

    'intro-howto': `### [${entry.index}] intro-howto (${entry.label || '이용방법'}) — ${entry.required ? '필수' : '선택'}
**시트 규칙 [${cat}]: ${cat === 'TOUR' ? '이용방법 데이터 불러오기. 예약확정→현장 이용 절차.' : cat === 'TICKET' ? 'AI 생성. 예약→바우처→입장 절차.' : 'AI 생성. 예약→이용 절차.'}**
규칙:
- title: "이용 방법", 최대 15자
- steps: 3~5개, 각각:
  - step: 번호
  - title: 행동 중심, 최대 15자. "~하기" 패턴.
  - description: 구체적 방법, 최대 50자.
  - icon: 이모지 1개 (선택)
- **데이터에 없는 절차 만들어내기 금지**
\`\`\`json
{ "title": "이용 방법", "steps": [{ "step": 1, "title": "바우처 확인하기", "description": "결제 후 이메일로 QR코드가 발송돼요", "icon": "📧" }] }
\`\`\``,

    'intro-comparison': `### [${entry.index}] intro-comparison (${entry.label || '비교표'}) — ${entry.required ? '필수' : '선택'}
**시트 규칙 [${cat}]: ${cat === 'TOUR' ? '요금·옵션표. 직접매핑.' : cat === 'TICKET' ? '비교표/절약계산. 직접매핑.' : '상품 비교표. 직접매핑.'}**
${cat === 'TOUR' ? '투어 옵션별 가격 비교표.' : cat === 'TICKET' ? '티켓 옵션 비교 또는 시티패스 절약 계산.' : '상품 옵션 비교.'}
규칙:
- title: ${cat === 'TICKET' ? '"개별 구매보다 ₩{절약액} 절약" 또는 "티켓 옵션 비교"' : '"요금·옵션 비교"'}
- items: 포함 항목 + 개별 가격. **가격은 원본 데이터에서 정확히 추출** (추측 금지)
- **가격 데이터가 없으면 반드시 합리적으로 추정하여 반드시 생성**
\`\`\`json
{ "title": "옵션 비교", "items": [{ "name": "string", "price": 22000, "included": true }], "totalIndividual": 120000, "packagePrice": 89000, "savings": 31000, "savingsPercent": 26 }
\`\`\``,

    'intro-safety': `### [${entry.index}] intro-safety (${entry.label || '안전/장비'}) — ${entry.required ? '필수' : '선택'}
**시트 규칙 [${cat}]: ${cat === 'ACTIVITY' ? '안전 장비 목록 + 안심 메시지. 초보자 안심 키워드 필수.' : '안전/장비 정보.'}**
규칙:
- title: 기본 "안전 장비 완비", 최대 15자. 초보자 안심 키워드 권장.
- equipment: 구체적 장비 목록 1~5개. 데이터에 있는 것만.
- description: 안심 메시지. "초보도 OK" 느낌. 전문 강사/인증 정보 포함 권장. 최대 80자.
좋은 예: description="전원 구명조끼 착용, PADI 인증 강사가 1:4로 케어해요"
나쁜 예: description="안전합니다"
\`\`\`json
{ "title": "안전 장비 완비", "equipment": ["구명조끼", "헬멧"], "description": "전원 구명조끼 착용, PADI 인증 강사가 1:4로 케어해요" }
\`\`\``,

    'intro-accommodation': `### [${entry.index}] intro-accommodation (${entry.label || '호텔 안내'}) — ${entry.required ? '필수' : '선택'}
**시트 규칙 [${cat}]: ${cat === 'TOUR' ? '이미지 + AI (세미패키지 전용). 가이드 투어에서는 해당없음.' : '호텔/숙소 정보 카드.'}**
규칙:
- name: 정확한 호텔명 (데이터에 있는 그대로)
- starRating: 별 등급 (1~5). 데이터에 있는 것만.
- location: 위치 한 줄. 주요 랜드마크와의 거리 포함 권장.
- amenities: 주요 편의시설 3~5개. 데이터에 있는 것만.
- **숙소 데이터가 없으면 반드시 합리적으로 추정하여 반드시 생성** — 호텔 정보 만들어내기 금지
\`\`\`json
{ "name": "string", "starRating": 4, "location": "시내 중심, 지하철 5분", "amenities": ["조식포함", "수영장", "무료 Wi-Fi"] }
\`\`\``,

    'intro-schedule': `### [${entry.index}] intro-schedule (${entry.label || '타임라인'}) — ${entry.required ? '필수' : '선택'}
**시트 규칙 [${cat}]: ${cat === 'TOUR' ? '투어 코스별 타임라인. 당일투어면 코스별 뱃지.' : cat === 'TICKET' ? '공연 시간표.' : '일정 타임라인.'}**
좌측 핀(D1, D2...) + 세로 연결선 + 우측에 제목/설명/타입뱃지.
규칙:
- title: "당일 일정 한눈에" 등 제목. 최대 15자.
- totalDuration: 전체 소요시간. "9시간 30분" 등 (선택)
- days: 각각:
  - label: 핀 텍스트. 당일투어면 "D1", "D2" 순번. 여러 날이면 "Day 1".
  - title: 코스 제목. "신세계성 출발", "오전 동책 투어" 등 구체적. 최대 20자.
  - summary: 시간/활동 설명. "12:10 미팅 · 12:30 출발", "박물관 관람 · 운하 유람선" 등. 최대 40자.
  - type: "이동" | "가이드 투어" | "자유 일정" — 해당하는 것만.
- **데이터에 없는 코스 추가 금지**
\`\`\`json
{ "title": "당일 일정 한눈에", "totalDuration": "9시간 30분", "days": [{ "label": "D1", "title": "신세계성 출발", "summary": "12:10 미팅 · 12:30 출발", "type": "이동" }, { "label": "D2", "title": "오전 동책 투어", "summary": "박물관 관람 · 운하 유람선", "type": "가이드 투어" }] }
\`\`\``,

    'intro-cta': `### [${entry.index}] intro-cta (${entry.label || '이런 상품은 어때요?'}) — ${entry.required ? '필수' : '선택'}
**시트 규칙 [${cat}]: 이미지 + CTA 버튼. "이런 상품은 어때요?" 문구 고정.**
이미지 1장 위에 제목 + 설명 + "추천 상품 보러가기" 버튼 오버레이.
규칙:
- title: "이런 상품은 어때요?" (고정)
- desc: 추천 이유 한줄. 최대 30자. ${cat === 'TOUR' ? '같은 도시 투어 추천.' : cat === 'TICKET' ? '같은 도시 티켓 추천.' : '유사 상품 추천.'}
- url: 빈 문자열 (사용자가 직접 입력)
- image: null (사용자가 직접 추가)
\`\`\`json
{ "title": "이런 상품은 어때요?", "desc": "비슷한 상품을 둘러보세요", "url": "", "image": null }
\`\`\``,

    'intro-program': `### [${entry.index}] intro-program (${entry.label || '프로그램'}) — ${entry.required ? '필수' : '선택'}
**시트 규칙 [${cat}]: ${cat === 'TICKET' ? '공연/메뉴 소개. AI 생성. 공연(공연 소개), 뷰티(메뉴 소개), 미식(메뉴 소개)에서 사용.' : cat === 'CLASS' ? '커리큘럼. 수업 과정 상세.' : '프로그램 상세. 이미지 + 텍스트.'}**
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

    'intro-card-grid': `### [${entry.index}] intro-card-grid (${entry.label || '카드 그리드'}) — ${entry.required ? '필수' : '선택'}
**시트 규칙 [${cat}]: ${cat === 'TOUR' ? '투어 코스/명소. 각 장소에서 뭘 구경하고 뭘 할 수 있는지 생생하게 설명.' : cat === 'TICKET' ? '어트랙션/포함시설. 각 어트랙션의 매력을 구체적으로 설명.' : cat === 'SNAPS' ? '업소·매장 목록. 각 매장 특징 설명.' : '카드 그리드.'}**
제목 → 설명(2~3줄) → 이미지 세로 나열. 최대 3개.
규칙:
- title: "${entry.label || '주요 명소'}" 등 섹션 제목. 최대 15자.
- items: 최대 3개, 각각:
  - title: 장소명/어트랙션명. 최대 15자. 데이터에 있는 이름 그대로.
  - subtitle: **2~3줄 설명 (60~100자). 그곳에서 뭘 구경하고, 뭘 체험하고, 뭘 즐길 수 있는지 구체적으로.** "~를 구경할 수 있어요", "~를 체험해보세요" 등 행동 동사 포함. 감각적 묘사(시각/맛/분위기) 권장.
  - image: 빈 객체 {} (이미지는 자동 배분)
- **데이터에 있는 장소만 사용.**
좋은 예: { "title": "외탄 야경", "subtitle": "상하이의 랜드마크 야경을 한눈에 담을 수 있어요. 100년 역사의 유럽풍 건축물과 푸동의 초현대식 스카이라인이 황푸강을 사이에 두고 마주하는 장관을 감상해보세요." }
나쁜 예: { "title": "외탄", "subtitle": "유명한 곳" }
\`\`\`json
{ "title": "주요 명소", "items": [{ "title": "장소명", "subtitle": "2~3줄 설명 (뭘 구경하고 뭘 할 수 있는지)", "image": {} }] }
\`\`\``,
  };

  return schemas[entry.block] || '';
}

// ─── 응답 파싱 ──────────────────────────────────────────────

function parseIntroResponse(text, recipe) {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : text;

  let aiBlocks = [];
  try {
    const parsed = JSON.parse(jsonStr.trim());
    if (Array.isArray(parsed)) {
      aiBlocks = parsed
        .filter((item) => item.blockType && item.data)
        .map((item) => ({ blockType: item.blockType, data: item.data }));
    }
  } catch {
    // 파싱 실패 → 전부 fallback
  }

  // 레시피의 모든 블록을 보장 (AI가 빠뜨린 블록은 fallback으로 채움)
  const usedIdx = {};
  return recipe.map((item) => {
    // AI 결과에서 같은 blockType 순서대로 매칭
    for (let i = 0; i < aiBlocks.length; i++) {
      if (aiBlocks[i].blockType === item.block && !usedIdx[i] && Object.keys(aiBlocks[i].data).length > 0) {
        usedIdx[i] = true;
        return { blockType: item.block, data: aiBlocks[i].data };
      }
    }
    return { blockType: item.block, data: buildFallbackData(item.block) };
  });
}

function buildFallbackData(blockType) {
  const fallbacks = {
    'intro-hook': { title: '이 상품이 특별한 이유', subtitle: '상세 정보를 확인해보세요', textAlign: 'left' },
    'intro-text': { paragraphs: ['상품 상세 정보를 확인해보세요.'], background: 'white' },
    'intro-highlights': { title: '핵심 포인트', items: [{ icon: '✨', label: '특별한 경험' }], columns: 2 },
    'intro-experience': { title: '이런 분께 추천해요', items: [{ icon: '👤', label: '추천 대상', description: '' }] },
    'intro-cta': { title: '이런 상품은 어때요?', desc: '비슷한 상품을 둘러보세요', url: '', image: null },
    'intro-howto': { title: '이용 방법', steps: [{ step: 1, title: '예약', description: '원하는 날짜에 예약하세요' }] },
  };
  return fallbacks[blockType] || {};
}
