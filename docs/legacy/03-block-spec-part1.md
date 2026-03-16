# PDP 블록 구현 스펙 — Part 1 (블록 1~7)

> 마이리얼트립 T&A PDP 20개 블록 컴포넌트 상세 설계
> 작성일: 2026-03-15 | 버전: 2.0

---

## 공통 규칙

### 네이밍 컨벤션
```
클래스: pdp-{blockType}__{element}--{modifier}
예시:   pdp-hero__title, pdp-hero__badge--active
```

### 공통 디자인 토큰
```css
:root {
  --pdp-primary: #2B96ED;
  --pdp-primary-dark: #1A7AD4;
  --pdp-primary-light: #F0F9FF;
  --pdp-text: #1D2229;
  --pdp-text-secondary: #6B7280;
  --pdp-border: #E5E7EB;
  --pdp-success: #059669;
  --pdp-danger: #EF4444;
  --pdp-font: 'Pretendard', -apple-system, sans-serif;
  --pdp-content-padding: 20px;
  --pdp-section-gap: 32px;
  --pdp-radius-sm: 8px;
  --pdp-radius-md: 12px;
  --pdp-radius-lg: 16px;
  --pdp-shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --pdp-shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --pdp-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 공통 섹션 래퍼
```css
.pdp-section {
  padding: var(--pdp-content-padding);
  padding-top: var(--pdp-section-gap);
  padding-bottom: var(--pdp-section-gap);
}
.pdp-section__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--pdp-text);
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}
```

---

## 블록 1: hero — 히어로

### 전환 역할
**Hook** — 3초 안에 첫인상 형성. ATF에서 가격, 별점, 핵심 배지를 동시에 전달하여 "이건 괜찮은 상품이다"라는 인식 형성.

### HTML 구조
```html
<section class="pdp-hero" aria-label="상품 대표 이미지 및 기본 정보">
  <!-- 이미지 캐러셀 -->
  <div class="pdp-hero__carousel" role="region" aria-roledescription="carousel" aria-label="상품 이미지">
    <div class="pdp-hero__track">
      <div class="pdp-hero__slide" role="group" aria-roledescription="slide" aria-label="1 / 5">
        <img class="pdp-hero__image" src="..." alt="이스탄불 블루모스크 전경"
             loading="eager" decoding="async" fetchpriority="high">
      </div>
      <!-- 추가 슬라이드 -->
    </div>
    <div class="pdp-hero__pagination" role="tablist" aria-label="이미지 페이지">
      <button class="pdp-hero__dot pdp-hero__dot--active" role="tab" aria-selected="true" aria-label="이미지 1"></button>
      <button class="pdp-hero__dot" role="tab" aria-selected="false" aria-label="이미지 2"></button>
    </div>
    <span class="pdp-hero__counter" aria-live="polite">1 / 5</span>
  </div>

  <!-- 오버레이 정보 -->
  <div class="pdp-hero__overlay">
    <div class="pdp-hero__badges">
      <span class="pdp-hero__badge">한국어 가이드</span>
      <span class="pdp-hero__badge">즉시확정</span>
      <span class="pdp-hero__badge pdp-hero__badge--free-cancel">무료취소</span>
    </div>
    <h1 class="pdp-hero__title">이스탄불 올드 시티 프라이빗 가이드 투어</h1>
    <p class="pdp-hero__subtitle">블루모스크 · 아야소피아 · 그랜드 바자르를 하루에</p>
    <div class="pdp-hero__meta">
      <div class="pdp-hero__rating" aria-label="평점 4.8점, 리뷰 327개">
        <span class="pdp-hero__stars" aria-hidden="true">★★★★★</span>
        <span class="pdp-hero__score">4.8</span>
        <span class="pdp-hero__count">(327)</span>
      </div>
      <div class="pdp-hero__price">
        <span class="pdp-hero__price-original" aria-label="정가 189,000원">189,000원</span>
        <span class="pdp-hero__price-current" aria-label="할인가 159,000원">159,000원</span>
        <span class="pdp-hero__price-unit">/ 1인</span>
      </div>
    </div>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
/* 레이아웃 */
.pdp-hero {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.pdp-hero__carousel {
  position: relative;
  aspect-ratio: 4 / 3;       /* 모바일: 4:3 */
  overflow: hidden;
  touch-action: pan-y pinch-zoom;
}
.pdp-hero__track {
  display: flex;
  height: 100%;
  transition: transform 300ms ease-out;
  will-change: transform;
}
.pdp-hero__slide {
  flex: 0 0 100%;
  height: 100%;
}
.pdp-hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;    /* focalPoint로 동적 변경 */
}

/* 페이지네이션 */
.pdp-hero__pagination {
  position: absolute;
  bottom: 64px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 2;
}
.pdp-hero__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all var(--pdp-transition);
}
.pdp-hero__dot--active {
  width: 18px;
  border-radius: 3px;
  background: #fff;
}
.pdp-hero__counter {
  position: absolute;
  bottom: 72px;
  right: 16px;
  font-size: 12px;
  color: #fff;
  background: rgba(0,0,0,0.5);
  padding: 2px 8px;
  border-radius: 10px;
  z-index: 2;
}

/* 오버레이 */
.pdp-hero__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 48px var(--pdp-content-padding) var(--pdp-content-padding);
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, transparent 100%);
  color: #fff;
  z-index: 1;
}

/* 배지 */
.pdp-hero__badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.pdp-hero__badge {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(43,150,237,0.85);
  border-radius: 100px;
  backdrop-filter: blur(4px);
  white-space: nowrap;
}
.pdp-hero__badge--free-cancel {
  background: rgba(5,150,105,0.85);
}

