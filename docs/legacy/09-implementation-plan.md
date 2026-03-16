# PDP 자동 생성 도구 — 상세 구현 계획

> **시니어 풀스택 개발자 관점 | 2026-03-16**

---

## 목차

1. [현재 코드베이스 분석 요약](#현재-코드베이스-분석-요약)
2. [디렉토리 구조 설계](#1-디렉토리-구조-설계)
3. [백엔드 API 설계](#2-백엔드-api-설계)
4. [MRT 상품 페이지 스크래핑 구현](#3-mrt-상품-페이지-스크래핑-구현)
5. [AI 카피 생성 구현](#4-ai-카피-생성-구현)
6. [프론트엔드 통합](#5-프론트엔드-통합)
7. [샘플 데이터 구조](#6-샘플-데이터-구조)
8. [구현 순서 (단계별)](#7-구현-순서-단계별)
9. [핵심 설계 결정 정리](#핵심-설계-결정-정리)

---

## 현재 코드베이스 분석 요약

| 구성요소 | 파일 | 역할 | 상태 |
|---------|------|------|------|
| `engine/pdp-engine.js` | 렌더링 엔진 | 카테고리 감지 → 레시피 조회 → 블록 렌더 → HTML 조립 | 완성 |
| `engine/block-registry.js` | 블록 레지스트리 | Map 기반 블록 등록/조회 | 완성 |
| `engine/data-validator.js` | 데이터 검증 | 필수 블록/카테고리 유효성 검증 | 완성 |
| `recipes/category-recipes.js` | 카테고리 레시피 | 8개 카테고리별 블록 배치 순서 | 완성 |
| `blocks/*.js` | 12개 블록 렌더러 | 각각 `render`, `validate`, 일부 `mount/unmount` | 완성 |
| `script.js` | 프레젠테이션용 | 인라인 샘플 데이터 + 인라인 렌더 함수 (엔진 미사용) | **리팩토링 필요** |
| `index.html` | 프레젠테이션 페이지 | 소개 + 데모 (프로덕션 도구 아님) | **별도 도구 페이지 필요** |

**핵심 문제**: `script.js`가 `engine/`의 ES Module 블록들을 쓰지 않고 **자체 인라인 렌더 함수**를 가지고 있다. 프로덕션 도구에서는 `engine/pdp-engine.js` + `blocks/*.js`를 직접 사용해야 한다.

---

## 1. 디렉토리 구조 설계

```
pdp-design-tf/
├── server.js                 # Express 서버 진입점
├── package.json              # 의존성 + scripts
├── .env.example              # 환경변수 템플릿
├── .env                      # (gitignore) 실제 환경변수
│
├── lib/                      # 백엔드 전용 로직 (Node.js)
│   ├── extractor.js          # MRT URL → 상품 데이터 추출
│   ├── generator.js          # Anthropic API → 블록별 카피 생성
│   └── field-mapper.js       # 추출 원본 → 블록 데이터 스키마 변환
│
├── engine/                   # [기존 유지] 렌더링 엔진 (프론트+백 공유 가능)
│   ├── pdp-engine.js         # 수정 없음
│   ├── block-registry.js     # 수정 없음
│   └── data-validator.js     # 수정 없음
│
├── blocks/                   # [기존 유지] 12개 블록 렌더러
│   ├── hero.js
│   ├── highlights.js
│   ├── overview.js
│   ├── guideProfile.js
│   ├── itinerary.js
│   ├── inclusions.js
│   ├── optionTable.js
│   ├── imageGrid.js
│   ├── usageGuide.js
│   ├── comparison.js
│   ├── recommendFor.js
│   └── trustBadges.js
│
├── recipes/                  # [기존 유지] 카테고리 레시피
│   └── category-recipes.js
│
├── public/                   # 프로덕션 도구 프론트엔드
│   ├── index.html            # 도구 메인 페이지
│   ├── app.js                # 메인 앱 로직 (ES Module)
│   ├── app.css               # 도구 스타일
│   └── lib/
│       └── block-loader.js   # 브라우저에서 블록 동적 로딩
│
├── samples/                  # 카테고리별 샘플 데이터
│   ├── tour.json
│   ├── ticket-theme.json
│   ├── ticket-transport.json
│   ├── ticket-citypass.json
│   ├── ticket-experience.json
│   ├── activity.json
│   ├── service.json
│   └── semi-package.json
│
├── presentation/             # [기존 유지] 발표 페이지 (별도 독립)
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── index.html                # [기존 유지] 원래 발표 페이지
├── script.js                 # [기존 유지] 발표용
└── style.css                 # [기존 유지] 발표용
```

### 기존 코드 변경 방침

- `engine/`, `blocks/`, `recipes/`는 **수정 없이 그대로 유지**. 이미 잘 설계돼 있음.
- `index.html` + `script.js` + `style.css`는 프레젠테이션 용도이므로 건드리지 않음.
- 프로덕션 도구는 `public/` 하위에 완전히 새로 구성.
- `lib/`은 Node.js 전용 (서버사이드 스크래핑 + AI 호출).

---

## 2. 백엔드 API 설계

### package.json

```json
{
  "name": "pdp-design-tf",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "@anthropic-ai/sdk": "^0.39.0",
    "cheerio": "^1.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0"
  }
}
```

### .env.example

```bash
# Anthropic API Key
ANTHROPIC_API_KEY=sk-ant-api03-...

# 서버 포트
PORT=3000

# MRT 스크래핑 User-Agent (차단 방지)
USER_AGENT=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36

# AI 모델 설정
AI_MODEL_CLASSIFY=claude-haiku-4-20250414
AI_MODEL_COPY=claude-sonnet-4-20250514
```

### server.js

```javascript
// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { extractProductData } from './lib/extractor.js';
import { generateBlockCopy } from './lib/generator.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ── 미들웨어 ──
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// 정적 파일: public/ 디렉토리
app.use(express.static('public'));

// 엔진/블록/레시피도 브라우저에서 ES Module로 직접 import할 수 있도록 정적 서빙
app.use('/engine', express.static('engine'));
app.use('/blocks', express.static('blocks'));
app.use('/recipes', express.static('recipes'));
app.use('/samples', express.static('samples'));

// ── API 라우트 ──

/**
 * POST /api/extract
 * MRT 상품 URL에서 데이터를 추출한다.
 */
app.post('/api/extract', async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'url 필드가 필요합니다.',
      });
    }

    // URL 형식 검증
    const urlPattern = /myrealtrip\.com\/offers\/(\d+)/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({
        error: 'INVALID_URL',
        message: '마이리얼트립 상품 URL 형식이 아닙니다. (예: https://myrealtrip.com/offers/12345)',
      });
    }

    const result = await extractProductData(url);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/generate
 * 추출된 원본 데이터로 AI 카피를 생성한다.
 */
app.post('/api/generate', async (req, res, next) => {
  try {
    const { rawData, category, targetBlocks } = req.body;

    if (!rawData || !category) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'rawData와 category 필드가 필요합니다.',
      });
    }

    const result = await generateBlockCopy({ rawData, category, targetBlocks });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── 에러 핸들러 ──
app.use((err, req, res, _next) => {
  console.error('[server] 에러:', err);

  // Anthropic API 에러
  if (err.status && err.type) {
    return res.status(502).json({
      error: 'AI_API_ERROR',
      message: `AI 서비스 에러: ${err.message}`,
      detail: err.type,
    });
  }

  // 스크래핑 에러
  if (err.code === 'EXTRACT_FAILED') {
    return res.status(422).json({
      error: 'EXTRACT_FAILED',
      message: err.message,
      detail: err.detail || null,
    });
  }

  // 기타
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: '서버 내부 에러가 발생했습니다.',
  });
});

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT} 에서 실행 중`);
});
```

### API 스키마 상세

#### `POST /api/extract`

**요청:**

```json
{
  "url": "https://myrealtrip.com/offers/128492"
}
```

**성공 응답 (200):**

```json
{
  "success": true,
  "extractMethod": "__NEXT_DATA__",
  "rawData": {
    "id": 128492,
    "title": "이스탄불 올드 시티 프라이빗 가이드 투어",
    "description": "블루모스크 · 아야소피아 · 그랜드 바자르를 하루에...",
    "images": [
      { "url": "https://d2ur7st6jjikze.cloudfront.net/...", "alt": "" }
    ],
    "price": { "amount": 159000, "currency": "KRW", "originalAmount": 189000 },
    "rating": { "score": 4.8, "reviewCount": 327 },
    "options": [
      { "name": "프라이빗 (2인)", "price": 159000 }
    ],
    "category": "guide_tour",
    "location": { "city": "이스탄불", "country": "터키" },
    "tags": ["한국어가이드", "프라이빗"],
    "includes": ["가이드", "입장료", "차량"],
    "excludes": ["식사", "팁"],
    "itinerary": "09:00 호텔 픽업\n09:30 블루모스크...",
    "notices": ["복장 안내: ...", "운영 안내: ..."],
    "faq": [],
    "reviewSummary": { "positive": ["가이드 친절", "일정 알참"], "negative": [] }
  },
  "suggestedCategory": "TOUR",
  "warnings": []
}
```

#### `POST /api/generate`

**요청:**

```json
{
  "rawData": { /* /api/extract 응답의 rawData */ },
  "category": "TOUR",
  "targetBlocks": ["highlights", "overview", "faq"]
}
```

`targetBlocks`를 생략하면 해당 카테고리 레시피의 **모든 AI 생성 대상 블록**에 대해 카피를 생성한다. AI가 생성하지 않는 블록(hero, trustBadges 등 원본 데이터 그대로 쓰는 블록)은 제외.

**성공 응답 (200):**

```json
{
  "success": true,
  "category": "TOUR",
  "productData": {
    "category": "TOUR",
    "blocks": {
      "hero": {
        "image": { "url": "https://...", "alt": "이스탄불 블루모스크" },
        "badges": [{ "type": "korean_guide", "label": "한국어 가이드" }],
        "title": "이스탄불 올드 시티 프라이빗 가이드 투어",
        "subtitle": "블루모스크 · 아야소피아 · 그랜드 바자르를 하루에",
        "rating": { "score": 4.8, "count": 327 }
      },
      "highlights": {
        "title": "이 투어의 매력",
        "items": [
          { "icon": "🕌", "text": "블루모스크 내부의 2만 장 이즈닉 타일을 전문 가이드와 감상" },
          { "icon": "👨‍👩‍👧‍👦", "text": "우리 가족만을 위한 프라이빗 투어, 아이 속도에 맞춰 진행" }
        ]
      },
      "overview": {
        "title": "상품 소개",
        "paragraphs": [
          "이스탄불의 심장부...",
          "관광객으로 붐비는 루트 대신..."
        ]
      }
    }
  },
  "usage": {
    "model": "claude-sonnet-4-20250514",
    "inputTokens": 1847,
    "outputTokens": 1203,
    "estimatedCost": 0.065
  },
  "warnings": []
}
```

#### 에러 응답 형식 (공통)

```json
{
  "error": "ERROR_CODE",
  "message": "사용자에게 보여줄 메시지",
  "detail": "디버깅용 상세 정보 (선택)"
}
```

**에러 코드 목록:**

| 코드 | HTTP 상태 | 설명 |
|------|-----------|------|
| `INVALID_REQUEST` | 400 | 필수 필드 누락 |
| `INVALID_URL` | 400 | MRT URL 형식 아님 |
| `EXTRACT_FAILED` | 422 | 스크래핑 실패 |
| `AI_API_ERROR` | 502 | Anthropic API 에러 |
| `INTERNAL_ERROR` | 500 | 서버 내부 에러 |

---

## 3. MRT 상품 페이지 스크래핑 구현

### lib/extractor.js

```javascript
// lib/extractor.js
import * as cheerio from 'cheerio';

/**
 * MRT 상품 URL에서 데이터를 추출한다.
 *
 * 전략:
 *  1차: __NEXT_DATA__ JSON 파싱 (MRT는 Next.js 기반)
 *  2차: HTML 직접 파싱 (폴백)
 *
 * @param {string} url - MRT 상품 URL
 * @returns {Promise<object>}
 */
export async function extractProductData(url) {
  const normalizedUrl = normalizeUrl(url);
  const html = await fetchPage(normalizedUrl);
  const warnings = [];

  // 1차 시도: __NEXT_DATA__
  let rawData = extractFromNextData(html);
  let extractMethod = '__NEXT_DATA__';

  // 2차 폴백: HTML 파싱
  if (!rawData) {
    warnings.push('__NEXT_DATA__를 찾을 수 없어 HTML 파싱으로 폴백');
    rawData = extractFromHTML(html);
    extractMethod = 'html_parse';
  }

  if (!rawData || !rawData.title) {
    const err = new Error('상품 데이터를 추출할 수 없습니다. 페이지 구조가 변경되었을 수 있습니다.');
    err.code = 'EXTRACT_FAILED';
    throw err;
  }

  // 카테고리 추론
  const suggestedCategory = inferCategory(rawData);

  return {
    success: true,
    extractMethod,
    rawData,
    suggestedCategory,
    warnings,
  };
}


// ── 내부 함수들 ──

/**
 * URL 정규화
 */
function normalizeUrl(url) {
  let normalized = url.trim();

  // 프로토콜 없으면 추가
  if (!normalized.startsWith('http')) {
    normalized = 'https://' + normalized;
  }

  // myrealtrip.com 확인
  const parsed = new URL(normalized);
  if (!parsed.hostname.includes('myrealtrip.com')) {
    const err = new Error('마이리얼트립 URL이 아닙니다.');
    err.code = 'EXTRACT_FAILED';
    throw err;
  }

  return normalized;
}

/**
 * 페이지 HTML 가져오기
 */
async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': process.env.USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'ko-KR,ko;q=0.9',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(15000), // 15초 타임아웃
  });

  if (!response.ok) {
    const err = new Error(`페이지 요청 실패: HTTP ${response.status}`);
    err.code = 'EXTRACT_FAILED';
    err.detail = `URL: ${url}, Status: ${response.status}`;
    throw err;
  }

  return response.text();
}

/**
 * __NEXT_DATA__에서 상품 데이터 추출
 * MRT는 Next.js SSR이라 <script id="__NEXT_DATA__">에 props가 들어있음.
 */
function extractFromNextData(html) {
  const $ = cheerio.load(html);
  const nextDataScript = $('#__NEXT_DATA__').html();

  if (!nextDataScript) return null;

  try {
    const nextData = JSON.parse(nextDataScript);

    // Next.js props 경로 (MRT 구조에 따라 다를 수 있음)
    const pageProps = nextData?.props?.pageProps;
    if (!pageProps) return null;

    // MRT 상품 데이터 탐색 (여러 경로 시도)
    const offer = pageProps.offer
      || pageProps.product
      || pageProps.initialData?.offer
      || findOfferInDehydrated(pageProps.dehydratedState);

    if (!offer) return null;

    return mapNextDataToRaw(offer);
  } catch (e) {
    console.warn('[extractor] __NEXT_DATA__ JSON 파싱 실패:', e.message);
    return null;
  }
}

/**
 * React Query dehydratedState에서 offer 데이터 찾기
 */
function findOfferInDehydrated(dehydrated) {
  if (!dehydrated?.queries) return null;

  for (const query of dehydrated.queries) {
    const data = query?.state?.data;
    if (data && (data.id || data.offerId) && data.title) {
      return data;
    }
  }
  return null;
}

/**
 * __NEXT_DATA__ offer 객체를 rawData 스키마로 변환
 */
function mapNextDataToRaw(offer) {
  return {
    id: offer.id || offer.offerId,
    title: offer.title || offer.name || '',
    description: offer.description || offer.summary || '',
    images: extractImages(offer),
    price: {
      amount: offer.price?.amount || offer.salePrice || offer.minPrice || 0,
      currency: offer.price?.currency || 'KRW',
      originalAmount: offer.price?.originalAmount || offer.originalPrice || null,
    },
    rating: {
      score: offer.rating?.average || offer.reviewRating || 0,
      reviewCount: offer.rating?.count || offer.reviewCount || 0,
    },
    options: (offer.options || offer.ticketOptions || []).map(opt => ({
      name: opt.name || opt.title || '',
      description: opt.description || '',
      price: opt.price?.amount || opt.salePrice || 0,
      originalPrice: opt.price?.originalAmount || opt.originalPrice || null,
    })),
    category: offer.category?.code || offer.categoryCode || '',
    location: {
      city: offer.city?.name || offer.location?.city || '',
      country: offer.country?.name || offer.location?.country || '',
    },
    tags: offer.tags || offer.badges || [],
    includes: offer.includes || offer.includedItems || [],
    excludes: offer.excludes || offer.excludedItems || [],
    itinerary: offer.itinerary || offer.schedule || '',
    notices: offer.notices || offer.precautions || [],
    faq: offer.faq || offer.faqs || [],
    reviewSummary: {
      positive: offer.reviewSummary?.positive || [],
      negative: offer.reviewSummary?.negative || [],
    },
    guideName: offer.guide?.name || offer.hostName || null,
    guidePhoto: offer.guide?.profileImage || null,
    guideIntro: offer.guide?.introduction || null,
    guideLanguages: offer.guide?.languages || [],
  };
}

/**
 * 이미지 배열 추출 (다양한 필드명 대응)
 */
function extractImages(offer) {
  const sources = offer.images || offer.photos || offer.gallery || [];

  if (typeof sources[0] === 'string') {
    return sources.map(url => ({ url, alt: '' }));
  }

  return sources.map(img => ({
    url: img.url || img.src || img.imageUrl || '',
    alt: img.alt || img.caption || '',
  }));
}

/**
 * HTML 파싱 폴백 (cheerio 기반)
 */
function extractFromHTML(html) {
  const $ = cheerio.load(html);

  const title = $('h1').first().text().trim()
    || $('meta[property="og:title"]').attr('content')
    || $('title').text().trim();

  if (!title) return null;

  const description = $('meta[property="og:description"]').attr('content')
    || $('meta[name="description"]').attr('content')
    || '';

  const ogImage = $('meta[property="og:image"]').attr('content') || '';

  // 가격 추출 시도 (MRT 가격 셀렉터)
  const priceText = $('.offer-price, .product-price, [class*="price"]').first().text();
  const priceMatch = priceText.match(/[\d,]+/);
  const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, ''), 10) : 0;

  // 이미지 수집
  const images = [];
  $('img[src*="cloudfront"], img[src*="myrealtrip"]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.includes('icon') && !src.includes('logo')) {
      images.push({ url: src, alt: $(el).attr('alt') || '' });
    }
  });

  if (ogImage && !images.find(i => i.url === ogImage)) {
    images.unshift({ url: ogImage, alt: title });
  }

  return {
    id: null,
    title,
    description,
    images,
    price: { amount: price, currency: 'KRW', originalAmount: null },
    rating: { score: 0, reviewCount: 0 },
    options: [],
    category: '',
    location: { city: '', country: '' },
    tags: [],
    includes: [],
    excludes: [],
    itinerary: '',
    notices: [],
    faq: [],
    reviewSummary: { positive: [], negative: [] },
    guideName: null,
    guidePhoto: null,
    guideIntro: null,
    guideLanguages: [],
  };
}

