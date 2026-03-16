# MRT 상품 페이지 테크니컬 리서치 결과

> 테크니컬 리서치 전문가 관점 | 2026-03-16

---

## 1. 페이지 기술 스택 (실제 확인)

| 항목 | 결과 |
|------|------|
| **프레임워크** | **Ruby on Rails v11.0.9** (Next.js 아님!) |
| **프론트엔드** | **React on Rails** + Turbolinks (하이브리드) |
| **렌더링** | **SSR** — HTML에 모든 데이터가 포함됨 |
| **`__NEXT_DATA__`** | **없음** (Next.js 아님) |
| **JSON-LD** | **없음** |
| **CDN** | `d2ur7st6jjikze.cloudfront.net` (이미지), `dffoxz5he03rp.cloudfront.net` (정적 자산) |

**핵심 발견**: MRT는 Next.js가 아니라 **Rails SSR + React on Rails** 구조. React 컴포넌트에 props로 넘기는 JSON 데이터가 `<script type="application/json" class="js-react-on-rails-component">` 태그 안에 그대로 노출된다.

---

## 2. 데이터 추출 소스

### 2-1. React on Rails 컴포넌트 데이터 (핵심 소스) ★

페이지에 4개의 React 컴포넌트가 SSR로 렌더링됨:

```
AppDownloadBanner  → {} (빈 객체)
Header             → 유저 정보, 네비게이션
Offer              → ★ 모든 상품 데이터 ★
Footer             → 유저 정보
```

**추출 방법**:
```javascript
// CSS 셀렉터
document.querySelector('script[data-component-name="Offer"]')

// 또는 정규식
/data-component-name="Offer"[^>]*>(.*?)<\/script>/
```

### 2-2. OG 메타 태그

3개 상품 모두 일관되게 확인:

| 메타 태그 | 예시 |
|----------|------|
| `og:title` | `"이스탄불 박물관·미술관 입장권 - 마담 투소 이스탄불 입장권"` |
| `og:description` | 상품 소개 텍스트 (말줄임) |
| `og:image` | `https://d2ur7st6jjikze.cloudfront.net/offer_photos/...` |
| `og:url` | `https://www.myrealtrip.com/offers/129381` |

**og:title 패턴**: `{도시} {서브카테고리} - {상품 제목}`

### 2-3. 전역 JS 변수

```javascript
window.App = window.App || {};
var WISH_IDS = [];
var WISH_NUM = 2;
var IS_DOMESTIC = false;
var IS_USER_LOGIN = false;
```

### 2-4. Rails Context

```html
<script type="application/json" id="js-react-on-rails-context">
{
  "railsEnv": "production",
  "rorVersion": "11.0.9",
  "href": "https://www.myrealtrip.com/offers/129381"
}
</script>
```

---

## 3. Offer 컴포넌트 JSON — 추출 가능 필드 전체 매핑

| 필드 | JSON 경로 | 예시 |
|------|----------|------|
| 상품 ID | `offerInfo.id` | `129381` |
| 글로벌 PID | `offer.gpid` | `"OFF129381"` |
| **상품 제목** | `offerInfo.title` | `"마담 투소 이스탄불 입장권"` |
| **부제목** | `offerInfo.subtitle` | `"역사적 인물과..."` |
| **상세 소개** | `offerInfo.introduction` | (HTML 포함 긴 텍스트) |
| 판매 상태 | `offerInfo.status` | `"판매중"`, `"휴면중"` |
| **현재 가격** | `price.changedPrice` / `offer.price.main` | `36100.0` |
| **원래 가격** | `price.mainPrice` / `offer.price.origin` | `null` 또는 `0` |
| 가격 단위 | `offerInfo.price_unit_title` | `"명"` |
| 할인 여부 | `offer.price.includeDiscount` | `true` |
| **평점** | `offerInfo.score` / `offer.review.star` | `4.7` |
| **리뷰 수 (MRT)** | `offerInfo.total_traveler_reviews` | `3` |
| **리뷰 수 (통합)** | `offer.review.count` | `7` |
| 리뷰 타입 | `offer.review.type` | `"istanbul"` / `"mrt"` |
| 리뷰 점수 분포 | `reviewScores[].score/count` | `[{score:5,count:2},...]` |
| 개별 리뷰 | `reviews[]` | `{id, message, score, user, createdAt}` |
| **카테고리 (raw)** | `offerInfo.category` | `"ticket"`, `"guide_tour"` |
| **카테고리 (표시)** | `offer.category` | `"티켓/패스"`, `"가이드 투어"` |
| **1차 분류** | `standardCategory.firstStandardCategoryCode` | `"TICKET"` |
| **2차 분류** | `standardCategory.secondStandardCategoryCode` | `"ADMISSION_TICKET"` |
| **3차 분류** | `standardCategory.thirdStandardCategoryCode` | `"MUSEUM"` |
| 태그 | `offerInfo.tag_list` | `["박물관/미술관", "근교"]` |
| 디스플레이 태그 | `displayTags[].title` | `["즉시확정", "무이자 할부"]` |
| **사진 URL** | `photos[]` | CDN URL 배열 |
| 대표 이미지 | `offer.image` | (medium 사이즈) |
| 소요 시간 | `offerInfo.duration_size` + `duration_unit` | `2` + `"hour"` |
| 투어 규모 | `offerInfo.scale` | `"그룹 투어"` |
| 이동 수단 | `offerInfo.transport` | `"도보 이동"` |
| 즉시 확정 | `allowQuickReserve` | `true` |
| 환불 가능 | `offerInfo.refundable` | `true` |
| 취소 정책 | `offerInfo.cancel_policy` | (텍스트) |
| **포함 서비스** | `offerInfo.including_service` | `"입장료"` |
| **미포함 서비스** | `offerInfo.excluding_service` | `"기타 개인 경비"` |
| 주의사항 | `offerInfo.attention` | (텍스트) |
| 공지 | `notice.title` + `notice.content` | 제목 + 내용 |
| 집합 장소 | `offerInfo.meeting_point` | 주소 텍스트 |
| 좌표 | `offerInfo.lat/lng` | `41.034619`, `28.979785` |
| **도시명** | `cityName` / `offer.city.name` | `"이스탄불"` |
| **국가명** | `offer.country.name` | `"터키"` |
| 가이드 이름 | `guide.name` | `"BEMYGUEST"` |
| 가이드 설명 | `guide.description` | (텍스트) |
| 가이드 프로필 | `guide.profileImage` | CDN URL |
| 판매 수량 | `offerInfo.selling_count` | `18` |
| 페이지뷰 | `offerInfo.pv_count` | `249` |
| 옵션 URL | `optionUrl` | `"/offers/129381/options"` |
| 추천 상품 | `recommendOffers[]` | (상품 목록) |

