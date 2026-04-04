// recipes/intro-recipes.js — 카테고리별 상품소개 블록 배치 순서
// SSoT: '투어 로직 수정' (gid=1347016114), '티켓 로직 수정' (gid=722898837)
// 모든 섹션은 필수. 선택 영역 없음.

const INTRO_RECIPES = {
  TOUR: [
    { block: 'intro-hook', required: true, label: '히어로 이미지' },
    { block: 'intro-text', required: true, label: '투어 소개' },
    { block: 'intro-highlights', required: true, label: '하이라이트' },
    { block: 'intro-experience', required: true, label: '추천 대상' },
    { block: 'intro-provider', required: true, label: '가이드 소개' },
    { block: 'intro-schedule', required: true, label: '타임라인' },
    { block: 'intro-card-grid', required: true, label: '투어 코스/명소' },
    { block: 'intro-accommodation', required: true, label: '호텔 안내' },
    { block: 'intro-text', required: true, label: '포함·불포함' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-text', required: true, label: '집합/픽업' },
    { block: 'intro-text', required: true, label: '취소환불' },
    { block: 'intro-text', required: true, label: 'FAQ' },
    { block: 'intro-cta', required: true, label: '이런 상품은 어때요?' },
  ],

  TICKET: [
    { block: 'intro-hook', required: true, label: '히어로 이미지' },
    { block: 'intro-text', required: true, label: '소개' },
    { block: 'intro-highlights', required: true, label: '하이라이트' },
    { block: 'intro-text', required: true, label: '티켓 옵션 비교표' },
    { block: 'intro-experience', required: true, label: '추천 대상' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-card-grid', required: true, label: '어트랙션/포함시설' },
    { block: 'intro-comparison', required: true, label: '비교표/절약계산' },
    { block: 'intro-schedule', required: true, label: '시간표' },
    { block: 'intro-program', required: true, label: '공연/메뉴 소개' },
    { block: 'intro-text', required: true, label: '노선·구간' },
    { block: 'intro-text', required: true, label: '위치·교통' },
    { block: 'intro-text', required: true, label: '공지/주의사항' },
    { block: 'intro-text', required: true, label: 'FAQ' },
    { block: 'intro-cta', required: true, label: '이런 상품은 어때요?' },
  ],

  ACTIVITY: [
    { block: 'intro-hook', required: true, label: '히어로 이미지' },
    { block: 'intro-text', required: true, label: '상품 소개' },
    { block: 'intro-highlights', required: true, label: '핵심 포인트' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-schedule', required: true, label: '타임라인' },
    { block: 'intro-stat', required: true, label: '스펙표' },
    { block: 'intro-safety', required: true, label: '안전/장비' },
    { block: 'intro-text', required: true, label: '포함·불포함' },
    { block: 'intro-cta', required: true, label: '이런 상품은 어때요?' },
  ],

  CLASS: [
    { block: 'intro-hook', required: true, label: '히어로 이미지' },
    { block: 'intro-text', required: true, label: '클래스 소개' },
    { block: 'intro-program', required: true, label: '커리큘럼' },
    { block: 'intro-experience', required: true, label: '대상·연령' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-text', required: true, label: '포함·불포함' },
    { block: 'intro-cta', required: true, label: '이런 상품은 어때요?' },
  ],

  SNAPS: [
    { block: 'intro-hook', required: true, label: '히어로 이미지' },
    { block: 'intro-text', required: true, label: '서비스 소개' },
    { block: 'intro-card-grid', required: true, label: '업소·매장 목록' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-text', required: true, label: '포함·불포함' },
    { block: 'intro-cta', required: true, label: '이런 상품은 어때요?' },
  ],

  CONVENIENCE: [
    { block: 'intro-hook', required: true, label: '히어로 이미지' },
    { block: 'intro-text', required: true, label: '상품/서비스 소개' },
    { block: 'intro-howto', required: true, label: '이용방법' },
    { block: 'intro-comparison', required: true, label: '상품 비교표' },
    { block: 'intro-text', required: true, label: '포함·불포함' },
    { block: 'intro-cta', required: true, label: '이런 상품은 어때요?' },
  ],
};

export function getIntroRecipe(category) {
  return INTRO_RECIPES[category] || INTRO_RECIPES.TOUR;
}

export function getIntroRequiredBlocks(category) {
  return getIntroRecipe(category).map((b) => b.block);
}

export function getIntroCategories() {
  return Object.keys(INTRO_RECIPES);
}
