/**
 * MRT 상품 URL → 구조화된 상품 데이터 추출
 *
 * 추출 전략 (우선순위):
 *   1. experiences.myrealtrip.com __NEXT_DATA__ (dehydratedState 파티션 구조)
 *   2. React on Rails 컴포넌트 데이터 (script[data-component-name="Offer"])
 *   3. __NEXT_DATA__ (Next.js pageProps 직접 접근)
 *   4. HTML 메타 + DOM 파싱 (폴백)
 */

import * as cheerio from 'cheerio';

const USER_AGENT =
  process.env.USER_AGENT ||
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ─── MRT API 설정 ──────────────────────────────────────────
// 테스트 환경 (운영 배포 후 gateway URL로 교체 예정)
const MRT_API_BASE = process.env.MRT_API_BASE || 'https://api3.myrealtrip.com/traveler-experiences';
const MRT_API_KEY = process.env.MRT_API_KEY || 'a1b2c3d4-5678-9012-ef34-567890abcdef';

// URL 또는 ID에서 상품 ID 추출
function extractProductId(urlOrId) {
  // 숫자만 들어온 경우
  if (/^\d+$/.test(urlOrId.trim())) return urlOrId.trim();
  // URL에서 숫자 ID 추출
  const match = urlOrId.match(/\/(\d{4,})/);
  return match ? match[1] : null;
}