/* 텍스트 */
.pdp-hero__title {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}
.pdp-hero__subtitle {
  font-size: 14px;
  opacity: 0.85;
  margin-bottom: 10px;
  line-height: 1.4;
}

/* 메타 (별점 + 가격) */
.pdp-hero__meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.pdp-hero__rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}
.pdp-hero__stars { color: #FFD43B; }
.pdp-hero__score { font-weight: 700; }
.pdp-hero__count { opacity: 0.7; }

.pdp-hero__price {
  text-align: right;
}
.pdp-hero__price-original {
  font-size: 12px;
  text-decoration: line-through;
  opacity: 0.6;
  display: block;
}
.pdp-hero__price-current {
  font-size: 20px;
  font-weight: 800;
}
.pdp-hero__price-unit {
  font-size: 12px;
  opacity: 0.7;
}

/* 인터랙션 상태 */
.pdp-hero__slide:active {
  cursor: grabbing;
}
```

### 인터랙션 동작

**JS 필요: YES**

```javascript
function initHeroCarousel(container) {
  const track = container.querySelector('.pdp-hero__track');
  const dots = container.querySelectorAll('.pdp-hero__dot');
  const counter = container.querySelector('.pdp-hero__counter');
  const slides = container.querySelectorAll('.pdp-hero__slide');
  const total = slides.length;
  let current = 0;
  let startX = 0;
  let isDragging = false;

  function goTo(index) {
    current = Math.max(0, Math.min(index, total - 1));
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('pdp-hero__dot--active', i === current);
      d.setAttribute('aria-selected', i === current);
    });
    if (counter) counter.textContent = `${current + 1} / ${total}`;
  }

  // 터치 스와이프
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(current + (diff > 0 ? 1 : -1));
    }
    isDragging = false;
  }, { passive: true });

  // 도트 클릭
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
  });

  // 키보드 네비게이션
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });
}
```

### 데이터 바인딩
```javascript
// JSON 데이터 필드
const heroData = {
  images: [                          // 필수, 최소 1장
    { url: "string", alt: "string", focalPoint: { x: 50, y: 50 } }
  ],
  badges: [                          // 선택, 최대 4개
    { type: "free_cancel|instant_confirm|korean_guide|...", label: "string" }
  ],
  title: "string",                   // 필수, 최대 40자
  subtitle: "string",               // 선택, 최대 60자
  rating: { score: 4.8, count: 327 },  // 선택
  price: {                           // 선택 (v2.0 추가)
    current: 159000,
    original: 189000,                // 선택 (할인 전)
    currency: "원",
    unit: "1인"
  }
};

// Fallback 처리
// - images 비어있으면: placeholder 이미지 + alt="상품 이미지 준비 중"
// - rating 없으면: 별점 영역 비노출
// - price 없으면: 가격 영역 비노출 (CTA에서만 표시)
// - subtitle 없으면: subtitle 영역 비노출
// - badges 비어있으면: 배지 영역 비노출
```

### 모바일 vs 데스크톱
| 항목 | 모바일 (360~768px) | 데스크톱 (769px+) |
|------|-------------------|-----------------|
| 이미지 비율 | 4:3 | 16:9 또는 2:1 |
| 이미지 동작 | 좌우 스와이프 캐러셀 | 메인 이미지 + 하단 썸네일 그리드 |
| 오버레이 | gradient 오버레이 | 이미지 아래 별도 영역 |
| 가격 | 오버레이 우하단 | 우측 사이드바 CTA 영역에 표시 |
| 제목 크기 | 22px | 28px |

### 접근성
- `<section>` + `aria-label="상품 대표 이미지 및 기본 정보"`
- 캐러셀: `role="region"`, `aria-roledescription="carousel"`
- 각 슬라이드: `role="group"`, `aria-label="N / 전체"`
- 이미지: 반드시 의미 있는 `alt` 텍스트 (장소/풍경 묘사)
- 별점: `aria-label="평점 4.8점, 리뷰 327개"`
- 가격: `aria-label="할인가 159,000원"`
- 첫 번째 이미지: `loading="eager"`, `fetchpriority="high"` (LCP 최적화)
- 키보드: 좌우 화살표로 슬라이드 전환

---

## 블록 2: trustBadges — 신뢰 배지 바 (v2.0 신규)

### 전환 역할
**Hook** — 히어로 직후 3대 불안(품질/가격/리스크)을 한 줄로 해소. GYG 3-Layer Trust Stack 패턴.

### HTML 구조
```html
<section class="pdp-trust" aria-label="신뢰 보증">
  <div class="pdp-trust__scroll">
    <ul class="pdp-trust__list" role="list">
      <li class="pdp-trust__item">
        <svg class="pdp-trust__icon" aria-hidden="true" width="16" height="16"><!-- 체크 아이콘 --></svg>
        <span class="pdp-trust__text">48시간 전 무료 취소</span>
      </li>
      <li class="pdp-trust__item">
        <svg class="pdp-trust__icon" aria-hidden="true" width="16" height="16"><!-- 번개 아이콘 --></svg>
        <span class="pdp-trust__text">즉시 확정</span>
      </li>
      <li class="pdp-trust__item">
        <svg class="pdp-trust__icon" aria-hidden="true" width="16" height="16"><!-- 방패 아이콘 --></svg>
        <span class="pdp-trust__text">최저가 보장</span>
      </li>
      <li class="pdp-trust__item">
        <svg class="pdp-trust__icon" aria-hidden="true" width="16" height="16"><!-- 티켓 아이콘 --></svg>
        <span class="pdp-trust__text">e-티켓</span>
      </li>
    </ul>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
