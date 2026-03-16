# PDP 전환 설계 시스템

> 마이리얼트립 T&A PDP — 전환을 만들어내는 정보 구조 설계
> 작성일: 2026-03-15 | 버전: 2.0

---

## 1. 설계 원칙: "채우기"가 아닌 "설계"

### 1.1 핵심 전환

| Before (v1.0) | After (v2.0) |
|---------------|-------------|
| "비어있는 PDP를 채우자" | "전환을 만드는 정보 구조를 설계하자" |
| 콘텐츠 길이가 핵심 | 정보 접근성과 신뢰가 핵심 |
| 모든 블록을 다 넣으면 좋다 | **적정 블록을 올바른 순서로** |
| 고정된 카테고리별 순서 | 전환 퍼널 단계별 설계 |

### 1.2 설계 근거

| 원칙 | 근거 | 출처 |
|------|------|------|
| **스캔 우선** | 79%의 사용자가 읽지 않고 스캔. 25%만 실제로 읽힘 | NNgroup |
| **ATF 집중** | 주의력의 57~80%가 Above-the-fold에 집중 | CXL, Baymard |
| **역U자형 정보량** | 정보가 많을수록 좋은 게 아님. 임계점 넘으면 전환 하락 | Frontiers in Neuroscience |
| **사회적 증거 최우선** | 리뷰/UGC가 전환에 가장 큰 영향 (+354%) | PowerReviews |
| **신뢰 > 설명** | 사용자가 찾는 건 "긴 설명"이 아니라 "이거 괜찮다"는 확신 | Google Messy Middle |
| **마찰 제거** | 장바구니 이탈 원인 1위: 추가비용(48%), 2위: 둘러보는 중(43%) | Baymard |

### 1.3 정보 계층 (Information Hierarchy)

PDP의 정보를 3단계로 분류한다:

```
Tier 1: Must-See (ATF에 반드시)
  → 가격, 리뷰 별점, 핵심 배지(무료취소/즉시확정), 대표 이미지, CTA

Tier 2: Should-See (스크롤 시 자연스럽게)
  → 하이라이트, 포함/불포함, 일정, 가이드, 이용방법

Tier 3: Can-See (필요한 사람만 펼쳐 보도록)
  → 상세 설명(더보기), FAQ(아코디언), 주의사항, 관련 상품
```

**핵심: Tier 3를 Tier 1보다 위에 놓지 마라.** 긴 설명 텍스트가 리뷰와 CTA를 밀어내리면 전환이 떨어진다.

---

## 2. 블록 분류

### 2.1 레이어 분류 (기존 유지)

| 레이어 | 설명 | 예시 |
|--------|------|------|
| **Structured** | 텍스트/HTML, AI 자동 생성 가능 | FAQ, 포함사항, 주의사항 |
| **Hybrid** | 텍스트 + 이미지 조합 | 가이드 소개, 매력포인트 |
| **Visual** | 이미지 중심 | 히어로, 이미지 그리드 |

### 2.2 전환 역할 분류 (v2.0 신규)

블록을 **전환 퍼널에서의 역할**로 분류한다:

| 전환 역할 | 목적 | 해당 블록 |
|----------|------|----------|
| **Hook** | 첫인상 + 구매 동기 | hero, highlights, trustBadges |
| **Convince** | 상세 정보로 확신 | overview, itinerary, imageGrid, guideProfile, optionTable |
| **Reassure** | 불안 제거 | inclusions, meetingPoint, usageGuide, notice, faq, reviews |
| **Convert** | 행동 유도 | cta, comparison, relatedProducts, socialProof |

---

## 3. 블록 전체 목록 (20개)

기존 18개에서 **전환 핵심 블록 2개 추가** (trustBadges, socialProof).

