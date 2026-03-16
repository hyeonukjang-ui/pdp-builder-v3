# PDP 자동 생성 도구 — 풀 파이프라인 기술 아키텍처 분석

> CTO / Technical Architect 관점 | 2026-03-16

---

## 1. 시스템 아키텍처

### 1.1 전체 파이프라인 구조도

```
[사용자]
   │
   ▼
┌──────────────────────────────────────────────────────────┐
│  FRONTEND (브라우저 — 바닐라 JS + ES Modules)              │
│                                                           │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────────┐  │
│  │ 사이드바   │   │ 프리뷰    │   │ 메타 패널            │  │
│  │ URL 입력  │   │ PDP 렌더링│   │ (블록수, 비용, 경고)  │  │
│  │ 카테고리   │   │ 모바일/PC │   │                      │  │
│  │ 블록 편집  │   │          │   │                      │  │
│  └─────┬────┘   └────▲─────┘   └──────────────────────┘  │
│        │              │                                    │
│        │    renderPDP()│ + mountPDP()                      │
│        │              │                                    │
│  ┌─────┴──────────────┴────────────────────────────────┐  │
│  │  렌더링 엔진 (pdp-engine.js)                         │  │
│  │  ├─ block-registry.js (12개 블록 렌더러, 설계 20개 중) │  │
│  │  ├─ category-recipes.js (8개 카테고리 레시피)          │  │
│  │  └─ data-validator.js (입력 검증)                     │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTP (fetch)
                            ▼
┌──────────────────────────────────────────────────────────┐
│  BACKEND (Node.js + Express)                              │
│                                                           │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │ /api/extract │   │ /api/generate │   │ /api/health  │  │
│  │ URL→데이터   │   │ 데이터→AI카피  │   │ 서버 상태    │  │
│  └──────┬──────┘   └──────┬───────┘   └──────────────┘  │
│         ▼                  ▼                               │
│  ┌─────────────┐   ┌──────────────┐                      │
│  │ Scraper      │   │ AI Engine    │                      │
│  │ (Cheerio)    │   │ (Claude API) │                      │
│  └──────┬──────┘   └──────┬───────┘                      │
│         ▼                  ▼                               │
│  ┌─────────────┐   ┌──────────────┐                      │
│  │ MRT 상품 URL │   │ Anthropic API│                      │
│  └─────────────┘   └──────────────┘                      │
└──────────────────────────────────────────────────────────┘
```

### 1.2 핵심 설계 원칙

프론트엔드는 "순수 렌더링 엔진"으로 유지하고, 백엔드는 "데이터 조달" 역할만 한다. AI가 HTML을 직접 생성하지 않으며, 구조화된 JSON만 생성하면 기존 렌더링 엔진이 블록을 조립한다.

---

## 2. 기술 스택 결정

### 2.1 백엔드: Node.js + Express ✅

**채택 이유**:
1. 프론트와 동일 언어(JS) — TF 내 누구나 전체 코드를 읽을 수 있음
2. Express는 학습 곡선 거의 없음 — 3줄로 엔드포인트 생성
3. Cheerio, node-fetch, @anthropic-ai/sdk 모두 npm에서 바로 사용
4. 프로토타입 목적이므로 Enterprise급 프레임워크(NestJS 등)는 과도

| 기각된 대안 | 이유 |
|------------|------|
| Python + FastAPI | 프론트와 언어 불일치, TF 내 Python 익숙도 미확인 |
| Deno/Bun | 프로덕션 안정성 미검증, 라이브러리 호환성 |

### 2.2 스크래핑: Cheerio (기본) + Puppeteer (폴백)

- **Cheerio**: 가볍고 빠름(~50MB), jQuery 문법. SSR HTML 파싱에 적합
- **Puppeteer**: CSR only 페이지 대응 폴백. 무거움(Chromium ~300MB)
- **향후 이상적**: MRT 내부 API 직접 호출

### 2.3 AI: Claude API

> AI 파이프라인 정본: 11-ai-copy-strategy.md 참조

| 작업 | 모델 | 이유 |
|------|------|------|
| 1단계: 카피 브리프 생성 | **Sonnet** | 분석적 사고, 전체 상품 맥락 파악 |
| 2단계: 블록별 카피 생성 | **Haiku** (병렬) | 정형화된 구조, 빠른 처리, 비용 최소화 |
| 카테고리 분류 | Haiku | 단순 분류, 1초 이내 |