/* 레이아웃 — edge-to-edge, 좌우 여백 없음 */
.pdp-trust {
  background: var(--pdp-primary-light);  /* #F0F9FF */
  border-bottom: 1px solid var(--pdp-border);
  overflow: hidden;
}
.pdp-trust__scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;               /* Firefox */
  -ms-overflow-style: none;            /* IE/Edge */
}
.pdp-trust__scroll::-webkit-scrollbar {
  display: none;                       /* Chrome/Safari */
}
.pdp-trust__list {
  display: flex;
  gap: 0;
  padding: 0;
  margin: 0;
  list-style: none;
  min-width: max-content;              /* 가로 스크롤 강제 */
}
.pdp-trust__item {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;                        /* 고정 높이 36px */
  padding: 0 16px;
  white-space: nowrap;
  border-right: 1px solid rgba(43,150,237,0.15);
  flex-shrink: 0;
}
.pdp-trust__item:last-child {
  border-right: none;
}
.pdp-trust__icon {
  width: 16px;
  height: 16px;
  color: var(--pdp-primary);
  flex-shrink: 0;
}
.pdp-trust__text {
  font-size: 13px;
  font-weight: 600;
  color: var(--pdp-primary-dark);       /* #1A7AD4 */
  letter-spacing: -0.01em;
}

/* 인터랙션 — 호버 시 아이템 강조 */
.pdp-trust__item:hover {
  background: rgba(43,150,237,0.08);
}
```

### 인터랙션 동작

**JS 필요: NO (CSS만으로 가로 스크롤)**

단, 4개 이하일 때 가운데 정렬하려면 JS로 판단:
```javascript
function initTrustBadges(container) {
  const list = container.querySelector('.pdp-trust__list');
  const scroll = container.querySelector('.pdp-trust__scroll');
  // 스크롤 필요 없으면 가운데 정렬
  if (list.scrollWidth <= scroll.clientWidth) {
    list.style.justifyContent = 'center';
  }
}
```

### 데이터 바인딩
```javascript
const trustBadgesData = {
  badges: [                            // 필수, 최소 1개, 최대 4개
    {
      type: "free_cancel",             // enum
      label: "48시간 전 무료 취소",     // 화면 표시 텍스트
      icon: "check-circle"             // 아이콘 식별자
    }
  ]
};

// type → icon 매핑 (내장)
const BADGE_ICON_MAP = {
  free_cancel: 'check-circle',
  instant_confirm: 'zap',
  best_price: 'shield',
  e_ticket: 'ticket',
  korean_guide: 'globe',
  verified: 'badge-check'
};

// Fallback: badges 배열이 비어있으면 섹션 전체 비노출
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 레이아웃 | edge-to-edge 가로 스크롤 | 중앙 정렬, 한 줄에 모두 표시 |
| 좌우 여백 | 0 (padding 없음) | content-padding 유지 |
| 높이 | 36px 고정 | 40px |
| 스크롤 힌트 | 우측 끝 아이템이 살짝 잘려 보임 | 불필요 |

### 접근성
- `<section>` + `aria-label="신뢰 보증"`
- 리스트: `role="list"`, 각 아이템은 `<li>`
- 아이콘: `aria-hidden="true"` (텍스트가 의미 전달)
- 스크롤 영역: 키보드 Tab으로 각 아이템 접근 가능해야 함

---

## 블록 3: highlights — 하이라이트

### 전환 역할
**Hook** — ATF에서 "왜 이 상품인가"를 3~5개 핵심 포인트로 즉시 전달. Category Heuristics 편향 활용.

### HTML 구조
```html
<section class="pdp-highlights" aria-label="상품 핵심 매력">
  <div class="pdp-highlights__inner">
    <h2 class="pdp-section__title">이 투어의 매력</h2>
    <ul class="pdp-highlights__list" role="list">
      <li class="pdp-highlights__item">
        <span class="pdp-highlights__icon" aria-hidden="true">🕌</span>
        <span class="pdp-highlights__text">블루모스크 내부의 2만 장 이즈닉 타일을 전문 가이드와 감상</span>
      </li>
      <li class="pdp-highlights__item">
        <span class="pdp-highlights__icon" aria-hidden="true">👨‍👩‍👧‍👦</span>
        <span class="pdp-highlights__text">우리 가족만을 위한 프라이빗 투어, 아이 속도에 맞춰 진행</span>
      </li>
      <li class="pdp-highlights__item">
        <span class="pdp-highlights__icon" aria-hidden="true">🚐</span>
        <span class="pdp-highlights__text">호텔 픽업/샌딩 포함, 이동 걱정 제로</span>
      </li>
      <li class="pdp-highlights__item">
        <span class="pdp-highlights__icon" aria-hidden="true">📸</span>
        <span class="pdp-highlights__text">가이드가 알려주는 인생샷 포인트에서 사진 촬영</span>
      </li>
    </ul>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-highlights {
  background: var(--pdp-primary-light); /* #F0F9FF */
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
}
.pdp-highlights__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}
.pdp-highlights__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border-radius: var(--pdp-radius-sm);
  font-size: 14px;
  line-height: 1.55;
  color: var(--pdp-text);
  transition: transform var(--pdp-transition);
}
.pdp-highlights__item:active {
  transform: scale(0.98);
}
.pdp-highlights__icon {
  font-size: 20px;
  flex-shrink: 0;
  width: 28px;
  text-align: center;
  padding-top: 1px;
}
.pdp-highlights__text {
  flex: 1;
  min-width: 0;
}
```

### 인터랙션 동작

**JS 필요: NO**

정적 리스트. 인터랙션 없음.