| # | 블록 ID | 블록명 | 전환 역할 | 레이어 | 필수 여부 |
|---|---------|--------|----------|--------|----------|
| 1 | `hero` | 히어로 | Hook | Visual | **필수** |
| 2 | `trustBadges` | 신뢰 배지 바 | Hook | Structured | **필수** (v2.0 신규) |
| 3 | `highlights` | 하이라이트 | Hook | Structured | **필수** |
| 4 | `overview` | 상품 개요 | Convince | Structured | **필수** |
| 5 | `optionTable` | 옵션/요금표 | Convince | Structured | 조건부 |
| 6 | `itinerary` | 일정/코스 | Convince | Hybrid | 조건부 |
| 7 | `inclusions` | 포함/불포함 | Reassure | Structured | **필수** |
| 8 | `imageGrid` | 이미지 그리드 | Convince | Visual | 선택 |
| 9 | `guideProfile` | 가이드 소개 | Convince | Hybrid | 조건부 |
| 10 | `meetingPoint` | 집합/픽업 장소 | Reassure | Hybrid | 조건부 |
| 11 | `usageGuide` | 이용방법 | Reassure | Structured | **필수** |
| 12 | `recommendFor` | 추천 대상 | Convince | Structured | 선택 |
| 13 | `comparison` | 비교/절약 | Convert | Structured | 선택 |
| 14 | `hotelInfo` | 숙소 안내 | Convince | Hybrid | 조건부 |
| 15 | `notice` | 주의사항 | Reassure | Structured | **필수** |
| 16 | `faq` | FAQ | Reassure | Structured | **필수** |
| 17 | `reviews` | 리뷰 하이라이트 | Reassure | Structured | **필수** (v2.0 승격) |
| 18 | `socialProof` | 소셜 프루프 | Convert | Structured | 권장 (v2.0 신규) |
| 19 | `relatedProducts` | 관련 상품 | Convert | Visual | 선택 |
| 20 | `cta` | CTA 고정바 | Convert | Structured | **필수** |

### 변경 사항 (v1.0 → v2.0)

| 변경 | 이유 |
|------|------|
| `trustBadges` 신규 추가 | 무료취소/즉시확정/가격보증을 ATF에 독립 섹션으로. GYG 3-Layer Trust 패턴 |
| `socialProof` 신규 추가 | "오늘 N명 예약", "최근 N시간 N명 조회" 동적 소셜 프루프. Booking.com 패턴 |
| `reviews` 필수로 승격 | 전환 영향 1위(+354%). 리뷰 없는 상품도 "아직 리뷰가 없어요" 표시 |

---

## 4. 신규 블록 상세 정의

### 4.1 `trustBadges` - 신뢰 배지 바 (v2.0 신규)

**전환 역할**: Hook — ATF에서 즉시 3대 불안 해소

**배치**: 히어로 바로 아래, 하이라이트 위

```json
{
  "blockType": "trustBadges",
  "data": {
    "badges": [
      {
        "type": "enum: free_cancel | instant_confirm | best_price | e_ticket | korean_guide | verified",
        "label": "string (예: '48시간 전 무료 취소')",
        "icon": "string"
      }
    ]
  }
}
```

**디자인 가이드**:
- 가로 스크롤, 뱃지 높이 `36px`, `border-radius: 8px`
- 배경: `#F0F9FF` (연한 블루), 아이콘 + 텍스트
- 최대 4개 표시, 나머지는 스크롤
- 모바일: 전체 너비, 좌우 여백 없음 (edge-to-edge)

**GYG 참고 패턴**:
```
Layer 1: ✓ Certified by GYG   (품질 보증)
Layer 2: ✓ Best Price          (가격 보증)
Layer 3: ✓ Free Cancellation   (리스크 보증)
```

---

### 4.2 `socialProof` - 소셜 프루프 (v2.0 신규)

**전환 역할**: Convert — 구매 결정의 마지막 넛지

```json
{
  "blockType": "socialProof",
  "data": {
    "type": "enum: booking_count | viewing_count | recent_review | urgency",
    "messages": [
      {
        "icon": "string",
        "text": "string (예: '오늘 23명이 이 상품을 예약했어요')",
        "timestamp": "string (선택)"
      }
    ]
  }
}
```

**디자인 가이드**:
- CTA 고정바 바로 위에 배치 (또는 CTA 바 안에 통합)
- `font-size: 13px`, `color: #6B7280`
- 애니메이션: 부드러운 fade-in, 메시지 로테이션 (5초 간격)
- **반드시 실제 데이터 기반**. 가짜 긴급성은 신뢰 파괴

**Booking.com 패턴 참고**:
- "지난 24시간 동안 이 상품이 5번 예약되었습니다"
- "지금 3명이 이 상품을 보고 있습니다"
- "이 날짜 남은 자리가 2석뿐이에요"