**PDP 1건 비용**: ~$0.02 ~ $0.04 (11-ai-copy-strategy.md 기준)

### 2.4 프론트엔드: 바닐라 JS + ES Modules 유지 ✅

현재 렌더링 엔진이 깔끔한 ES Modules 구조로 잘 작성되어 있음. 프레임워크 도입 시 "빌드 환경 셋업"만으로 1-2일 소요. 프로토타입 목적에 과도.

---

## 3. MRT 상품 페이지 데이터 추출 전략

> **핵심 발견** (12-mrt-page-research.md 참조): MRT는 **Next.js가 아니라 Rails v11.0.9 + React on Rails** 구조. `__NEXT_DATA__`는 존재하지 않으며, React 컴포넌트 props JSON이 `<script data-component-name="Offer">` 태그에 노출된다.

### 3.1 다중 폴백 체인 (추천)

```javascript
async function extractProductData(url) {
  const html = await fetchHTML(url);

  // Strategy 1: React on Rails 컴포넌트 데이터 (핵심 소스) ★
  // <script data-component-name="Offer"> 태그에서 JSON 추출
  let data = tryExtractReactOnRails(html, 'Offer');
  if (data) return { data, method: 'react_on_rails' };

  // Strategy 2: OG 메타 태그 + HTML 파싱 (폴백)
  data = tryExtractOGAndHTML(html);
  if (data) return { data, method: 'og_html', partial: true };

  // Strategy 3: window 전역 변수 파싱 (최종 폴백)
  data = tryExtractWindowVars(html);
  if (data) return { data, method: 'window_vars', partial: true };

  throw new Error('데이터 추출 실패');
}
```

MRT가 프론트엔드 기술 스택을 변경하더라도 폴백 체인으로 자동 적응하는 구조.

---

## 4. Claude API 통합 전략

> 정본: 11-ai-copy-strategy.md § 1.1 "2단계 하이브리드"

### 4.1 2단계 하이브리드 파이프라인

```
[1단계] 분석 & 전략 수립 (Sonnet 1회, 선행 필수)
  입력: 상품 raw 데이터 전체 + 카테고리
  출력: "카피 브리프" — 핵심 USP, 타겟 고객, 톤앤매너, 키 메시지

[2단계] 블록별 카피 생성 (Haiku 병렬 호출)
  입력: 카피 브리프 + 해당 블록의 raw 데이터 + 블록별 프롬프트
  출력: 해당 블록의 JSON 데이터
  → 블록별 독립 호출이므로 Promise.all()로 병렬 처리
```

**병렬 호출**: 2단계의 블록별 호출(최대 12개)이 `Promise.all()`로 병렬 실행. 총 시간 ~3-4초.

### 4.2 에러 핸들링

```
Claude API 호출 → 실패 → 1회 재시도 → 실패 → 폴백 모델(Haiku) → 실패 → 블록 건너뛰기
```

핵심: AI 호출 실패가 전체 PDP 생성을 막아서는 안 됨. `pdp-engine.js`의 `skippedBlocks` 처리로 graceful degradation.

---

## 5. AI 환각(Hallucination) 방지

가격/취소정책/포함불포함 등을 AI가 잘못 생성하면 CS 분쟁으로 이어질 수 있다. 아키텍처 수준에서 방지한다.

### 5.1 AI 생성 금지 필드 (원본 데이터 직접 사용)

| 필드 | 이유 | 데이터 소스 |
|------|------|-----------|
| 가격 (price, originalPrice) | 오류 시 법적/CS 리스크 | MRT Offer JSON → 직접 매핑 |
| 취소 정책 (cancellationPolicy) | "무료 취소" 잘못 생성 시 치명적 | MRT Offer JSON → 직접 매핑 |
| 좌표 (coordinates) | 잘못된 위치 안내 | MRT Offer JSON → 직접 매핑 |
| 옵션 가격 (option.price) | 가격 정보 조작 방지 | MRT /offers/{id}/options API → 직접 매핑 |
| trustBadges의 type/존재 여부 | "무료 취소" 배지를 만들어내면 안 됨 | MRT 데이터 기반 조건 분기 (AI는 label 정제만) |

### 5.2 AI 담당 범위 (서술형 블록만)

