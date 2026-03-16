/**
 * Health Score V1 산출기
 *
 * 카테고리별 필수 블록 존재 여부를 기반으로 상품의 콘텐츠 완성도를 평가한다.
 * 참조: docs/phases/phase-1.md, docs/00-project-overview.md
 */

// 카테고리별 필수 블록 (Phase 1 기준)
const REQUIRED_BLOCKS = {
  TOUR: ['hero', 'highlights', 'overview', 'itinerary', 'inclusions', 'trustBadges'],
  TICKET_THEME: ['hero', 'highlights', 'overview', 'inclusions', 'trustBadges'],
  TICKET_TRANSPORT: ['hero', 'highlights', 'usageGuide', 'inclusions', 'trustBadges'],
  TICKET_CITYPASS: ['hero', 'highlights', 'overview', 'inclusions', 'comparison'],
  TICKET_EXPERIENCE: ['hero', 'highlights', 'overview', 'inclusions', 'trustBadges'],
  ACTIVITY: ['hero', 'highlights', 'overview', 'inclusions', 'trustBadges'],
  SERVICE: ['hero', 'highlights', 'usageGuide', 'inclusions'],
  SEMI_PACKAGE: ['hero', 'highlights', 'overview', 'itinerary', 'inclusions', 'trustBadges'],
};

/**
 * rawData에서 블록별 데이터 존재 여부를 판정한다.
 * 추출된 원본 데이터를 기반으로, 각 블록에 필요한 필드가 있는지 확인.
 */
function detectAvailableBlocks(rawData) {
  const available = new Set();

  // hero: 제목만 있으면 최소 렌더 가능
  if (rawData.title) available.add('hero');

  // highlights: 태그나 설명에서 생성 가능 (AI 생성 블록이지만, 입력 데이터 존재 여부)
  if (rawData.title && (rawData.tags?.length > 0 || rawData.description)) {
    available.add('highlights');
  }

  // overview: 설명이 있어야 함
  if (rawData.description && rawData.description.length > 20) {
    available.add('overview');
  }

  // itinerary: 일정 데이터가 있어야 함
  if (
    (rawData.itinerary && rawData.itinerary.length > 10) ||
    (rawData.itinerarySlots && rawData.itinerarySlots.length > 0)
  ) {
    available.add('itinerary');
  }

  // inclusions: 포함/불포함 목록이 있어야 함
  if (
    (rawData.includes && rawData.includes.length > 0) ||
    (rawData.excludes && rawData.excludes.length > 0)
  ) {
    available.add('inclusions');
  }

  // trustBadges: 태그에서 추출 가능
  if (rawData.tags?.length > 0 || rawData.instantConfirm) {
    available.add('trustBadges');
  }

  // usageGuide: 설명이나 공지에서 생성 가능
  if (rawData.description || rawData.notices?.length > 0) {
    available.add('usageGuide');
  }

  // comparison: 옵션이 2개 이상이어야 비교 가능
  if (rawData.options && rawData.options.length >= 2) {
    available.add('comparison');
  }

  // imageGrid: 이미지가 2장 이상
  if (rawData.images && rawData.images.length >= 2) {
    available.add('imageGrid');
  }

  // guideProfile: 가이드 정보가 있어야 함
  if (rawData.guideName) {
    available.add('guideProfile');
  }

  // faq: 기존 FAQ 데이터가 있거나, 충분한 정보로 생성 가능
  if (rawData.faq?.length > 0 || rawData.description) {
    available.add('faq');
  }

  // reviews: 리뷰 데이터가 있어야 함
  if (rawData.rating?.score && rawData.rating?.reviewCount > 0) {
    available.add('reviews');
  }

  // meetingPoint: 집합 장소 데이터
  if (rawData.meetingPlace || rawData.meetingTime) {
    available.add('meetingPoint');
  }

  // notice: 공지사항 데이터
  if (rawData.notices?.length > 0) {
    available.add('notice');
  }

  // optionTable: 옵션 데이터
  if (rawData.options?.length > 0) {
    available.add('optionTable');
  }

  // socialProof: 리뷰+별점이 있으면
  if (rawData.rating?.reviewCount > 10) {
    available.add('socialProof');
  }

  // recommendFor: AI 생성 가능 (입력 데이터 충분하면)
  if (rawData.title && rawData.description) {
    available.add('recommendFor');
  }

  // hotelInfo: 세미패키지의 호텔 정보
  if (rawData.hotels?.length > 0 || rawData.hotelInfo) {
    available.add('hotelInfo');
  }

  return available;
}

/**
 * Health Score를 산출한다.
 *
 * @param {object} rawData - 추출된 상품 원본 데이터
 * @param {string} category - 상품 카테고리
 * @returns {{ score: number, grade: string, required: string[], present: string[], missing: string[] }}
 */
export function calculateHealthScore(rawData, category) {
  const requiredBlocks = REQUIRED_BLOCKS[category];
  if (!requiredBlocks) {
    return {
      score: 0,
      grade: 'D',
      required: [],
      present: [],
      missing: [],
      error: `알 수 없는 카테고리: ${category}`,
    };
  }

  const availableBlocks = detectAvailableBlocks(rawData);
  const present = requiredBlocks.filter((b) => availableBlocks.has(b));
  const missing = requiredBlocks.filter((b) => !availableBlocks.has(b));

  const score = Math.round((present.length / requiredBlocks.length) * 100);

  let grade;
  if (score >= 90) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 50) grade = 'C';
  else grade = 'D';

  return {
    score,
    grade,
    required: requiredBlocks,
    present,
    missing,
    totalBlocks: availableBlocks.size,
    availableBlocks: [...availableBlocks],
  };
}

/**
 * 여러 상품의 Health Score를 산출하고 우선순위 매트릭스를 생성한다.
 *
 * @param {Array<{ rawData: object, category: string, meta?: object }>} products
 * @returns {Array<object>} 우선순위 순으로 정렬된 결과
 */
export function buildPriorityMatrix(products) {
  const results = products.map((product) => {
    const health = calculateHealthScore(product.rawData, product.category);
    return {
      title: product.rawData.title || '(제목 없음)',
      category: product.category,
      ...health,
      // meta에 매출/PDP뷰 데이터가 있으면 포함
      dailyRevenue: product.meta?.dailyRevenue || null,
      dailyPdpViews: product.meta?.dailyPdpViews || null,
      currentCvr: product.meta?.currentCvr || null,
    };
  });

  // 우선순위 정렬: 낮은 Score × 높은 매출 (1사분면)
  results.sort((a, b) => {
    // 매출 데이터가 있으면 (score 낮을수록 + 매출 높을수록 우선)
    if (a.dailyRevenue != null && b.dailyRevenue != null) {
      const priorityA = (100 - a.score) * a.dailyRevenue;
      const priorityB = (100 - b.score) * b.dailyRevenue;
      return priorityB - priorityA;
    }
    // 매출 데이터 없으면 score 낮은 순
    return a.score - b.score;
  });

  return results;
}

export { REQUIRED_BLOCKS };