---

## 5. 기존 블록 스키마 (v1.0 유지, 디자인 가이드 업데이트)

### 5.1 `hero` - 히어로

v1.0 스키마 유지. 디자인 가이드 변경사항:

**v2.0 변경**: ATF에 리뷰 별점 반드시 포함 (위치: 제목 아래)
- 리뷰 별점이 ATF에 있으면 **+153.1% 전환** (PowerReviews)
- `rating.score` + `rating.count` 를 hero 오버레이 안에 배치

```json
{
  "blockType": "hero",
  "data": {
    "image": { "url": "string", "alt": "string", "focalPoint": { "x": 50, "y": 50 } },
    "badges": [{ "type": "string", "label": "string" }],
    "title": "string (최대 40자)",
    "subtitle": "string (최대 60자)",
    "rating": { "score": "number", "count": "number" },
    "price": {
      "current": "number",
      "original": "number (선택, 할인 전)",
      "unit": "string (1인/1매)"
    }
  }
}
```

**v2.0 추가**: `price` 필드. 가격도 ATF에 반드시 노출.

---

### 5.2 `highlights` - 하이라이트

v1.0 스키마 유지.

**v2.0 강조**: 마이리얼트립 PDP에 현재 없는 섹션. **경쟁사 5곳 모두 보유**. 가장 시급한 gap.

```json
{
  "blockType": "highlights",
  "data": {
    "title": "string (기본값: '이 상품의 매력')",
    "items": [
      { "icon": "string", "text": "string (최대 50자, 구체적 대상 + 행동 동사 포함)" }
    ]
  }
}
```

---

### 5.3 나머지 블록 스키마

> hero(5.1), highlights(5.2), reviews(5.4), cta(5.5)는 아래에 별도 정의. trustBadges(4.1), socialProof(4.2)는 위에서 정의.

#### `overview` — 상품 개요

```json
{
  "blockType": "overview",
  "data": {
    "title": "string (기본값: '상품 소개')",
    "content": "string (HTML 허용)",
    "collapsedLines": "number (기본값: 모바일 3, 데스크톱 5)"
  }
}
```
v2.0: 기본 접혀있기. 핵심 1문장 + "더 보기". Tier 3이므로 ATF 차지 금지.

#### `optionTable` — 옵션/요금표

```json
{
  "blockType": "optionTable",
  "data": {
    "title": "string (기본값: '옵션 선택')",
    "options": [
      {
        "name": "string",
        "description": "string (선택)",
        "price": { "amount": "number", "currency": "string", "unit": "string" },
        "originalPrice": "number (선택)",
        "badges": ["string"],
        "available": "boolean"
      }
    ]
  }
}
```
모바일: 카드형 세로 나열. 데스크톱: 테이블형 가로 비교.

#### `itinerary` — 일정/코스

```json
{
  "blockType": "itinerary",
  "data": {
    "title": "string",
    "type": "enum: timeline | day_by_day",
    "stops": [
      {
        "time": "string (선택)",
        "day": "number (선택, day_by_day일 때)",
        "title": "string",
        "description": "string",
        "duration": "string (선택)",
        "image": { "url": "string", "alt": "string" }
      }
    ],
    "totalDuration": "string (선택)"
  }
}
```

#### `inclusions` — 포함/불포함

```json
{
  "blockType": "inclusions",
  "data": {
    "included": [
      { "text": "string", "detail": "string (선택, 혜택 프레이밍)" }
    ],
    "excluded": [
      { "text": "string", "tip": "string (선택, 대안 팁)" }
    ]
  }
}
```
v2.0: CS 분쟁 1위 원인. ✅/❌ 시각화 필수. 불포함에 대안 팁 추가 (예: "점심 불포함 — 가이드가 현지 맛집 안내").

#### `imageGrid` — 이미지 그리드

```json
{
  "blockType": "imageGrid",
  "data": {
    "title": "string (선택)",
    "images": [
      { "url": "string", "alt": "string", "caption": "string (선택)" }
    ],
    "layout": "enum: grid | carousel (기본: 모바일 carousel, 데스크톱 grid)"
  }
}
```

#### `guideProfile` — 가이드 소개