---

## 4. 이미지 URL 패턴

```
CDN: d2ur7st6jjikze.cloudfront.net

상품 사진: /offer_photos/{offer_id}/{photo_id}_{size}_{ts}.jpg
설명 이미지: /offer_descriptive_images/{offer_id}/{id}_{size}_{ts}.jpg
프로필: /profile_images/{guide_id}/{id}_{size}_{ts}.png
도시: /landscapes/{id}_{size}_{ts}.jpg

사이즈: large, medium, medium_square
```

---

## 5. 추천 추출 전략

### 1순위: `script[data-component-name="Offer"]` JSON 파싱 ★★★

```javascript
const cheerio = require('cheerio');

function extractOfferData(html) {
  const $ = cheerio.load(html);
  const offerScript = $('script[data-component-name="Offer"]').html();
  if (offerScript) {
    return JSON.parse(offerScript);
  }
  return null;
}
```

**장점**:
- 1회 HTTP 요청으로 **40개+ 필드** 구조화된 JSON 추출
- SSR이므로 브라우저/Puppeteer 불필요
- 3개 상품 모두 **동일한 구조** 확인

**리스크**: Rails 업데이트 시 컴포넌트명/구조 변경 가능

### 2순위: OG 메타 태그 (요약 정보만)

제목 + 설명 + 대표이미지만 빠르게 추출 가능. 가격, 리뷰, 카테고리 등 없음.

### 3순위: 옵션/가격 API

```
GET /offers/{id}/options    → 옵션별 가격 데이터
GET /offers/{id}/check_option → 가격 확인
```

---

## 6. 주의사항

### 접근 제한
- 기본 `fetch`로 정상 접근 가능 (User-Agent 헤더 필수)
- **로그인 불필요** — 상품 데이터 전부 비로그인 상태에서 노출
- 일부 URL은 500/404 반환 — 삭제/비활성 상품

### 데이터 100% SSR
- JavaScript 실행 없이 정적 HTML 파싱만으로 완전한 데이터 추출 가능
- 옵션별 실시간 가격, 캘린더 가용일은 별도 API 호출 필요

### 가격 데이터 주의
- `price.mainPrice`가 `null`인 경우 다수 → `price.changedPrice`가 실제 가격
- `offer.price.origin`이 0이면 할인 없음
- 통화: 항상 KRW

### 카테고리 매핑
- `standardCategory`가 가장 정확한 3단계 분류 체계
- `offerInfo.category`는 raw 값 (`"ticket"`, `"guide_tour"`)
- `offer.category`는 표시용 (`"티켓/패스"`, `"가이드 투어"`)

### CTO 계획과의 차이점
- **`__NEXT_DATA__`는 존재하지 않음** — Rails SSR이므로 이 전략은 제거해야 함
- 대신 `data-component-name="Offer"` JSON 파싱이 메인 전략
- Puppeteer 폴백은 불필요 — 데이터가 100% SSR
