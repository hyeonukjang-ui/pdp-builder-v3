# PDP Conversion Design

> 박윤경 · T&A Experience Team · 2026.03
> "콘텐츠를 채우는 게 아니라, 전환을 설계한다"

---

## 프로젝트 한 줄 요약

상품소개가 없는 T&A 상품에 **AI로 이미지+카피를 생성**하고, 생성된 콘텐츠가 **실제 예약 전환을 만들어내도록** 정보 구조·배치·톤을 데이터 기반으로 설계한다.

---

## 왜 "콘텐츠 생성"에 "전환 설계"가 더해져야 하는가

### 현재 TF 내 3개 프로젝트

| 사람 | 접근 | 풀고 있는 문제 | 핵심 역할 |
|------|------|-------------|----------|
| 기원 | URL/데이터 → AI → 이미지+카피 생성 | **AI 콘텐츠 생성** — 상품소개가 없는 상품에 이미지+카피를 AI로 생성 | Content Supply |
| 현욱 | DnD 섹션 빌더, ~70개 섹션 | **콘텐츠 조립 도구** — 비개발자도 PDP를 쉽게 구성할 수 있는 인프라 | Content Assembly |
| 박윤경 | 전환 설계 + Health Score + A/B 테스트 | **전환 구조 설계** — 생성·조립된 콘텐츠가 실제 예약으로 이어지도록 정보 구조와 배치를 설계 | Conversion Architecture |

세 프로젝트는 각각 **필수적인 문제의 서로 다른 층위**를 풀고 있다. 콘텐츠 공급(기원), 조립 도구(현욱), 전환 설계(박윤경) — 하나라도 빠지면 PDP 개선은 완성되지 않는다.

### 아직 답하지 못한 질문이 있다

기원과 현욱의 프로젝트가 "무엇을 만들고 어떻게 조립할 것인가"를 해결하고 있지만, **"어떤 상품을 먼저, 어떤 순서로, 어떤 톤으로 보여줘야 전환이 일어나는가"**에 대한 답은 아직 없다.

| 전제 | 리서치 결과 | 출처 |
|------|-----------|------|
| "콘텐츠를 채우면 CVR이 오른다" | 10개 미만 요소 페이지가 40+ 요소보다 **전환율 2배** 높음 | Envive AI |
| "긴 설명이 도움된다" | 79%의 사용자가 콘텐츠를 **읽지 않고 스캔**. 25%만 실제로 읽힘 | NNgroup |
| "콘텐츠가 많을수록 좋다" | 정보량과 전환율은 **역U자형** — 임계점 넘으면 역효과 | Frontiers in Neuroscience |
| "콘텐츠 길이와 CVR은 비례한다" | 상관관계는 있지만 **인과관계가 아님**. 고품질 상품이 콘텐츠도 길고 전환도 높은 것 | 리서치 종합 |

### 리서치가 가리키는 진짜 CVR 레버

> **주의**: 아래 수치들은 각 출처의 실험 환경 기준이며, 마이리얼트립 T&A 도메인에서의 실제 효과는 A/B 테스트로 검증해야 한다. 벤더(PowerReviews, TicketingHub 등)의 자사 마케팅 데이터가 포함되어 있으므로, **방향성 근거**로만 활용하고 구체적 수치는 MRT 자체 실험으로 확인한다.

| 순위 | 레버 | 전환율 영향 (방향성 근거) | 출처 |
|:---:|------|-----------|------|
| 1 | **리뷰 & UGC** | 리뷰 有 vs 無: **+354% CVR** | PowerReviews* |
| 2 | **페이지 로드 속도** | 0.1초 개선당 **+10.1% CVR** | NitroPack/Google |
| 3 | **소셜 프루프 & 긴급성** | 소셜 프루프 위젯으로 **+18% 전환** | WiserNotify |
| 4 | **신뢰 신호** (무료취소, 즉시확정, 가격보증) | **+20% 전환** | Eklipse Creative |
| 5 | **Above-the-fold 정보 구조** | 주의력의 57~80%가 ATF에 집중 | CXL, Baymard |
| 6 | **저압박 CTA** | "예약하기"→"날짜 확인하기"로 **전환 4배** | TicketingHub* |

\* 벤더 자사 마케팅 데이터. 이커머스 전반 대상이며 T&A OTA 특화 수치 아님.

**콘텐츠 자동 생성은 "필요 조건"이지 "충분 조건"이 아니다. 세 프로젝트가 조합되어야 "충분 조건"에 가까워진다.**

---

## 이 프로젝트가 풀려는 질문

> 기원이 "무엇을" 생성하고, 현욱이 "어떤 도구로" 조립한다면,
> 이 프로젝트는 **"어떤 상품을 먼저, 어떤 순서와 톤으로 보여줘야 전환이 일어나는가"**를 해결한다.
> 세 프로젝트는 서로 대체가 아닌 **보완 관계**다.