```json
{
  "blockType": "guideProfile",
  "data": {
    "name": "string",
    "photo": { "url": "string", "alt": "string" },
    "title": "string (예: '한국어 전문 가이드')",
    "experience": "string (예: '현지 12년 거주')",
    "languages": ["string"],
    "introduction": "string (최대 200자)",
    "certifications": ["string (선택)"]
  }
}
```

#### `meetingPoint` — 집합/픽업 장소

```json
{
  "blockType": "meetingPoint",
  "data": {
    "type": "enum: meeting | pickup | e_ticket",
    "title": "string",
    "address": "string",
    "description": "string (교통편, 랜드마크 기준 안내)",
    "coordinates": { "lat": "number", "lng": "number" },
    "mapImage": { "url": "string", "alt": "string" }
  }
}
```

#### `usageGuide` — 이용방법

```json
{
  "blockType": "usageGuide",
  "data": {
    "title": "string (기본값: '이용 방법')",
    "steps": [
      { "step": "number", "title": "string", "description": "string" }
    ]
  }
}
```

#### `recommendFor` — 추천 대상

```json
{
  "blockType": "recommendFor",
  "data": {
    "title": "string (기본값: '이런 분께 추천해요')",
    "targets": [
      { "icon": "string", "text": "string" }
    ]
  }
}
```

#### `comparison` — 비교/절약

```json
{
  "blockType": "comparison",
  "data": {
    "title": "string (예: '개별 구매보다 ₩32,000 절약')",
    "items": [
      { "name": "string", "individualPrice": "number", "included": "boolean" }
    ],
    "totalIndividual": "number",
    "packagePrice": "number",
    "savings": "number"
  }
}
```
시티패스 필수. 가격 앵커링으로 구매 장벽 해소.

#### `hotelInfo` — 숙소 안내

```json
{
  "blockType": "hotelInfo",
  "data": {
    "name": "string",
    "starRating": "number",
    "images": [{ "url": "string", "alt": "string" }],
    "amenities": ["string"],
    "checkIn": "string",
    "checkOut": "string",
    "address": "string",
    "description": "string (선택)"
  }
}
```
세미패키지 필수.

#### `notice` — 주의사항

```json
{
  "blockType": "notice",
  "data": {
    "groups": [
      {
        "title": "string (예: '취소/환불 정책')",
        "items": ["string"]
      }
    ]
  }
}
```
모바일: 카테고리별 아코디언.

#### `faq` — FAQ

```json
{
  "blockType": "faq",
  "data": {
    "title": "string (기본값: '자주 묻는 질문')",
    "items": [
      { "question": "string", "answer": "string" }
    ]
  }
}
```
아코디언 UI. 질문만 보이고 답변은 클릭 시 노출.

#### `relatedProducts` — 관련 상품

```json
{
  "blockType": "relatedProducts",
  "data": {
    "title": "string (기본값: '함께 많이 본 상품')",
    "products": [
      {
        "id": "string",
        "title": "string",
        "image": { "url": "string", "alt": "string" },
        "price": { "amount": "number", "currency": "string" },
        "rating": { "score": "number", "count": "number" },
        "badges": ["string"]
      }
    ]
  }
}
```

#### `reviews` — v2.0 필수 승격 + 확장

```json
{
  "blockType": "reviews",
  "data": {
    "title": "string",
    "summary": {
      "averageScore": "number",
      "totalCount": "number",
      "distribution": { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
      "aiSummary": "string (선택, AI 리뷰 요약 — GYG 패턴)"
    },
    "featured": [
      {
        "author": "string",
        "date": "string",
        "score": "number",
        "text": "string",
        "photos": [{ "url": "string", "alt": "string" }],
        "travelType": "string (선택: 가족/커플/솔로/친구)"
      }
    ],
    "ugcGallery": [
      { "url": "string", "alt": "string", "author": "string" }
    ]
  }
}
```

**v2.0 추가 필드**:
- `aiSummary`: AI가 전체 리뷰를 요약한 핵심 인사이트 (GYG 2025 패턴)
- `travelType`: 여행자 유형별 리뷰 필터 (GYG 패턴)
- `ugcGallery`: 여행자 사진 전용 갤러리 (Viator/Traveloka "Captured Moments" 패턴)

#### `cta` — v2.0 변경

