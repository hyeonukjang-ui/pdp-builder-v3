# PDP 블록 구현 스펙 — Part 2 (블록 8~14)

> Part 1의 공통 규칙/디자인 토큰을 그대로 사용합니다.

---

## 블록 8: imageGrid — 이미지 그리드

### 전환 역할
**Convince** — 비주얼로 기대감을 자극하여 감정적 구매 결정을 유도. 특히 액티비티/서비스 카테고리에서 핵심 역할.

### HTML 구조
```html
<section class="pdp-images" aria-label="상품 이미지 갤러리">
  <div class="pdp-images__inner">
    <h2 class="pdp-section__title">사진으로 미리 보기</h2>

    <!-- 모바일: 가로 스와이프 캐러셀 -->
    <div class="pdp-images__carousel" role="region" aria-roledescription="carousel" aria-label="상품 사진">
      <div class="pdp-images__track">
        <figure class="pdp-images__slide" role="group" aria-roledescription="slide" aria-label="1 / 6">
          <img class="pdp-images__img" src="photo1.webp" alt="고래상어와 스노클링하는 모습"
               loading="lazy" decoding="async">
          <figcaption class="pdp-images__caption">고래상어와 함께하는 스노클링</figcaption>
        </figure>
        <figure class="pdp-images__slide" role="group" aria-roledescription="slide" aria-label="2 / 6">
          <img class="pdp-images__img" src="photo2.webp" alt="투말록 폭포 전경"
               loading="lazy" decoding="async">
          <figcaption class="pdp-images__caption">에메랄드빛 투말록 폭포</figcaption>
        </figure>
      </div>
      <div class="pdp-images__scrollbar" aria-hidden="true">
        <div class="pdp-images__scrollbar-thumb"></div>
      </div>
    </div>

    <!-- 데스크톱: 그리드 (모바일에서 display:none) -->
    <div class="pdp-images__grid">
      <figure class="pdp-images__grid-item">
        <img class="pdp-images__img" src="photo1.webp" alt="고래상어와 스노클링하는 모습"
             loading="lazy" decoding="async">
        <figcaption class="pdp-images__caption">고래상어와 함께하는 스노클링</figcaption>
      </figure>
      <!-- 반복... -->
    </div>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-images {
  padding: var(--pdp-section-gap) 0;  /* 좌우 패딩 없음: 풀 와이드 */
}
.pdp-images__inner > .pdp-section__title {
  padding: 0 var(--pdp-content-padding);
}

/* 모바일: 가로 캐러셀 */
.pdp-images__carousel {
  overflow: hidden;
  position: relative;
}
.pdp-images__track {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 var(--pdp-content-padding);
}
.pdp-images__track::-webkit-scrollbar { display: none; }

.pdp-images__slide {
  flex: 0 0 calc(100% - 48px);       /* 다음 이미지 살짝 보임 */
  scroll-snap-align: start;
  border-radius: var(--pdp-radius-md);
  overflow: hidden;
  margin: 0;
}
.pdp-images__img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  background: #F3F4F6;               /* placeholder 색상 */
}
.pdp-images__caption {
  font-size: 12px;
  color: var(--pdp-text-secondary);
  padding: 8px 0 0;
  text-align: center;
}

/* 스크롤바 인디케이터 */
.pdp-images__scrollbar {
  width: 60px;
  height: 3px;
  background: var(--pdp-border);
  border-radius: 2px;
  margin: 12px auto 0;
  overflow: hidden;
}
.pdp-images__scrollbar-thumb {
  height: 100%;
  background: var(--pdp-primary);
  border-radius: 2px;
  width: 30%;                         /* JS로 동적 계산 */
  transition: transform 100ms linear;
}

/* 데스크톱: 그리드 */
.pdp-images__grid {
  display: none;
}

@media (min-width: 769px) {
  .pdp-images__carousel { display: none; }
  .pdp-images__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 0 var(--pdp-content-padding);
  }
  .pdp-images__grid-item {
    border-radius: var(--pdp-radius-sm);
    overflow: hidden;
    cursor: pointer;
    margin: 0;
    transition: transform var(--pdp-transition);
  }
  .pdp-images__grid-item:hover {
    transform: scale(1.02);
  }
  .pdp-images__grid-item:first-child {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
  }
}
```

### 인터랙션 동작

**JS 필요: YES**

