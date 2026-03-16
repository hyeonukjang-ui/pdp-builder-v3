# PDP 블록 구현 스펙 — Part 3 (블록 15~20)

> Part 1의 공통 규칙/디자인 토큰을 그대로 사용합니다.

---

## 블록 15: notice — 주의사항

### 전환 역할
**Reassure** — 예상치 못한 제약사항으로 인한 CS 분쟁 사전 방지. 카테고리별 그룹핑으로 필요한 정보만 빠르게 찾을 수 있도록.

### HTML 구조
```html
<section class="pdp-notice" aria-label="주의사항">
  <div class="pdp-notice__inner">
    <h2 class="pdp-section__title">알아두세요</h2>

    <!-- 그룹별 아코디언 -->
    <div class="pdp-notice__groups">
      <!-- critical (빨강) -->
      <details class="pdp-notice__group pdp-notice__group--critical" open>
        <summary class="pdp-notice__summary">
          <span class="pdp-notice__severity" aria-hidden="true">
            <svg width="16" height="16"><circle cx="8" cy="8" r="8" fill="#EF4444"/><path d="M8 4v5M8 11v1" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>
          </span>
          <span class="pdp-notice__subtitle">안전 안내</span>
          <svg class="pdp-notice__chevron" aria-hidden="true" width="12" height="12"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/></svg>
        </summary>
        <ul class="pdp-notice__list">
          <li>고래상어 접촉 금지 (최소 1m 거리 유지)</li>
          <li>플래시 촬영 금지</li>
          <li>선크림 사용 금지 (해양 환경 보호, 래시가드 권장)</li>
        </ul>
      </details>

      <!-- warning (노랑) -->
      <details class="pdp-notice__group pdp-notice__group--warning">
        <summary class="pdp-notice__summary">
          <span class="pdp-notice__severity" aria-hidden="true">
            <svg width="16" height="16"><circle cx="8" cy="8" r="8" fill="#F59E0B"/><path d="M8 5v4M8 11v0.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>
          </span>
          <span class="pdp-notice__subtitle">참여 조건</span>
          <svg class="pdp-notice__chevron" aria-hidden="true" width="12" height="12"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/></svg>
        </summary>
        <ul class="pdp-notice__list">
          <li>만 6세 이상 참여 가능</li>
          <li>수영을 못해도 구명조끼 착용으로 참여 가능</li>
          <li>심장질환, 임신 중에는 참여 불가</li>
        </ul>
      </details>

      <!-- info (파랑) -->
      <details class="pdp-notice__group pdp-notice__group--info">
        <summary class="pdp-notice__summary">
          <span class="pdp-notice__severity" aria-hidden="true">
            <svg width="16" height="16"><circle cx="8" cy="8" r="8" fill="#2B96ED"/><path d="M8 5v0.5M8 7v4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>
          </span>
          <span class="pdp-notice__subtitle">기타 안내</span>
          <svg class="pdp-notice__chevron" aria-hidden="true" width="12" height="12"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/></svg>
        </summary>
        <ul class="pdp-notice__list">
          <li>새벽 출발이라 전날 충분한 수면 권장</li>
          <li>고래상어는 야생 동물이라 100% 관찰을 보장하지 않습니다 (관찰 확률 98%+)</li>
          <li>이용일 2일 전까지 무료 취소 가능</li>
        </ul>
      </details>
    </div>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-notice {
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
}
.pdp-notice__groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 각 그룹 (아코디언) */
.pdp-notice__group {
  border-radius: var(--pdp-radius-sm);
  overflow: hidden;
}
.pdp-notice__group--critical {
  background: #FEF2F2;
  border-left: 3px solid #EF4444;
}
.pdp-notice__group--warning {
  background: #FFFBEB;
  border-left: 3px solid #F59E0B;
}
.pdp-notice__group--info {
  background: var(--pdp-primary-light);
  border-left: 3px solid var(--pdp-primary);
}

/* summary */
.pdp-notice__summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 700;
  color: var(--pdp-text);
  cursor: pointer;
  list-style: none;
  user-select: none;
}
.pdp-notice__summary::-webkit-details-marker { display: none; }
.pdp-notice__summary::marker { display: none; }

.pdp-notice__subtitle {
  flex: 1;
}
.pdp-notice__chevron {
  color: var(--pdp-text-secondary);
  transition: transform 300ms ease;
  flex-shrink: 0;
}
details[open] > .pdp-notice__summary .pdp-notice__chevron {
  transform: rotate(180deg);
}

/* 리스트 */
.pdp-notice__list {
  padding: 0 14px 14px 42px;         /* 아이콘 + 패딩 맞춤 */
  margin: 0;
}
.pdp-notice__list li {
  font-size: 13px;
  color: var(--pdp-text-secondary);
  line-height: 1.6;
  margin-bottom: 4px;
  list-style: disc;
}
.pdp-notice__list li:last-child {
  margin-bottom: 0;
}
```

### 인터랙션 동작

**JS 필요: YES (critical은 기본 열림)**

```javascript
function initNotice(section) {
  const groups = section.querySelectorAll('.pdp-notice__group');

  groups.forEach(group => {
    // critical 등급은 기본 열림 (HTML open 속성)
    if (group.classList.contains('pdp-notice__group--critical')) {
      group.setAttribute('open', '');
    }

    // 애니메이션이 필요하면 details/summary의 toggle 이벤트 활용
    group.addEventListener('toggle', () => {
      // 선택: 다른 그룹 닫기 (옵션)
      // groups.forEach(g => { if (g !== group) g.removeAttribute('open'); });
    });
  });
}
```

