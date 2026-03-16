# PDP 블록 데이터 스키마 정의

> 데이터 아키텍트 관점 | 2026-03-16

---

## 목차

1. [전체 상품 데이터 스키마](#1-전체-상품-데이터-스키마)
2. [블록별 상세 스키마](#2-블록별-상세-스키마)
3. [카테고리별 필요 블록 매핑](#3-카테고리별-필요-블록-매핑)
4. [MRT 원본 데이터 → 블록 스키마 변환 매핑](#4-mrt-원본-데이터--블록-스키마-변환-매핑)
5. [AI 생성 시 JSON 스키마](#5-ai-생성-시-json-스키마)

---

## 1. 전체 상품 데이터 스키마

### 1.1 ProductData 루트 타입

```typescript
interface ProductData {
  /** 상품 카테고리 (8개 중 하나) */
  category: ProductCategory;

  /** 상품 ID (MRT offer ID) */
  productId?: string;

  /** MRT 상품 URL */
  url?: string;

  /** 블록별 데이터 (블록 타입을 키로 사용) */
  blocks: ProductBlocks;
}

type ProductCategory =
  | 'TICKET_THEME'       // 티켓 · 테마파크
  | 'TICKET_TRANSPORT'   // 티켓 · 교통
  | 'TICKET_CITYPASS'    // 티켓 · 시티패스
  | 'TICKET_EXPERIENCE'  // 티켓 · 체험
  | 'TOUR'               // 가이드 투어
  | 'SERVICE'            // 서비스
  | 'ACTIVITY'           // 액티비티
  | 'SEMI_PACKAGE';      // 세미패키지

interface ProductBlocks {
  hero?:          HeroData;
  trustBadges?:   TrustBadgesData;
  highlights?:    HighlightsData;
  overview?:      OverviewData;
  guideProfile?:  GuideProfileData;
  itinerary?:     ItineraryData;
  inclusions?:    InclusionsData;
  optionTable?:   OptionTableData;
  imageGrid?:     ImageGridData;
  usageGuide?:    UsageGuideData;
  comparison?:    ComparisonData;
  recommendFor?:  RecommendForData;

  // 레시피에는 존재하지만 현재 블록 렌더러 미구현
  notice?:        NoticeData;
  faq?:           FaqData;
  cta?:           CtaData;
  reviews?:       any;           // 미구현
  socialProof?:   any;           // 미구현
  relatedProducts?: any;         // 미구현
  meetingPoint?:  any;           // 미구현
  hotelInfo?:     any;           // 미구현
}
```

### 1.2 data-validator.js 검증 규칙

| 검증 항목 | 조건 | 결과 |
|-----------|------|------|
| `data` 존재 여부 | `null`, `undefined`, 비객체 | **error** |
| `data.category` 존재 여부 | 미지정 | **error** |
| `data.category` 유효성 | 8개 카테고리에 포함 여부 | **error** |
| `data.blocks` 존재 여부 | 미지정 또는 비객체 | **error** |
| 필수 블록 존재 여부 | hero, highlights, overview, inclusions, notice, faq, cta | **warning** (graceful skip) |

> 핵심 설계 원칙: 필수 블록이 누락되어도 `warning`으로 처리하고 해당 블록만 건너뛰는 **graceful degradation** 방식.

---

## 2. 블록별 상세 스키마

### 2.1 Hero 블록

```typescript
interface HeroData {
  /** 대표 이미지 */
  image: {
    url: string;    // 필수 (validate 조건)
    alt?: string;   // 선택 (폴백: '')
  };

  /** 상품명 */
  title: string;    // 필수 (validate 조건)

  /** 부제목 */
  subtitle?: string;

  /** 배지 목록 */
  badges?: HeroBadge[];

  /** 별점 정보 */
  rating?: {
    score?: number;   // 0~5, 소수점 허용 (0.25~0.75 구간에서 반별)
    count?: number;   // 리뷰 수 (toLocaleString() 포맷)
  };

  /** 가격 정보 */
  price?: {
    current?: number;    // 현재 가격
    original?: number;   // 원래 가격 (할인 전, 선택)
    currency?: string;   // 통화 기호 (예: '₩', '$')
    unit?: string;       // 단위 (예: '1인', '1매')
  };
}

interface HeroBadge {
  type?: string;    // CSS modifier용 (예: 'korean_guide', 'instant_confirm')
  label?: string;   // 표시 텍스트
}
```

**validate 조건**: `data.title && data.image.url` 모두 truthy

**폴백 처리 분석**:
| 필드 | 접근 방식 | 폴백값 |
|------|-----------|--------|
| `image.url` | `data?.image?.url` | `'/placeholder.jpg'` |
| `image.alt` | `data?.image?.alt` | `''` |
| `title` | `data?.title` | `''` |
| `subtitle` | `data?.subtitle` | `''` |
| `badges` | `data?.badges` | `[]` |
| `rating` | `data?.rating` | `undefined` (미렌더링) |
| `price` | `data?.price` | `undefined` (미렌더링) |

---

### 2.2 TrustBadges 블록

```typescript
interface TrustBadgesData {
  /** 신뢰 배지 목록 (최대 4개만 렌더링) */
  badges: TrustBadge[];
}

interface TrustBadge {
  type?: string;    // CSS modifier용 (예: 'default')
  label?: string;   // 표시 텍스트
  icon?: string;    // 이모지 또는 아이콘 문자
}
```

**validate 조건**: `data.badges.length >= 1`

**제약조건**: `badges.slice(0, 4)` — 최대 4개까지만 표시

---

### 2.3 Highlights 블록

```typescript
interface HighlightsData {
  /** 섹션 제목 */
  title?: string;

  /** 하이라이트 항목 (최소 1개 필수) */
  items: HighlightItem[];
}

interface HighlightItem {
  icon?: string;    // 이모지 (선택, 없으면 아이콘 영역 미렌더링)
  text?: string;    // 하이라이트 텍스트
}
```

**validate 조건**: `data.items.length >= 1`

**렌더링 특이사항**: `items.length === 0`이면 빈 문자열 반환 (블록 자체 미렌더링)

---

### 2.4 Overview 블록

```typescript
interface OverviewData {
  /** 섹션 제목 */
  title?: string;

  /**
   * 본문 내용 (두 가지 방식 중 하나)
   * paragraphs가 우선 적용, 없으면 content 사용
   */
  paragraphs?: string[];    // 문단 배열 → 각각 <p> 태그로 변환
  content?: string;          // HTML 문자열 직접 사용
}
```

**validate 조건**: `data.content || data.paragraphs.length` (둘 중 하나 존재)

**렌더링 특이사항**:
- `paragraphs`가 존재하면 `content`보다 우선 적용
- 기본 3줄 접힘 상태 (`-webkit-line-clamp: 3`)
- mount()에서 "더 보기/접기" 토글 이벤트 바인딩

---

### 2.5 GuideProfile 블록

```typescript
interface GuideProfileData {
  /** 가이드 이름 (필수) */
  name: string;

  /** 가이드 사진 */
  photo?: {
    url: string;
    alt?: string;     // 폴백: name 값 사용
  };

  /** 가이드 직함/타이틀 */
  title?: string;

  /** 경력 설명 (예: '이스탄불 거주 12년') */
  experience?: string;

  /** 구사 언어 목록 */
  languages?: string[];

  /** 자기 소개 문구 */
  introduction?: string;

  /** 자격/인증 배지 */
  certifications?: string[];
}
```

**validate 조건**: `data.name` (이름만 있으면 유효)

**폴백 처리**:
- `photo`가 없으면 이름 첫 글자로 이니셜 아바타 생성
- `photo.url` 로드 실패 시 `onerror`로 이니셜 아바타로 전환

> 참고: `script.js`의 샘플 데이터에서는 `photo`가 string (URL)이고, 블록 렌더러에서는 `photo.url` 객체 형식. 블록 렌더러 기준이 정규 스키마.

---

### 2.6 Itinerary 블록

```typescript
interface ItineraryData {
  /** 섹션 제목 */
  title?: string;

  /** 일정 표시 유형 */
  type?: 'timeline' | 'day_by_day';   // 기본값: 'timeline'

  /** 일정 항목 (최소 1개 필수) */
  stops: ItineraryStop[];

  /** 총 소요시간 (예: '총 약 5시간 30분') */
  totalDuration?: string;
}

interface ItineraryStop {
  /** 시각 (timeline 모드) */
  time?: string;        // 예: '09:00'

  /** 날짜/일차 (day_by_day 모드) */
  day?: number;         // 기본값: 1

  /** 장소/활동명 */
  title?: string;

  /** 상세 설명 */
  description?: string;

  /** 소요시간 */
  duration?: string;    // 예: '약 50분'

  /** 장소 이미지 URL */
  image?: string;
}
```

**validate 조건**: `data.stops.length >= 1`

**렌더링 분기**:
- `type === 'day_by_day'`: `stop.day` 기준 그룹핑 → Day별 섹션 생성
- `type === 'timeline'` (기본): 순차 타임라인 렌더링

> 참고: `script.js` 샘플에서는 `items` 키를 사용하지만, 블록 렌더러는 `stops` 키를 기대함. 블록 렌더러 기준이 정규 스키마.

---

### 2.7 Inclusions 블록

```typescript
interface InclusionsData {
  /** 섹션 제목 */
  title?: string;

  /** 포함 항목 */
  included?: IncludedItem[];

  /** 불포함 항목 */
  excluded?: ExcludedItem[];
}

interface IncludedItem {
  text?: string;      // 항목명
  detail?: string;    // 부가 설명 (작은 글씨)
}

interface ExcludedItem {
  text?: string;      // 항목명
  tip?: string;       // 팁/대안 제안 (노란 아이콘 + 텍스트)
}
```

**validate 조건**: `data.included.length || data.excluded.length` (둘 중 하나 존재)

**렌더링 특이사항**: 2열 그리드 (`1fr 1fr`), 모바일 640px 이하에서 1열로 전환

> 참고: `script.js` 샘플에서 excluded의 부가 설명 필드가 `detail`이지만, 블록 렌더러는 `tip`을 기대함. 블록 렌더러 기준이 정규 스키마.

---

### 2.8 OptionTable 블록

```typescript
interface OptionTableData {
  /** 섹션 제목 */
  title?: string;

  /** 옵션 목록 (최소 1개 필수) */
  options: OptionItem[];
}

interface OptionItem {
  /** 옵션명 */
  name?: string;

  /** 옵션 설명 */
  description?: string;

  /** 가격 정보 */
  price?: {
    amount?: number;      // 현재 가격
    currency?: string;    // 통화 기호
    unit?: string;        // 단위 (예: '1인')
  };

  /** 할인 전 원래 가격 */
  originalPrice?: number;

  /** 옵션 배지 (예: '인기', '추천') */
  badges?: string[];

  /** 판매 가능 여부 */
  available?: boolean;    // 기본값: true (false일 때 매진 표시 + 반투명)
}
```

**validate 조건**: `data.options.length >= 1`

**렌더링 특이사항**: `available === false` 시 카드 반투명(opacity: 0.5) + "매진" 텍스트

> 참고: `script.js`의 optionTable 샘플은 `columns/rows` 테이블 구조를 사용하지만, 블록 렌더러는 `options[]` 카드 리스트 구조. 블록 렌더러 기준이 정규 스키마.

---

### 2.9 ImageGrid 블록

```typescript
interface ImageGridData {
  /** 섹션 제목 */
  title?: string;

  /** 이미지 목록 (최소 1개 필수) */
  images: ImageItem[];

  /** 레이아웃 모드 */
  layout?: 'carousel' | 'grid';   // 기본값: 'carousel'
}

interface ImageItem {
  url?: string;       // 이미지 URL (폴백: '/placeholder.jpg')
  alt?: string;       // 대체 텍스트
  caption?: string;   // 이미지 캡션
}
```

**validate 조건**: `data.images.length >= 1`

**렌더링 특이사항**:
- `carousel`: CSS scroll-snap 기반 가로 스크롤, 인디케이터 도트
- `grid`: 2열 그리드, 모바일 640px 이하에서 carousel로 자동 전환
- mount()에서 스크롤 이벤트 → 도트 활성화 인디케이터 업데이트
- 모든 이미지 `loading="lazy"`, `onerror` 폴백 처리

---

### 2.10 UsageGuide 블록

```typescript
interface UsageGuideData {
  /** 섹션 제목 */
  title?: string;

  /** 이용 단계 (최소 1개 필수) */
  steps: UsageStep[];
}

interface UsageStep {
  /** 단계 번호 */
  step?: number;         // 미지정 시 배열 인덱스 + 1

  /** 단계 제목 */
  title?: string;

  /** 단계 설명 */
  description?: string;

  /** 아이콘 (이모지) — 있으면 번호 대신 표시 */
  icon?: string;
}
```

**validate 조건**: `data.steps.length >= 1`

**렌더링 특이사항**: 타임라인 형태의 스텝 표시, `icon`이 있으면 숫자 대신 아이콘 사용

---

### 2.11 Comparison 블록

```typescript
interface ComparisonData {
  /** 섹션 제목 */
  title?: string;

  /** 비교 항목 (최소 1개 필수) */
  items: ComparisonItem[];

  /** 개별 구매 시 총액 */
  totalIndividual?: number;   // 기본값: 0

  /** 패키지 가격 (필수 — validate 조건) */
  packagePrice: number;

  /** 절약 금액 */
  savings?: number;           // 기본값: 0
}

interface ComparisonItem {
  /** 항목명 */
  name?: string;

  /** 개별 구매 가격 */
  individualPrice?: number;

  /** 패키지 포함 여부 */
  included?: boolean;    // true: 초록 체크 + 취소선, false: 회색 X
}
```

**validate 조건**: `data.items.length >= 1 && data.packagePrice` (둘 다 필수)

**자동 계산 필드** (렌더링 시):
- `savingsPercent` = `Math.round((savings / totalIndividual) * 100)`
- `packageRatio` = `Math.round((packagePrice / totalIndividual) * 100)` (바 차트용)

---

### 2.12 RecommendFor 블록

```typescript
interface RecommendForData {
  /** 섹션 제목 */
  title?: string;

  /** 추천 대상 목록 (최소 1개 필수) */
  targets: RecommendTarget[];
}

interface RecommendTarget {
  icon?: string;    // 이모지
  text?: string;    // 추천 대상 설명
}
```

**validate 조건**: `data.targets.length >= 1`

> 참고: `script.js` 샘플에서는 `items[].emoji` 키를 사용하지만, 블록 렌더러는 `targets[].icon` 키를 기대함. 블록 렌더러 기준이 정규 스키마.

---

### 2.13 미구현 블록 (레시피에만 존재)

레시피(`category-recipes.js`)에 정의되어 있으나 블록 렌더러 파일이 아직 없는 블록:

| 블록 타입 | 설명 | 사용 카테고리 | 예상 스키마 (샘플 데이터 기반) |
|-----------|------|--------------|------|
| `notice` | 알아두세요 (주의/안내) | 전 카테고리 | `{ title, sections: [{ subtitle, type, severity, items: [string] }] }` |
| `faq` | 자주 묻는 질문 | 전 카테고리 | `{ title, items: [{ question, answer }] }` |
| `cta` | 구매 CTA 버튼 | 전 카테고리 | `{ priceDisplay: { originalPrice, currentPrice, currency, unit }, buttonText, urgencyText }` |
| `reviews` | 리뷰 | 전 카테고리 | 미정 |
| `socialProof` | 소셜 프루프 | 전 카테고리 | 미정 |
| `relatedProducts` | 연관 상품 | 전 카테고리 | 미정 |
| `meetingPoint` | 미팅 포인트 | TICKET_TRANSPORT, TICKET_EXPERIENCE, TOUR, SERVICE, ACTIVITY, SEMI_PACKAGE | 미정 |
| `hotelInfo` | 숙소 정보 | SEMI_PACKAGE | 미정 |

---

## 3. 카테고리별 필요 블록 매핑

### 3.1 블록 매트릭스

| 블록 | TICKET_THEME | TICKET_TRANSPORT | TICKET_CITYPASS | TICKET_EXPERIENCE | TOUR | SERVICE | ACTIVITY | SEMI_PACKAGE |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| hero | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| trustBadges | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| highlights | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 |
| overview | 6 | 5 | 6 | 6 | 7 | 5 | 5 | 4 |
| guideProfile | - | - | - | - | 4 | 7 | - | - |
| itinerary | - | - | - | 5 | 5 | - | 6 | 5 |
| inclusions | 7 | 7 | 7 | 7 | 9 | 6 | 7 | 8 |
| optionTable | 4 | - | - | - | 8 | - | - | 7 |
| imageGrid | 5 | - | 5 | 4 | 6 | 4 | 4 | - |
| usageGuide | 8 | 4 | 8 | 9 | 11 | 9 | 9 | 11 |
| comparison | - | - | 4 | - | - | - | - | 9 |
| recommendFor | - | - | - | - | 13 | - | 11 | 12 |
| meetingPoint | - | 6 | - | 8 | 10 | 8 | 8 | 10 |
| hotelInfo | - | - | - | - | - | - | - | 6 |
| reviews | 9 | 8 | 9 | 10 | 12 | 10 | 10 | 12 |
| notice | 10 | 9 | 10 | 11 | 14 | 11 | 12 | 13 |
| faq | 11 | 10 | 11 | 12 | 15 | 12 | 13 | 14 |
| socialProof | 12 | 11 | 12 | 13 | 16 | 13 | 14 | 15 |
| relatedProducts | 13 | 12 | 13 | 14 | 17 | 14 | 15 | 16 |
| cta | 14 | 13 | 14 | 15 | 18 | 15 | 16 | 17 |

> 숫자 = 해당 카테고리에서의 배치 순서, `-` = 미사용

### 3.2 카테고리별 특징 블록

| 카테고리 | 핵심 차별 블록 | 설명 |
|----------|---------------|------|
| **TICKET_THEME** | `optionTable`, `imageGrid` | 테마파크 옵션(1일/2일 패스)과 시설 이미지 중심 |
| **TICKET_TRANSPORT** | `usageGuide`, `meetingPoint` | 이용방법(교환/탑승)과 미팅포인트가 핵심 |
| **TICKET_CITYPASS** | `comparison`, `imageGrid` | 개별 vs 패키지 가격 비교가 핵심 |
| **TICKET_EXPERIENCE** | `imageGrid`, `itinerary`, `meetingPoint` | 체험 이미지 + 진행 순서 + 집합 장소 |
| **TOUR** | `guideProfile`, `itinerary`, `optionTable`, `recommendFor` | 가이드 소개 + 상세 일정이 가장 풍부 |
| **SERVICE** | `guideProfile`, `imageGrid` | 서비스 제공자 프로필 + 결과물 이미지 |
| **ACTIVITY** | `itinerary`, `imageGrid`, `recommendFor` | 활동 순서 + 현장 이미지 + 대상 추천 |
| **SEMI_PACKAGE** | `itinerary`, `hotelInfo`, `optionTable`, `comparison`, `recommendFor` | 일정+숙소+옵션+가격비교 모두 필요, 가장 복잡 |

---

## 4. MRT 원본 데이터 → 블록 스키마 변환 매핑

MRT(마이리얼트립) Offer 페이지에서 스크래핑되는 원본 JSON 필드가 각 블록의 어떤 필드로 변환되는지 매핑한다.

### 4.1 변환 매핑 테이블

| MRT 원본 필드 (추정) | 블록 | 블록 필드 | 변환 로직 |
|----------------------|------|-----------|-----------|
| `offer.title` | hero | `title` | 직접 매핑 |
| `offer.subtitle` / `offer.summary` | hero | `subtitle` | 직접 매핑 또는 AI 요약 |
| `offer.mainImage` / `offer.images[0]` | hero | `image.url` | 첫 번째 이미지 URL |
| `offer.rating.average` | hero | `rating.score` | 직접 매핑 |
| `offer.rating.totalCount` | hero | `rating.count` | 직접 매핑 |
| `offer.price.amount` | hero | `price.current` | 직접 매핑 |
| `offer.price.originalAmount` | hero | `price.original` | 직접 매핑 (할인 상품만) |
| `offer.price.currency` | hero | `price.currency` | `KRW` → `₩` 변환 |
| `offer.tags` / `offer.badges` | hero, trustBadges | `badges[]` | 태그 → badge 객체 변환 |
| `offer.description` | overview | `content` 또는 `paragraphs` | HTML 파싱 → 문단 분리 |
| `offer.highlights` | highlights | `items[]` | AI로 아이콘 매칭 생성 |
| `offer.guide.name` | guideProfile | `name` | 직접 매핑 |
| `offer.guide.photo` | guideProfile | `photo.url` | 직접 매핑 |
| `offer.guide.languages` | guideProfile | `languages[]` | 직접 매핑 |
| `offer.guide.introduction` | guideProfile | `introduction` | 직접 매핑 또는 AI 보정 |
| `offer.itinerary` / `offer.schedule` | itinerary | `stops[]` | 구조 변환 (시간/장소/설명 파싱) |
| `offer.inclusions` | inclusions | `included[]` | 항목별 `{ text, detail }` 변환 |
| `offer.exclusions` | inclusions | `excluded[]` | 항목별 `{ text, tip }` 변환, AI로 tip 생성 |
| `offer.options` | optionTable | `options[]` | 옵션명/가격/상태 매핑 |
| `offer.images[]` | imageGrid | `images[]` | `{ url, alt }` 변환, AI로 caption 생성 |
| `offer.usageInfo` / `offer.howToUse` | usageGuide | `steps[]` | AI로 단계별 구조화 |
| `offer.notices` / `offer.terms` | notice | `sections[]` | 카테고리별 그룹핑 + severity 할당 |
| `offer.faq` | faq | `items[]` | `{ question, answer }` 매핑 |

### 4.2 AI 생성이 필요한 필드

MRT 원본 데이터에서 직접 매핑이 불가능하고, Claude API를 통해 생성해야 하는 필드:

| 블록 | AI 생성 필드 | 생성 방식 |
|------|-------------|-----------|
| highlights | `items[].icon` | 텍스트 내용에 맞는 이모지 자동 선택 |
| highlights | `items[].text` | 원본 설명에서 핵심 포인트 추출/재구성 |
| overview | `paragraphs[]` | 원본 description을 자연스러운 문단으로 재구성 |
| guideProfile | `introduction` | 가이드 정보 기반 소개 문구 생성 |
| guideProfile | `certifications[]` | 경력/자격 정보에서 배지 텍스트 추출 |
| itinerary | `stops[].description` | 일정 원본을 설명형 문장으로 변환 |
| inclusions | `excluded[].tip` | 불포함 항목에 대한 대안/팁 생성 |
| imageGrid | `images[].caption` | 이미지 내용 기반 캡션 생성 |
| usageGuide | `steps[]` 전체 | 이용안내 텍스트를 단계별 구조로 변환 |
| comparison | 전체 | 시티패스 구성 항목 + 가격 비교 구조 생성 |
| recommendFor | `targets[]` | 상품 특성에서 추천 대상 생성 |
| hero | `subtitle` | 핵심 키워드 조합으로 부제 생성 |

---

## 5. AI 생성 시 JSON 스키마

Claude API에 상품 데이터 생성을 요청할 때 사용할 output 스키마 예시.

### 5.1 API 요청 프롬프트 구조

```
시스템 프롬프트:
  - 역할: 마이리얼트립 T&A 상품 카피라이터
  - 제약: 아래 JSON Schema에 맞는 출력만 생성
  - 톤앤매너: 친근하되 신뢰감 있는 여행 상품 설명

유저 프롬프트:
  - MRT 원본 상품 데이터 (스크래핑 결과)
  - 카테고리 지정
  - 생성할 블록 목록 (카테고리 레시피 기반)
```

### 5.2 Output JSON Schema (전체)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PDPProductData",
  "type": "object",
  "required": ["category", "blocks"],
  "properties": {
    "category": {
      "type": "string",
      "enum": [
        "TICKET_THEME", "TICKET_TRANSPORT", "TICKET_CITYPASS",
        "TICKET_EXPERIENCE", "TOUR", "SERVICE", "ACTIVITY", "SEMI_PACKAGE"
      ]
    },
    "blocks": {
      "type": "object",
      "properties": {
        "hero": {
          "type": "object",
          "required": ["title", "image"],
          "properties": {
            "image": {
              "type": "object",
              "required": ["url"],
              "properties": {
                "url": { "type": "string", "format": "uri" },
                "alt": { "type": "string" }
              }
            },
            "title": { "type": "string", "minLength": 1, "maxLength": 60 },
            "subtitle": { "type": "string", "maxLength": 80 },
            "badges": {
              "type": "array",
              "maxItems": 5,
              "items": {
                "type": "object",
                "properties": {
                  "type": { "type": "string" },
                  "label": { "type": "string" }
                }
              }
            },
            "rating": {
              "type": "object",
              "properties": {
                "score": { "type": "number", "minimum": 0, "maximum": 5 },
                "count": { "type": "integer", "minimum": 0 }
              }
            },
            "price": {
              "type": "object",
              "properties": {
                "current": { "type": "number" },
                "original": { "type": "number" },
                "currency": { "type": "string" },
                "unit": { "type": "string" }
              }
            }
          }
        },

        "trustBadges": {
          "type": "object",
          "required": ["badges"],
          "properties": {
            "badges": {
              "type": "array",
              "minItems": 1,
              "maxItems": 4,
              "items": {
                "type": "object",
                "properties": {
                  "type": { "type": "string" },
                  "label": { "type": "string" },
                  "icon": { "type": "string" }
                }
              }
            }
          }
        },

        "highlights": {
          "type": "object",
          "required": ["items"],
          "properties": {
            "title": { "type": "string" },
            "items": {
              "type": "array",
              "minItems": 1,
              "maxItems": 6,
              "items": {
                "type": "object",
                "required": ["text"],
                "properties": {
                  "icon": { "type": "string", "maxLength": 2 },
                  "text": { "type": "string", "maxLength": 100 }
                }
              }
            }
          }
        },

        "overview": {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "paragraphs": {
              "type": "array",
              "minItems": 1,
              "maxItems": 5,
              "items": { "type": "string" }
            },
            "content": { "type": "string" }
          }
        },

        "guideProfile": {
          "type": "object",
          "required": ["name"],
          "properties": {
            "name": { "type": "string" },
            "photo": {
              "type": "object",
              "properties": {
                "url": { "type": "string", "format": "uri" },
                "alt": { "type": "string" }
              }
            },
            "title": { "type": "string" },
            "experience": { "type": "string" },
            "languages": {
              "type": "array",
              "items": { "type": "string" }
            },
            "introduction": { "type": "string", "maxLength": 200 },
            "certifications": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        },

        "itinerary": {
          "type": "object",
          "required": ["stops"],
          "properties": {
            "title": { "type": "string" },
            "type": {
              "type": "string",
              "enum": ["timeline", "day_by_day"],
              "default": "timeline"
            },
            "stops": {
              "type": "array",
              "minItems": 1,
              "items": {
                "type": "object",
                "properties": {
                  "time": { "type": "string" },
                  "day": { "type": "integer", "minimum": 1 },
                  "title": { "type": "string" },
                  "description": { "type": "string" },
                  "duration": { "type": "string" },
                  "image": { "type": "string", "format": "uri" }
                }
              }
            },
            "totalDuration": { "type": "string" }
          }
        },

        "inclusions": {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "included": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["text"],
                "properties": {
                  "text": { "type": "string" },
                  "detail": { "type": "string" }
                }
              }
            },
            "excluded": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["text"],
                "properties": {
                  "text": { "type": "string" },
                  "tip": { "type": "string" }
                }
              }
            }
          }
        },

        "optionTable": {
          "type": "object",
          "required": ["options"],
          "properties": {
            "title": { "type": "string" },
            "options": {
              "type": "array",
              "minItems": 1,
              "items": {
                "type": "object",
                "required": ["name"],
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "price": {
                    "type": "object",
                    "properties": {
                      "amount": { "type": "number" },
                      "currency": { "type": "string" },
                      "unit": { "type": "string" }
                    }
                  },
                  "originalPrice": { "type": "number" },
                  "badges": {
                    "type": "array",
                    "items": { "type": "string" }
                  },
                  "available": { "type": "boolean", "default": true }
                }
              }
            }
          }
        },

        "imageGrid": {
          "type": "object",
          "required": ["images"],
          "properties": {
            "title": { "type": "string" },
            "images": {
              "type": "array",
              "minItems": 1,
              "maxItems": 12,
              "items": {
                "type": "object",
                "required": ["url"],
                "properties": {
                  "url": { "type": "string", "format": "uri" },
                  "alt": { "type": "string" },
                  "caption": { "type": "string" }
                }
              }
            },
            "layout": {
              "type": "string",
              "enum": ["carousel", "grid"],
              "default": "carousel"
            }
          }
        },

        "usageGuide": {
          "type": "object",
          "required": ["steps"],
          "properties": {
            "title": { "type": "string" },
            "steps": {
              "type": "array",
              "minItems": 1,
              "maxItems": 8,
              "items": {
                "type": "object",
                "required": ["title"],
                "properties": {
                  "step": { "type": "integer", "minimum": 1 },
                  "title": { "type": "string" },
                  "description": { "type": "string" },
                  "icon": { "type": "string", "maxLength": 2 }
                }
              }
            }
          }
        },

        "comparison": {
          "type": "object",
          "required": ["items", "packagePrice"],
          "properties": {
            "title": { "type": "string" },
            "items": {
              "type": "array",
              "minItems": 1,
              "items": {
                "type": "object",
                "required": ["name", "individualPrice", "included"],
                "properties": {
                  "name": { "type": "string" },
                  "individualPrice": { "type": "number" },
                  "included": { "type": "boolean" }
                }
              }
            },
            "totalIndividual": { "type": "number" },
            "packagePrice": { "type": "number" },
            "savings": { "type": "number" }
          }
        },

        "recommendFor": {
          "type": "object",
          "required": ["targets"],
          "properties": {
            "title": { "type": "string" },
            "targets": {
              "type": "array",
              "minItems": 1,
              "maxItems": 5,
              "items": {
                "type": "object",
                "required": ["text"],
                "properties": {
                  "icon": { "type": "string", "maxLength": 2 },
                  "text": { "type": "string", "maxLength": 80 }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### 5.3 카테고리별 AI 프롬프트 예시 (TOUR)

```
당신은 마이리얼트립의 T&A 상품 카피라이터입니다.

아래 MRT 원본 상품 데이터를 분석하여, TOUR 카테고리의 PDP 블록 데이터를 생성하세요.

## 생성할 블록 (TOUR 레시피 순서)
hero, trustBadges, highlights, guideProfile, itinerary, imageGrid, overview,
optionTable, inclusions, meetingPoint, usageGuide, reviews, recommendFor,
notice, faq, socialProof, relatedProducts, cta

## 규칙
1. 모든 텍스트는 한국어로 작성
2. highlights는 4~6개, 각 항목에 맞는 이모지 아이콘 포함
3. overview는 2~3개 문단, 각 문단 2~3문장
4. itinerary.stops는 시간순 정렬, 각 stop에 description 필수
5. inclusions.excluded에는 가능하면 tip (대안/팁) 포함
6. comparison은 TICKET_CITYPASS에서만 생성
7. recommendFor.targets는 3~5개, 구체적인 여행자 페르소나
8. 가격은 숫자(number)로, 통화 기호는 별도 currency 필드에

## MRT 원본 데이터
{여기에 스크래핑된 JSON 삽입}

## 출력 형식
위 JSON Schema를 준수하는 JSON 객체를 반환하세요.
```

### 5.4 validate 조건 요약 (Quick Reference)

| 블록 | validate 조건 | 실패 시 |
|------|--------------|---------|
| hero | `title` AND `image.url` | 블록 스킵 |
| trustBadges | `badges.length >= 1` | 블록 스킵 |
| highlights | `items.length >= 1` | 블록 스킵 |
| overview | `content` OR `paragraphs.length` | 블록 스킵 |
| guideProfile | `name` | 블록 스킵 |
| itinerary | `stops.length >= 1` | 블록 스킵 |
| inclusions | `included.length` OR `excluded.length` | 블록 스킵 |
| optionTable | `options.length >= 1` | 블록 스킵 |
| imageGrid | `images.length >= 1` | 블록 스킵 |
| usageGuide | `steps.length >= 1` | 블록 스킵 |
| comparison | `items.length >= 1` AND `packagePrice` | 블록 스킵 |
| recommendFor | `targets.length >= 1` | 블록 스킵 |

---

## 부록: 샘플 데이터 vs 블록 렌더러 키 불일치 정리

`script.js`의 샘플 데이터와 `blocks/` 렌더러 간에 발견된 키 불일치. **블록 렌더러 기준이 정규 스키마**이며, 데이터 생성 시 반드시 렌더러 기준을 따라야 한다.

| 블록 | script.js (샘플) | blocks/ (렌더러) | 정규 스키마 |
|------|-----------------|-----------------|------------|
| guideProfile | `photo: string` (URL) | `photo: { url, alt }` | `{ url, alt }` 객체 |
| itinerary | `items[]` | `stops[]` | `stops[]` |
| itinerary.stops | `time`, `title`, `description`, `duration` | `time`, `day`, `title`, `description`, `duration`, `image` | 렌더러 기준 |
| optionTable | `columns[]` + `rows[]` 테이블 구조 | `options[]` 카드 리스트 구조 | `options[]` 카드 |
| usageGuide.steps | `stepNumber` | `step` | `step` |
| inclusions.excluded | `detail` | `tip` | `tip` |
| recommendFor | `items[].emoji` | `targets[].icon` | `targets[].icon` |

> 이 불일치는 script.js가 초기 프레젠테이션용 프로토타입이고, blocks/ 렌더러가 리팩토링된 정규 구현이기 때문에 발생. 향후 script.js 샘플 데이터도 렌더러 스키마에 맞게 마이그레이션 필요.