// MRT 내부 API로 메타 데이터 조회
async function fetchFromMrtApi(productId) {
  const url = `${MRT_API_BASE}/api/v1/open/products/${productId}/meta`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, {
      headers: {
        'accept': 'application/json;charset=UTF-8',
        'X-Mrt-Authorization': MRT_API_KEY,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json();
    if (json.result?.status !== 200 || !json.data) return null;

    const d = json.data;
    return {
      id: d.id,
      title: d.title,
      status: d.status,
      // 카테고리: API가 정확한 1차/2차/3차 분류 제공
      firstStandardCategory: d.firstStandardCategory,
      secondStandardCategory: d.secondStandardCategory,
      thirdStandardCategory: d.thirdStandardCategory,
      integrationType: d.integrationType,
      partnerId: d.partnerId,
      price: d.price,
      currency: d.currency,
      duration: d.duration,
      languages: d.languages,
      transport: d.transport,
      images: (d.images || []).map(img => ({ url: img.imageUrl, position: img.position })),
      regionCategories: d.regionCategories,
      displayCategories: d.displayCategories,
      firstPublishedAt: d.firstPublishedAt,
      sellingCount: d.sellingCount,
    };
  } catch (err) {
    clearTimeout(timeout);
    console.warn('[extractor] MRT API 호출 실패:', err.message);
    return null;
  }
}

// API 카테고리 → 빌더 카테고리 매핑
function mapApiCategory(apiData) {
  if (!apiData?.firstStandardCategory) return null;
  const catMap = {
    'TOUR': 'TOUR',
    'TICKET': 'TICKET',
    'ACTIVITY': 'ACTIVITY',
    'CLASS': 'CLASS',
    'SNAP': 'SNAPS',
    'SNAPS': 'SNAPS',
    'CONVENIENCE': 'CONVENIENCE',
  };
  const d2Map = {
    // TOUR
    'GUIDE_TOUR': '가이드 투어',
    'NIGHT_TOUR': '가이드 투어',
    'WALKING_TOUR': '가이드 투어',
    'DAY_TOUR': '가이드 투어',
    'PRIVATE_TOUR': '가이드 투어',
    'GROUP_TOUR': '가이드 투어',
    'SUBURB_TOUR': '가이드 투어',
    'CRUISE_TOUR': '크루즈·페리 투어',
    'CRUISE': '크루즈·페리 투어',
    'SEMI_PACKAGE': '세미패키지·패키지 투어',
    'PACKAGE_TOUR': '세미패키지·패키지 투어',
    // TICKET
    'ENTRANCE': '입장권',
    'ADMISSION_TICKET': '입장권',
    'THEME_PARK': '입장권',
    'MUSEUM': '입장권',
    'OBSERVATORY': '입장권',
    'ATTRACTION': '입장권',
    'TRANSPORT': '교통',
    'RAIL_PASS': '교통',
    'BUS_PASS': '교통',
    'CITY_PASS': '시티패스',
    'CITYPASS': '시티패스',
    'PERFORMANCE': '공연',
    'SHOW': '공연',
    'MUSICAL': '공연',
    'BEAUTY': '뷰티',
    'SPA': '뷰티',
    'MASSAGE': '뷰티',
    'FOOD': '미식',
    'RESTAURANT': '미식',
    'FOOD_TOUR': '미식',
    // ACTIVITY
    'WATER_ACTIVITY': '수중 액티비티',
    'DIVING': '수중 액티비티',
    'SNORKELING': '수중 액티비티',
    'WATER_SPORTS': '수상 액티비티',
    'GROUND_ACTIVITY': '그라운드 액티비티',
    'HIKING': '그라운드 액티비티',
    'SKY_ACTIVITY': '스카이 액티비티',
    'PARAGLIDING': '스카이 액티비티',
    // CONVENIENCE
    'PICKUP': '픽업·샌딩',
    'SIM': '유심·와이파이',
    'WIFI': '유심·와이파이',
    'LUGGAGE': '짐 관리',
    'RENTAL': '대여',
  };
  return {
    category: catMap[apiData.firstStandardCategory] || 'TOUR',
    depth2: d2Map[apiData.secondStandardCategory] || null,
  };
}

// ─── 공개 API ────────────────────────────────────────────────

export async function extractProductData(url) {
  const normalizedUrl = normalizeUrl(url);
  const productId = extractProductId(url);
  const warnings = [];

  // ── Step 0: MRT API + 스크래핑 병렬 실행
  const apiPromise = productId ? fetchFromMrtApi(productId) : Promise.resolve(null);
  const htmlPromise = fetchPage(normalizedUrl).catch((err) => {
    warnings.push(`스크래핑 실패: ${err.message}`);
    return null; // 스크래핑 실패해도 API만으로 진행
  });

  const [apiData, html] = await Promise.all([apiPromise, htmlPromise]);

  if (apiData) {
    console.log(`[extractor] MRT API 성공: ${apiData.title} (${apiData.firstStandardCategory})`);
    warnings.push('MRT API 데이터 병합됨');
  }

  let rawData = null;
  let extractMethod = '';

  if (html) {
    // Strategy 1: experiences.myrealtrip.com (dehydratedState 파티션 구조)
    rawData = extractFromExperiencesNextData(html);
    extractMethod = 'experiences_next_data';

    // Strategy 2: React on Rails 컴포넌트 데이터
    if (!rawData) {
      rawData = extractFromReactOnRails(html);
      extractMethod = 'react_on_rails';
    }

    // Strategy 3: __NEXT_DATA__ (pageProps 직접)
    if (!rawData) {
      rawData = extractFromNextData(html);
      extractMethod = '__NEXT_DATA__';
    }

    if (!rawData) {
      warnings.push('experiences/__NEXT_DATA__/React on Rails 모두 실패, HTML 파싱으로 폴백');
    }

    // Strategy 4: HTML 파싱 (최소한의 데이터)
    if (!rawData) {
      rawData = extractFromHTML(html);
      extractMethod = 'html_parse';
    }
  }

  // Strategy 5: 스크래핑 전부 실패 → API 데이터만으로 구성
  if ((!rawData || !rawData.title) && apiData) {
    rawData = {
      id: apiData.id,
      title: apiData.title,
      description: '',
      images: apiData.images,
      price: { amount: apiData.price, currency: apiData.currency || 'KRW' },
      duration: apiData.duration ? apiData.duration + '분' : '',
      languages: apiData.languages,
      transport: apiData.transport,
      regionCategories: apiData.regionCategories,
    };
    extractMethod = 'mrt_api_only';
    warnings.push('스크래핑 실패, API 데이터만으로 구성');
  }

  if (!rawData || !rawData.title) {
    const err = new Error('상품 데이터를 추출할 수 없습니다.');
    err.code = 'EXTRACT_FAILED';
    err.detail = `URL: ${normalizedUrl}`;
    throw err;
  }

  // ── API 데이터 병합: 스크래핑 데이터에 API 정보를 보강
  if (apiData) {
    rawData._apiMeta = apiData;
    // API 이미지가 더 정확하면 교체
    if (apiData.images.length && (!rawData.images || !rawData.images.length)) {
      rawData.images = apiData.images;
    }
    // 가격 정보 보강
    if (apiData.price && !rawData.price?.amount) {
      rawData.price = { amount: apiData.price, currency: apiData.currency || 'KRW' };
    }
    // duration 보강
    if (apiData.duration && !rawData.duration) {
      rawData.duration = apiData.duration + '분';
    }
    extractMethod += '+mrt_api';
  }

  // 카테고리: API가 있으면 API 기준, 없으면 스크래핑 추론
  let suggestedCategory;
  let suggestedDepth2 = null;
  if (apiData) {
    const mapped = mapApiCategory(apiData);
    suggestedCategory = mapped?.category || inferCategory(rawData);
    suggestedDepth2 = mapped?.depth2;
  } else {
    suggestedCategory = inferCategory(rawData);
  }

  return {
    success: true,
    extractMethod,
    rawData,
    suggestedCategory,
    suggestedDepth2,
    warnings,
  };
}

// ─── URL 정규화 ──────────────────────────────────────────────

function normalizeUrl(url) {
  let normalized = url.trim();

  // 프로토콜 없으면 https 추가
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }

  // http → https
  normalized = normalized.replace(/^http:\/\//, 'https://');

  // myrealtrip.com 확인
  try {
    const parsed = new URL(normalized);
    if (!parsed.hostname.includes('myrealtrip.com')) {
      const err = new Error('마이리얼트립 도메인이 아닙니다.');
      err.code = 'EXTRACT_FAILED';
      throw err;
    }
    return normalized;
  } catch (e) {
    if (e.code === 'EXTRACT_FAILED') throw e;
    const err = new Error(`유효하지 않은 URL입니다: ${url}`);
    err.code = 'EXTRACT_FAILED';
    throw err;
  }
}

// ─── 페이지 가져오기 ─────────────────────────────────────────

async function fetchPage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!response.ok) {
      const err = new Error(
        `페이지 요청 실패 (HTTP ${response.status}): ${url}`,
      );
      err.code = 'EXTRACT_FAILED';
      err.detail = `status: ${response.status}`;
      throw err;
    }

    return await response.text();
  } catch (e) {
    if (e.code === 'EXTRACT_FAILED') throw e;
    if (e.name === 'AbortError') {
      const err = new Error(`페이지 요청 타임아웃 (15초): ${url}`);
      err.code = 'EXTRACT_FAILED';
      throw err;
    }
    const err = new Error(`페이지 요청 실패: ${e.message}`);
    err.code = 'EXTRACT_FAILED';
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Strategy 1: experiences.myrealtrip.com dehydratedState ──

function extractFromExperiencesNextData(html) {
  try {
    const $ = cheerio.load(html);
    const scriptEl = $('#__NEXT_DATA__');
    if (!scriptEl.length) return null;

    const nextData = JSON.parse(scriptEl.html());
    const queries =
      nextData?.props?.pageProps?.dehydratedState?.queries;
    if (!Array.isArray(queries)) return null;

    // header 쿼리 찾기: queryKey에 'experienceProduct'와 'header' 포함
    const headerQuery = queries.find(
      (q) =>
        Array.isArray(q.queryKey) &&
        q.queryKey.includes('experienceProduct') &&
        q.queryKey.includes('header'),
    );
    // item 쿼리 찾기: queryKey에 'experienceProduct'와 'item' 포함
    const itemQuery = queries.find(
      (q) =>
        Array.isArray(q.queryKey) &&
        q.queryKey.includes('experienceProduct') &&
        q.queryKey.includes('item'),
    );

    if (!headerQuery && !itemQuery) return null;

    const header = headerQuery?.state?.data?.data || {};
    const partitions = itemQuery?.state?.data?.data?.partitions || [];

    // 파티션을 viewType/key로 빠르게 조회
    const partMap = {};
    for (const p of partitions) {
      const k = p.key || p.viewType;
      // CONTAINER는 key로 구분 (INCLUDE_EXCLUDE, USAGE, ESSENTIALS, REFUND)
      if (p.viewType === 'CONTAINER' && p.key) {
        partMap[p.key] = p;
      } else {
        partMap[p.viewType] = p;
      }
    }

    const getPD = (key) => partMap[key]?.partitionData || null;

    // ── 이미지
    const rawImages = header.images || [];
    const images = rawImages.map((img) => ({
      url: img.url || '',
      alt: header.title || '',
    }));

    // ── 리뷰/별점
    const reviewPD = getPD('REVIEW');
    const reviewStat = reviewPD?.travelerReview?.statistic || {};
    const reviewScore =
      parseFloat(header.reviewScore) || reviewStat.averageScore || null;
    const reviewCountMatch = (header.reviewCountDescription || '').match(
      /(\d+)/,
    );
    const reviewCount = reviewCountMatch
      ? parseInt(reviewCountMatch[1], 10)
      : reviewStat.reviewCount || 0;

    // ── 지역
    const regionArr = header.region || [];
    const country = regionArr[0] || null;
    const city = regionArr[1] || regionArr[0] || null;

    // ── 태그/배지
    const displayTags = header.displayTags || [];
    const tags = displayTags.map(
      (t) => t.name || t.label || '',
    );

    // ── 파트너/가이드
    const partnerPD = getPD('PARTNER');
    const partner = partnerPD?.partner || {};

    // ── 소개 (HTML)
    const introPD = getPD('INTRODUCTION');
    const introHtml = introPD?.introduction || '';
    // HTML 태그 제거하여 텍스트 추출
    const introText = introHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    // 상세 소개 HTML에서 이미지 URL 추출 (기존 PDP 이미지)
    const descriptionImages = [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(introHtml)) !== null) {
      const url = imgMatch[1];
      if (url && url.startsWith('http') && !url.includes('pixel') && !url.includes('tracking')) {
        descriptionImages.push(url);
      }
    }

    // ── 일정
    const itinPD = getPD('ITINERARIES');
    const itineraries = itinPD?.itineraries || [];
    const itineraryText = itineraries
      .map((itin) => {
        const slotsText = (itin.slots || [])
          .map((s) => `${s.title || ''}: ${s.description || ''}`)
          .join('\n');
        return itin.title ? `[${itin.title}]\n${slotsText}` : slotsText;
      })
      .join('\n\n');
    // 구조화된 itinerary 데이터도 보존
    const itinerarySlots = itineraries.flatMap((itin) =>
      (itin.slots || []).map((s) => ({
        title: s.title || '',
        description: s.description || '',
        imageUrl: s.imageUrl || null,
      })),
    );

    // ── 포함/불포함
    const inclExclPD = getPD('INCLUDE_EXCLUDE');
    const inclExclItems = inclExclPD?.items || [];
    const includesItem = inclExclItems.find((i) => i.key === 'INCLUDES');
    const excludesItem = inclExclItems.find((i) => i.key === 'EXCLUDES');
    const includes = (includesItem?.descriptions || []).flatMap((d) =>
      (d.description || '').split(/\r?\n/).filter(Boolean),
    );
    const excludes = (excludesItem?.descriptions || []).flatMap((d) =>
      (d.description || '').split(/\r?\n/).filter(Boolean),
    );

    // ── 이용안내 (만나는시간, 만나는장소)
    const usagePD = getPD('USAGE');
    const usageItems = usagePD?.items || [];
    const meetingTime = usageItems
      .filter((i) => i.key === 'TIME')
      .flatMap((i) =>
        (i.descriptions || []).map((d) => d.description || ''),
      )
      .join(', ');
    const meetingPlace = usageItems
      .filter((i) => i.key === 'PLACE')
      .map((i) => {
        const descs = (i.locationData?.descriptions || [])
          .map((d) => d.description || '')
          .join(', ');
        return descs;
      })
      .join(', ');

    // ── 필수 확인사항
    const essentialsPD = getPD('ESSENTIALS');
    const essentialsItems = essentialsPD?.items || [];
    const notices = essentialsItems.flatMap((i) =>
      (i.descriptions || []).map((d) => d.description || ''),
    );

    // ── 취소/환불
    const refundPD = getPD('REFUND');
    const refundItems = refundPD?.items || [];
    const refundPolicy = refundItems
      .flatMap((i) =>
        (i.descriptions || []).map((d) => d.description || ''),
      )
      .join('\n');

    // ── FAQ
    const faqPD = getPD('FAQ');
    const faqs = (faqPD?.faqs || []).map((f) => ({
      question: f.title || '',
      answer: f.description || '',
    }));

    // ── 리뷰 상세
    const representReviews =
      reviewPD?.travelerReview?.representReview?.reviews || [];
    const reviewSummary = {
      positive: representReviews
        .filter((r) => r.score >= 4)
        .map((r) => r.body || r.description || '')
        .slice(0, 3),
      negative: representReviews
        .filter((r) => r.score <= 2)
        .map((r) => r.body || r.description || '')
        .slice(0, 3),
    };

    // ── 메트릭 (확정률, 당일확정 등)
    const metricPD = getPD('METRIC_SECTION');
    const metrics = (metricPD?.items || []).map((m) => ({
      title: m.title || '',
      description: m.description || '',
    }));

    // ── 상품 ID 추출
    const idFromKey = headerQuery?.queryKey?.find(
      (k) => typeof k === 'number',
    );

    return {
      id: idFromKey || null,
      title: header.title || '',
      description: introText,
      descriptionHtml: introHtml,
      images,
      descriptionImages: descriptionImages.slice(0, 10),
      price: { amount: null, currency: '₩', originalAmount: null },
      rating: { score: reviewScore, reviewCount },
      options: [],
      category: null,
      location: { city, country },
      tags,
      includes,
      excludes,
      itinerary: itineraryText,
      itinerarySlots,
      notices,
      faq: faqs,
      reviewSummary,
      guideName: partner.name || null,
      guidePhoto: partner.profileImageUrl || null,
      guideIntro: partner.description || null,
      guideLanguages: [],
      meetingTime,
      meetingPlace,
      refundPolicy,
      metrics,
      instantConfirm: header.instantConfirm || false,
      displayTags: displayTags,
    };
  } catch (e) {
    console.warn(
      '[extractor] experiences __NEXT_DATA__ 파싱 실패:',
      e.message,
    );
    return null;
  }
}