/**
 * 카테고리 자동 추론 (키워드 기반 1차 분류)
 * AI 분류 전 사전 필터 역할. 확실하지 않으면 'TOUR' 기본값.
 */
function inferCategory(rawData) {
  const text = `${rawData.title} ${rawData.description} ${rawData.tags?.join(' ')}`.toLowerCase();
  const cat = rawData.category?.toLowerCase() || '';

  // 키워드 매핑 (우선순위 순서)
  const rules = [
    { keywords: ['시티패스', 'citypass', 'city pass', 'pass'], category: 'TICKET_CITYPASS' },
    { keywords: ['세미패키지', '항공+호텔', '패키지'], category: 'SEMI_PACKAGE' },
    { keywords: ['스노클링', '다이빙', '래프팅', '서핑', '카약', '번지', '짚라인', 'activity'], category: 'ACTIVITY' },
    { keywords: ['가이드 투어', 'guide tour', '워킹투어', '프라이빗 투어'], category: 'TOUR' },
    { keywords: ['교통', '버스', '열차', '공항'], category: 'TICKET_TRANSPORT' },
    { keywords: ['테마파크', '유니버설', '디즈니', '놀이공원', '아쿠아리움', '전망대'], category: 'TICKET_THEME' },
    { keywords: ['체험', '클래스', '쿠킹', '공방'], category: 'TICKET_EXPERIENCE' },
    { keywords: ['sim', '유심', '와이파이', 'esim', '짐 보관'], category: 'SERVICE' },
    { keywords: ['티켓', '입장권', 'ticket'], category: 'TICKET_THEME' },
  ];

  // 카테고리 코드 매핑 (MRT API가 내려주는 값)
  if (cat.includes('guide_tour') || cat.includes('tour')) return 'TOUR';
  if (cat.includes('activity')) return 'ACTIVITY';
  if (cat.includes('ticket')) return 'TICKET_THEME';

  for (const rule of rules) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      return rule.category;
    }
  }

  return 'TOUR'; // 기본 폴백
}
```

---

## 4. AI 카피 생성 구현

### lib/generator.js

```javascript
// lib/generator.js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * 추출된 원본 데이터를 기반으로 각 블록별 최적화된 카피를 생성한다.
 *
 * 전략:
 * - hero, trustBadges: AI 생성 불필요 (원본 데이터 직접 매핑)
 * - highlights, overview, itinerary 등: AI가 원본을 재가공
 * - 블록별 분리 호출이 아닌, 단일 호출에서 JSON으로 전체 블록 데이터를 한 번에 생성
 *   (비용 효율 + 블록 간 일관성 유지)
 *
 * @param {object} params
 * @param {object} params.rawData - extractor에서 추출한 원본 데이터
 * @param {string} params.category - 카테고리 키 (TOUR, TICKET_THEME 등)
 * @param {string[]|null} params.targetBlocks - 생성할 블록 목록 (null이면 전체)
 * @returns {Promise<object>}
 */