### 데이터 바인딩
```javascript
const noticeData = {
  title: "알아두세요",                // 선택, 기본값: "알아두세요"
  groups: [                           // 필수, 최소 1개
    {
      title: "안전 안내",            // 필수
      severity: "critical",           // "critical" | "warning" | "info"
      items: [                        // 필수, 최소 1개
        "고래상어 접촉 금지 (최소 1m 거리 유지)"
      ]
    }
  ]
};

// Fallback:
// - groups 비어있으면: 섹션 전체 비노출
// - severity 없으면: "info" 기본값
// - critical 그룹은 항상 기본 열림
// - 1개 그룹만 있으면: 아코디언 대신 그냥 펼쳐서 표시
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 레이아웃 | 아코디언 (critical만 기본 열림) | 모두 열림 또는 아코디언 유지 |
| 간격 | 8px | 12px |

### 접근성
- `<details>` + `<summary>` 네이티브 아코디언 (키보드/스크린리더 기본 지원)
- severity 아이콘: `aria-hidden="true"`, severity 정보는 색상 + 그룹 제목으로 전달
- 리스트: `<ul>` + `list-style: disc`

---

## 블록 16: faq — FAQ

### 전환 역할
**Reassure** — 반복되는 CS 문의를 아코디언으로 사전 해결. 질문만 보이고 답변은 클릭 시 노출하여 스크롤 공간 절약.

### HTML 구조
```html
<section class="pdp-faq" aria-label="자주 묻는 질문">
  <div class="pdp-faq__inner">
    <h2 class="pdp-section__title">자주 묻는 질문</h2>

    <div class="pdp-faq__list">
      <details class="pdp-faq__item">
        <summary class="pdp-faq__question">
          <span class="pdp-faq__q-text">비가 오면 어떻게 되나요?</span>
          <svg class="pdp-faq__chevron" aria-hidden="true" width="12" height="12">
            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </summary>
        <div class="pdp-faq__answer">
          <p>비가 와도 정상 진행됩니다. 대부분 실내 관람이고, 이동은 전용 차량이라 비에 거의 젖지 않아요. 폭우 시 가이드가 대체 동선을 안내합니다.</p>
        </div>
      </details>

      <details class="pdp-faq__item">
        <summary class="pdp-faq__question">
          <span class="pdp-faq__q-text">유모차를 가져가도 되나요?</span>
          <svg class="pdp-faq__chevron" aria-hidden="true" width="12" height="12">
            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </summary>
        <div class="pdp-faq__answer">
          <p>가능하지만, 블루모스크와 그랜드 바자르는 계단이 많아 접이식 유모차를 권장합니다.</p>
        </div>
      </details>

      <details class="pdp-faq__item">
        <summary class="pdp-faq__question">
          <span class="pdp-faq__q-text">취소/환불은 어떻게 되나요?</span>
          <svg class="pdp-faq__chevron" aria-hidden="true" width="12" height="12">
            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </summary>
        <div class="pdp-faq__answer">
          <p>이용일 3일 전까지 무료 취소 가능합니다. 2일 전 50%, 1일 전~당일은 환불 불가예요.</p>
        </div>
      </details>
    </div>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-faq {
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
}
.pdp-faq__list {
  border-top: 1px solid var(--pdp-border);
}
.pdp-faq__item {
  border-bottom: 1px solid var(--pdp-border);
}

/* 질문 (summary) */
.pdp-faq__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 0;
  cursor: pointer;
  list-style: none;
  user-select: none;
}
.pdp-faq__question::-webkit-details-marker { display: none; }
.pdp-faq__question::marker { display: none; }

.pdp-faq__q-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--pdp-text);
  line-height: 1.45;
  flex: 1;
}
.pdp-faq__chevron {
  color: var(--pdp-text-secondary);
  transition: transform 300ms ease;
  flex-shrink: 0;
}
details[open] > .pdp-faq__question .pdp-faq__chevron {
  transform: rotate(180deg);
}

/* 호버 상태 */
.pdp-faq__question:hover .pdp-faq__q-text {
  color: var(--pdp-primary);
}