```javascript
function initImageGrid(section) {
  const track = section.querySelector('.pdp-images__track');
  const thumb = section.querySelector('.pdp-images__scrollbar-thumb');
  const slides = section.querySelectorAll('.pdp-images__slide');

  if (!track || !thumb || slides.length === 0) return;

  // 스크롤바 위치 동기화
  const thumbWidth = (track.clientWidth / track.scrollWidth) * 100;
  thumb.style.width = `${thumbWidth}%`;

  track.addEventListener('scroll', () => {
    const progress = track.scrollLeft / (track.scrollWidth - track.clientWidth);
    thumb.style.transform = `translateX(${progress * (100 / thumbWidth * 100 - 100)}%)`;
  }, { passive: true });

  // 이미지 클릭 → 풀스크린 갤러리 (라이트박스)
  const imgs = section.querySelectorAll('.pdp-images__img');
  imgs.forEach((img, index) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      openLightbox(
        Array.from(imgs).map(i => ({ src: i.src, alt: i.alt })),
        index
      );
    });
  });
}

// 라이트박스 (간단 구현)
function openLightbox(images, startIndex) {
  const overlay = document.createElement('div');
  overlay.className = 'pdp-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', '이미지 확대 보기');
  overlay.innerHTML = `
    <button class="pdp-lightbox__close" aria-label="닫기">&times;</button>
    <img class="pdp-lightbox__img" src="${images[startIndex].src}" alt="${images[startIndex].alt}">
    <div class="pdp-lightbox__counter">${startIndex + 1} / ${images.length}</div>
  `;

  let current = startIndex;
  const img = overlay.querySelector('.pdp-lightbox__img');
  const counter = overlay.querySelector('.pdp-lightbox__counter');

  // 스와이프로 이미지 전환
  let startX = 0;
  overlay.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
  overlay.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      current = Math.max(0, Math.min(current + (diff > 0 ? 1 : -1), images.length - 1));
      img.src = images[current].src;
      img.alt = images[current].alt;
      counter.textContent = `${current + 1} / ${images.length}`;
    }
  });

  overlay.querySelector('.pdp-lightbox__close').addEventListener('click', () => {
    overlay.remove();
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  overlay.querySelector('.pdp-lightbox__close').focus();
}
```

**라이트박스 CSS:**
```css
.pdp-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pdp-lightbox__img {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
}
.pdp-lightbox__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  font-size: 24px;
  color: #fff;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}
.pdp-lightbox__counter {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  color: rgba(255,255,255,0.7);
}
```

### 데이터 바인딩
```javascript
const imageGridData = {
  title: "사진으로 미리 보기",       // 선택
  images: [                           // 필수, 최소 2장
    {
      url: "string",
      alt: "string",                  // 필수
      caption: "string"              // 선택
    }
  ],
  layout: "carousel"                  // "carousel" | "grid" (기본: 모바일 carousel, 데스크톱 grid)
};

// Fallback:
// - images 비어있거나 1장: 섹션 전체 비노출
// - caption 없으면: figcaption 비노출
// - alt 없으면: "상품 이미지" 기본값 (접근성 최소 보장)
// - 이미지 로드 실패: 회색 placeholder + "이미지를 불러올 수 없습니다"
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 레이아웃 | 가로 스와이프 캐러셀 | 2~3열 그리드 |
| 이미지 비율 | 4:3 | 4:3 |
| 다음 이미지 미리보기 | 우측에 살짝 보임 | N/A |
| 풀스크린 | 탭 → 라이트박스 | 클릭 → 라이트박스 |
| lazy loading | 화면 밖 이미지 lazy | 화면 밖 이미지 lazy |

### 접근성
- 캐러셀: `role="region"`, `aria-roledescription="carousel"`
- 각 슬라이드: `<figure>`, `<figcaption>` 시맨틱 사용
- 이미지: 모두 의미 있는 `alt` 필수
- 라이트박스: `role="dialog"`, `aria-label`, Escape로 닫기, 포커스 트래핑

---

## 블록 9: guideProfile — 가이드 소개

### 전환 역할
**Convince** — Authority Bias 활용. "누가 안내하는가"가 투어 구매의 핵심 변수. 가이드 신뢰 형성 후 일정을 보면 "이 가이드가 안내하는 이 코스" 프레이밍 효과.

### HTML 구조
```html
<section class="pdp-guide" aria-label="가이드 소개">
  <div class="pdp-guide__inner">
    <h2 class="pdp-section__title">가이드 소개</h2>

    <div class="pdp-guide__profile">
      <img class="pdp-guide__photo" src="guide.jpg" alt="가이드 김서연"
           loading="lazy" width="64" height="64">
      <div class="pdp-guide__info">
        <div class="pdp-guide__name-row">
          <h3 class="pdp-guide__name">김서연</h3>
          <span class="pdp-guide__badge">인기 가이드</span>
          <span class="pdp-guide__badge">전문 가이드</span>
        </div>
        <p class="pdp-guide__experience">이스탄불 거주 12년 · 투어 2,000회+</p>
        <div class="pdp-guide__languages" aria-label="가이드 사용 언어">
          <span class="pdp-guide__lang">한국어</span>
          <span class="pdp-guide__lang">English</span>
          <span class="pdp-guide__lang">Turkce</span>
        </div>
      </div>
    </div>

    <blockquote class="pdp-guide__intro">
      <p>"이스탄불에서 12년째 살고 있는 김서연입니다. 터키 역사학을 전공했고, 2,000회 이상의 투어를 진행했어요. '교과서에 없는 이스탄불'을 보여드릴게요."</p>
    </blockquote>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-guide {
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
}