export async function generateBlockCopy({ rawData, category, targetBlocks }) {
  // Step 1: 원본 데이터에서 직접 매핑 가능한 블록 처리
  const directMappedBlocks = buildDirectMappedBlocks(rawData);

  // Step 2: AI 생성이 필요한 블록 목록 결정
  const AI_GENERATED_BLOCKS = [
    'highlights', 'overview', 'itinerary', 'inclusions',
    'usageGuide', 'faq', 'recommendFor', 'guideProfile',
    'comparison', 'notice',
  ];

  const blocksToGenerate = targetBlocks
    ? targetBlocks.filter(b => AI_GENERATED_BLOCKS.includes(b))
    : AI_GENERATED_BLOCKS;

  // Step 3: AI 호출
  const prompt = buildPrompt(rawData, category, blocksToGenerate);

  const message = await client.messages.create({
    model: process.env.AI_MODEL_COPY || 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  // Step 4: 응답 파싱
  const responseText = message.content[0]?.text || '';
  const aiBlocks = parseAIResponse(responseText);

  // Step 5: 직접 매핑 블록 + AI 생성 블록 병합
  const mergedBlocks = {
    ...directMappedBlocks,
    ...aiBlocks,
  };

  return {
    success: true,
    category,
    productData: {
      category,
      blocks: mergedBlocks,
    },
    usage: {
      model: message.model,
      inputTokens: message.usage?.input_tokens || 0,
      outputTokens: message.usage?.output_tokens || 0,
      estimatedCost: estimateCost(message.usage),
    },
    warnings: [],
  };
}
```

### 직접 매핑 블록 (AI 불필요)

```javascript
function buildDirectMappedBlocks(raw) {
  const blocks = {};

  // hero: 원본 데이터 그대로
  if (raw.title) {
    blocks.hero = {
      image: raw.images?.[0] || { url: '/placeholder.jpg', alt: '' },
      badges: (raw.tags || []).slice(0, 3).map(tag => ({
        type: tagToType(tag),
        label: typeof tag === 'string' ? tag : tag.label || tag.name || '',
      })),
      title: raw.title,
      subtitle: raw.description?.slice(0, 80) || '',
      rating: raw.rating?.score ? {
        score: raw.rating.score,
        count: raw.rating.reviewCount || 0,
      } : null,
      price: raw.price?.amount ? {
        current: raw.price.amount,
        original: raw.price.originalAmount || null,
        currency: raw.price.currency === 'KRW' ? '₩' : raw.price.currency,
        unit: '1인',
      } : null,
    };
  }

  // trustBadges: 태그에서 추출
  if (raw.tags?.length) {
    blocks.trustBadges = {
      badges: raw.tags.slice(0, 4).map(tag => ({
        type: tagToType(tag),
        label: typeof tag === 'string' ? tag : tag.label || '',
        icon: tagToIcon(tag),
      })),
    };
  }

  // imageGrid: 이미지 배열 직접 사용
  if (raw.images?.length > 1) {
    blocks.imageGrid = {
      title: '상품 이미지',
      images: raw.images.slice(0, 8).map(img => ({
        url: img.url,
        alt: img.alt || raw.title,
        caption: img.caption || null,
      })),
      layout: 'carousel',
    };
  }

  // optionTable: 옵션 데이터 직접 매핑
  if (raw.options?.length) {
    blocks.optionTable = {
      title: '옵션 안내',
      options: raw.options.map(opt => ({
        name: opt.name,
        description: opt.description || null,
        price: {
          amount: opt.price,
          currency: '₩',
          unit: '1인',
        },
        originalPrice: opt.originalPrice || null,
        badges: [],
        available: true,
      })),
    };
  }

  return blocks;
}

function tagToType(tag) {
  const label = (typeof tag === 'string' ? tag : tag.label || '').toLowerCase();
  if (label.includes('가이드')) return 'korean_guide';
  if (label.includes('즉시')) return 'instant_confirm';
  if (label.includes('무료취소')) return 'free_cancel';
  if (label.includes('베스트')) return 'best_seller';
  if (label.includes('e-티켓') || label.includes('모바일')) return 'e_ticket';
  if (label.includes('프라이빗') || label.includes('소그룹')) return 'small_group';
  return 'default';
}

function tagToIcon(tag) {
  const label = (typeof tag === 'string' ? tag : tag.label || '').toLowerCase();
  if (label.includes('가이드')) return '🗣️';
  if (label.includes('즉시')) return '⚡';
  if (label.includes('무료취소')) return '↩️';
  if (label.includes('베스트')) return '🏆';
  if (label.includes('e-티켓') || label.includes('모바일')) return '📱';
  return '✓';
}
```

### AI 프롬프트

```javascript
function buildPrompt(rawData, category, targetBlocks) {
  const blockInstructions = targetBlocks.map(block => {
    return BLOCK_PROMPT_SPECS[block] || '';
  }).filter(Boolean).join('\n\n');

  return `당신은 마이리얼트립 여행 상품의 상품 상세 페이지(PDP) 카피라이터입니다.
아래 상품 원본 데이터를 기반으로, 지정된 블록별 JSON 데이터를 생성해주세요.

## 상품 원본 데이터
\`\`\`json
${JSON.stringify(rawData, null, 2)}
\`\`\`

## 카테고리: ${category}

## 생성할 블록과 JSON 스키마

${blockInstructions}

## 작성 규칙
1. **한국어**로 작성. 자연스럽고 매력적인 여행 카피.
2. 각 블록의 JSON 스키마를 **정확히** 준수.
3. 원본 데이터에 없는 정보를 **절대 지어내지 말 것**. 가격, 시간, 포함사항 등 팩트는 원본 그대로.
4. 원본에 해당 블록 데이터가 부족하면, 해당 블록을 빈 객체 \`{}\`로 반환.
5. highlights의 text는 **구체적 대상 + 행동 동사 포함** (예: "블루모스크 2만 장 이즈닉 타일을 전문 가이드와 감상").
6. overview는 2~4 문단, 각 문단 2~3문장. 감성적이되 정보 밀도 높게.
7. icon/emoji는 내용과 관련된 것으로.

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요. 설명 텍스트 없이 JSON만 출력하세요.
\`\`\`json
{
  "highlights": { ... },
  "overview": { ... },
  ...
}
\`\`\``;
}
```

### 블록별 프롬프트 스펙 (BLOCK_PROMPT_SPECS)

각 블록이 AI에게 기대하는 JSON 스키마를 정의한다.

| 블록 | 제목 예시 | 주요 필드 |
|------|----------|----------|
| `highlights` | "이 투어의 매력" | `items[].icon`, `items[].text` (3~5개) |
| `overview` | "상품 소개" | `paragraphs[]` (2~4개) |
| `itinerary` | "투어 일정" | `type`, `stops[].time/title/description/duration`, `totalDuration` |
| `inclusions` | "포함 / 불포함" | `included[].text/detail`, `excluded[].text/tip` |
| `usageGuide` | "이용 방법" | `steps[].step/title/description/icon` (3~5단계) |
| `faq` | "자주 묻는 질문" | `items[].question/answer` (3~5개) |
| `recommendFor` | "이런 분에게 추천해요" | `targets[].icon/text` (3~4개) |
| `guideProfile` | 가이드 이름 | `name`, `photo`, `experience`, `languages`, `introduction` |
| `comparison` | "개별 구매 vs 이 패키지" | `items[]`, `totalIndividual`, `packagePrice`, `savings` |
| `notice` | "알아두세요" | `sections[].subtitle/type/severity/items` |

### 응답 파싱 및 비용 추정

```javascript
function parseAIResponse(text) {
  // JSON 블록 추출 (```json ... ``` 또는 raw JSON)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    || text.match(/```\s*([\s\S]*?)\s*```/);

  const jsonStr = jsonMatch ? jsonMatch[1] : text;

  try {
    const parsed = JSON.parse(jsonStr.trim());

    // 빈 객체인 블록은 제거
    const cleaned = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value && typeof value === 'object' && Object.keys(value).length > 0) {
        cleaned[key] = value;
      }
    }

    return cleaned;
  } catch (e) {
    console.error('[generator] AI 응답 JSON 파싱 실패:', e.message);
    console.error('[generator] 원본 응답:', text.slice(0, 500));

    // 파싱 실패 시 빈 객체 반환 (에러를 던지지 않고 graceful 처리)
    return {};
  }
}

