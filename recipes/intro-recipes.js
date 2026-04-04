// recipes/intro-recipes.js — 카테고리별 상품소개 블록 배치 순서 (세로 페이지용)
// 기준: PDP 섹션 구조 분석 시트 (2026-03-30) Depth1별 빈도 순서

const INTRO_RECIPES = {
  // TOUR: 가이드투어, 크루즈·페리, 세미패키지 — 공통: HERO, INCLUDES, FAQ / 선택: TIMELINE, HIGHLIGHTS, GUIDE, MEETING_POINT 등
  TOUR: [
    { block: 'intro-hook', required: true, label: 'HERO 이미지' },
    { block: 'intro-highlights', required: false, label: '하이라이트/매력 포인트' },
    { block: 'intro-experience', required: false, label: '추천 대상' },
    { block: 'intro-provider', required: false, label: '가이드 소개' },
    { block: 'intro-schedule', required: false, label: '일정/타임라인' },
    { block: 'intro-card-grid', required: false, label: '투어 코스/주요 스팟' },
    { block: 'intro-comparison', required: false, label: '요금·옵션표' },
    { block: 'intro-accommodation', required: false, label: '호텔 안내' },
    { block: 'intro-text', required: true, label: '포함·불포함' },
    { block: 'intro-cta', required: false, label: '이런 상품은 어때요?' },
  ],

  // TICKET: 입장권, 교통, 시티패스, 공연, 뷰티, 미식 — 공통: HERO, HOW_TO_USE, FAQ
  TICKET: [
    { block: 'intro-hook', required: true, label: 'HERO 이미지' },
    { block: 'intro-highlights', required: false, label: '하이라이트/매력 포인트' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-card-grid', required: false, label: '주요 어트랙션/포함 시설' },
    { block: 'intro-comparison', required: false, label: '티켓 비교표/절약 계산' },
    { block: 'intro-stat', required: false, label: '핵심 수치' },
    { block: 'intro-schedule', required: false, label: '시간표' },
    { block: 'intro-program', required: false, label: '공연/메뉴 소개' },
    { block: 'intro-text', required: false, label: '포함·불포함/주의사항' },
    { block: 'intro-cta', required: false, label: '이런 상품은 어때요?' },
  ],

  // ACTIVITY: 수중, 그라운드, 수상, 스카이 — 공통: HERO, INCLUDES, HOW_TO_USE(75%), LOCATION(75%), FAQ
  ACTIVITY: [
    { block: 'intro-hook', required: true, label: 'HERO 이미지' },
    { block: 'intro-text', required: true, label: '상품 소개' },
    { block: 'intro-highlights', required: false, label: '핵심 포인트' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-schedule', required: false, label: '타임라인' },
    { block: 'intro-stat', required: false, label: '스펙표' },
    { block: 'intro-safety', required: false, label: '안전/장비' },
    { block: 'intro-text', required: true, label: '포함·불포함' },
    { block: 'intro-cta', required: false, label: '이런 상품은 어때요?' },
  ],

  // CLASS: 클래스, 키즈 해외 클래스 — 공통: HERO, CURRICULUM, HOW_TO_USE, INCLUDES, FAQ
  CLASS: [
    { block: 'intro-hook', required: true, label: 'HERO 이미지' },
    { block: 'intro-text', required: false, label: '클래스/프로그램 소개' },
    { block: 'intro-program', required: true, label: '커리큘럼' },
    { block: 'intro-experience', required: false, label: '대상·연령' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-text', required: true, label: '포함·불포함' },
    { block: 'intro-cta', required: false, label: '이런 상품은 어때요?' },
  ],

  // SNAPS: 스냅촬영 — 공통: HERO, SERVICE_INTRO, VENUE_LIST, LOCATION, HOW_TO_USE, INCLUDES, FAQ
  SNAPS: [
    { block: 'intro-hook', required: true, label: 'HERO 이미지' },
    { block: 'intro-text', required: true, label: '서비스 소개' },
    { block: 'intro-card-grid', required: false, label: '업소·매장 목록' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-text', required: true, label: '포함·불포함' },
    { block: 'intro-cta', required: false, label: '이런 상품은 어때요?' },
  ],

  // CONVENIENCE: 여행편의 6종 — 공통: HERO, HOW_TO_USE, FAQ
  CONVENIENCE: [
    { block: 'intro-hook', required: true, label: 'HERO 이미지' },
    { block: 'intro-text', required: false, label: '상품/서비스 소개' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-comparison', required: false, label: '상품 비교표' },
    { block: 'intro-text', required: false, label: '포함·불포함' },
    { block: 'intro-cta', required: false, label: '이런 상품은 어때요?' },
  ],
};

export function getIntroRecipe(category) {
  return INTRO_RECIPES[category] || INTRO_RECIPES.TOUR;
}

export function getIntroRequiredBlocks(category) {
  return getIntroRecipe(category).filter((b) => b.required).map((b) => b.block);
}

export function getIntroCategories() {
  return Object.keys(INTRO_RECIPES);
}