### 데이터 바인딩
```javascript
const highlightsData = {
  title: "이 투어의 매력",          // 선택, 기본값: "이 상품의 매력"
  items: [                          // 필수, 3~5개
    {
      icon: "🕌",                   // 이모지 또는 아이콘 식별자
      text: "블루모스크 내부의 2만 장 이즈닉 타일을 전문 가이드와 감상"
      // 최대 50자, 구체적 대상 + 행동 동사 포함
    }
  ]
};

// Fallback:
// - items 비어있으면: 섹션 전체 비노출
// - icon 없으면: 기본 아이콘 "✦" 사용
// - title 없으면: 카테고리별 기본값
//   TOUR: "이 투어의 매력"
//   TICKET: "이 티켓의 포인트"
//   ACTIVITY: "이런 경험을 할 수 있어요"
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 레이아웃 | 세로 스택 (1열) | 2열 그리드 |
| 아이템 간격 | 8px | 12px |
| 폰트 크기 | 14px | 15px |
| 배경 | full-width #F0F9FF | content-width #F0F9FF |

```css
@media (min-width: 769px) {
  .pdp-highlights__list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}
```

### 접근성
- `<section>` + `aria-label="상품 핵심 매력"`
- 리스트: `<ul>` + `role="list"`, 각 아이템 `<li>`
- 이모지 아이콘: `aria-hidden="true"` (텍스트가 의미 전달)
- 텍스트: 충분한 color contrast (var(--pdp-text) on #fff = 15:1+)

---

## 블록 4: overview — 상품 개요

### 전환 역할
**Convince** — 상품의 전체적인 맥락과 분위기를 전달. 단, Tier 3 정보이므로 기본 접힘 상태. 핵심 1~3줄만 ATF 근처에서 보이고 나머지는 "더 보기"로 확장.

### HTML 구조
```html
<section class="pdp-overview" aria-label="상품 소개">
  <div class="pdp-overview__inner">
    <h2 class="pdp-section__title">상품 소개</h2>
    <div class="pdp-overview__content" id="overviewContent"
         data-collapsed="true" aria-expanded="false">
      <p>이스탄불의 심장부, 올드 시티를 하루 만에 깊이 있게 만나는 프라이빗 투어입니다. 유네스코 세계문화유산인 블루모스크와 아야소피아를 전문 가이드의 해설과 함께 둘러보며, 비잔틴과 오스만 두 제국의 흔적을 동시에 느낄 수 있습니다.</p>
      <p>관광객으로 붐비는 루트 대신, 현지인만 아는 골목길과 로컬 카페를 경유하는 특별한 동선으로 구성했습니다.</p>
      <p>10년 이상 이스탄불에 거주한 한국인 가이드가 동행합니다.</p>
    </div>
    <button class="pdp-overview__toggle" id="overviewToggle"
            aria-controls="overviewContent" aria-expanded="false">
      더 보기
      <svg class="pdp-overview__chevron" aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
        <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>
    </button>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-overview {
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
}
.pdp-overview__content {
  font-size: 15px;
  line-height: 1.75;
  color: var(--pdp-text-secondary);
  transition: max-height 400ms ease-out;
  overflow: hidden;
}
.pdp-overview__content p {
  margin-bottom: 16px;
}
.pdp-overview__content p:last-child {
  margin-bottom: 0;
}

/* 접힌 상태 */
.pdp-overview__content[data-collapsed="true"] {
  max-height: 4.5em;                 /* 약 3줄 (15px * 1.75 * 3 = ~78.75px) */
  position: relative;
}
.pdp-overview__content[data-collapsed="true"]::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2.5em;
  background: linear-gradient(transparent, #fff);
  pointer-events: none;
}

/* 펼친 상태 */
.pdp-overview__content[data-collapsed="false"] {
  max-height: 2000px;                /* 충분히 큰 값 */
}
.pdp-overview__content[data-collapsed="false"]::after {
  display: none;
}

/* 토글 버튼 */
.pdp-overview__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--pdp-primary);
  background: none;
  border: none;
  cursor: pointer;
  margin-top: 4px;
}
.pdp-overview__chevron {
  transition: transform 300ms ease;
}
.pdp-overview__toggle[aria-expanded="true"] .pdp-overview__chevron {
  transform: rotate(180deg);
}
```

### 인터랙션 동작

**JS 필요: YES**

```javascript
function initOverview(section) {
  const content = section.querySelector('.pdp-overview__content');
  const toggle = section.querySelector('.pdp-overview__toggle');

  if (!content || !toggle) return;

  // 콘텐츠가 3줄 이하면 토글 숨기기
  const lineHeight = parseFloat(getComputedStyle(content).lineHeight);
  if (content.scrollHeight <= lineHeight * 3.5) {
    toggle.style.display = 'none';
    content.removeAttribute('data-collapsed');
    content.setAttribute('aria-expanded', 'true');
    return;
  }

  toggle.addEventListener('click', () => {
    const isCollapsed = content.getAttribute('data-collapsed') === 'true';
    content.setAttribute('data-collapsed', !isCollapsed);
    content.setAttribute('aria-expanded', isCollapsed);
    toggle.setAttribute('aria-expanded', isCollapsed);
    toggle.firstChild.textContent = isCollapsed ? '접기 ' : '더 보기 ';
  });
}
```

### 데이터 바인딩
```javascript
const overviewData = {
  title: "상품 소개",               // 선택, 기본값: "상품 소개"
  content: "string (HTML 허용)",    // 필수
  // 또는 paragraphs 배열:
  paragraphs: [                      // content와 paragraphs 중 하나
    "첫 번째 단락...",
    "두 번째 단락..."
  ],
  collapsedLines: 3                  // 선택, 기본값: 모바일 3, 데스크톱 5
};