function estimateCost(usage) {
  if (!usage) return 0;
  // Sonnet 4 기준: input $3/M, output $15/M
  const inputCost = (usage.input_tokens || 0) * 3 / 1_000_000;
  const outputCost = (usage.output_tokens || 0) * 15 / 1_000_000;
  return Math.round((inputCost + outputCost) * 1000) / 1000;
}
```

### lib/field-mapper.js

```javascript
// lib/field-mapper.js
/**
 * 블록 데이터 스키마 간 차이를 보정하는 유틸리티.
 *
 * 문제: script.js의 인라인 샘플 데이터는 blocks/의 ES Module 렌더러가 기대하는 스키마와
 * 미묘하게 다름 (예: itinerary.items vs itinerary.stops, recommendFor.items vs recommendFor.targets).
 *
 * 이 모듈은 AI가 생성한 블록 데이터(또는 샘플 데이터)를 각 블록 렌더러가 기대하는
 * 정확한 스키마로 정규화한다.
 */

/**
 * productData.blocks를 각 블록 렌더러의 스키마에 맞게 정규화
 * @param {object} blocks - { hero: {...}, highlights: {...}, ... }
 * @returns {object} 정규화된 blocks
 */
export function normalizeBlocks(blocks) {
  if (!blocks || typeof blocks !== 'object') return blocks;

  const normalized = { ...blocks };

  // itinerary: items → stops (블록 렌더러는 stops를 기대)
  if (normalized.itinerary?.items && !normalized.itinerary?.stops) {
    normalized.itinerary = {
      ...normalized.itinerary,
      stops: normalized.itinerary.items,
    };
    delete normalized.itinerary.items;
  }

  // recommendFor: items → targets (블록 렌더러는 targets를 기대)
  if (normalized.recommendFor?.items && !normalized.recommendFor?.targets) {
    normalized.recommendFor = {
      ...normalized.recommendFor,
      targets: normalized.recommendFor.items.map(item => ({
        icon: item.emoji || item.icon || '',
        text: item.text || '',
      })),
    };
    delete normalized.recommendFor.items;
  }

  // guideProfile: photo가 string이면 object로 변환
  if (normalized.guideProfile?.photo && typeof normalized.guideProfile.photo === 'string') {
    normalized.guideProfile = {
      ...normalized.guideProfile,
      photo: {
        url: normalized.guideProfile.photo,
        alt: normalized.guideProfile.name || '',
      },
    };
  }

  // inclusions: excluded[].detail → excluded[].tip (렌더러는 tip을 기대)
  if (normalized.inclusions?.excluded) {
    normalized.inclusions = {
      ...normalized.inclusions,
      excluded: normalized.inclusions.excluded.map(item => ({
        text: item.text,
        tip: item.tip || item.detail || null,
      })),
    };
  }

  return normalized;
}
```

---

## 5. 프론트엔드 통합

### public/index.html

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PDP 자동 생성 도구</title>
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css" rel="stylesheet">
<link rel="stylesheet" href="app.css">
</head>
<body>
  <div class="app-layout">
    <!-- 사이드바 (입력 패널) -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__header">
        <h1 class="sidebar__title">PDP 자동 생성</h1>
      </div>

      <!-- 모드 탭: URL 입력 / 샘플 선택 -->
      <div class="sidebar__tabs">
        <button class="sidebar__tab active" data-mode="url">URL 입력</button>
        <button class="sidebar__tab" data-mode="sample">샘플 데이터</button>
      </div>

      <!-- URL 입력 모드 -->
      <div class="sidebar__panel" id="panelUrl">
        <label class="input-label" for="productUrl">마이리얼트립 상품 URL</label>
        <input
          class="input-field"
          id="productUrl"
          type="url"
          placeholder="https://myrealtrip.com/offers/12345"
        />
        <button class="btn btn--primary btn--full" id="btnExtract">
          데이터 추출
        </button>
      </div>

      <!-- 샘플 데이터 모드 -->
      <div class="sidebar__panel hidden" id="panelSample">
        <label class="input-label">카테고리 선택</label>
        <select class="input-select" id="sampleSelect">
          <option value="">선택하세요</option>
          <option value="tour">가이드 투어</option>
          <option value="ticket-theme">티켓 - 테마파크</option>
          <option value="ticket-transport">티켓 - 교통</option>
          <option value="ticket-citypass">티켓 - 시티패스</option>
          <option value="ticket-experience">티켓 - 체험</option>
          <option value="activity">액티비티</option>
          <option value="service">서비스</option>
          <option value="semi-package">세미패키지</option>
        </select>
        <button class="btn btn--primary btn--full" id="btnLoadSample">
          샘플 불러오기
        </button>
      </div>

      <!-- 카테고리 오버라이드 -->
      <div class="sidebar__section" id="categorySection" style="display:none;">
        <label class="input-label">카테고리</label>
        <select class="input-select" id="categoryOverride">
          <option value="">자동 감지</option>
          <option value="TOUR">가이드 투어</option>
          <option value="TICKET_THEME">티켓 - 테마파크</option>
          <option value="TICKET_TRANSPORT">티켓 - 교통</option>
          <option value="TICKET_CITYPASS">티켓 - 시티패스</option>
          <option value="TICKET_EXPERIENCE">티켓 - 체험</option>
          <option value="ACTIVITY">액티비티</option>
          <option value="SERVICE">서비스</option>
          <option value="SEMI_PACKAGE">세미패키지</option>
        </select>
        <button class="btn btn--accent btn--full" id="btnGenerate">
          AI 카피 생성
        </button>
      </div>

      <!-- 상태 표시 -->
      <div class="sidebar__status" id="status"></div>

      <!-- 렌더링 메타 정보 -->
      <div class="sidebar__meta" id="renderMeta" style="display:none;">
        <h3>렌더링 결과</h3>
        <div id="metaContent"></div>
      </div>
    </aside>

    <!-- 프리뷰 영역 -->
    <main class="preview-area">
      <div class="preview-toolbar">
        <div class="preview-toolbar__view">
          <button class="view-btn active" data-width="375">모바일</button>
          <button class="view-btn" data-width="768">태블릿</button>
          <button class="view-btn" data-width="100%">데스크톱</button>
        </div>
        <button class="btn btn--ghost" id="btnExportHtml">HTML 내보내기</button>
      </div>
      <div class="preview-frame" id="previewFrame">
        <div class="preview-container" id="previewContainer">
          <div class="preview-empty">
            <p>URL을 입력하거나 샘플을 선택하세요</p>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- ES Module 진입점 -->
  <script type="module" src="app.js"></script>
</body>
</html>
```

