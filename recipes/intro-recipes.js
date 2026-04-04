// recipes/intro-recipes.js — 카테고리별 상품소개 블록 배치 순서
// SSoT: '투어 로직 수정' (gid=1347016114), '티켓 로직 수정' (gid=722898837)

const INTRO_RECIPES = {
  // 투어 로직 수정 시트 (14개)
  TOUR: [
    { block: 'intro-hook', required: true, label: '히어로 이미지' },
    { block: 'intro-text', required: true, label: '투어 소개' },
    { block: 'intro-highlights', required: true, label: '하이라이트' },
    { block: 'intro-experience', required: false, label: '추천 대상' },
    { block: 'intro-provider', required: false, label: '가이드 소개' },
    { block: 'intro-schedule', required: false, label: '타임라인' },
    { block: 'intro-card-grid', required: false, label: '투어 코스/명소' },
    { block: 'intro-accommodation', required: false, label: '호텔 안내' },
    { block: 'intro-text', required: true, label: '포함·불포함' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-text', required: true, label: '집합/픽업' },
    { block: 'intro-text', required: true, label: '취소환불' },
    { block: 'intro-text', required: true, label: 'FAQ' },
    { block: 'intro-cta', required: false, label: '이런 상품은 어때요?' },
  ],

  // 티켓 로직 수정 시트 (15개)
  TICKET: [
    { block: 'intro-hook', required: true, label: '히어로 이미지' },
    { block: 'intro-text', required: true, label: '소개' },
    { block: 'intro-highlights', required: true, label: '하이라이트' },
    { block: 'intro-text', required: false, label: '티켓 옵션 비교표' },
    { block: 'intro-experience', required: true, label: '추천 대상' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-card-grid', required: false, label: '어트랙션/포함시설' },
    { block: 'intro-comparison', required: false, label: '비교표/절약계산' },
    { block: 'intro-schedule', required: false, label: '시간표' },
    { block: 'intro-program', required: false, label: '공연/메뉴 소개' },
    { block: 'intro-text', required: false, label: '노선·구간' },
    { block: 'intro-text', required: false, label: '위치·교통' },
    { block: 'intro-text', required: true, label: '공지/주의사항' },
    { block: 'intro-text', required: true, label: 'FAQ' },
    { block: 'intro-cta', required: true, label: '이런 상품은 어때요?' },
  ],

  ACTIVITY: [
    { block: 'intro-hook', required: true, label: '히어로 이미지' },
    { block: 'intro-text', required: true, label: '상품 소개' },
    { block: 'intro-highlights', required: false, label: '핵심 포인트' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-schedule', required: false, label: '타임라인' },
    { block: 'intro-stat', required: false, label: '스펙표' },
    { block: 'intro-safety', required: false, label: '안전/장비' },
    { block: 'intro-text', required: true, label: '포함·불포함' },
    { block: 'intro-cta', required: false, label: '이런 상품은 어때요?' },
  ],

  CLASS: [
    { block: 'intro-hook', required: true, label: '히어로 이미지' },
    { block: 'intro-text', required: false, label: '클래스 소개' },
    { block: 'intro-program', required: true, label: '커리큘럼' },
    { block: 'intro-experience', required: false, label: '대상·연령' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-text', required: true, label: '포함·불포함' },
    { block: 'intro-cta', required: false, label: '이런 상품은 어때요?' },
  ],

  SNAPS: [
    { block: 'intro-hook', required: true, label: '히어로 이미지' },
    { block: 'intro-text', required: true, label: '서비스 소개' },
    { block: 'intro-card-grid', required: false, label: '업소·매장 목록' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-text', required: true, label: '포함·불포함' },
    { block: 'intro-cta', required: false, label: '이런 상품은 어때요?' },
  ],

  CONVENIENCE: [
    { block: 'intro-hook', required: true, label: '히어로 이미지' },
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