/* 프로필 카드 */
.pdp-guide__profile {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.pdp-guide__photo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--pdp-primary-light);
  flex-shrink: 0;
}
.pdp-guide__info {
  flex: 1;
  min-width: 0;
}
.pdp-guide__name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.pdp-guide__name {
  font-size: 17px;
  font-weight: 700;
  color: var(--pdp-text);
}
.pdp-guide__badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  background: var(--pdp-primary-light);
  color: var(--pdp-primary);
  border-radius: 100px;
}
.pdp-guide__experience {
  font-size: 13px;
  color: var(--pdp-text-secondary);
  margin-bottom: 6px;
}
.pdp-guide__languages {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.pdp-guide__lang {
  font-size: 11px;
  padding: 2px 8px;
  background: #F3F4F6;
  color: var(--pdp-text-secondary);
  border-radius: 4px;
}

/* 자기소개 (인용문) */
.pdp-guide__intro {
  padding: 16px;
  background: #F9FAFB;
  border-radius: var(--pdp-radius-sm);
  border-left: 3px solid var(--pdp-primary);
  margin: 0;
}
.pdp-guide__intro p {
  font-size: 14px;
  color: var(--pdp-text-secondary);
  line-height: 1.65;
  font-style: italic;
  margin: 0;
}
```

### 인터랙션 동작

**JS 필요: NO**

정적 콘텐츠. 인터랙션 없음.

### 데이터 바인딩
```javascript
const guideProfileData = {
  name: "김서연",                    // 필수
  photo: { url: "...", alt: "..." }, // 선택
  title: "한국어 전문 가이드",       // 선택
  experience: "이스탄불 거주 12년",  // 선택
  languages: ["한국어", "English"],  // 선택
  introduction: "이스탄불에서 12년째...", // 선택, 최대 200자
  certifications: ["인기 가이드"],   // 선택
};

// Fallback:
// - name만 있으면: 이름만 표시, 나머지 비노출
// - photo 없으면: 기본 아바타 아이콘 (회색 원 + 사람 아이콘)
// - languages 비어있으면: 언어 태그 영역 비노출
// - introduction 없으면: 인용문 영역 비노출
// - 가이드 데이터 자체가 없으면: 섹션 전체 비노출
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 사진 크기 | 64px | 80px |
| 레이아웃 | 세로 스택 | 좌측 프로필 + 우측 소개 (가로 배치) |
| 이름 크기 | 17px | 18px |

### 접근성
- 사진: 의미 있는 `alt` ("가이드 김서연")
- 배지: 텍스트로 의미 전달, 색상 의존 아님
- 소개: `<blockquote>` 시맨틱 마크업
- 언어 목록: `aria-label="가이드 사용 언어"`

---

## 블록 10: meetingPoint — 집합/픽업 장소

### 전환 역할
**Reassure** — CS 문의 1위 "어디서 만나요?"를 사전 해결. 지도와 교통편 정보로 도착 불안 해소.

### HTML 구조
```html
<section class="pdp-meeting" aria-label="집합 장소 안내">
  <div class="pdp-meeting__inner">
    <h2 class="pdp-section__title">집합 장소</h2>

    <!-- 지도 영역 -->
    <div class="pdp-meeting__map">
      <img class="pdp-meeting__map-img"
           src="https://maps.googleapis.com/maps/api/staticmap?center=41.0082,28.9784&zoom=15&size=640x200&scale=2&markers=color:blue|41.0082,28.9784&key=..."
           alt="집합 장소 지도: 술탄아흐메트 광장 근처"
           loading="lazy">
      <button class="pdp-meeting__map-btn" aria-label="구글 지도에서 집합 장소 보기">
        <svg aria-hidden="true" width="16" height="16"><!-- 외부 링크 아이콘 --></svg>
        지도에서 보기
      </button>
    </div>

    <!-- 주소 + 교통편 -->
    <div class="pdp-meeting__details">
      <div class="pdp-meeting__address">
        <svg class="pdp-meeting__icon" aria-hidden="true" width="16" height="16"><!-- 핀 아이콘 --></svg>
        <div>
          <strong class="pdp-meeting__place">술탄아흐메트 광장 분수대 앞</strong>
          <p class="pdp-meeting__addr">Sultanahmet Sq, Fatih, Istanbul 34122, Turkiye</p>
        </div>
      </div>

      <div class="pdp-meeting__transport">
        <svg class="pdp-meeting__icon" aria-hidden="true" width="16" height="16"><!-- 교통 아이콘 --></svg>
        <div>
          <strong class="pdp-meeting__transport-title">교통편 안내</strong>
          <p class="pdp-meeting__transport-desc">트램 T1 술탄아흐메트역 하차, 도보 2분. 광장 중앙의 큰 분수대가 랜드마크입니다.</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-meeting {
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
}

/* 지도 영역 */
.pdp-meeting__map {
  position: relative;
  border-radius: var(--pdp-radius-md);
  overflow: hidden;
  margin-bottom: 16px;
}
.pdp-meeting__map-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
  background: #F3F4F6;
}
.pdp-meeting__map-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--pdp-primary);
  background: #fff;
  border: 1px solid var(--pdp-border);
  border-radius: var(--pdp-radius-sm);
  cursor: pointer;
  box-shadow: var(--pdp-shadow-sm);
  transition: background var(--pdp-transition);
}
.pdp-meeting__map-btn:hover {
  background: var(--pdp-primary-light);
}

/* 주소 + 교통편 */
.pdp-meeting__details {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.pdp-meeting__address,
.pdp-meeting__transport {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.pdp-meeting__icon {
  flex-shrink: 0;
  color: var(--pdp-primary);
  margin-top: 2px;
}
.pdp-meeting__place {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--pdp-text);
  margin-bottom: 2px;
}
.pdp-meeting__addr {
  font-size: 13px;
  color: var(--pdp-text-secondary);
  line-height: 1.4;
  margin: 0;
}
.pdp-meeting__transport-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--pdp-text);
  margin-bottom: 2px;
}
.pdp-meeting__transport-desc {
  font-size: 13px;
  color: var(--pdp-text-secondary);
  line-height: 1.55;
  margin: 0;
}
```

### 인터랙션 동작

**JS 필요: YES (지도 버튼만)**

```javascript
function initMeetingPoint(section) {
  const mapBtn = section.querySelector('.pdp-meeting__map-btn');
  if (!mapBtn) return;

  mapBtn.addEventListener('click', () => {
    const lat = section.dataset.lat;
    const lng = section.dataset.lng;
    if (lat && lng) {
      // 모바일: 네이티브 지도 앱으로 열기
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      const url = isMobile
        ? `https://maps.google.com/maps?q=${lat},${lng}`
        : `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank', 'noopener');
    }
  });
}
```

### 데이터 바인딩
```javascript
const meetingPointData = {
  type: "meeting",                    // "meeting" | "pickup" | "e_ticket"
  title: "집합 장소",                 // 선택, type에 따라 기본값 변경
  address: "Sultanahmet Sq, Fatih, Istanbul",  // 필수
  placeName: "술탄아흐메트 광장 분수대 앞",     // 선택
  description: "트램 T1 술탄아흐메트역 하차, 도보 2분.",  // 선택
  coordinates: { lat: 41.0082, lng: 28.9784 },  // 선택
  mapImage: { url: "...", alt: "..." }  // 선택
};

// Fallback:
// - type="e_ticket"이면: "전자 티켓으로 입장" 안내 + 지도 영역 비노출
// - type="pickup"이면: 제목을 "픽업 장소"로 변경
// - coordinates 없으면: 지도 이미지 대신 정적 placeholder
// - mapImage 없으면: Google Static Maps API로 자동 생성 (coordinates 필요)
// - address만 있으면: 주소만 표시, 지도/교통편 비노출
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 지도 높이 | 180px | 240px |
| 레이아웃 | 세로 스택 | 좌측 지도 + 우측 텍스트 (가로) |
| "지도에서 보기" | Google Maps 앱 열기 | Google Maps 새 탭 |

### 접근성
- 지도 이미지: 의미 있는 `alt` (위치 설명 포함)
- "지도에서 보기" 버튼: `aria-label="구글 지도에서 집합 장소 보기"`
- 주소: 복사 가능한 텍스트 (이미지가 아님)
- 아이콘: `aria-hidden="true"`

---

## 블록 11: usageGuide — 이용방법

### 전환 역할
**Reassure** — "어떻게 쓰는 거야?" CS 문의를 사전 차단. 특히 교통 티켓에서 이용방법이 가장 중요한 정보.

### HTML 구조
```html
<section class="pdp-usage" aria-label="이용 방법">
  <div class="pdp-usage__inner">
    <h2 class="pdp-section__title">이용 방법</h2>

    <ol class="pdp-usage__steps" role="list">
      <li class="pdp-usage__step">
        <div class="pdp-usage__num" aria-hidden="true">
          <span>1</span>
        </div>
        <div class="pdp-usage__body">
          <h3 class="pdp-usage__step-title">예약 완료</h3>
          <p class="pdp-usage__step-desc">결제 후 이메일로 QR코드가 즉시 발송됩니다.</p>
        </div>
      </li>

      <li class="pdp-usage__step">
        <div class="pdp-usage__num" aria-hidden="true">
          <span>2</span>
        </div>
        <div class="pdp-usage__body">
          <h3 class="pdp-usage__step-title">QR코드 준비</h3>
          <p class="pdp-usage__step-desc">입장 당일, 이메일의 QR코드를 스마트폰에 준비하세요. 프린트 불필요.</p>
        </div>
      </li>

      <li class="pdp-usage__step">
        <div class="pdp-usage__num" aria-hidden="true">
          <span>3</span>
        </div>
        <div class="pdp-usage__body">
          <h3 class="pdp-usage__step-title">바로 입장</h3>
          <p class="pdp-usage__step-desc">입장 게이트의 QR 스캐너에 대면 바로 입장 완료!</p>
        </div>
      </li>
    </ol>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-usage {
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
}
.pdp-usage__steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: step;
}
.pdp-usage__step {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.pdp-usage__num {
  width: 36px;
  height: 36px;
  background: var(--pdp-primary-light);
  color: var(--pdp-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  flex-shrink: 0;
}
.pdp-usage__body {
  flex: 1;
  min-width: 0;
  padding-top: 6px;
}
.pdp-usage__step-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--pdp-text);
  margin-bottom: 4px;
}
.pdp-usage__step-desc {
  font-size: 14px;
  color: var(--pdp-text-secondary);
  line-height: 1.55;
  margin: 0;
}