### public/lib/block-loader.js

```javascript
// public/lib/block-loader.js
/**
 * 브라우저에서 블록 렌더러를 동적으로 로딩한다.
 *
 * 각 blocks/*.js 파일은 import 시 registerBlock()을 자동 호출하므로,
 * import만 하면 block-registry에 등록된다.
 */

const BLOCK_FILES = [
  'hero',
  'trustBadges',
  'highlights',
  'overview',
  'guideProfile',
  'itinerary',
  'inclusions',
  'optionTable',
  'imageGrid',
  'usageGuide',
  'comparison',
  'recommendFor',
];

let loaded = false;

/**
 * 모든 블록 렌더러를 로딩한다.
 * 멱등성 보장: 이미 로딩했으면 스킵.
 */
export async function loadAllBlocks() {
  if (loaded) return;

  const imports = BLOCK_FILES.map(name =>
    import(`/blocks/${name}.js`).catch(err => {
      console.warn(`[block-loader] "${name}" 블록 로딩 실패:`, err.message);
    })
  );

  await Promise.all(imports);
  loaded = true;
  console.log('[block-loader] 전체 블록 로딩 완료');
}
```

### public/app.js

```javascript
// public/app.js
import { loadAllBlocks } from './lib/block-loader.js';
import { renderPDP, mountPDP, unmountPDP } from '/engine/pdp-engine.js';
import { getRegisteredBlocks } from '/engine/block-registry.js';
import { validateProductData } from '/engine/data-validator.js';

// ── 상태 관리 ──
const state = {
  rawData: null,           // extractor에서 추출한 원본 데이터
  productData: null,       // 블록별 데이터 (렌더링용)
  category: null,
  loading: false,
  step: 'idle',            // idle → extracting → extracted → generating → ready
};

// ── DOM 요소 ──
const $ = (sel) => document.querySelector(sel);
const previewContainer = $('#previewContainer');
const statusEl = $('#status');

// ── 초기화 ──
document.addEventListener('DOMContentLoaded', async () => {
  // 블록 렌더러 로딩
  await loadAllBlocks();
  console.log('[app] 등록된 블록:', getRegisteredBlocks());

  // 이벤트 바인딩
  bindEvents();
});
```