| AI 담당 블록 | 생성 내용 | 환각 리스크 |
|------------|----------|:---:|
| hero (title, subtitle) | 제목/부제 카피 | 낮음 |
| highlights | 핵심 매력 추출 | 중간 — 데이터에 없는 특징을 만들 수 있음 |
| overview | 상품 소개 문단 | 중간 |
| guideProfile (introduction) | 가이드 소개 다듬기 | 중간 — 경력을 부풀릴 수 있음 |
| itinerary (description) | 일정 설명 | 중간 — 장소를 추가할 수 있음 |
| recommendFor | 추천 대상 | 낮음 |
| imageGrid (caption, alt) | 이미지 캡션 | 낮음 |

### 5.3 검증 레이어

```
AI 생성 결과 → [자동 검증] → [금칙어 체크] → [원본 데이터 교차 대조] → 저장
                                                    ↓ (불일치 발견 시)
                                              해당 필드를 원본으로 덮어쓰기
```

---

## 6. 영속 레이어 (Persistence)

"80% 자동 + 20% 검수" 운영 모델을 위해 생성 결과를 저장/검수/공유할 수 있어야 한다.

### 6.1 최소 저장 구조 (V1: SQLite)

```javascript
// 생성 결과 저장 스키마
{
  id: "pdp_20260316_129381",           // 고유 ID
  offerId: "129381",                    // MRT 상품 ID
  category: "TICKET_THEME",
  status: "draft",                      // draft → reviewed → approved → published
  generatedAt: "2026-03-16T10:30:00Z",
  reviewedBy: null,                     // 검수자
  reviewedAt: null,
  blocks: { /* 전체 블록 JSON */ },
  rawData: { /* 원본 추출 데이터 */ },
  metadata: {
    extractMethod: "react_on_rails",
    aiCost: 0.03,
    generationTimeMs: 4200,
    validationErrors: [],
    validationWarnings: ["highlights[2] 글자수 초과"]
  }
}
```

### 6.2 검수 워크플로우

```
생성 → [draft] → 자동 검증 통과 → [reviewed] → 사람 확인 → [approved] → 배포 가능
                    ↓ (실패)
              [draft + 경고 플래그] → 수동 검수 필수
```

### 6.3 Phase별 저장소 전략

| Phase | 저장소 | 이유 |
|-------|--------|------|
| Phase 1~2 (프로토타입) | SQLite 파일 또는 JSON 파일 | 설치 불필요, 단일 파일, 백업 쉬움 |
| Phase 3~4 (A/B 테스트) | SQLite + 간단한 대시보드 | 검수 상태 추적 필요 |
| Phase 5 (스케일링) | PostgreSQL 또는 MRT 내부 DB 연동 검토 | 동시 접근, 프로덕션 안정성 |

---

## 7. 보안 및 안정성

- **API 키**: `.env` (gitignore), 서버 사이드에서만 사용
- **CORS**: localhost만 허용
- **Rate Limiting**: MRT 스크래핑 분당 10건, Claude API 동시 5건
- **에러 바운더리**: 스크래핑/AI/렌더링/프론트 각 레이어별 독립 처리
- **이미지 프록시**: MRT CDN 핫링크 차단 대비, 서버 사이드 이미지 프록시 엔드포인트 준비 (`/api/image-proxy?url=...`)

---

## 8. 배포 및 데모

### 8.1 로컬 개발: `npm start` 하나로 전체 실행

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "cheerio": "^1.0.0",
    "@anthropic-ai/sdk": "^0.30.0",
    "dotenv": "^16.4.0",
    "better-sqlite3": "^11.0.0"
  }
}
```

### 8.2 TF 발표 데모 시나리오

1. **라이브 데모** (인터넷 O): 실제 MRT URL → 실시간 추출 → AI 생성 → 렌더링 (~15초)
2. **프리셋 데모** (인터넷 불안정): 8개 샘플 데이터 탭 전환 (즉시)
3. **카테고리 전환 데모**: 같은 데이터, 다른 레시피로 블록 순서 변경

### 8.3 오프라인 폴백

서버 없이도 8개 카테고리 샘플 데이터로 동작. 프레젠테이션은 네트워크 상태와 무관하게 반드시 동작해야 함.

---

## 9. 비용 추정 (월간)

| 시나리오 | 월 생성량 | 월 비용 |
|---------|----------|--------|
| 데모/테스트 | ~50 PDP | ~$3.5 |
| Phase 2 (30개) | ~100 PDP | ~$7 |
| Phase 5 (257개) | ~500 PDP | ~$35 |
| 풀 스케일 (2,000개) | ~2,500 PDP | ~$175 |