/* 커넥터 라인 (선택 구현) */
.pdp-usage__step:not(:last-child) .pdp-usage__num::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  width: 2px;
  height: calc(100% + 16px);       /* gap 만큼 */
  background: var(--pdp-border);
  transform: translateX(-50%);
}
/* 커넥터를 쓰려면 .pdp-usage__num에 position:relative 추가 필요 */
```

### 인터랙션 동작

**JS 필요: NO**

정적 리스트.

### 데이터 바인딩
```javascript
const usageGuideData = {
  title: "이용 방법",                // 선택, 기본값: "이용 방법"
  steps: [                           // 필수, 최소 2개
    {
      step: 1,                       // 순서 번호
      title: "예약 완료",            // 필수
      description: "결제 후 이메일로 QR코드가 즉시 발송됩니다.",  // 필수
      icon: "📧"                     // 선택 (있으면 번호 대신 아이콘)
    }
  ]
};

// Fallback:
// - steps 비어있으면: 섹션 전체 비노출
// - icon 있으면: 번호 대신 이모지/아이콘 표시
// - description 없으면: 제목만 표시
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 레이아웃 | 세로 스택 | 세로 스택 (동일) 또는 3열 가로 |
| 넘버 크기 | 36px | 40px |

```css
@media (min-width: 769px) {
  .pdp-usage__steps {
    flex-direction: row;
    gap: 24px;
  }
  .pdp-usage__step {
    flex-direction: column;
    align-items: center;
    text-align: center;
    flex: 1;
  }
}
```