```json
{
  "blockType": "cta",
  "data": {
    "priceDisplay": {
      "originalPrice": "number (선택)",
      "currentPrice": "number",
      "currency": "string",
      "unit": "string"
    },
    "buttonText": "string (기본값: '날짜 확인하기')",
    "trustText": "string (선택, 예: '48시간 전 무료 취소')",
    "urgencyText": "string (선택, 실시간 데이터 기반만)"
  }
}
```

**v2.0 변경**:
- `buttonText`: "예약하기"(현행) → **카테고리별 저압박 CTA**로 변경 (06-copy-guidelines.md 참조)
  - 투어: "일정 확인하기" / 티켓·교통: "가격 보기" / 시티패스: "절약 금액 보기" / 체험: "날짜 확인하기" / 서비스: "예약 가능일 보기"
- `trustText` 추가: CTA 버튼 바로 옆에 신뢰 메시지 ("무료 취소" 등)

---

## 6. 카테고리별 전환 레시피

### 6.1 정보 배치 원칙 (v2.0)

기존 v1.0의 "첫인상→구매동기→판단근거→불안해소→행동유도" 흐름을 유지하되, 전환 역할로 재정의:

```
Hook (3초 안에 잡기)
  → hero + trustBadges + highlights

Convince (왜 이 상품인가)
  → overview(접힌 상태) + 카테고리별 핵심 블록(itinerary/imageGrid/guideProfile)

Reassure (불안 제거)
  → inclusions + meetingPoint + usageGuide + reviews + faq

Convert (행동 유도)
  → socialProof + comparison + relatedProducts + cta(고정)
```

### 6.2 카테고리별 블록 조합표

| # | 블록 | TICKET_THEME | TICKET_TRANSPORT | TICKET_CITYPASS | TICKET_EXPERIENCE | TOUR | SERVICE | ACTIVITY | SEMI_PACKAGE |
|---|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | hero | O | O | O | O | O | O | O | O |
| 2 | trustBadges | O | O | O | O | O | O | O | O |
| 3 | highlights | O | O | O | O | O | O | O | O |
| 4 | overview | O | O | O | O | O | O | O | O |
| 5 | optionTable | O | D | D | D | O | D | D | D |
| 6 | itinerary | - | - | - | D | **O** | - | D | **O** |
| 7 | inclusions | O | O | O | O | O | O | O | O |
| 8 | imageGrid | O | - | D | D | D | D | **O** | D |
| 9 | guideProfile | - | - | - | - | **O** | D | - | D |
| 10 | meetingPoint | - | D | - | D | **O** | D | D | D |
| 11 | usageGuide | O | O | O | O | O | O | O | O |
| 12 | recommendFor | D | D | D | D | D | D | D | D |
| 13 | comparison | - | - | **O** | - | - | - | - | D |
| 14 | hotelInfo | - | - | - | - | - | - | - | **O** |
| 15 | notice | O | O | O | O | O | O | O | O |
| 16 | faq | O | O | O | O | O | O | O | O |
| 17 | reviews | O | O | O | O | O | O | O | O |
| 18 | socialProof | D | D | D | D | D | D | D | D |
| 19 | relatedProducts | D | D | D | D | D | D | D | D |
| 20 | cta | O | O | O | O | O | O | O | O |

O = 필수, D = 권장(데이터 있을 때), - = 해당없음

### 6.3 카테고리별 배치 순서

#### TICKET_THEME (테마파크 티켓)
```
hero → trustBadges → highlights → optionTable → imageGrid → overview(접힘) → inclusions → usageGuide → reviews → notice → faq → socialProof → relatedProducts → cta
```
- **핵심**: 옵션표를 앞에 → 가격 비교로 빠른 결정. 이미지 그리드로 기대감 자극
- **근거**: 티켓 구매자의 핵심 질문은 "어떤 옵션이 몇 원?"(Category Heuristics). GYG/Klook 티켓 PDP 모두 옵션표가 하이라이트 직후 배치

#### TICKET_TRANSPORT (교통 티켓)
```
hero → trustBadges → highlights → usageGuide → overview(접힘) → meetingPoint → inclusions → reviews → notice → faq → socialProof → relatedProducts → cta
```
- **핵심**: 이용방법이 가장 중요. QR vs 실물 교환을 명확히
- **근거**: 교통 티켓 CS 문의 1위 "어떻게 쓰나요?". 이용방법을 뒤로 밀면 이탈 + CS 비용 증가. Klook 교통 패스 PDP "How to Use" 최상단 배치