// Fallback:
// - content/paragraphs 모두 비어있으면: 섹션 전체 비노출
// - 1개 문단이면: 접기 기능 비활성화
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 기본 노출 줄 수 | 3줄 | 5줄 |
| 폰트 크기 | 15px | 16px |
| line-height | 1.75 | 1.8 |
| 그라디언트 | 2.5em | 3em |

### 접근성
- 콘텐츠: `aria-expanded="false/true"`
- 토글 버튼: `aria-controls="overviewContent"`, `aria-expanded="false/true"`
- 접힌 상태에서도 스크린리더는 전체 텍스트 읽을 수 있도록 `overflow: hidden`이지만 `aria-hidden`은 사용하지 않음

---

## 블록 5: optionTable — 옵션/요금표

### 전환 역할
**Convince** — 옵션별 가격 비교를 통해 Category Heuristics 편향 활용. "어떤 옵션이 몇 원?"에 즉시 답변.

### HTML 구조
```html
<section class="pdp-options" aria-label="옵션 선택">
  <div class="pdp-options__inner">
    <h2 class="pdp-section__title">옵션 안내</h2>

    <!-- 모바일: 카드형 -->
    <div class="pdp-options__cards">
      <article class="pdp-options__card pdp-options__card--recommended"
               tabindex="0" role="radio" aria-checked="false">
        <div class="pdp-options__card-header">
          <h3 class="pdp-options__card-name">1일 스튜디오 패스</h3>
          <span class="pdp-options__card-badge">추천</span>
        </div>
        <p class="pdp-options__card-desc">슈퍼 닌텐도 월드 포함</p>
        <div class="pdp-options__card-price">
          <span class="pdp-options__card-original">₩85,000</span>
          <span class="pdp-options__card-current">₩72,000</span>
          <span class="pdp-options__card-unit">/ 성인 1매</span>
        </div>
        <ul class="pdp-options__card-details">
          <li>아동(4~11세): ₩49,000</li>
        </ul>
      </article>

      <article class="pdp-options__card" tabindex="0" role="radio" aria-checked="false">
        <div class="pdp-options__card-header">
          <h3 class="pdp-options__card-name">1.5일 패스</h3>
        </div>
        <p class="pdp-options__card-desc">전일 15시부터 입장</p>
        <div class="pdp-options__card-price">
          <span class="pdp-options__card-current">₩108,000</span>
          <span class="pdp-options__card-unit">/ 성인 1매</span>
        </div>
      </article>

      <article class="pdp-options__card" tabindex="0" role="radio" aria-checked="false">
        <div class="pdp-options__card-header">
          <h3 class="pdp-options__card-name">2일 패스</h3>
        </div>
        <p class="pdp-options__card-desc">연속 2일 이용</p>
        <div class="pdp-options__card-price">
          <span class="pdp-options__card-current">₩132,000</span>
          <span class="pdp-options__card-unit">/ 성인 1매</span>
        </div>
      </article>
    </div>

    <!-- 데스크톱: 테이블형 (모바일에서는 display:none) -->
    <div class="pdp-options__table-wrap" role="table" aria-label="옵션별 가격 비교">
      <table class="pdp-options__table">
        <thead>
          <tr>
            <th scope="col">티켓 종류</th>
            <th scope="col">성인(12세+)</th>
            <th scope="col">아동(4~11세)</th>
            <th scope="col">비고</th>
          </tr>
        </thead>
        <tbody>
          <tr class="pdp-options__row--highlight">
            <td><strong>1일 스튜디오 패스</strong> <span class="pdp-options__rec-tag">추천</span></td>
            <td>₩72,000</td>
            <td>₩49,000</td>
            <td>-</td>
          </tr>
          <tr>
            <td>1.5일 패스</td>
            <td>₩108,000</td>
            <td>₩73,000</td>
            <td>전일 15시~</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="pdp-options__footnote">* 익스프레스 패스는 별도 구매 필요</p>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-options {
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
}

/* 모바일 카드형 */
.pdp-options__cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pdp-options__card {
  border: 2px solid var(--pdp-border);
  border-radius: var(--pdp-radius-md);
  padding: 16px;
  cursor: pointer;
  transition: border-color var(--pdp-transition), box-shadow var(--pdp-transition);
}
.pdp-options__card:hover,
.pdp-options__card:focus-visible {
  border-color: var(--pdp-primary);
  box-shadow: 0 0 0 1px var(--pdp-primary);
}
.pdp-options__card[aria-checked="true"] {
  border-color: var(--pdp-primary);
  background: var(--pdp-primary-light);
}
.pdp-options__card--recommended {
  border-color: var(--pdp-primary);
  position: relative;
}
.pdp-options__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.pdp-options__card-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--pdp-text);
}
.pdp-options__card-badge {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: var(--pdp-primary);
  padding: 2px 8px;
  border-radius: 100px;
}
.pdp-options__card-desc {
  font-size: 13px;
  color: var(--pdp-text-secondary);
  margin-bottom: 8px;
}
.pdp-options__card-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.pdp-options__card-original {
  font-size: 13px;
  color: var(--pdp-text-secondary);
  text-decoration: line-through;
}
.pdp-options__card-current {
  font-size: 20px;
  font-weight: 800;
  color: var(--pdp-text);
}
.pdp-options__card-unit {
  font-size: 13px;
  color: var(--pdp-text-secondary);
}
.pdp-options__card-details {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--pdp-border);
  list-style: none;
}
.pdp-options__card-details li {
  font-size: 13px;
  color: var(--pdp-text-secondary);
}

/* 데스크톱 테이블형 */
.pdp-options__table-wrap {
  display: none;
  overflow-x: auto;
}
.pdp-options__table {
  width: 100%;
  font-size: 14px;
  border-collapse: collapse;
}
.pdp-options__table thead th {
  background: #F9FAFB;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 13px;
  color: var(--pdp-text-secondary);
  border-bottom: 2px solid var(--pdp-border);
  text-align: left;
}
.pdp-options__table tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid #F3F4F6;
  color: var(--pdp-text);
}
.pdp-options__row--highlight {
  background: var(--pdp-primary-light);
}
.pdp-options__row--highlight td:first-child {
  border-left: 3px solid var(--pdp-primary);
}
.pdp-options__rec-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: var(--pdp-primary);
  background: rgba(43,150,237,0.1);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 6px;
}
.pdp-options__footnote {
  font-size: 12px;
  color: var(--pdp-text-secondary);
  margin-top: 12px;
}

/* 반응형: 데스크톱에서 테이블 표시 */
@media (min-width: 769px) {
  .pdp-options__cards { display: none; }
  .pdp-options__table-wrap { display: block; }
}
```