### 접근성
- `<ol>` 순서 리스트 사용
- 넘버: `aria-hidden="true"` (ol이 순서 전달)
- 충분한 텍스트 색상 대비

---

## 블록 12: recommendFor — 추천 대상

### 전환 역할
**Convince** — "나한테 맞는 상품인가?"를 타겟 페르소나로 답변. 자기 투영(Self-referencing) 효과로 구매 확신 강화.

### HTML 구조
```html
<section class="pdp-recommend" aria-label="추천 대상">
  <div class="pdp-recommend__inner">
    <h2 class="pdp-section__title">이런 분에게 추천해요</h2>

    <ul class="pdp-recommend__list" role="list">
      <li class="pdp-recommend__item">
        <span class="pdp-recommend__emoji" aria-hidden="true">🌊</span>
        <span class="pdp-recommend__text">버킷리스트에 "고래상어와 수영"이 있는 분</span>
      </li>
      <li class="pdp-recommend__item">
        <span class="pdp-recommend__emoji" aria-hidden="true">👨‍👩‍👧</span>
        <span class="pdp-recommend__text">가족과 함께 특별한 자연 체험을 원하는 분</span>
      </li>
      <li class="pdp-recommend__item">
        <span class="pdp-recommend__emoji" aria-hidden="true">📸</span>
        <span class="pdp-recommend__text">SNS용 인생샷을 남기고 싶은 분</span>
      </li>
    </ul>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-recommend {
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
  background: #F9FAFB;
}
.pdp-recommend__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}
.pdp-recommend__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border-radius: var(--pdp-radius-sm);
  font-size: 14px;
  color: var(--pdp-text);
  line-height: 1.5;
}
.pdp-recommend__emoji {
  font-size: 22px;
  flex-shrink: 0;
  width: 28px;
  text-align: center;
}
.pdp-recommend__text {
  flex: 1;
}
```

### 인터랙션 동작

**JS 필요: NO**