### 3개 레이어

```
Layer 1. Content Intelligence (어디에 먼저?)
         → 2,000개 상품 중 뭘 먼저 개선해야 ROI가 가장 높은지 진단
         → PDP Health Score 자동 산출

Layer 2. Conversion Architecture (어떻게 보여줄까?)
         → 블록 순서·조합·톤을 전환 심리학 기반으로 설계
         → 카테고리별 "전환 레시피" 정의

Layer 3. Trust & Proof Design (왜 믿고 사야 하는가?)
         → 리뷰/UGC, 소셜 프루프, 신뢰 신호를 PDP 전체에 전략적 배치
         → Google "Messy Middle" 6가지 인지 편향 활용
```

---

## TF 내 역할 분담 — 보완 구조

```
기원 (Content Supply)        →  콘텐츠를 "만든다" (AI 이미지+카피 생성)
현욱 (Content Assembly)      →  콘텐츠를 "조립한다" (빌더 도구)
박윤경 (Conversion Design)   →  뭘 먼저 만들지 우선순위를 매기고,
                                 어떻게 보여줘야 팔리는지 구조를 설계하고,
                                 실제로 팔렸는지 데이터로 증명한다
```

세 역할은 **동등한 보완 관계**. 각자의 산출물이 다른 프로젝트의 입력이 된다.

### 인터페이스 정의 — 상호 의존 관계

```
박윤경 → 기원
  ├─ PDP Health Score 우선순위 리스트 (어떤 상품을 먼저 생성할지)
  ├─ 카테고리별 필수 블록 목록 + 순서 (무엇을 생성할지)
  └─ 카피 가이드라인 + 품질 체크리스트 (어떤 톤과 원칙으로 생성할지)

박윤경 → 현욱
  ├─ 전환 레시피 (카테고리별 블록 조합 + 배치 순서)
  ├─ 신규 블록 스펙 (trustBadges, socialProof JSON 스키마)
  └─ A/B 테스트 설계안 (변수, 대조군, 성공 기준)

기원 → 박윤경
  ├─ AI 생성 콘텐츠 품질 데이터 (블록별 생성 성공률, 재생성 비율)
  └─ 카테고리별 데이터 가용성 현황 (어떤 블록에 어떤 데이터가 있는지)

현욱 → 박윤경
  ├─ 빌더 내 블록 구현 현황 및 제약사항
  └─ 조립된 PDP의 Health Score 변화 데이터

공통 산출물
  └─ A/B 테스트 결과 로그 (CVR, CTR, 스크롤 깊이)
```

---

## 데이터 기반 현황 (BigQuery 659개 상품 분석)

| 항목 | 수치 |
|------|------|
| 콘텐츠 임계점 미달 상품 | 257개 |
| 통이미지 PDP (SEO 0점, 접근성 0점) | 118개 |
| PDP 1건 수동 제작 소요 시간 | 2~5일 |
| TICKET 카테고리 임계점 도달 시 CVR 변화 | +3.27pp |
| TOUR 카테고리 임계점 도달 시 CVR 변화 | +2.02pp |

---

## 경쟁사 Gap Analysis (마이리얼트립에 빠져있는 것)

### Critical Gaps — 전환에 직접 영향

| Gap | 경쟁사 현황 | 마이리얼트립 현황 | 영향도 |
|-----|-----------|----------------|:---:|
| **하이라이트 섹션** | GYG/Klook/Viator/Traveloka 모두 보유 | 없음. 히어로 후 바로 상세 설명 진입 | 높음 |
| **저압박 CTA** | GYG/Viator: "Check Availability" | "예약하기" 직접적 문구 | 높음 |
| **무료취소 상단 배치** | GYG: 최상단 배지. Viator: 24시간 무료취소 강조 | 취소정책이 페이지 하단 | 높음 |
| **신뢰 보증 체계** | GYG: Best Price Guarantee + Certified Badge + Free Cancel 3단 | "[마이리얼트립 공식 판매]" 라벨만 | 중~높음 |
| **포함/불포함 시각화** | GYG: 초록 체크/빨강 X (업계 표준) | 있으나 시각적 대비 약함 | 중간 |

### Emerging — 2025~2026 경쟁사 혁신

| 패턴 | 선도 플랫폼 | 핵심 |
|------|-----------|------|
| **Who's Going** (소셜 기능) | Airbnb 2025.10 | "미래에 누가 함께 가는지" → 솔로 여행자 예약 장벽 낮춤 |
| **AI 리뷰 요약** | GYG 2025 Spring | 300개 리뷰를 핵심 인사이트로 요약 |
| **AI Content Creator** | GYG 2025 Fall | 공급자용 AI 콘텐츠 생성 도구 (품질 표준화 목적) |
| **Viator 상품 품질 기준** | Viator 2025 | Good/Excellent 등급, 미달 상품 제거 |