// ─── Strategy 2: React on Rails ──────────────────────────────

function extractFromReactOnRails(html) {
  try {
    const $ = cheerio.load(html);

    // MRT는 Rails + React on Rails 구조.
    // 상품 데이터가 <script data-component-name="Offer"> 안에 JSON으로 들어있다.
    const scriptEl = $('script[data-component-name="Offer"]');
    if (!scriptEl.length) return null;

    const jsonStr = scriptEl.html();
    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);

    // React on Rails는 보통 props 안에 데이터를 넣는다
    const offer = parsed?.offer || parsed?.props?.offer || parsed;
    if (!offer) return null;

    return mapToRaw(offer);
  } catch (e) {
    console.warn('[extractor] React on Rails 파싱 실패:', e.message);
    return null;
  }
}

// ─── Strategy 2: __NEXT_DATA__ ───────────────────────────────

function extractFromNextData(html) {
  try {
    const $ = cheerio.load(html);

    const scriptEl = $('#__NEXT_DATA__');
    if (!scriptEl.length) return null;

    const jsonStr = scriptEl.html();
    if (!jsonStr) return null;

    const nextData = JSON.parse(jsonStr);

    // Next.js pageProps → offer 경로 탐색
    const pageProps = nextData?.props?.pageProps;
    if (!pageProps) return null;

    const offer =
      pageProps.offer ||
      pageProps.product ||
      pageProps.data?.offer ||
      pageProps.initialData?.offer;

    if (!offer) return null;

    return mapToRaw(offer);
  } catch (e) {
    console.warn('[extractor] __NEXT_DATA__ 파싱 실패:', e.message);
    return null;
  }
}