### 데이터 바인딩
```javascript
const recommendForData = {
  title: "이런 분에게 추천해요",     // 선택
  targets: [                          // 필수, 2~5개
    { icon: "🌊", text: "버킷리스트에 '고래상어와 수영'이 있는 분" }
  ]
};

// Fallback:
// - targets 비어있으면: 섹션 전체 비노출
// - icon 없으면: "👤" 기본 아이콘
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 레이아웃 | 1열 세로 | 2열 그리드 |
| 배경 | 회색 풀와이드 | 콘텐츠 너비 내 |

### 접근성
- 이모지: `aria-hidden="true"`
- 리스트: `<ul>` + `role="list"`

---

## 블록 13: comparison — 비교/절약

### 전환 역할
**Convert** — 가격 앵커링(Anchoring Bias)으로 "이게 진짜 이득인가?" 해소. 시티패스 필수 블록. 개별 구매 총액 vs 패키지 가격을 시각적으로 대비.

### HTML 구조
```html
<section class="pdp-comparison" aria-label="가격 비교">
  <div class="pdp-comparison__inner">
    <h2 class="pdp-section__title">개별 구매보다 <strong class="pdp-comparison__savings-inline">₩32,000</strong> 절약</h2>

    <div class="pdp-comparison__table" role="table" aria-label="개별 구매 대비 절약 금액">
      <div class="pdp-comparison__header" role="row">
        <span role="columnheader">포함 항목</span>
        <span role="columnheader">개별 구매 시</span>
        <span role="columnheader">이 상품</span>
      </div>

      <div class="pdp-comparison__row" role="row">
        <span class="pdp-comparison__item-name" role="cell">에펠탑 입장권</span>
        <span class="pdp-comparison__item-individual" role="cell">₩28,000</span>
        <span class="pdp-comparison__item-included" role="cell">
          <svg aria-hidden="true" width="16" height="16"><path d="M4 8l3 3 5-5" stroke="#059669" stroke-width="2" fill="none"/></svg>
          포함
        </span>
      </div>

      <div class="pdp-comparison__row" role="row">
        <span class="pdp-comparison__item-name" role="cell">루브르 박물관</span>
        <span class="pdp-comparison__item-individual" role="cell">₩22,000</span>
        <span class="pdp-comparison__item-included" role="cell">
          <svg aria-hidden="true" width="16" height="16"><path d="M4 8l3 3 5-5" stroke="#059669" stroke-width="2" fill="none"/></svg>
          포함
        </span>
      </div>

      <div class="pdp-comparison__row" role="row">
        <span class="pdp-comparison__item-name" role="cell">세느강 유람선</span>
        <span class="pdp-comparison__item-individual" role="cell">₩18,000</span>
        <span class="pdp-comparison__item-included" role="cell">
          <svg aria-hidden="true" width="16" height="16"><path d="M4 8l3 3 5-5" stroke="#059669" stroke-width="2" fill="none"/></svg>
          포함
        </span>
      </div>
    </div>

    <!-- 총액 비교 -->
    <div class="pdp-comparison__total">
      <div class="pdp-comparison__total-row">
        <span>개별 구매 합계</span>
        <span class="pdp-comparison__total-individual">₩68,000</span>
      </div>
      <div class="pdp-comparison__total-row pdp-comparison__total-row--package">
        <span>이 상품 가격</span>
        <span class="pdp-comparison__total-package">₩36,000</span>
      </div>
      <div class="pdp-comparison__savings">
        <span class="pdp-comparison__savings-label">절약 금액</span>
        <span class="pdp-comparison__savings-amount">₩32,000</span>
        <span class="pdp-comparison__savings-percent">47% 절약</span>
      </div>
    </div>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-comparison {
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
  background: linear-gradient(180deg, #FFFBEB 0%, #FFF 100%);  /* 주의 끌기 */
}
.pdp-comparison__savings-inline {
  color: var(--pdp-danger);
}

/* 비교 테이블 */
.pdp-comparison__table {
  margin-bottom: 16px;
}
.pdp-comparison__header {
  display: grid;
  grid-template-columns: 1fr 80px 80px;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 2px solid var(--pdp-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--pdp-text-secondary);
}
.pdp-comparison__row {
  display: grid;
  grid-template-columns: 1fr 80px 80px;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid #F3F4F6;
  font-size: 14px;
  align-items: center;
}
.pdp-comparison__item-name {
  color: var(--pdp-text);
  font-weight: 500;
}
.pdp-comparison__item-individual {
  color: var(--pdp-text-secondary);
  text-align: right;
}
.pdp-comparison__item-included {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--pdp-success);
  font-size: 13px;
  font-weight: 600;
  justify-content: flex-end;
}

/* 총액 비교 */
.pdp-comparison__total {
  background: #fff;
  border: 2px solid var(--pdp-border);
  border-radius: var(--pdp-radius-md);
  padding: 16px;
  margin-top: 16px;
}
.pdp-comparison__total-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--pdp-text-secondary);
  padding: 6px 0;
}
.pdp-comparison__total-individual {
  text-decoration: line-through;
  color: var(--pdp-text-secondary);
}
.pdp-comparison__total-row--package {
  font-weight: 700;
  color: var(--pdp-text);
  font-size: 16px;
}
.pdp-comparison__total-package {
  color: var(--pdp-primary);
  font-weight: 800;
  font-size: 18px;
}