### 인터랙션 동작

**JS 필요: YES (카드 선택)**

```javascript
function initOptionTable(section) {
  const cards = section.querySelectorAll('.pdp-options__card');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.setAttribute('aria-checked', 'false'));
      card.setAttribute('aria-checked', 'true');
      // 선택된 옵션 정보를 CTA에 전달
      const price = card.querySelector('.pdp-options__card-current')?.textContent;
      document.dispatchEvent(new CustomEvent('pdp:option-selected', {
        detail: { price, name: card.querySelector('.pdp-options__card-name')?.textContent }
      }));
    });

    // 키보드: Enter/Space로 선택
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}
```

### 데이터 바인딩
```javascript
const optionTableData = {
  title: "옵션 안내",                 // 선택, 기본값: "옵션 선택"
  options: [                          // 필수, 최소 1개
    {
      name: "1일 스튜디오 패스",
      description: "슈퍼 닌텐도 월드 포함",  // 선택
      price: { amount: 72000, currency: "₩", unit: "성인 1매" },
      originalPrice: 85000,           // 선택
      badges: ["추천"],               // 선택
      available: true,                // 필수
      subPrices: [                    // 선택
        { label: "아동(4~11세)", amount: 49000 }
      ]
    }
  ],
  footnote: "* 익스프레스 패스는 별도 구매 필요"  // 선택
};

// Fallback:
// - options 비어있으면: 섹션 전체 비노출
// - available=false인 옵션: 회색 처리 + "일시 품절" 표시
// - originalPrice 없으면: 할인 표시 안 함
// - badges 없으면: 추천 태그 비노출
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 형태 | 카드형 세로 나열 | 테이블형 가로 비교 |
| 선택 동작 | 카드 탭 → 테두리 강조 | 행 클릭 → 배경 강조 |
| 가격 크기 | 20px bold | 18px bold |
| 추가 정보 | 카드 내 펼침 | 비고 열에 표시 |

### 접근성
- 카드 그룹: `role="radiogroup"`, 각 카드 `role="radio"`, `aria-checked`
- 테이블: 표준 `<table>`, `<th scope="col">`
- 품절 옵션: `aria-disabled="true"`, 시각적으로도 비활성 표시
- 키보드: Tab으로 카드 간 이동, Enter/Space로 선택

---

## 블록 6: itinerary — 일정/코스

### 전환 역할
**Convince** — 투어/액티비티의 시간별 흐름을 시각화하여 "이 투어가 어떻게 진행되는지" 명확하게 전달. 구매 확신 강화.

### HTML 구조
```html
<section class="pdp-itinerary" aria-label="투어 일정">
  <div class="pdp-itinerary__inner">
    <h2 class="pdp-section__title">투어 일정</h2>
    <span class="pdp-itinerary__total">총 약 5시간 30분</span>

    <ol class="pdp-itinerary__timeline" role="list">
      <li class="pdp-itinerary__stop">
        <div class="pdp-itinerary__marker">
          <span class="pdp-itinerary__dot" aria-hidden="true"></span>
          <span class="pdp-itinerary__line" aria-hidden="true"></span>
        </div>
        <div class="pdp-itinerary__content">
          <span class="pdp-itinerary__time">09:00</span>
          <h3 class="pdp-itinerary__title">호텔 픽업</h3>
          <p class="pdp-itinerary__desc">숙소 로비에서 가이드가 직접 픽업합니다.</p>
        </div>
      </li>

      <li class="pdp-itinerary__stop">
        <div class="pdp-itinerary__marker">
          <span class="pdp-itinerary__dot" aria-hidden="true"></span>
          <span class="pdp-itinerary__line" aria-hidden="true"></span>
        </div>
        <div class="pdp-itinerary__content">
          <span class="pdp-itinerary__time">09:30</span>
          <h3 class="pdp-itinerary__title">블루모스크 (술탄아흐메트)</h3>
          <p class="pdp-itinerary__desc">오스만 건축의 걸작, 내부 2만 장의 푸른 이즈닉 타일이 펼치는 장관을 감상하세요.</p>
          <span class="pdp-itinerary__duration">약 50분</span>
        </div>
      </li>

      <!-- 마지막 아이템 -->
      <li class="pdp-itinerary__stop pdp-itinerary__stop--last">
        <div class="pdp-itinerary__marker">
          <span class="pdp-itinerary__dot pdp-itinerary__dot--end" aria-hidden="true"></span>
        </div>
        <div class="pdp-itinerary__content">
          <span class="pdp-itinerary__time">14:30</span>
          <h3 class="pdp-itinerary__title">호텔 복귀</h3>
          <p class="pdp-itinerary__desc">전용 차량으로 숙소까지 안전하게 이동합니다.</p>
        </div>
      </li>
    </ol>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-itinerary {
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
}
.pdp-itinerary__total {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  color: var(--pdp-primary);
  background: var(--pdp-primary-light);
  padding: 4px 12px;
  border-radius: 100px;
  margin-bottom: 20px;
}
.pdp-itinerary__timeline {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 각 정류소 */
.pdp-itinerary__stop {
  display: flex;
  gap: 16px;
  padding-bottom: 0;
}

/* 마커 (도트 + 세로선) */
.pdp-itinerary__marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 16px;
  padding-top: 4px;
}
.pdp-itinerary__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--pdp-primary);
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(43,150,237,0.15);
}
.pdp-itinerary__dot--end {
  background: var(--pdp-text-secondary);
  box-shadow: none;
}
.pdp-itinerary__line {
  width: 2px;
  flex: 1;
  background: #E5E7EB;
  margin: 4px 0;
  min-height: 20px;
}