**주요 핸들러:**

- `handleExtract()` -- URL 입력 → `POST /api/extract` → 카테고리 셀렉터 표시
- `handleLoadSample()` -- 샘플 JSON fetch → 검증 → 즉시 렌더링
- `handleGenerate()` -- `POST /api/generate` → 렌더링 + 메타 정보 표시
- `renderPreview()` -- `unmountPDP()` → `renderPDP()` → `mountPDP()` 순서로 기존 엔진 활용
- `handleExportHtml()` -- `previewContainer.innerHTML`을 Blob → 다운로드

**뷰 토글:**

- 모바일 (375px) / 태블릿 (768px) / 데스크톱 (100%)
- MRT 모바일 퍼스트이므로 375px이 기본

---

## 6. 샘플 데이터 구조

### 파일 네이밍 규칙

```
samples/{category-key}.json
```

| 카테고리 상수 | 파일명 |
|-------------|--------|
| TOUR | `tour.json` |
| TICKET_THEME | `ticket-theme.json` |
| TICKET_TRANSPORT | `ticket-transport.json` |
| TICKET_CITYPASS | `ticket-citypass.json` |
| TICKET_EXPERIENCE | `ticket-experience.json` |
| ACTIVITY | `activity.json` |
| SERVICE | `service.json` |
| SEMI_PACKAGE | `semi-package.json` |