---

## 사용자가 PDP에서 진짜 하는 질문 (Google "Messy Middle" 기반)

여행자의 구매 여정은 **탐색↔평가** 반복. 6가지 인지 편향이 결정을 좌우한다:

| 인지 편향 | 사용자 질문 | PDP에서의 답 |
|----------|-----------|------------|
| **Social Proof** | "이거 괜찮은 거야?" | 리뷰 수, 평점, UGC 사진, "오늘 N명 예약" |
| **Category Heuristics** | "핵심이 뭐야?" | 소요시간, 언어, 그룹크기 — 핵심 스펙을 눈에 띄게 |
| **Authority** | "누가 안내하는데?" | 가이드 경력, 인증, 전문성 표시 |
| **Power of Now** | "지금 가능해?" | 실시간 가용성, 즉시 확정 배지 |
| **Scarcity** | "나중에 봐도 되나?" | "남은 자리 3석", 잔여석 실시간 표시 |
| **Power of Free** | "혹시 잘못 고르면?" | 무료 취소, 무료 픽업, 가격 보증 |

**이 질문들 중 "긴 설명을 더 읽고 싶다"는 없다.**

→ 상세 설계: [02-pdp-section-system.md](./02-pdp-section-system.md), 카피 가이드: [06-copy-guidelines.md](./06-copy-guidelines.md)

---

## Layer 1: Content Intelligence — PDP Health Score

### 개념

모든 T&A 상품 PDP를 자동으로 진단하고, 개선 우선순위를 매기는 시스템.

**V1 (Phase 1 적용)**: 단순하게 시작, Phase 3 결과로 역산 후 고도화

```
PDP Health Score V1 = 카테고리별 필수 블록 존재 여부(Y/N) × 일매출
  → 결과: 우선순위 리스트 (Score 낮고 매출 높은 상품부터)
```

**V2 (Phase 3 이후 고도화)**:

```
PDP Health Score V2 = f(
  콘텐츠 완성도     — 필수 블록 존재 여부, 카테고리별 임계점 거리
  데이터 정확성     — 가격/취소정책/포함불포함 API 데이터 일치 여부
  전환 요소 충족도  — 리뷰 수, 신뢰 배지, CTA 최적화 여부
  SEO 점수         — 시맨틱 HTML, 이미지 alt, 구조화 데이터
  데이터 신선도     — 마지막 업데이트 일자
)
```

V2의 세부 가중치는 Phase 3 A/B 테스트 결과에서 **어떤 요소가 실제 CVR에 가장 영향이 컸는지**를 역산하여 결정한다.

### 왜 이게 먼저인가

기원이 AI로 콘텐츠를 만들든, 현욱이 빌더로 조립하든, **"어떤 상품을 먼저 해야 하는가"**에 대한 답이 없으면 의미 없다. 257개 미달 상품 × 8개 카테고리 중 **임계점까지 거리가 짧고 × 일매출이 높은** 상품부터 하는 게 ROI 최대.

### CSM 피드백과의 정합

- "데이터 완성도 리포트 필요" → PDP Health Score가 정확히 이것
- "가격/취소정책 반드시 수동 검증" → Score에서 데이터 정확성 자동 체크
- "80% 자동 + 20% 검수" → Score가 낮은 부분만 사람이 검수

---

## Layer 2: Conversion Architecture — 전환 레시피

### 개념

같은 블록이라도 **순서, 강조점, 톤**에 따라 전환율이 달라진다. 이 조합을 카테고리별로 정의한 것이 "전환 레시피".

### 기존 "카테고리별 고정 순서"와의 차이

| 기존 | 새 접근 |
|------|--------|
| TOUR면 이 순서, TICKET이면 저 순서 (고정) | 카테고리 + **사용자 시그널**에 따라 변동 가능 |
| 모든 사용자에게 동일한 페이지 | 진입 경로별 정보 우선순위 조정 |
| 콘텐츠 양 중심 (임계점 px) | **정보 접근성** 중심 (핵심 정보가 ATF에 있는가) |

### 진입 의도 기반 정보 우선순위 (향후 확장)

```
"이스탄불 투어 후기" 검색 → 리뷰/가이드 프로필 먼저
인스타그램 광고 클릭     → 비주얼/하이라이트 먼저
"이스탄불 투어 가격"    → 옵션표/CTA 먼저
재방문 유저              → CTA/날짜선택 먼저
```

→ MVP는 카테고리별 고정 순서로 시작, A/B 테스트로 검증 후 점진적 개인화

---

## Layer 3: Trust & Proof Design — 신뢰 계층

### GYG의 3-Layer Trust Stack (참고 모델)