// ─── Strategy 3: HTML 메타 + DOM 파싱 ────────────────────────

function extractFromHTML(html) {
  try {
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text().trim() ||
      $('title').text().trim();

    if (!title) return null;

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    const ogImage = $('meta[property="og:image"]').attr('content');
    const images = ogImage ? [{ url: ogImage, alt: title }] : [];

    // 가격 추출 시도 — 다양한 셀렉터
    let priceAmount = null;
    const priceSelectors = [
      '.product-price .current',
      '.offer-price',
      '[class*="price"] [class*="current"]',
      '[class*="Price"] [class*="amount"]',
      '[data-testid="price"]',
    ];
    for (const selector of priceSelectors) {
      const el = $(selector).first();
      if (el.length) {
        const text = el.text().replace(/[^\d]/g, '');
        if (text) {
          priceAmount = parseInt(text, 10);
          break;
        }
      }
    }

    // 별점 추출 시도
    let ratingScore = null;
    let reviewCount = null;
    const ratingEl = $('[class*="rating"], [class*="Rating"]').first();
    if (ratingEl.length) {
      const ratingText = ratingEl.text();
      const scoreMatch = ratingText.match(/([\d.]+)/);
      if (scoreMatch) ratingScore = parseFloat(scoreMatch[1]);
    }
    const reviewEl = $(
      '[class*="review-count"], [class*="reviewCount"]',
    ).first();
    if (reviewEl.length) {
      const countMatch = reviewEl.text().match(/([\d,]+)/);
      if (countMatch) reviewCount = parseInt(countMatch[1].replace(/,/g, ''), 10);
    }

    return {
      id: extractOfferId($('meta[property="og:url"]').attr('content') || ''),
      title,
      description,
      images,
      price: priceAmount
        ? { amount: priceAmount, currency: '₩', originalAmount: null }
        : null,
      rating:
        ratingScore !== null
          ? { score: ratingScore, reviewCount: reviewCount || 0 }
          : null,
      options: [],
      category: null,
      location: { city: null, country: null },
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
  } catch (e) {
    console.warn('[extractor] HTML 파싱 실패:', e.message);
    return null;
  }
}

// ─── 원본 offer → 정규화된 rawData 매핑 ─────────────────────

function mapToRaw(offer) {
  if (!offer) return null;

  // 이미지 — 다양한 필드명 대응
  const rawImages =
    offer.images ||
    offer.photos ||
    offer.imageUrls ||
    offer.gallery ||
    [];
  const images = rawImages.map((img) => {
    if (typeof img === 'string') return { url: img, alt: '' };
    return {
      url: img.url || img.src || img.imageUrl || img.path || '',
      alt: img.alt || img.caption || img.description || '',
    };
  });

  // 가격 — 다양한 구조 대응
  const rawPrice = offer.price || offer.pricing || {};
  const price = {
    amount:
      rawPrice.amount ||
      rawPrice.sellingPrice ||
      rawPrice.salePrice ||
      rawPrice.current ||
      offer.sellingPrice ||
      null,
    currency: rawPrice.currency || rawPrice.currencyCode || '₩',
    originalAmount:
      rawPrice.originalAmount ||
      rawPrice.retailPrice ||
      rawPrice.originalPrice ||
      rawPrice.original ||
      offer.retailPrice ||
      null,
  };

  // 별점
  const rawRating = offer.rating || offer.review || offer.reviews || {};
  const rating = {
    score:
      rawRating.score ||
      rawRating.average ||
      rawRating.averageRating ||
      offer.averageRating ||
      null,
    reviewCount:
      rawRating.reviewCount ||
      rawRating.count ||
      rawRating.totalCount ||
      offer.reviewCount ||
      0,
  };

  // 옵션
  const rawOptions = offer.options || offer.optionGroups || offer.items || [];
  const options = rawOptions.map((opt) => ({
    name: opt.name || opt.title || '',
    description: opt.description || opt.subtitle || '',
    price: opt.price || opt.sellingPrice || opt.amount || null,
    originalPrice:
      opt.originalPrice || opt.retailPrice || opt.originalAmount || null,
  }));

  // 포함/불포함
  const includes =
    offer.includes ||
    offer.included ||
    offer.includedItems ||
    offer.inclusions ||
    [];
  const excludes =
    offer.excludes ||
    offer.excluded ||
    offer.excludedItems ||
    offer.exclusions ||
    [];

  // 태그
  const tags =
    offer.tags ||
    offer.badges ||
    offer.labels ||
    offer.features ||
    [];
  const normalizedTags = tags.map((t) =>
    typeof t === 'string' ? t : t.name || t.label || t.text || '',
  );

  // 가이드 정보
  const guide = offer.guide || offer.host || {};
  const guideName =
    guide.name || guide.displayName || offer.guideName || null;
  const guidePhoto =
    guide.photo ||
    guide.profileImage ||
    guide.avatarUrl ||
    offer.guidePhoto ||
    null;
  const guideIntro =
    guide.introduction ||
    guide.description ||
    guide.bio ||
    offer.guideIntro ||
    null;
  const guideLanguages =
    guide.languages || guide.spokenLanguages || offer.guideLanguages || [];

  // 위치
  const rawLocation = offer.location || offer.address || {};
  const location = {
    city:
      rawLocation.city ||
      rawLocation.cityName ||
      offer.city ||
      offer.cityName ||
      null,
    country:
      rawLocation.country ||
      rawLocation.countryName ||
      offer.country ||
      offer.countryName ||
      null,
  };

  // FAQ
  const rawFaq = offer.faq || offer.faqs || offer.frequentlyAskedQuestions || [];
  const faq = rawFaq.map((item) => ({
    question: item.question || item.q || '',
    answer: item.answer || item.a || '',
  }));

  // 공지
  const notices =
    offer.notices ||
    offer.warnings ||
    offer.importantNotices ||
    offer.cautions ||
    [];

  // 리뷰 요약
  const reviewSummary = {
    positive:
      offer.reviewSummary?.positive ||
      offer.reviewHighlights?.positive ||
      [],
    negative:
      offer.reviewSummary?.negative ||
      offer.reviewHighlights?.negative ||
      [],
  };

  return {
    id: offer.id || offer.offerId || null,
    title: offer.title || offer.name || offer.productName || '',
    description:
      offer.description ||
      offer.summary ||
      offer.shortDescription ||
      '',
    images,
    price,
    rating,
    options,
    category:
      offer.category ||
      offer.categoryCode ||
      offer.productType ||
      null,
    location,
    tags: normalizedTags,
    includes: normalizeStringArray(includes),
    excludes: normalizeStringArray(excludes),
    itinerary: offer.itinerary || offer.schedule || offer.courseInfo || '',
    notices: normalizeStringArray(notices),
    faq,
    reviewSummary,
    guideName,
    guidePhoto:
      typeof guidePhoto === 'string'
        ? guidePhoto
        : guidePhoto?.url || null,
    guideIntro,
    guideLanguages: normalizeStringArray(guideLanguages),
  };
}

// ─── 카테고리 추론 ───────────────────────────────────────────

function inferCategory(rawData) {
  // 원본 카테고리가 있으면 매핑 시도
  if (rawData.category) {
    const cat = rawData.category.toUpperCase();
    const VALID_CATEGORIES = [
      'TOUR',
      'TICKET_THEME',
      'TICKET_TRANSPORT',
      'TICKET_CITYPASS',
      'TICKET_EXPERIENCE',
      'ACTIVITY',
      'SERVICE',
      'SEMI_PACKAGE',
    ];
    if (VALID_CATEGORIES.includes(cat)) return cat;
  }

  const title = (rawData.title || '').toLowerCase();
  const titleAndTags = [
    rawData.title || '',
    ...(rawData.tags || []),
  ]
    .join(' ')
    .toLowerCase();
  const fullText = [
    rawData.title || '',
    rawData.description || '',
    ...(rawData.tags || []),
  ]
    .join(' ')
    .toLowerCase();

  // ── Phase 1: 제목 기반 강한 신호 (우선순위 높음)
  const titleRules = [
    // 1) 투어 (최우선 — "투어", "가이드" 키워드가 있으면 입장료 포함이어도 투어)
    {
      keywords: [
        '투어', 'tour', '가이드', 'guided',
        '워킹투어', '데이투어', '단독투어',
      ],
      category: 'TOUR',
    },
    {
      keywords: ['세미패키지', '세미 패키지', '항공+호텔', '항공+숙박'],
      category: 'TOUR',
    },
    // 2) 시티패스/교통 (투어 아닌 경우)
    {
      keywords: ['시티패스', 'citypass', 'city pass', '주유패스', '주유 패스'],
      category: 'TICKET',
    },
    {
      keywords: [
        '공항', '셔틀', '리무진', '트랜스퍼', '버스패스', '레일패스',
        '홉온홉오프', '관광버스', '시티버스', '시티투어버스', '더블데커',
        'hop on', 'hop off', 'sightseeing bus', 'double decker',
        'transfer', 'airport', 'shuttle', 'bus pass', 'rail pass',
      ],
      category: 'TICKET',
    },
    // 3) 테마파크
    {
      keywords: [
        '테마파크', '유니버설', '디즈니', '놀이공원', '워터파크', '레고랜드',
        'theme park', 'universal', 'disney', 'legoland',
      ],
      category: 'TICKET',
    },
    // 4) 입장권/티켓 (투어 키워드가 없을 때만 매칭)
    {
      keywords: [
        '입장권', '입장', '티켓', 'ticket', 'admission', 'entry',
        '전망대', '타워', '박물관', '미술관', '아쿠아리움', '수족관',
        '동물원', '식물원', '전시', '관람', '궁전', '패스',
        'tower', 'museum', 'gallery', 'aquarium', 'zoo', 'palace',
        'observatory', 'exhibition',
      ],
      category: 'TICKET',
    },
    {
      keywords: [
        '스노클링', '다이빙', '래프팅', '서핑', '번지', '짚라인',
        '카약', '패러글라이딩', '크루즈', '요트',
        'snorkeling', 'diving', 'rafting', 'surfing', 'cruise',
      ],
      category: 'ACTIVITY',
    },
    {
      keywords: [
        '체험', '클래스', '쿠킹', '원데이클래스', '공방',
        'workshop', 'class', 'cooking',
      ],
      category: 'CLASS',
    },
    {
      keywords: [
        'sim', '유심', 'esim', '와이파이', '포켓와이파이',
        '스냅', '촬영', '스파', '마사지', 'wifi',
      ],
      category: 'CONVENIENCE',
    },
  ];

  for (const rule of titleRules) {
    if (rule.keywords.some((kw) => title.includes(kw))) {
      return rule.category;
    }
  }

  // ── Phase 2: 제목+태그+설명 전체에서 매칭 (약한 신호)
  const fullRules = [
    {
      keywords: ['시티패스', 'citypass', '주유패스'],
      category: 'TICKET_CITYPASS',
    },
    {
      keywords: ['세미패키지', '항공+호텔', '패키지 투어'],
      category: 'SEMI_PACKAGE',
    },
    {
      keywords: [
        '스노클링', '다이빙', '래프팅', '서핑', '번지',
        '짚라인', '카약', '패러글라이딩', '크루즈', '요트',
      ],
      category: 'ACTIVITY',
    },
    {
      keywords: [
        '가이드 투어', '워킹투어', '프라이빗 투어', '데이투어', '단독투어',
        'guided tour', 'walking tour', 'private tour', 'day tour',
      ],
      category: 'TOUR',
    },
    {
      keywords: [
        '테마파크', '유니버설', '디즈니', '놀이공원',
      ],
      category: 'TICKET_THEME',
    },
    {
      keywords: [
        '유심', 'esim', '포켓와이파이', '스냅촬영',
      ],
      category: 'SERVICE',
    },
  ];

  for (const rule of fullRules) {
    if (rule.keywords.some((kw) => fullText.includes(kw))) {
      return rule.category;
    }
  }

  // ── Phase 3: 가이드 정보가 있으면 TOUR일 가능성 높음
  if (rawData.guideName) return 'TOUR';

  return 'TOUR'; // 기본값
}

// ─── 유틸리티 ────────────────────────────────────────────────

function normalizeStringArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) =>
    typeof item === 'string' ? item : item.text || item.name || item.label || String(item),
  );
}

function extractOfferId(url) {
  const match = url.match(/(?:offers|products)\/(\d+)/);
  return match ? match[1] : null;
}