/* 절약 금액 강조 */
.pdp-comparison__savings {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px dashed var(--pdp-danger);
}
.pdp-comparison__savings-label {
  font-size: 13px;
  color: var(--pdp-text-secondary);
}
.pdp-comparison__savings-amount {
  font-size: 22px;
  font-weight: 800;
  color: var(--pdp-danger);
}
.pdp-comparison__savings-percent {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: var(--pdp-danger);
  padding: 2px 8px;
  border-radius: 100px;
}
```

### 인터랙션 동작

**JS 필요: NO**

정적 콘텐츠. 금액 계산은 렌더링 시 서버/클라이언트에서 수행.

### 데이터 바인딩
```javascript
const comparisonData = {
  title: "개별 구매보다 ₩32,000 절약",  // 자동 생성
  items: [                               // 필수, 최소 2개
    {
      name: "에펠탑 입장권",
      individualPrice: 28000,
      included: true
    }
  ],
  totalIndividual: 68000,               // 자동 합산 또는 수동
  packagePrice: 36000,                  // 필수
  savings: 32000,                       // 자동 계산
  savingsPercent: 47                    // 자동 계산
};

// Fallback:
// - items 비어있거나 packagePrice 없으면: 섹션 전체 비노출
// - savings가 0 이하이면: 섹션 비노출 (절약이 없으면 보여줄 이유 없음)
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 테이블 너비 | 100% (가로 스크롤 불필요하게 컬럼 최소화) | 100%, 여유로운 컬럼 |
| 절약 금액 | 22px bold | 28px bold |
| 배경 | 노란색 그라디언트 | 동일 |

### 접근성
- `role="table"`, `role="row"`, `role="cell"`, `role="columnheader"`
- 절약 금액: 충분히 큰 폰트로 시각적 강조, 색상만 의존 아님(텍스트 "절약")
- 취소선 가격: 스크린리더가 인식할 수 있도록 `aria-label` 사용 고려

---

## 블록 14: hotelInfo — 숙소 안내

### 전환 역할
**Convince** — 세미패키지에서 숙소가 구매 결정의 핵심 요소. 호텔 품질, 어메니티, 위치를 한눈에 보여주어 "이 가격에 이 호텔이면 괜찮다"는 확신.

### HTML 구조
```html
<section class="pdp-hotel" aria-label="숙소 안내">
  <div class="pdp-hotel__inner">
    <h2 class="pdp-section__title">숙소 안내</h2>

    <!-- 호텔 이미지 캐러셀 -->
    <div class="pdp-hotel__carousel" role="region" aria-roledescription="carousel" aria-label="숙소 사진">
      <div class="pdp-hotel__track">
        <div class="pdp-hotel__slide">
          <img class="pdp-hotel__img" src="hotel1.webp" alt="호텔 외관" loading="lazy">
        </div>
        <div class="pdp-hotel__slide">
          <img class="pdp-hotel__img" src="hotel2.webp" alt="호텔 객실" loading="lazy">
        </div>
      </div>
      <div class="pdp-hotel__dots" role="tablist">
        <button class="pdp-hotel__dot pdp-hotel__dot--active" role="tab" aria-selected="true"></button>
        <button class="pdp-hotel__dot" role="tab" aria-selected="false"></button>
      </div>
    </div>

    <!-- 호텔 정보 -->
    <div class="pdp-hotel__info">
      <div class="pdp-hotel__name-row">
        <h3 class="pdp-hotel__name">카파도키아 케이브 리조트</h3>
        <div class="pdp-hotel__stars" aria-label="4성급">
          <span aria-hidden="true">★★★★</span>
        </div>
      </div>

      <!-- 어메니티 -->
      <div class="pdp-hotel__amenities" aria-label="편의시설">
        <span class="pdp-hotel__amenity">
          <svg aria-hidden="true" width="14" height="14"><!-- 와이파이 --></svg>
          Wi-Fi
        </span>
        <span class="pdp-hotel__amenity">
          <svg aria-hidden="true" width="14" height="14"><!-- 조식 --></svg>
          조식 포함
        </span>
        <span class="pdp-hotel__amenity">
          <svg aria-hidden="true" width="14" height="14"><!-- 수영장 --></svg>
          수영장
        </span>
        <span class="pdp-hotel__amenity">
          <svg aria-hidden="true" width="14" height="14"><!-- 주차 --></svg>
          무료 주차
        </span>
      </div>

      <!-- 체크인/아웃 -->
      <div class="pdp-hotel__times">
        <div class="pdp-hotel__time">
          <span class="pdp-hotel__time-label">체크인</span>
          <span class="pdp-hotel__time-value">15:00</span>
        </div>
        <div class="pdp-hotel__time-divider" aria-hidden="true"></div>
        <div class="pdp-hotel__time">
          <span class="pdp-hotel__time-label">체크아웃</span>
          <span class="pdp-hotel__time-value">11:00</span>
        </div>
      </div>

      <!-- 주소 -->
      <p class="pdp-hotel__address">
        <svg aria-hidden="true" width="14" height="14"><!-- 핀 --></svg>
        Goreme, Nevsehir 50180, Turkiye
      </p>
    </div>

    <!-- 추가 설명 (선택) -->
    <p class="pdp-hotel__desc">카파도키아 동굴 지형을 활용한 유니크한 리조트. 옥상 테라스에서 열기구 뷰를 감상할 수 있습니다.</p>
  </div>
</section>
```