```
Layer 1 (상단): "Certified by GYG" 배지     → 품질 불안 해소
Layer 2 (가격 영역): "Best Price Guarantee"  → 가격 불안 해소
Layer 3 (CTA 근처): "Free Cancellation"      → 리스크 불안 해소
```

### 마이리얼트립 적용안

| 배치 위치 | 신뢰 요소 | 해소하는 불안 |
|----------|----------|------------|
| 히어로 상단 | 즉시확정 + 무료취소 배지 | "이게 진짜 되는 거야?" |
| 가격 영역 | 최저가 보장 또는 가격 투명성 | "더 싼 데 없나?" |
| CTA 바로 위 | 리뷰 별점 요약 + 예약 건수 | "다른 사람들도 샀어?" |
| CTA 옆 | "무료 취소 가능" 텍스트 | "잘못 고르면 어쩌지?" |

---

## 실행 우선순위

> 상세 로드맵: [07-execution-roadmap.md](./07-execution-roadmap.md)

| Phase | 작업 | 오너 | 의존성 | 성공 기준 |
|:---:|------|------|--------|----------|
| **0** | TF 발표 — 방향성 합의 + ROI 추정 | 박윤경 | BigQuery 접근 | TF 리더 승인 + 상위 30개 상품 기준 월간 예상 추가 GMV 산출 |
| **1** | PDP Health Score 설계 + 우선순위 리스트 | 박윤경 | BigQuery 접근 | 상위 30개 상품 선정 + Score 산출 |
| **2** | 상위 30개 전환 레시피 적용 | 박윤경 + 현욱 | Phase 1 완료, 빌더 연동 | 30개 상품 ATF 정보 구조 개선 완료 |
| **3** | Quick Win A/B 테스트 (CTA + 신뢰 배지) | 박윤경 + 개발 | Phase 2 완료, A/B 인프라 | CVR 유의미 변화 (p<0.05) |
| **4** | 리뷰/UGC 노출 강화 | 박윤경 + 기원 | 리뷰 데이터 접근 | 리뷰 有 상품 CVR 베이스라인 대비 +10% |
| **5** | 257개 전체 확대 | 기원 + 현욱 | Phase 3~4 검증 완료 | 카테고리별 CVR 추적 대시보드 가동 |

---

## 파일 구조

```
pdp-design-tf/
├── _archive/                        # v1.0 코드 아카이브
└── docs/
    ├── 00-project-overview.md       # 이 문서 (프로젝트 전략, 마스터)
    ├── 01-research-archive.md       # 리서치 근거 아카이브
    ├── 02-pdp-section-system.md     # 전환 설계 상세 (블록 + 전환 레시피)
    ├── 03-block-spec-part1.md       # 블록 구현 스펙 (1~7)
    ├── 04-block-spec-part2.md       # 블록 구현 스펙 (8~14)
    ├── 05-block-spec-part3.md       # 블록 구현 스펙 (15~20)
    ├── 06-copy-guidelines.md        # 전환 카피 가이드라인
    ├── 07-execution-roadmap.md      # 실행 로드맵 (Phase별 상세)
    ├── 08-cto-architecture.md       # 풀스택 기술 아키텍처
    ├── 09-implementation-plan.md    # 상세 구현 계획
    ├── 10-ux-design-spec.md         # 도구 UI/UX 설계
    ├── 11-ai-copy-strategy.md       # AI 카피 생성 전략 + 프롬프트 (정본)
    ├── 12-mrt-page-research.md      # MRT 페이지 테크니컬 리서치
    ├── 13-data-schema.md            # 블록 데이터 스키마
    ├── 14-qa-review.md              # QA / Devil's Advocate 리뷰
    └── 15-final-synthesis.md        # 7명 전문가 토론 결과 종합
```

---

## 리서치 출처 요약

> 상세 출처: [01-research-archive.md](./01-research-archive.md)

- [PowerReviews - UGC & Conversion 2023](https://www.powerreviews.com/how-ugc-impacts-conversion-2023/)
- [NitroPack/Google - Page Speed & Conversion](https://nitropack.io/blog/how-page-speed-affects-conversion/)
- [NNgroup - F-Pattern Reading](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)
- [Frontiers in Neuroscience - Information Overload](https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2021.695852/full)
- [Google - Messy Middle](https://www.thinkwithgoogle.com/consumer-insights/consumer-journey/navigating-purchase-behavior-and-decision-making/)
- [Baymard Institute - Product Page UX](https://baymard.com/research/product-page)
- [Booking.com + OpenAI](https://openai.com/index/booking-com/)
- [GetYourGuide Fall 2025 Release](https://www.getyourguide.supply/fall2025)
- [Airbnb Social Features 2025](https://news.airbnb.com/introducing-social-features-for-airbnb-experiences/)
- [Envive AI - E-commerce CVR Statistics](https://www.envive.ai/post/ecommerce-conversion-rate-statistics)