#### TICKET_CITYPASS (시티패스)
```
hero → trustBadges → highlights → comparison → imageGrid → overview(접힘) → inclusions → usageGuide → reviews → notice → faq → socialProof → relatedProducts → cta
```
- **핵심**: "3곳만 가면 본전" 절약 계산을 앞에 → 심리적 저항 즉시 완화
- **근거**: 시티패스 구매 장벽은 "이게 진짜 이득인가?"(가격 앵커링). Traveloka/Klook 시티패스 PDP가 개별 구매 대비 절약 금액을 ATF에 표시

#### TICKET_EXPERIENCE (유람선/공연)
```
hero → trustBadges → highlights → imageGrid → itinerary → overview(접힘) → inclusions → meetingPoint → usageGuide → reviews → notice → faq → socialProof → relatedProducts → cta
```
- **핵심**: 비주얼(야경, 공연) + 운행 시간을 먼저 보여줌
- **근거**: 체험형 티켓은 감정적 구매 비중 높음. 비주얼이 기대감 형성에 가장 효과적. Viator 크루즈 PDP가 풀스크린 이미지 → 코스 순서

#### TOUR (가이드 투어)
```
hero → trustBadges → highlights → guideProfile → itinerary → imageGrid → overview(접힘) → optionTable → inclusions → meetingPoint → usageGuide → reviews → recommendFor → notice → faq → socialProof → relatedProducts → cta
```
- **핵심**: 가이드 신뢰 → 일정 상세화 → 집합장소(CS 1위 원인) 반드시 포함
- **근거**: 투어 구매 핵심 변수는 "누가 안내하는가"(Authority Bias). GYG 투어 PDP에서 가이드 프로필이 일정보다 앞. 가이드 신뢰 형성 후 일정을 보면 "이 가이드가 안내하는 이 코스" 프레이밍 효과

#### SERVICE (스냅/스파/미식)
```
hero → trustBadges → highlights → imageGrid → overview(접힘) → inclusions → guideProfile → meetingPoint → usageGuide → reviews → notice → faq → socialProof → relatedProducts → cta
```
- **핵심**: 감성 이미지로 분위기 전달 → 서비스 상세
- **근거**: 서비스 상품은 "결과물 품질"이 핵심(스냅 사진, 스파 시설). UGC/포트폴리오 이미지가 텍스트 설명보다 전환에 직접 기여. Airbnb Experience가 호스트 포트폴리오를 비주얼 우선 배치

#### ACTIVITY (액티비티)
```
hero → trustBadges → highlights → imageGrid → overview(접힘) → itinerary → inclusions → meetingPoint → usageGuide → reviews → recommendFor → notice → faq → socialProof → relatedProducts → cta
```
- **핵심**: 비주얼 강하게 앞에. "초보 OK", "안전 장비 포함" 같은 Reassure 요소 중요
- **근거**: 액티비티 구매의 최대 장벽은 "나도 할 수 있을까?"(불안). 비주얼로 설렘 형성 → Reassure(안전 장비 포함 명시)로 불안 해소. Viator 액티비티 PDP "No experience needed" 배지를 ATF 배치

#### SEMI_PACKAGE (세미패키지)
```
hero → trustBadges → highlights → overview(접힘) → itinerary → hotelInfo → optionTable → inclusions → comparison → meetingPoint → usageGuide → reviews → recommendFor → notice → faq → socialProof → relatedProducts → cta
```
- **핵심**: 가장 복잡. Day별 일정 + 호텔이 결정 요소
- **근거**: 세미패키지 구매자는 "이걸로 여행 계획 끝"을 원함. Day별 일정 → 숙소 → 가격 순서가 "올인원" 프레이밍에 유리. Klook 패키지 PDP가 Day-by-Day → Hotel → Price 순서

---

## 7. PDP Health Score 설계

### 7.1 점수 산정 기준 (100점 만점)