/* 답변 */
.pdp-faq__answer {
  padding: 0 0 16px;
}
.pdp-faq__answer p {
  font-size: 14px;
  color: var(--pdp-text-secondary);
  line-height: 1.65;
  margin: 0;
}
```

### 인터랙션 동작

**JS 필요: NO (네이티브 details/summary 사용)**

선택적 JS: SEO를 위한 JSON-LD FAQ 스키마 자동 생성.

```javascript
function generateFaqSchema(section) {
  const items = section.querySelectorAll('.pdp-faq__item');
  const faqEntries = Array.from(items).map(item => ({
    "@type": "Question",
    "name": item.querySelector('.pdp-faq__q-text').textContent.trim(),
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.querySelector('.pdp-faq__answer p').textContent.trim()
    }
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqEntries
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
```

### 데이터 바인딩
```javascript
const faqData = {
  title: "자주 묻는 질문",           // 선택, 기본값: "자주 묻는 질문"
  items: [                            // 필수, 최소 2개 권장
    {
      question: "비가 오면 어떻게 되나요?",    // 필수
      answer: "비가 와도 정상 진행됩니다..."   // 필수
    }
  ]
};

// Fallback:
// - items 비어있으면: 섹션 전체 비노출
// - 1개 항목이면: 아코디언이 아닌 일반 텍스트로 표시
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 레이아웃 | 전체 너비 아코디언 | 동일 (max-width 제한) |
| 질문 크기 | 15px | 16px |
| 답변 크기 | 14px | 15px |
| 터치 타겟 | summary 전체 (패딩 16px) | 동일 |

### 접근성
- `<details>` + `<summary>` 네이티브 아코디언
- 키보드: Enter/Space로 열기/닫기 (브라우저 기본 동작)
- 스크린리더: 펼쳐짐/접혀짐 상태 자동 전달
- JSON-LD FAQ 스키마: 검색엔진 노출 최적화

---

## 블록 17: reviews — 리뷰 하이라이트 (v2.0 필수 승격)

### 전환 역할
**Reassure** — 전환 영향 1위(+354% CVR). 실제 여행자의 경험이 가장 강력한 설득 수단. Social Proof + Authority 편향 동시 활용.

### HTML 구조
```html
<section class="pdp-reviews" aria-label="여행자 리뷰">
  <div class="pdp-reviews__inner">
    <h2 class="pdp-section__title">여행자 리뷰</h2>

    <!-- 요약 영역 -->
    <div class="pdp-reviews__summary">
      <div class="pdp-reviews__score-block">
        <span class="pdp-reviews__avg-score">4.8</span>
        <div class="pdp-reviews__avg-stars" aria-hidden="true">★★★★★</div>
        <span class="pdp-reviews__total-count">327개 리뷰</span>
      </div>

      <!-- 별점 분포 바 -->
      <div class="pdp-reviews__distribution" aria-label="별점 분포">
        <div class="pdp-reviews__dist-row">
          <span class="pdp-reviews__dist-label">5점</span>
          <div class="pdp-reviews__dist-bar">
            <div class="pdp-reviews__dist-fill" style="width: 78%" aria-label="78%"></div>
          </div>
          <span class="pdp-reviews__dist-count">256</span>
        </div>
        <div class="pdp-reviews__dist-row">
          <span class="pdp-reviews__dist-label">4점</span>
          <div class="pdp-reviews__dist-bar">
            <div class="pdp-reviews__dist-fill" style="width: 15%"></div>
          </div>
          <span class="pdp-reviews__dist-count">49</span>
        </div>
        <div class="pdp-reviews__dist-row">
          <span class="pdp-reviews__dist-label">3점</span>
          <div class="pdp-reviews__dist-bar">
            <div class="pdp-reviews__dist-fill" style="width: 5%"></div>
          </div>
          <span class="pdp-reviews__dist-count">16</span>
        </div>
        <div class="pdp-reviews__dist-row">
          <span class="pdp-reviews__dist-label">2점</span>
          <div class="pdp-reviews__dist-bar">
            <div class="pdp-reviews__dist-fill" style="width: 1%"></div>
          </div>
          <span class="pdp-reviews__dist-count">4</span>
        </div>
        <div class="pdp-reviews__dist-row">
          <span class="pdp-reviews__dist-label">1점</span>
          <div class="pdp-reviews__dist-bar">
            <div class="pdp-reviews__dist-fill" style="width: 0.5%"></div>
          </div>
          <span class="pdp-reviews__dist-count">2</span>
        </div>
      </div>
    </div>

    <!-- AI 리뷰 요약 (선택) -->
    <div class="pdp-reviews__ai-summary">
      <div class="pdp-reviews__ai-badge">
        <svg aria-hidden="true" width="14" height="14"><!-- 스파크 아이콘 --></svg>
        AI 리뷰 요약
      </div>
      <p class="pdp-reviews__ai-text">여행자들이 가장 많이 언급한 키워드: <strong>친절한 가이드</strong>, <strong>알찬 코스</strong>, <strong>사진 포인트</strong>. 특히 가이드의 역사 해설에 대한 만족도가 높습니다.</p>
    </div>

    <!-- UGC 사진 갤러리 (가로 스크롤) -->
    <div class="pdp-reviews__photos">
      <h3 class="pdp-reviews__photos-title">여행자 사진</h3>
      <div class="pdp-reviews__photos-scroll">
        <img class="pdp-reviews__photo" src="ugc1.webp" alt="여행자가 촬영한 블루모스크 내부" loading="lazy">
        <img class="pdp-reviews__photo" src="ugc2.webp" alt="아야소피아 앞에서 가족 사진" loading="lazy">
        <img class="pdp-reviews__photo" src="ugc3.webp" alt="그랜드 바자르 향신료 가게" loading="lazy">
      </div>
    </div>

    <!-- 추천 리뷰 카드 -->
    <div class="pdp-reviews__featured">
      <article class="pdp-reviews__card">
        <div class="pdp-reviews__card-header">
          <div class="pdp-reviews__card-author">
            <span class="pdp-reviews__card-avatar" aria-hidden="true">J</span>
            <div>
              <span class="pdp-reviews__card-name">Jiyeon K.</span>
              <span class="pdp-reviews__card-meta">가족여행 · 2024.11</span>
            </div>
          </div>
          <div class="pdp-reviews__card-stars" aria-label="5점">★★★★★</div>
        </div>
        <p class="pdp-reviews__card-text">가이드 김서연님이 정말 친절하고 설명도 알차서 아이들도 지루해하지 않았어요. 특히 블루모스크 내부의 타일 설명이 인상 깊었습니다. 점심 맛집 추천도 완벽!</p>
        <div class="pdp-reviews__card-photos">
          <img src="review-photo1.webp" alt="블루모스크 내부" loading="lazy">
        </div>
      </article>

      <article class="pdp-reviews__card">
        <div class="pdp-reviews__card-header">
          <div class="pdp-reviews__card-author">
            <span class="pdp-reviews__card-avatar" aria-hidden="true">M</span>
            <div>
              <span class="pdp-reviews__card-name">Minjae P.</span>
              <span class="pdp-reviews__card-meta">커플 · 2024.12</span>
            </div>
          </div>
          <div class="pdp-reviews__card-stars" aria-label="5점">★★★★★</div>
        </div>
        <p class="pdp-reviews__card-text">프라이빗이라 우리 페이스대로 진행할 수 있어서 좋았어요. 사진도 정말 잘 찍어주셨고, 숨은 카페도 너무 좋았습니다.</p>
      </article>
    </div>

    <!-- 전체 리뷰 보기 -->
    <button class="pdp-reviews__all-btn">전체 리뷰 327개 보기</button>
  </div>
</section>

<!-- 빈 상태 (리뷰 없을 때) -->
<!--
<section class="pdp-reviews pdp-reviews--empty" aria-label="여행자 리뷰">
  <div class="pdp-reviews__inner">
    <h2 class="pdp-section__title">여행자 리뷰</h2>
    <div class="pdp-reviews__empty">
      <span class="pdp-reviews__empty-icon" aria-hidden="true">💬</span>
      <p class="pdp-reviews__empty-text">아직 첫 번째 리뷰를 기다리고 있어요</p>
      <p class="pdp-reviews__empty-sub">이 상품을 이용하셨다면 리뷰를 남겨주세요!</p>
    </div>
  </div>
</section>
-->
```

### 핵심 CSS 스펙
```css
.pdp-reviews {
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
}

/* 요약 영역 */
.pdp-reviews__summary {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--pdp-border);
}
.pdp-reviews__score-block {
  text-align: center;
  flex-shrink: 0;
  min-width: 80px;
}
.pdp-reviews__avg-score {
  display: block;
  font-size: 40px;
  font-weight: 800;
  color: var(--pdp-text);
  line-height: 1;
  letter-spacing: -0.03em;
}
.pdp-reviews__avg-stars {
  color: #F59E0B;
  font-size: 14px;
  margin: 4px 0;
}
.pdp-reviews__total-count {
  font-size: 13px;
  color: var(--pdp-text-secondary);
}

/* 별점 분포 바 */
.pdp-reviews__distribution {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pdp-reviews__dist-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pdp-reviews__dist-label {
  font-size: 12px;
  color: var(--pdp-text-secondary);
  width: 24px;
  text-align: right;
  flex-shrink: 0;
}
.pdp-reviews__dist-bar {
  flex: 1;
  height: 8px;
  background: #F3F4F6;
  border-radius: 4px;
  overflow: hidden;
}
.pdp-reviews__dist-fill {
  height: 100%;
  background: #F59E0B;
  border-radius: 4px;
  min-width: 2px;
  transition: width 600ms ease-out;
}
.pdp-reviews__dist-count {
  font-size: 12px;
  color: var(--pdp-text-secondary);
  width: 28px;
  text-align: right;
  flex-shrink: 0;
}

/* AI 리뷰 요약 */
.pdp-reviews__ai-summary {
  background: linear-gradient(135deg, #F0F9FF, #EEF2FF);
  border-radius: var(--pdp-radius-sm);
  padding: 14px;
  margin-bottom: 20px;
}
.pdp-reviews__ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--pdp-primary);
  background: rgba(43,150,237,0.1);
  padding: 2px 8px;
  border-radius: 100px;
  margin-bottom: 8px;
}
.pdp-reviews__ai-text {
  font-size: 14px;
  color: var(--pdp-text-secondary);
  line-height: 1.6;
  margin: 0;
}
.pdp-reviews__ai-text strong {
  color: var(--pdp-text);
  font-weight: 600;
}

/* UGC 사진 갤러리 */
.pdp-reviews__photos {
  margin-bottom: 20px;
}
.pdp-reviews__photos-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--pdp-text);
  margin-bottom: 10px;
}
.pdp-reviews__photos-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.pdp-reviews__photos-scroll::-webkit-scrollbar { display: none; }
.pdp-reviews__photo {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--pdp-radius-sm);
  flex-shrink: 0;
  cursor: pointer;
  transition: transform var(--pdp-transition);
}
.pdp-reviews__photo:hover {
  transform: scale(1.05);
}

/* 추천 리뷰 카드 */
.pdp-reviews__featured {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
.pdp-reviews__card {
  border: 1px solid var(--pdp-border);
  border-radius: var(--pdp-radius-md);
  padding: 16px;
}
.pdp-reviews__card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.pdp-reviews__card-author {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pdp-reviews__card-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--pdp-primary-light);
  color: var(--pdp-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.pdp-reviews__card-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--pdp-text);
}
.pdp-reviews__card-meta {
  display: block;
  font-size: 12px;
  color: var(--pdp-text-secondary);
}
.pdp-reviews__card-stars {
  color: #F59E0B;
  font-size: 13px;
  flex-shrink: 0;
}
.pdp-reviews__card-text {
  font-size: 14px;
  color: var(--pdp-text-secondary);
  line-height: 1.6;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pdp-reviews__card-photos {
  display: flex;
  gap: 6px;
}
.pdp-reviews__card-photos img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 6px;
}

/* 전체 리뷰 보기 버튼 */
.pdp-reviews__all-btn {
  display: block;
  width: 100%;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  color: var(--pdp-primary);
  background: none;
  border: 1px solid var(--pdp-primary);
  border-radius: var(--pdp-radius-sm);
  cursor: pointer;
  transition: background var(--pdp-transition);
}
.pdp-reviews__all-btn:hover {
  background: var(--pdp-primary-light);
}

/* 빈 상태 */
.pdp-reviews__empty {
  text-align: center;
  padding: 32px 0;
}
.pdp-reviews__empty-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}
.pdp-reviews__empty-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--pdp-text);
  margin-bottom: 4px;
}
.pdp-reviews__empty-sub {
  font-size: 14px;
  color: var(--pdp-text-secondary);
}
```

### 인터랙션 동작

**JS 필요: YES**

```javascript
function initReviews(section) {
  // 1. 분포 바 애니메이션 (뷰포트 진입 시)
  const bars = section.querySelectorAll('.pdp-reviews__dist-fill');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bars.forEach(bar => {
          const width = bar.style.width;
          bar.style.width = '0';
          requestAnimationFrame(() => {
            bar.style.width = width;
          });
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  observer.observe(section);

  // 2. UGC 사진 클릭 → 라이트박스
  const photos = section.querySelectorAll('.pdp-reviews__photo');
  photos.forEach((photo, index) => {
    photo.addEventListener('click', () => {
      openLightbox(
        Array.from(photos).map(p => ({ src: p.src, alt: p.alt })),
        index
      );
    });
  });

  // 3. 리뷰 카드 "더보기" (4줄 이상일 때)
  const texts = section.querySelectorAll('.pdp-reviews__card-text');
  texts.forEach(text => {
    if (text.scrollHeight > text.clientHeight) {
      const btn = document.createElement('button');
      btn.className = 'pdp-reviews__card-more';
      btn.textContent = '더보기';
      btn.addEventListener('click', () => {
        text.style.webkitLineClamp = 'unset';
        btn.remove();
      });
      text.after(btn);
    }
  });

  // 4. "전체 리뷰 보기" 버튼
  const allBtn = section.querySelector('.pdp-reviews__all-btn');
  if (allBtn) {
    allBtn.addEventListener('click', () => {
      // 리뷰 목록 페이지로 이동 또는 바텀시트 열기
      document.dispatchEvent(new CustomEvent('pdp:open-all-reviews'));
    });
  }
}
```

### 데이터 바인딩
```javascript
const reviewsData = {
  title: "여행자 리뷰",
  summary: {
    averageScore: 4.8,                // 필수
    totalCount: 327,                  // 필수
    distribution: {                   // 선택
      "5": 256, "4": 49, "3": 16, "2": 4, "1": 2
    },
    aiSummary: "여행자들이 가장 많이 언급한 키워드: 친절한 가이드, 알찬 코스"  // 선택
  },
  featured: [                         // 선택, 2~3개 권장
    {
      author: "Jiyeon K.",
      date: "2024.11",
      score: 5,
      text: "가이드 김서연님이 정말 친절하고...",
      photos: [{ url: "...", alt: "..." }],  // 선택
      travelType: "가족여행"          // 선택
    }
  ],
  ugcGallery: [                       // 선택
    { url: "...", alt: "...", author: "..." }
  ]
};

// Fallback:
// - totalCount === 0 : "아직 리뷰가 없어요" 빈 상태 표시
// - distribution 없으면: 분포 바 비노출 (점수 + 개수만)
// - aiSummary 없으면: AI 요약 영역 비노출
// - featured 비어있으면: 리뷰 카드 비노출 (요약만)
// - ugcGallery 비어있으면: 사진 갤러리 비노출
// - "전체 리뷰 보기" 버튼은 totalCount > 0일 때만 표시
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 요약 | 세로 스택 (점수 위, 분포 아래) | 가로 배치 (좌 점수, 우 분포) |
| UGC 갤러리 | 가로 스크롤 100px 썸네일 | 가로 스크롤 120px 썸네일 |
| 리뷰 카드 | 1열 | 2열 그리드 |
| 리뷰 텍스트 | 4줄 + 더보기 | 6줄 + 더보기 |

```css
@media (max-width: 480px) {
  .pdp-reviews__summary {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
@media (min-width: 769px) {
  .pdp-reviews__featured {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

### 접근성
- 별점: `aria-label="5점"` 등 텍스트로 전달
- 분포 바: 각 행에 `aria-label` (퍼센트 값)
- UGC 사진: 의미 있는 `alt`
- 빈 상태: 부정적이지 않은 메시지 ("리뷰가 없습니다" X → "첫 번째 리뷰를 기다리고 있어요" O)
- "전체 리뷰 보기": 명확한 목적 텍스트

---

## 블록 18: socialProof — 소셜 프루프 (v2.0 신규)

### 전환 역할
**Convert** — 구매 결정의 마지막 넛지. Social Proof + Scarcity + Power of Now 편향을 복합 활용. 반드시 실제 데이터 기반.

### HTML 구조
```html
<!-- CTA 바 위에 배치 또는 CTA 바 안에 통합 -->
<div class="pdp-social-proof" role="status" aria-live="polite" aria-atomic="true">
  <div class="pdp-social-proof__message pdp-social-proof__message--active">
    <svg class="pdp-social-proof__icon" aria-hidden="true" width="14" height="14">
      <!-- 불꽃 아이콘 -->
    </svg>
    <span class="pdp-social-proof__text">오늘 <strong>23명</strong>이 이 상품을 예약했어요</span>
  </div>
</div>
```

### 핵심 CSS 스펙
```css
/* CTA 위 독립형 */
.pdp-social-proof {
  padding: 8px var(--pdp-content-padding);
  background: #FFFBEB;
  border-top: 1px solid #FDE68A;
  overflow: hidden;
  min-height: 32px;
}
.pdp-social-proof__message {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 400ms ease, transform 400ms ease;
}
.pdp-social-proof__message--active {
  opacity: 1;
  transform: translateY(0);
}
.pdp-social-proof__icon {
  color: #F59E0B;
  flex-shrink: 0;
}
.pdp-social-proof__text {
  font-size: 13px;
  color: var(--pdp-text-secondary);
}
.pdp-social-proof__text strong {
  color: var(--pdp-text);
  font-weight: 700;
}

/* CTA 바 안에 통합형 */
.pdp-cta .pdp-social-proof {
  background: none;
  border: none;
  padding: 0;
  min-height: auto;
}
.pdp-cta .pdp-social-proof__text {
  font-size: 11px;
}
```

### 인터랙션 동작

**JS 필요: YES (메시지 로테이션)**

```javascript
function initSocialProof(container) {
  const messages = container.dataset.messages;
  if (!messages) return;

  const parsed = JSON.parse(messages);
  if (parsed.length === 0) return;

  const msgEl = container.querySelector('.pdp-social-proof__message');
  const textEl = container.querySelector('.pdp-social-proof__text');
  let current = 0;

  function showNext() {
    // fade out
    msgEl.classList.remove('pdp-social-proof__message--active');

    setTimeout(() => {
      current = (current + 1) % parsed.length;
      textEl.innerHTML = parsed[current].text;
      // fade in
      msgEl.classList.add('pdp-social-proof__message--active');
    }, 400); // 트랜지션 시간과 동기화
  }

  // 5초 간격 로테이션
  if (parsed.length > 1) {
    setInterval(showNext, 5000);
  }

  // 뷰포트 밖이면 일시정지 (성능)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      container.dataset.visible = entry.isIntersecting;
    });
  });
  observer.observe(container);
}
```

### 데이터 바인딩
```javascript
const socialProofData = {
  type: "booking_count",              // "booking_count" | "viewing_count" | "recent_review" | "urgency"
  messages: [                         // 필수, 최소 1개
    {
      icon: "fire",                   // 아이콘 식별자
      text: '오늘 <strong>23명</strong>이 이 상품을 예약했어요',
      timestamp: "2026-03-15T14:00:00"  // 선택, 데이터 신선도 표시
    },
    {
      icon: "eye",
      text: '지금 <strong>5명</strong>이 이 상품을 보고 있어요'
    },
    {
      icon: "calendar",
      text: '이 날짜 남은 자리 <strong>3석</strong>'
    }
  ]
};

// Fallback:
// - messages 비어있으면: 영역 전체 비노출
// - 데이터가 실시간이 아니면: 비노출 (가짜 긴급성 금지)
// - 예약 수가 0이면: 비노출
// - 메시지 1개면: 로테이션 없이 고정 표시

// 중요: 반드시 실제 API 데이터만 사용
// 가짜 데이터(하드코딩된 숫자)는 절대 금지
// timestamp로 데이터 신선도 확인 (24시간 이상 지나면 비노출)
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 배치 | CTA 고정바 위 또는 안에 통합 | CTA 사이드바 아래 고정 |
| 형태 | 단일 줄 텍스트, 5초 로테이션 | 고정 텍스트 (로테이션 선택) |
| 크기 | 13px | 13px |
| 애니메이션 | fade-in/out | fade-in/out |

### 접근성
- `role="status"`: 라이브 리전으로 스크린리더가 변경 내용 읽어줌
- `aria-live="polite"`: 현재 읽고 있는 내용을 방해하지 않고 대기
- `aria-atomic="true"`: 메시지 전체를 다시 읽음
- 애니메이션: `prefers-reduced-motion` 미디어 쿼리로 비활성화

```css
@media (prefers-reduced-motion: reduce) {
  .pdp-social-proof__message {
    transition: none;
  }
}
```

---

## 블록 19: relatedProducts — 관련 상품

### 전환 역할
**Convert** — 현재 상품이 맞지 않더라도 이탈을 방지하고 다른 전환 기회 제공. "함께 많이 본 상품"으로 Social Proof 가미.

### HTML 구조
```html
<section class="pdp-related" aria-label="관련 상품">
  <div class="pdp-related__inner">
    <h2 class="pdp-section__title">함께 많이 본 상품</h2>

    <div class="pdp-related__scroll">
      <div class="pdp-related__track">
        <a class="pdp-related__card" href="/offers/128492" aria-label="이스탄불 보스포루스 크루즈 디너, 89,000원, 평점 4.7">
          <div class="pdp-related__img-wrap">
            <img class="pdp-related__img" src="related1.webp"
                 alt="보스포루스 해협 야경" loading="lazy">
            <span class="pdp-related__card-badge">인기</span>
          </div>
          <div class="pdp-related__card-body">
            <h3 class="pdp-related__card-title">이스탄불 보스포루스 크루즈 디너</h3>
            <div class="pdp-related__card-rating">
              <span class="pdp-related__card-stars" aria-hidden="true">★</span>
              <span>4.7</span>
              <span class="pdp-related__card-review-count">(89)</span>
            </div>
            <div class="pdp-related__card-price">
              <span class="pdp-related__card-original">₩110,000</span>
              <span class="pdp-related__card-current">₩89,000</span>
            </div>
          </div>
        </a>

        <!-- 추가 카드 (최대 6개) -->
        <a class="pdp-related__card" href="/offers/234567">
          <!-- ... -->
        </a>
      </div>
    </div>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-related {
  padding: var(--pdp-section-gap) 0;    /* 좌우 패딩 없음: 풀와이드 스크롤 */
}
.pdp-related__inner > .pdp-section__title {
  padding: 0 var(--pdp-content-padding);
}
.pdp-related__scroll {
  overflow: hidden;
}
.pdp-related__track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 var(--pdp-content-padding);
  scroll-snap-type: x mandatory;
}
.pdp-related__track::-webkit-scrollbar { display: none; }

/* 카드 */
.pdp-related__card {
  flex: 0 0 calc(50% - 6px);          /* 모바일: 2장 보임 */
  scroll-snap-align: start;
  text-decoration: none;
  color: inherit;
  min-width: 0;
  border-radius: var(--pdp-radius-md);
  overflow: hidden;
  border: 1px solid var(--pdp-border);
  transition: transform var(--pdp-transition), box-shadow var(--pdp-transition);
}
.pdp-related__card:hover {
  transform: translateY(-2px);
  box-shadow: var(--pdp-shadow-md);
}
.pdp-related__card:active {
  transform: scale(0.98);
}

/* 이미지 */
.pdp-related__img-wrap {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}
.pdp-related__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pdp-related__card-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: var(--pdp-primary);
  padding: 2px 8px;
  border-radius: 100px;
}

/* 카드 본문 */
.pdp-related__card-body {
  padding: 10px 12px 12px;
}
.pdp-related__card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--pdp-text);
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pdp-related__card-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--pdp-text-secondary);
  margin-bottom: 6px;
}
.pdp-related__card-stars {
  color: #F59E0B;
}
.pdp-related__card-review-count {
  opacity: 0.7;
}
.pdp-related__card-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.pdp-related__card-original {
  font-size: 12px;
  color: var(--pdp-text-secondary);
  text-decoration: line-through;
}
.pdp-related__card-current {
  font-size: 16px;
  font-weight: 700;
  color: var(--pdp-text);
}

/* 반응형 */
@media (min-width: 769px) {
  .pdp-related__card {
    flex: 0 0 calc(33.33% - 8px);   /* 데스크톱: 3장 */
  }
}
```

### 인터랙션 동작

**JS 필요: NO (CSS scroll-snap만으로 충분)**

선택적 JS: 스크롤 끝에 도달 시 페이드 아웃 효과.

### 데이터 바인딩
```javascript
const relatedProductsData = {
  title: "함께 많이 본 상품",        // 선택
  products: [                         // 필수, 최소 2개, 최대 6개
    {
      id: "128492",
      title: "이스탄불 보스포루스 크루즈 디너",
      image: { url: "...", alt: "..." },
      price: { amount: 89000, currency: "₩" },
      originalPrice: 110000,          // 선택
      rating: { score: 4.7, count: 89 },
      badges: ["인기"],               // 선택
      url: "/offers/128492"           // 필수
    }
  ]
};

// Fallback:
// - products 2개 미만이면: 섹션 전체 비노출
// - 이미지 없으면: placeholder
// - rating 없으면: 별점 영역 비노출
// - badges 없으면: 배지 비노출
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 카드 너비 | 화면의 50% (2장 보임) | 33% (3장 보임) |
| 스크롤 | 가로 스와이프 | 가로 스크롤 또는 화살표 버튼 |
| 터치 타겟 | 카드 전체 (최소 48px 높이) | 클릭 |

### 접근성
- 각 카드: `<a>` 링크, `aria-label`에 상품명+가격+평점 전체 포함
- 이미지: `alt` 필수
- 리스트: 시맨틱한 `<a>` 링크 나열 (카드 컴포넌트)
- 터치 타겟: 최소 48px

---

## 블록 20: cta — CTA 고정바

### 전환 역할
**Convert** — 페이지 어디에서든 예약 행동에 즉시 접근 가능. 저압박 CTA 문구 + 신뢰 텍스트 + 가격으로 전환의 마지막 단계 완성.

### HTML 구조
```html
<div class="pdp-cta" role="complementary" aria-label="예약하기">
  <!-- 소셜 프루프 (선택, CTA 내 통합형) -->
  <div class="pdp-cta__social-proof" role="status" aria-live="polite">
    <span class="pdp-cta__social-text">오늘 23명이 예약했어요</span>
  </div>

  <div class="pdp-cta__bar">
    <!-- 가격 영역 -->
    <div class="pdp-cta__price-area">
      <div class="pdp-cta__price-row">
        <span class="pdp-cta__price-original" aria-label="정가 189,000원">189,000원</span>
        <span class="pdp-cta__price-discount" aria-label="16% 할인">16%</span>
      </div>
      <div class="pdp-cta__price-main">
        <span class="pdp-cta__price-current" aria-label="할인가 159,000원">159,000<small>원</small></span>
        <span class="pdp-cta__price-unit">/ 1인</span>
      </div>
    </div>

    <!-- CTA 버튼 -->
    <button class="pdp-cta__button" type="button">
      날짜 확인하기
    </button>
  </div>

  <!-- 신뢰 텍스트 -->
  <div class="pdp-cta__trust">
    <svg aria-hidden="true" width="12" height="12"><!-- 체크 아이콘 --></svg>
    <span>48시간 전 무료 취소</span>
  </div>
</div>
```

### 핵심 CSS 스펙
```css
/* 하단 고정 */
.pdp-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.1);
  /* iOS safe area */
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* 소셜 프루프 (CTA 상단) */
.pdp-cta__social-proof {
  padding: 4px var(--pdp-content-padding);
  background: #FFFBEB;
  border-bottom: 1px solid #FDE68A;
  text-align: center;
}
.pdp-cta__social-text {
  font-size: 12px;
  color: var(--pdp-text-secondary);
}

/* 메인 바 */
.pdp-cta__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px var(--pdp-content-padding);
}

/* 가격 */
.pdp-cta__price-area {
  flex: 1;
  min-width: 0;
}
.pdp-cta__price-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 1px;
}
.pdp-cta__price-original {
  font-size: 12px;
  color: var(--pdp-text-secondary);
  text-decoration: line-through;
}
.pdp-cta__price-discount {
  font-size: 11px;
  font-weight: 700;
  color: var(--pdp-danger);
  background: #FEF2F2;
  padding: 1px 5px;
  border-radius: 4px;
}
.pdp-cta__price-current {
  font-size: 22px;
  font-weight: 800;
  color: var(--pdp-text);
  letter-spacing: -0.02em;
}
.pdp-cta__price-current small {
  font-size: 14px;
  font-weight: 600;
}
.pdp-cta__price-unit {
  font-size: 12px;
  color: var(--pdp-text-secondary);
  margin-left: 2px;
}

/* 버튼 */
.pdp-cta__button {
  flex-shrink: 0;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: var(--pdp-primary);
  border: none;
  border-radius: var(--pdp-radius-sm);
  cursor: pointer;
  white-space: nowrap;
  min-height: 48px;                  /* 터치 타겟 최소 48px */
  transition: background var(--pdp-transition), transform 100ms ease;
}
.pdp-cta__button:hover {
  background: var(--pdp-primary-dark);
}
.pdp-cta__button:active {
  transform: scale(0.97);
}
/* 비활성 상태 */
.pdp-cta__button:disabled {
  background: #D1D5DB;
  color: #9CA3AF;
  cursor: not-allowed;
}

/* 신뢰 텍스트 */
.pdp-cta__trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px var(--pdp-content-padding);
  border-top: 1px solid #F3F4F6;
}
.pdp-cta__trust svg {
  color: var(--pdp-success);
}
.pdp-cta__trust span {
  font-size: 12px;
  font-weight: 500;
  color: var(--pdp-success);
}
```

### 인터랙션 동작

**JS 필요: YES**

```javascript
function initCta(container) {
  const button = container.querySelector('.pdp-cta__button');

  // 1. 스크롤 시 CTA 바 표시/숨김 (hero 아래로 스크롤하면 등장)
  const hero = document.querySelector('.pdp-hero');
  if (hero) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        container.classList.toggle('pdp-cta--visible', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    observer.observe(hero);
  } else {
    container.classList.add('pdp-cta--visible');
  }

  // 2. 버튼 클릭 → 날짜 선택 바텀시트 또는 스크롤
  button.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('pdp:cta-click', {
      detail: {
        action: button.textContent.trim(),
        price: container.querySelector('.pdp-cta__price-current')?.textContent
      }
    }));
    // 날짜 선택 UI로 스크롤 또는 바텀시트 열기
  });

  // 3. 옵션 선택 이벤트 수신 → 가격 업데이트
  document.addEventListener('pdp:option-selected', (e) => {
    const priceEl = container.querySelector('.pdp-cta__price-current');
    if (priceEl && e.detail.price) {
      priceEl.innerHTML = e.detail.price;
    }
  });
}
```

**CTA 등장 애니메이션:**
```css
.pdp-cta {
  transform: translateY(100%);
  transition: transform 300ms ease;
}
.pdp-cta--visible {
  transform: translateY(0);
}
```

### 데이터 바인딩
```javascript
const ctaData = {
  priceDisplay: {
    originalPrice: 189000,            // 선택 (할인 전)
    currentPrice: 159000,             // 필수
    currency: "원",                   // 필수
    unit: "1인",                      // 필수
    discountPercent: 16               // 선택 (자동 계산 가능)
  },
  buttonText: "날짜 확인하기",         // 필수, 카테고리별 기본값:
  // TOUR: "일정 확인하기"
  // TICKET_THEME: "옵션 선택하기"
  // TICKET_TRANSPORT: "가격 보기"
  // TICKET_CITYPASS: "절약 금액 보기"
  // TICKET_EXPERIENCE: "날짜 확인하기"
  // SERVICE: "예약 가능일 보기"
  // ACTIVITY: "예약 가능일 보기"
  // SEMI_PACKAGE: "견적 확인하기"
  trustText: "48시간 전 무료 취소",    // 선택
  urgencyText: "오늘 23명이 예약했어요" // 선택 (socialProof와 연동)
};

// Fallback:
// - currentPrice 없으면: "가격 확인하기" 버튼만 표시
// - originalPrice 없으면: 할인 표시 없음
// - trustText 없으면: 신뢰 텍스트 영역 비노출
// - urgencyText 없으면: 소셜 프루프 영역 비노출
// - buttonText 없으면: 카테고리별 기본값 사용
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 배치 | `position: fixed; bottom: 0` | 우측 사이드바에 `position: sticky; top: 80px` |
| 구조 | 가격 좌 + 버튼 우 | 세로 스택 (가격 → 버튼 → 신뢰) |
| 버튼 크기 | 높이 48px, 너비 auto | 너비 100%, 높이 52px |
| 소셜 프루프 | CTA 위 한 줄 | CTA 아래 고정 |
| safe area | `padding-bottom: env(safe-area-inset-bottom)` | 불필요 |
| 그림자 | 위쪽 그림자 (부유감) | 박스 테두리 |

```css
/* 데스크톱: 사이드바 CTA */
@media (min-width: 769px) {
  .pdp-cta {
    position: sticky;
    top: 80px;
    bottom: auto;
    width: 320px;
    border-radius: var(--pdp-radius-md);
    border: 1px solid var(--pdp-border);
    box-shadow: var(--pdp-shadow-md);
    transform: none;
    padding-bottom: 0;
  }
  .pdp-cta__bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .pdp-cta__button {
    width: 100%;
  }
}
```

### 접근성
- `role="complementary"` + `aria-label="예약하기"`
- 버튼: 최소 48px 터치 타겟, 명확한 액션 텍스트
- 가격: `aria-label`로 정가/할인가 구분 ("정가 189,000원", "할인가 159,000원")
- 소셜 프루프: `role="status"` + `aria-live="polite"`
- disabled 상태: `aria-disabled="true"`, 시각적으로도 비활성 표시
- 키보드: Tab으로 버튼 접근, Enter/Space로 실행
- safe area: iOS 하단 홈 바 영역 확보

---

## 전체 블록 요약 매트릭스

| # | 블록 | 전환 역할 | JS 필요 | 핵심 인터랙션 | 모바일 특이사항 |
|---|------|----------|:---:|------------|------------|
| 1 | hero | Hook | O | 캐러셀 스와이프 | 4:3 비율, 스와이프 |
| 2 | trustBadges | Hook | △ | 가로 스크롤 | edge-to-edge |
| 3 | highlights | Hook | X | 없음 | 1열 스택 |
| 4 | overview | Convince | O | 더보기/접기 | 3줄 접힘 |
| 5 | optionTable | Convince | O | 카드 선택 | 카드형 (데스크톱: 테이블) |
| 6 | itinerary | Convince | O | 일정 접기 | 4개 초과 시 접기 |
| 7 | inclusions | Reassure | X | 없음 | 1열 (데스크톱: 2열) |
| 8 | imageGrid | Convince | O | 스와이프+라이트박스 | 캐러셀 (데스크톱: 그리드) |
| 9 | guideProfile | Convince | X | 없음 | 세로 스택 |
| 10 | meetingPoint | Reassure | O | 지도 외부 링크 | Google Maps 앱 열기 |
| 11 | usageGuide | Reassure | X | 없음 | 세로 스택 |
| 12 | recommendFor | Convince | X | 없음 | 1열 스택 |
| 13 | comparison | Convert | X | 없음 | 노란 배경 강조 |
| 14 | hotelInfo | Convince | O | 이미지 캐러셀 | 캐러셀 |
| 15 | notice | Reassure | O | 아코디언 | critical 기본 열림 |
| 16 | faq | Reassure | △ | 네이티브 아코디언 | JSON-LD SEO |
| 17 | reviews | Reassure | O | 분포 애니메이션, 라이트박스 | 빈 상태 처리 필수 |
| 18 | socialProof | Convert | O | 메시지 로테이션 | CTA 통합 |
| 19 | relatedProducts | Convert | X | CSS scroll-snap | 2열 스크롤 |
| 20 | cta | Convert | O | 스크롤 연동, 옵션 연동 | fixed 하단, safe area |

O = 필수, △ = 선택적 (기본 동작은 CSS만), X = 불필요