/* 콘텐츠 */
.pdp-itinerary__content {
  flex: 1;
  min-width: 0;
  padding-bottom: 24px;
}
.pdp-itinerary__stop--last .pdp-itinerary__content {
  padding-bottom: 0;
}
.pdp-itinerary__time {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: var(--pdp-primary);
  background: var(--pdp-primary-light);
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
}
.pdp-itinerary__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--pdp-text);
  margin-bottom: 4px;
  line-height: 1.4;
}
.pdp-itinerary__desc {
  font-size: 14px;
  color: var(--pdp-text-secondary);
  line-height: 1.6;
  margin-bottom: 4px;
}
.pdp-itinerary__duration {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--pdp-text-secondary);
}
.pdp-itinerary__duration::before {
  content: '⏱';
  font-size: 11px;
}
```

### 인터랙션 동작

**JS 필요: YES (5개 이상 정류소일 때 접기)**

```javascript
function initItinerary(section) {
  const stops = section.querySelectorAll('.pdp-itinerary__stop');
  const VISIBLE_COUNT = 4;

  if (stops.length <= VISIBLE_COUNT) return;

  // 4개 이후 숨기기
  stops.forEach((stop, i) => {
    if (i >= VISIBLE_COUNT) {
      stop.classList.add('pdp-itinerary__stop--hidden');
      stop.style.display = 'none';
    }
  });

  // "전체 일정 보기" 버튼 추가
  const btn = document.createElement('button');
  btn.className = 'pdp-itinerary__expand';
  btn.innerHTML = `전체 ${stops.length}개 일정 보기 <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;
  btn.setAttribute('aria-expanded', 'false');
  section.querySelector('.pdp-itinerary__timeline').after(btn);

  btn.addEventListener('click', () => {
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    stops.forEach((stop, i) => {
      if (i >= VISIBLE_COUNT) {
        stop.style.display = isExpanded ? 'none' : 'flex';
      }
    });
    btn.setAttribute('aria-expanded', !isExpanded);
    btn.innerHTML = isExpanded
      ? `전체 ${stops.length}개 일정 보기 <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/></svg>`
      : `접기 <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 8l4-4 4 4" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;
  });
}
```

**접기 버튼 CSS:**
```css
.pdp-itinerary__expand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--pdp-primary);
  background: var(--pdp-primary-light);
  border: 1px dashed rgba(43,150,237,0.3);
  border-radius: var(--pdp-radius-sm);
  cursor: pointer;
  margin-top: 8px;
  transition: background var(--pdp-transition);
}
.pdp-itinerary__expand:hover {
  background: rgba(43,150,237,0.12);
}
```

### 데이터 바인딩
```javascript
const itineraryData = {
  title: "투어 일정",                // 선택
  type: "timeline",                  // "timeline" | "day_by_day"
  items: [                           // 필수, 최소 2개
    {
      time: "09:00",                 // 선택 (timeline일 때)
      day: 1,                        // 선택 (day_by_day일 때)
      title: "호텔 픽업",            // 필수
      description: "숙소 로비에서...", // 필수
      duration: "약 30분",           // 선택
      image: { url: "...", alt: "..." }  // 선택
    }
  ],
  totalDuration: "총 약 5시간 30분"  // 선택
};

// Fallback:
// - items 비어있으면: 섹션 전체 비노출
// - time 없으면: 시간 뱃지 비노출, 순서 번호로 대체 (1, 2, 3...)
// - duration 없으면: duration 영역 비노출
// - totalDuration 없으면: 상단 뱃지 비노출
// - type="day_by_day"이면: 시간 대신 "Day 1", "Day 2" 표시
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 레이아웃 | 세로 타임라인 | 세로 타임라인 (동일) |
| 이미지 | 비노출 (공간 절약) | 정류소별 썸네일 (있을 때) |
| 접기 | 4개 초과 시 접기 | 6개 초과 시 접기 |
| 설명 | 최대 2줄 + 더보기 | 전체 표시 |

### 접근성
- `<ol>` 순서 리스트 사용 (시간순/순서)
- 타임라인 마커: `aria-hidden="true"` (장식 요소)
- 시간/제목: 의미 전달에 충분한 텍스트
- 접기 버튼: `aria-expanded` 상태 관리

---

## 블록 7: inclusions — 포함/불포함

### 전환 역할
**Reassure** — CS 분쟁 1위 원인인 "포함/불포함 혼동"을 시각적으로 명확하게 해소. 불포함에 대안 팁을 추가하여 부정적 인상 완화.