| 카테고리 | 배점 | 세부 항목 |
|---------|:---:|----------|
| **필수 블록 존재** | 30점 | 카테고리별 필수 블록이 모두 있는가 |
| **데이터 완성도** | 25점 | 가격, 취소정책, 포함/불포함, 집합장소 등 핵심 데이터 존재 여부 |
| **전환 요소** | 20점 | 리뷰 수(10+개 기준), 신뢰 배지, CTA 최적화 |
| **SEO/접근성** | 15점 | 시맨틱 HTML(통이미지 아님), 이미지 alt, 구조화 데이터 |
| **데이터 신선도** | 10점 | 마지막 업데이트 일자, 가격 API 동기화 |

### 7.2 등급 체계 (Grade)

| 등급 | 점수 | 상태 | 자동 추천 액션 |
|:---:|:---:|------|-------------|
| **A** | 85~100 | 전환 최적화 상태 | A/B 테스트로 미세 조정. 소셜 프루프·개인화 실험 |
| **B** | 65~84 | 기본 구조 양호, 전환 요소 부족 | 신뢰 배지 추가, 리뷰 노출 강화, CTA 최적화 |
| **C** | 40~64 | 핵심 블록 누락 또는 데이터 불완전 | 필수 블록 채우기 + 데이터 정합성 검수. 기원/현욱 협업 대상 |
| **D** | 0~39 | 통이미지 또는 심각한 미달 | 전면 재구축 필요. 우선순위 리스트 최상위 후보 |

### 7.3 카테고리별 가중치 조정

기본 배점(7.1)을 카테고리 특성에 따라 조정한다:

| 카테고리 | 가중치 상향 항목 | 이유 |
|---------|----------------|------|
| **TOUR** | 가이드 프로필(+5), 집합장소(+5) | CS 1위 원인, Authority Bias 핵심 |
| **TICKET_TRANSPORT** | 이용방법(+5) | "어떻게 쓰나요?" CS 문의 비중 최고 |
| **TICKET_CITYPASS** | 비교/절약(+5) | 가격 앵커링이 구매 결정 핵심 |
| **ACTIVITY** | 이미지(+3), 포함사항(+3) | 비주얼 + "안전 장비 포함" 불안 해소 |
| **SEMI_PACKAGE** | 일정(+3), 숙소(+3) | Day별 일정과 호텔이 결정 요소 |

> 상향분만큼 해당 카테고리의 다른 항목에서 차감하여 총점 100점 유지.

### 7.4 우선순위 매트릭스

```
개선 우선순위 = PDP Health Score(낮을수록 개선 필요) × 일매출(높을수록 우선)
```

- **1사분면** (낮은 Score + 높은 매출): **즉시 개선** — ROI 최대
- **2사분면** (낮은 Score + 낮은 매출): 배치 작업으로 일괄 처리
- **3사분면** (높은 Score + 높은 매출): 유지 + A/B 테스트
- **4사분면** (높은 Score + 낮은 매출): 방치

---

## 8. A/B 테스트 우선순위

| 순위 | 테스트 | 가설 | 근거 | 예상 임팩트 | 구현 난이도 |
|:---:|--------|------|------|:---:|:---:|
| 1 | CTA 문구: "예약하기" vs "날짜 확인하기" | 저압박 CTA가 전환 2~4배 | TicketingHub, GYG/Viator 패턴 | **높음** | **낮음** (텍스트 변경) |
| 2 | 무료취소 배지: 하단 vs ATF 상단 | ATF 배치 시 전환 +15~20% | GYG 패턴 | **높음** | **낮음** (위치 이동) |
| 3 | 리뷰 별점: 상품 설명 아래 vs ATF | ATF 배치 시 +153% | PowerReviews | **높음** | **중간** (레이아웃 변경) |
| 4 | 하이라이트 섹션: 없음 vs 추가 | 구매 동기 즉시 제공으로 전환 개선 | GYG/Klook/Viator 전사 적용 | **중~높음** | **중간** (신규 블록 + 데이터) |
| 5 | 소셜 프루프: 없음 vs "오늘 N명 예약" | +18% 전환 | WiserNotify, Booking.com | **중간** | **높음** (실시간 데이터 파이프라인) |

> **Quick Win**: 순위 1~2는 임팩트 높고 난이도 낮음. Phase 3에서 동시 테스트 가능.

---

## 9. 모바일 전환 전략 (v2.0 보강)

> MRT 트래픽의 대부분이 모바일. 모바일에서의 전환 설계가 곧 전체 전환 설계.

### 9.1 디자인 토큰 (변경 없음)