### 필수/선택 필드 정의

모든 샘플 JSON의 최상위 구조:

```json
{
  "category": "TOUR",              // 필수. VALID_CATEGORIES 중 하나
  "blocks": {                      // 필수. 블록별 데이터
    "hero": {},                    // 필수
    "trustBadges": {},             // 선택 (데이터 없으면 생략)
    "highlights": {},              // 필수
    "overview": {},                // 필수
    "guideProfile": {},            // 선택 (TOUR, SERVICE만)
    "itinerary": {},               // 선택 (TOUR, ACTIVITY, SEMI_PACKAGE)
    "inclusions": {},              // 필수
    "optionTable": {},             // 선택
    "imageGrid": {},               // 선택
    "usageGuide": {},              // 선택
    "comparison": {},              // 선택 (TICKET_CITYPASS, SEMI_PACKAGE)
    "recommendFor": {},            // 선택
    "notice": {},                  // 필수 (data-validator 기준)
    "faq": {},                     // 필수
    "cta": {}                      // 필수
  }
}
```

### samples/tour.json 예시

기존 `script.js` 데이터를 정리하고, 블록 렌더러 스키마에 맞게 정규화한 샘플:

```json
{
  "category": "TOUR",
  "blocks": {
    "hero": {
      "image": { "url": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80", "alt": "이스탄불 블루모스크와 도시 전경" },
      "badges": [
        { "type": "korean_guide", "label": "한국어 가이드" },
        { "type": "small_group", "label": "프라이빗" },
        { "type": "instant_confirm", "label": "즉시확정" }
      ],
      "title": "이스탄불 올드 시티 프라이빗 가이드 투어",
      "subtitle": "블루모스크 · 아야소피아 · 그랜드 바자르를 하루에",
      "rating": { "score": 4.8, "count": 327 }
    },
    "trustBadges": {
      "badges": [
        { "type": "korean_guide", "label": "한국어 가이드", "icon": "🗣️" },
        { "type": "small_group", "label": "프라이빗", "icon": "👤" },
        { "type": "instant_confirm", "label": "즉시확정", "icon": "⚡" }
      ]
    },
    "highlights": {
      "title": "이 투어의 매력",
      "items": [
        { "icon": "🕌", "text": "블루모스크 내부의 2만 장 이즈닉 타일을 전문 가이드와 감상" },
        { "icon": "👨‍👩‍👧‍👦", "text": "우리 가족만을 위한 프라이빗 투어, 아이 속도에 맞춰 진행" },
        { "icon": "🚐", "text": "호텔 픽업/샌딩 포함, 이동 걱정 제로" },
        { "icon": "📸", "text": "가이드가 알려주는 인생샷 포인트에서 사진 촬영" }
      ]
    },
    "overview": {
      "title": "상품 소개",
      "paragraphs": [
        "이스탄불의 심장부, 올드 시티를 하루 만에 깊이 있게 만나는 프라이빗 투어입니다.",
        "관광객으로 붐비는 루트 대신, 현지인만 아는 골목길과 로컬 카페를 경유하는 특별한 동선입니다.",
        "10년 이상 이스탄불에 거주한 한국인 가이드가 동행합니다."
      ]
    },
    "guideProfile": {
      "name": "김서연",
      "photo": { "url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", "alt": "김서연" },
      "experience": "이스탄불 거주 12년",
      "languages": ["한국어", "English", "Turkce"],
      "introduction": "이스탄불에서 12년째 살고 있는 김서연입니다. 터키 역사학을 전공했고, 2,000회 이상의 투어를 진행했어요.",
      "certifications": ["인기 가이드", "전문 가이드"]
    },
    "itinerary": {
      "title": "투어 일정",
      "type": "timeline",
      "stops": [
        { "time": "09:00", "title": "호텔 픽업", "description": "숙소 로비에서 가이드가 직접 픽업합니다." },
        { "time": "09:30", "title": "블루모스크", "description": "오스만 건축의 걸작.", "duration": "약 50분" },
        { "time": "10:30", "title": "히포드롬 광장", "description": "로마 시대 전차 경기장.", "duration": "약 20분" },
        { "time": "11:00", "title": "아야소피아", "description": "비잔틴과 오스만 두 문화가 공존.", "duration": "약 60분" },
        { "time": "12:30", "title": "점심", "description": "현지 맛집에서 케밥.", "duration": "약 60분" },
        { "time": "13:30", "title": "그랜드 바자르", "description": "세계 최대 실내 시장.", "duration": "약 60분" },
        { "time": "14:30", "title": "호텔 복귀", "description": "전용 차량으로 이동." }
      ],
      "totalDuration": "약 5시간 30분"
    },
    "inclusions": {
      "title": "포함 / 불포함",
      "included": [
        { "text": "한국어 전문 가이드", "detail": "12년 경력" },
        { "text": "전용 차량 이동", "detail": "호텔 픽업/샌딩 포함" },
        { "text": "블루모스크·아야소피아 입장료" },
        { "text": "생수 1병" },
        { "text": "여행자 보험" }
      ],
      "excluded": [
        { "text": "점심 식사", "tip": "현지 맛집 안내 (1인 약 15,000원)" },
        { "text": "그랜드 바자르 쇼핑 비용" },
        { "text": "가이드 팁", "tip": "선택사항 (1인 $5~10)" }
      ]
    },
    "recommendFor": {
      "title": "이런 분에게 추천해요",
      "targets": [
        { "icon": "👨‍👩‍👧", "text": "아이와 함께 편한 투어를 원하는 가족" },
        { "icon": "📖", "text": "역사·문화 해설을 깊이 듣고 싶은 분" },
        { "icon": "📸", "text": "인생샷 포인트가 궁금한 분" }
      ]
    },
    "notice": {
      "title": "알아두세요",
      "sections": [
        {
          "subtitle": "복장 안내",
          "type": "dress_code",
          "severity": "warning",
          "items": ["블루모스크 입장 시 긴 바지, 어깨를 덮는 복장 필요", "편한 운동화 권장"]
        },
        {
          "subtitle": "운영 안내",
          "type": "general",
          "severity": "info",
          "items": ["금요일 예배 시간 입장 불가", "최소 출발 인원: 2명"]
        }
      ]
    },
    "faq": {
      "title": "자주 묻는 질문",
      "items": [
        { "question": "비가 오면 어떻게 되나요?", "answer": "비가 와도 정상 진행됩니다." },
        { "question": "유모차를 가져가도 되나요?", "answer": "가능하지만 접이식을 권장합니다." },
        { "question": "취소/환불은 어떻게 되나요?", "answer": "이용일 3일 전까지 무료 취소 가능합니다." }
      ]
    },
    "cta": {
      "priceDisplay": { "originalPrice": 189000, "currentPrice": 159000, "currency": "원", "unit": "1인" },
      "buttonText": "날짜 확인하기",
      "urgencyText": "이번 주 12명이 예약했어요"
    }
  }
}
```