### HTML 구조
```html
<section class="pdp-inclusions" aria-label="포함 및 불포함 사항">
  <div class="pdp-inclusions__inner">
    <h2 class="pdp-section__title">포함 / 불포함</h2>

    <div class="pdp-inclusions__grid">
      <!-- 포함 -->
      <div class="pdp-inclusions__group">
        <h3 class="pdp-inclusions__group-title pdp-inclusions__group-title--included">
          <svg aria-hidden="true" width="16" height="16"><circle cx="8" cy="8" r="8" fill="#059669"/><path d="M5 8l2 2 4-4" stroke="#fff" stroke-width="1.5" fill="none"/></svg>
          포함
        </h3>
        <ul class="pdp-inclusions__list" role="list">
          <li class="pdp-inclusions__item pdp-inclusions__item--included">
            <span class="pdp-inclusions__icon pdp-inclusions__icon--yes" aria-hidden="true">
              <svg width="18" height="18"><circle cx="9" cy="9" r="9" fill="#ECFDF5"/><path d="M6 9l2 2 4-4" stroke="#059669" stroke-width="1.5" fill="none"/></svg>
            </span>
            <div class="pdp-inclusions__text">
              <span class="pdp-inclusions__label">한국어 전문 가이드</span>
              <span class="pdp-inclusions__detail">12년 경력, 터키 역사학 전공</span>
            </div>
          </li>
          <li class="pdp-inclusions__item pdp-inclusions__item--included">
            <span class="pdp-inclusions__icon pdp-inclusions__icon--yes" aria-hidden="true">
              <svg width="18" height="18"><circle cx="9" cy="9" r="9" fill="#ECFDF5"/><path d="M6 9l2 2 4-4" stroke="#059669" stroke-width="1.5" fill="none"/></svg>
            </span>
            <div class="pdp-inclusions__text">
              <span class="pdp-inclusions__label">전용 차량 이동</span>
              <span class="pdp-inclusions__detail">호텔 픽업/샌딩 포함</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- 불포함 -->
      <div class="pdp-inclusions__group">
        <h3 class="pdp-inclusions__group-title pdp-inclusions__group-title--excluded">
          <svg aria-hidden="true" width="16" height="16"><circle cx="8" cy="8" r="8" fill="#EF4444"/><path d="M5 5l6 6M11 5l-6 6" stroke="#fff" stroke-width="1.5"/></svg>
          불포함
        </h3>
        <ul class="pdp-inclusions__list" role="list">
          <li class="pdp-inclusions__item pdp-inclusions__item--excluded">
            <span class="pdp-inclusions__icon pdp-inclusions__icon--no" aria-hidden="true">
              <svg width="18" height="18"><circle cx="9" cy="9" r="9" fill="#FEF2F2"/><path d="M6 6l6 6M12 6l-6 6" stroke="#EF4444" stroke-width="1.5"/></svg>
            </span>
            <div class="pdp-inclusions__text">
              <span class="pdp-inclusions__label">점심 식사</span>
              <span class="pdp-inclusions__detail pdp-inclusions__tip">가이드가 현지 맛집 안내 (1인 약 15,000원)</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-inclusions {
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
}
.pdp-inclusions__grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.pdp-inclusions__group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
}
.pdp-inclusions__group-title--included { color: var(--pdp-success); }
.pdp-inclusions__group-title--excluded { color: var(--pdp-danger); }

.pdp-inclusions__list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.pdp-inclusions__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #F3F4F6;
}
.pdp-inclusions__item:last-child {
  border-bottom: none;
}
.pdp-inclusions__icon {
  flex-shrink: 0;
  margin-top: 1px;
}
.pdp-inclusions__label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--pdp-text);
  line-height: 1.5;
}
.pdp-inclusions__detail {
  display: block;
  font-size: 12px;
  color: var(--pdp-text-secondary);
  margin-top: 2px;
  line-height: 1.4;
}
.pdp-inclusions__tip {
  color: var(--pdp-primary);          /* 대안 팁은 파란색 */
}
.pdp-inclusions__tip::before {
  content: '💡 ';
  font-size: 11px;
}

/* 데스크톱: 2열 그리드 */
@media (min-width: 769px) {
  .pdp-inclusions__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}
```

### 인터랙션 동작

**JS 필요: NO**

정적 리스트. 인터랙션 없음.

### 데이터 바인딩
```javascript
const inclusionsData = {
  title: "포함 / 불포함",            // 선택
  included: [                         // 필수, 최소 1개
    {
      text: "한국어 전문 가이드",     // 필수
      detail: "12년 경력, 터키 역사학 전공"  // 선택 (혜택 프레이밍)
    }
  ],
  excluded: [                         // 선택 (없으면 불포함 섹션 비노출)
    {
      text: "점심 식사",             // 필수
      tip: "가이드가 현지 맛집 안내 (1인 약 15,000원)"  // 선택 (대안 팁)
    }
  ]
};

// Fallback:
// - included 비어있으면: 포함 영역 비노출
// - excluded 비어있으면: 불포함 영역 비노출
// - 둘 다 비어있으면: 섹션 전체 비노출
// - detail/tip 없으면: 해당 서브텍스트 비노출
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 레이아웃 | 1열 (포함 위, 불포함 아래) | 2열 그리드 (좌: 포함, 우: 불포함) |
| 아이콘 크기 | 18px | 20px |
| 텍스트 크기 | 14px | 15px |

### 접근성
- `<section>` + `aria-label="포함 및 불포함 사항"`
- 포함/불포함: 각각 `<h3>` 부제로 구분
- 리스트: `<ul>` + `role="list"`
- 아이콘: `aria-hidden="true"`, 텍스트("포함"/"불포함" 제목)가 의미 전달
- 색상만으로 구분하지 않음: 아이콘 모양(체크/X)도 함께 사용

---

> Part 2 (블록 8~14)와 Part 3 (블록 15~20)에서 이어집니다.