```
--viewport-min: 360px
--viewport-max: 768px
--content-padding: 20px
--section-gap: 32px
--font-family: 'Pretendard', -apple-system, sans-serif
--color-primary: #2B96ED
--color-text-primary: #1D2229
--color-text-secondary: #6B7280
--color-border: #E5E7EB
--color-success: #059669
--color-danger: #EF4444
```

### 9.2 모바일 레이아웃 가이드

| 항목 | 가이드 |
|------|--------|
| ATF 높이 | 최대 500px 안에 hero + trustBadges + highlights 시작점 |
| overview 접기 | 기본 3줄. "더 보기" 버튼으로 확장 |
| faq 접기 | 아코디언. 질문만 보이고 답변은 클릭 시 |
| notice 접기 | 카테고리별 그룹핑. 한 번에 모두 펼치지 않기 |
| cta 고정바 | `position: fixed; bottom: 0;` 항상 접근 가능 |
| trustBadges | 히어로 바로 아래 edge-to-edge. 스크롤 시 sticky 고려 |

### 9.3 모바일 전환 패턴 (v2.0 신규)

모바일에서 전환율을 올리는 구체적 패턴:

| 패턴 | 설계 | 근거 |
|------|------|------|
| **Sticky CTA** | 고정바가 항상 보임. 페이지 하단 CTA 도달률이 30%인 반면, sticky CTA는 100% 노출 | FullStory: 하단 CTA 도달 30% |
| **Thumb Zone 최적화** | CTA 버튼은 하단 고정 (엄지 도달 범위). 터치 타겟 최소 48px | Google Material Design 가이드 |
| **스크롤 깊이별 넛지** | 50% 스크롤 시 socialProof 토스트 표시 ("오늘 N명 예약"). 50% 지점에서 절반 이탈하므로 이탈 방지 | Hotjar: 50% 지점 절반 이탈 |
| **이미지 최적화** | hero 이미지 WebP/AVIF, lazy loading. 0.1초 개선당 +10.1% CVR | NitroPack/Google |
| **원탭 CTA** | 날짜 선택 → 인원 → 결제를 바텀시트 내에서 완결. 페이지 이동 최소화 | Baymard: 체크아웃 단계 줄일수록 +35% |
| **스와이프 갤러리** | imageGrid를 가로 스와이프 캐러셀로. 세로 스크롤 공간 절약 + 탐색 재미 | GYG/Viator 모바일 PDP 패턴 |

### 9.4 모바일 vs 데스크톱 차이

| 요소 | 모바일 | 데스크톱 |
|------|--------|---------|
| CTA 배치 | 하단 고정바 (항상 노출) | 우측 사이드바 고정 |
| 이미지 | 풀와이드 스와이프 | 좌측 메인 + 썸네일 그리드 |
| trustBadges | 가로 스크롤, edge-to-edge | 히어로 아래 가로 나열 (스크롤 불필요) |
| overview | 기본 3줄 접힘 | 기본 5줄 접힘 (화면 넓으므로) |
| socialProof | CTA 고정바 내 통합 또는 토스트 | CTA 사이드바 아래 고정 텍스트 |
| optionTable | 카드형 세로 나열 | 테이블형 가로 비교 |

---

## 10. 출처

- [PowerReviews - UGC & Conversion](https://www.powerreviews.com/how-ugc-impacts-conversion-2023/)
- [NNgroup - F-Pattern Reading](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)
- [Frontiers in Neuroscience - Information Overload](https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2021.695852/full)
- [Google Messy Middle](https://www.thinkwithgoogle.com/consumer-insights/consumer-journey/navigating-purchase-behavior-and-decision-making/)
- [Baymard - Product Page UX](https://baymard.com/research/product-page)
- [CXL - Above the Fold](https://cxl.com/blog/above-the-fold/)
- [GetYourGuide Fall 2025](https://www.getyourguide.supply/fall2025)
- [Airbnb Social Features 2025](https://news.airbnb.com/introducing-social-features-for-airbnb-experiences/)
- [Booking.com Conversion Science](https://octalysisgroup.com/booking-com-conversion-science/)
- [WiserNotify - Social Proof](https://wisernotify.com/blog/social-proof-statistics/)
- [Envive AI - E-commerce CVR](https://www.envive.ai/post/ecommerce-conversion-rate-statistics)