### 스키마 차이점 정리

`script.js`의 인라인 데이터와 `blocks/*.js` 렌더러가 기대하는 스키마 사이의 차이. 샘플 JSON은 **블록 렌더러 기준**으로 작성하고, 차이가 있는 부분은 `field-mapper.js`가 보정한다.

| 블록 | script.js 키 | blocks/*.js 기대 키 | 비고 |
|------|------------|-------------------|------|
| itinerary | `items` | `stops` | 렌더러가 `data.stops` 사용 |
| recommendFor | `items[].emoji` | `targets[].icon` | 키 이름 + 배열명 모두 다름 |
| guideProfile | `photo` (string) | `photo.url` (object) | script.js는 string, 렌더러는 object |
| inclusions | `excluded[].detail` | `excluded[].tip` | 렌더러가 `tip`으로 대체 팁 표시 |

---

## 7. 구현 순서 (단계별)

### Phase 1: 로컬 프리뷰 (서버 + 샘플 렌더링) -- 1~2일

**목표**: Express 서버를 띄우고, 기존 블록 엔진으로 샘플 데이터를 프리뷰하는 것

1. `package.json` 생성 + 의존성 설치
2. `server.js` 작성 (정적 파일 서빙만, API는 스텁)
3. `public/index.html` + `public/app.css` 작성
4. `public/lib/block-loader.js` 작성
5. `public/app.js` 작성 (샘플 로딩 + 렌더링만)
6. `samples/tour.json` 작성 (script.js에서 추출 + 스키마 정규화)
7. `lib/field-mapper.js` 작성

**의존성**: 없음. 순수하게 기존 코드 활용.
**검증**: `npm start` → http://localhost:3000 → 샘플 선택 → 블록 렌더링 확인.

### Phase 2: 스크래핑 (URL 추출) -- 2~3일

**목표**: MRT 상품 URL을 넣으면 데이터가 추출되는 것

1. `lib/extractor.js` 작성
2. `server.js`에 `POST /api/extract` 연결
3. `public/app.js`에 URL 입력 → 추출 → 상태 표시 흐름 연결
4. 실제 MRT URL로 테스트 (최소 3개 카테고리)
5. HTML 폴백 파싱 보강

**의존성**: Phase 1 완료.
**리스크**: MRT 페이지 구조가 예상과 다를 수 있음 → `__NEXT_DATA__` 경로 조정 필요.

### Phase 3: AI 카피 생성 -- 2~3일

**목표**: 추출된 원본 데이터를 AI가 블록 스키마에 맞는 카피로 변환

1. `.env` 설정 + Anthropic SDK 연결 확인
2. `lib/generator.js` 작성
3. `server.js`에 `POST /api/generate` 연결
4. `public/app.js`에 추출 → 생성 → 렌더링 전체 파이프라인 연결
5. 프롬프트 튜닝 (카테고리별 최소 1개씩 테스트)
6. 비용 추적 로그 추가

**의존성**: Phase 2 완료 (rawData가 있어야 생성 가능).

### Phase 4: 나머지 샘플 + 폴리싱 -- 1~2일

**목표**: 8개 카테고리 전체 커버 + UX 마무리

1. 나머지 7개 샘플 JSON 작성 (`samples/*.json`)
2. HTML 내보내기 기능 완성
3. 에러 상태 UI 개선 (재시도 버튼, 구체적 에러 메시지)
4. 프리뷰 영역 CSS 폴리싱 (블록 간 간격, 반응형)
5. 로딩 스피너 + 스켈레톤 UI

**의존성**: Phase 1~3 모두 완료.

### 의존성 관계 다이어그램

```
Phase 1 ─────→ Phase 2 ─────→ Phase 3 ─────→ Phase 4
(샘플 프리뷰)   (스크래핑)      (AI 생성)       (폴리싱)
  │                                               │
  └───── Phase 4의 샘플 작업은 Phase 1 이후 병렬 가능 ┘
```

Phase 4의 "나머지 샘플 JSON 작성"은 Phase 1 완료 후 병렬로 진행 가능. 하지만 AI 생성 테스트는 Phase 3 이후.

---

## 핵심 설계 결정 정리

| 결정 사항 | 선택 | 이유 |
|----------|------|------|
| 기존 코드 수정 | 안 함 | engine/blocks/recipes가 이미 잘 설계돼 있음. 건드릴 필요 없음 |
| 블록 로딩 방식 | 브라우저 ES Module 직접 import | 번들러 없이 동작 가능. 블록 파일이 이미 ES Module |
| AI 호출 방식 | 단일 호출 (전체 블록 JSON 한 번에) | 블록별 분리 호출 대비 비용 50% 절감, 블록 간 일관성 유지 |
| 서버 프레임워크 | Express | 가장 간단. 의존성 최소. 정적 파일 서빙 + API 2개면 충분 |
| 스크래핑 도구 | fetch + cheerio | Puppeteer 불필요 (SSR 페이지라 HTML에 데이터가 있음) |
| 스키마 차이 보정 | field-mapper.js 별도 모듈 | 기존 블록 코드 수정 없이 데이터만 정규화 |
| 프리뷰 프레임 크기 | 375px / 768px / 100% | MRT 모바일 퍼스트. 주요 확인은 375px에서 |