### 핵심 CSS 스펙
```css
.pdp-hotel {
  padding: var(--pdp-section-gap) var(--pdp-content-padding);
}

/* 캐러셀 */
.pdp-hotel__carousel {
  position: relative;
  border-radius: var(--pdp-radius-md);
  overflow: hidden;
  margin-bottom: 16px;
}
.pdp-hotel__track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.pdp-hotel__track::-webkit-scrollbar { display: none; }
.pdp-hotel__slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
}
.pdp-hotel__img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}
.pdp-hotel__dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
}
.pdp-hotel__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  border: none;
  padding: 0;
  cursor: pointer;
}
.pdp-hotel__dot--active {
  background: #fff;
  width: 16px;
  border-radius: 3px;
}

/* 호텔 정보 */
.pdp-hotel__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.pdp-hotel__name {
  font-size: 17px;
  font-weight: 700;
  color: var(--pdp-text);
}
.pdp-hotel__stars {
  color: #F59E0B;
  font-size: 14px;
}

/* 어메니티 */
.pdp-hotel__amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.pdp-hotel__amenity {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--pdp-text-secondary);
  padding: 4px 10px;
  background: #F3F4F6;
  border-radius: 100px;
}

/* 체크인/아웃 */
.pdp-hotel__times {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  padding: 12px;
  background: #F9FAFB;
  border-radius: var(--pdp-radius-sm);
}
.pdp-hotel__time {
  text-align: center;
  flex: 1;
}
.pdp-hotel__time-label {
  display: block;
  font-size: 12px;
  color: var(--pdp-text-secondary);
  margin-bottom: 2px;
}
.pdp-hotel__time-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--pdp-text);
}
.pdp-hotel__time-divider {
  width: 1px;
  height: 32px;
  background: var(--pdp-border);
}

/* 주소 */
.pdp-hotel__address {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--pdp-text-secondary);
  margin-bottom: 12px;
}

/* 추가 설명 */
.pdp-hotel__desc {
  font-size: 14px;
  color: var(--pdp-text-secondary);
  line-height: 1.6;
}
```

### 인터랙션 동작

**JS 필요: YES (캐러셀)**

hero의 캐러셀과 동일한 패턴(터치 스와이프 + 도트 클릭). `initHeroCarousel()` 함수를 재사용하되 셀렉터만 변경.

```javascript
function initHotelCarousel(container) {
  // initHeroCarousel과 동일한 로직 적용
  // 셀렉터: .pdp-hotel__track, .pdp-hotel__dot, .pdp-hotel__slide
  initCarousel(container, {
    trackSelector: '.pdp-hotel__track',
    dotSelector: '.pdp-hotel__dot',
    slideSelector: '.pdp-hotel__slide'
  });
}
```

### 데이터 바인딩
```javascript
const hotelInfoData = {
  name: "카파도키아 케이브 리조트",  // 필수
  starRating: 4,                     // 선택 (1~5)
  images: [                          // 선택, 최소 1장 권장
    { url: "...", alt: "호텔 외관" }
  ],
  amenities: ["Wi-Fi", "조식 포함", "수영장"],  // 선택
  checkIn: "15:00",                  // 선택
  checkOut: "11:00",                 // 선택
  address: "Goreme, Nevsehir...",    // 선택
  description: "카파도키아 동굴 지형을..."  // 선택
};

// Fallback:
// - name만 있으면: 이름만 표시
// - images 비어있으면: 이미지 캐러셀 비노출
// - amenities 비어있으면: 어메니티 영역 비노출
// - checkIn/checkOut 없으면: 시간 영역 비노출
// - 호텔 데이터 자체가 없으면: 섹션 전체 비노출
```

### 모바일 vs 데스크톱
| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 이미지 | 캐러셀 | 좌측 큰 이미지 + 우측 작은 이미지 2장 |
| 레이아웃 | 세로 스택 | 이미지 좌측 + 정보 우측 |
| 어메니티 | 가로 스크롤 가능 | wrap |

### 접근성
- 별점: `aria-label="4성급"`, 별 아이콘은 `aria-hidden`
- 캐러셀: hero와 동일한 접근성 패턴
- 어메니티: 텍스트 + 아이콘 (아이콘만 의존 X)
- 체크인/아웃: 레이블 + 값 쌍으로 명확

---

> Part 3 (블록 15~20)에서 이어집니다.
