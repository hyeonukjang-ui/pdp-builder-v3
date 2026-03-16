// recipes/intro-recipes.js — 카테고리별 상품소개 블록 배치 순서 (세로 페이지용)

const INTRO_RECIPES = {
  TOUR: [
    { block: 'intro-hook', required: true },
    { block: 'intro-text', required: false, label: '상품 설명' },
    { block: 'intro-highlights', required: true },
    { block: 'intro-program', required: false, label: '투어 프로그램' },
    { block: 'intro-image', required: false },
    { block: 'intro-experience', required: true },
    { block: 'intro-provider', required: true },
    { block: 'intro-schedule', required: true },
    { block: 'intro-card-grid', required: false, label: '주요 스팟' },
    { block: 'intro-spot', required: false },
    { block: 'intro-cta', required: true },
  ],
  TICKET_THEME: [
    { block: 'intro-hook', required: true },
    { block: 'intro-text', required: true, label: '상품 설명' },
    { block: 'intro-highlights', required: true },
    { block: 'intro-card-grid', required: true, label: '주요 어트랙션' },
    { block: 'intro-image', required: false },
    { block: 'intro-experience', required: true },
    { block: 'intro-program', required: false, label: '체험 프로그램' },
    { block: 'intro-howto', required: true },
    { block: 'intro-text', required: false, label: '이용 팁' },
    { block: 'intro-cta', required: true },
  ],
  TICKET_TRANSPORT: [
    { block: 'intro-hook', required: true },
    { block: 'intro-text', required: true, label: '상품 설명' },
    { block: 'intro-highlights', required: true },
    { block: 'intro-howto', required: true },
    { block: 'intro-howto', required: false, label: '노선/커버리지' },
    { block: 'intro-stat', required: false },
    { block: 'intro-cta', required: true },
  ],
  TICKET_CITYPASS: [
    { block: 'intro-hook', required: true },
    { block: 'intro-text', required: true, label: '패스 설명' },
    { block: 'intro-highlights', required: true },
    { block: 'intro-card-grid', required: true, label: '포함 시설' },
    { block: 'intro-comparison', required: true },
    { block: 'intro-experience', required: true },
    { block: 'intro-image', required: false },
    { block: 'intro-howto', required: true },
    { block: 'intro-cta', required: true },
  ],
  TICKET_EXPERIENCE: [
    { block: 'intro-hook', required: true },
    { block: 'intro-text', required: true, label: '체험 설명' },
    { block: 'intro-image', required: false },
    { block: 'intro-highlights', required: true },
    { block: 'intro-program', required: false, label: '체험 프로그램' },
    { block: 'intro-experience', required: true },
    { block: 'intro-card-grid', required: false, label: '주요 스팟' },
    { block: 'intro-spot', required: false },
    { block: 'intro-howto', required: false },
    { block: 'intro-cta', required: true },
  ],
  ACTIVITY: [
    { block: 'intro-hook', required: true },
    { block: 'intro-text', required: false, label: '액티비티 설명' },
    { block: 'intro-highlights', required: true },
    { block: 'intro-program', required: false, label: '체험 프로그램' },
    { block: 'intro-image', required: false },
    { block: 'intro-experience', required: true },
    { block: 'intro-safety', required: true },
    { block: 'intro-card-grid', required: false, label: '포인트 스팟' },
    { block: 'intro-spot', required: true },
    { block: 'intro-stat', required: false },
    { block: 'intro-cta', required: true },
  ],
  SERVICE: [
    { block: 'intro-hook', required: true },
    { block: 'intro-text', required: true, label: '서비스 설명' },
    { block: 'intro-highlights', required: true },
    { block: 'intro-program', required: false, label: '서비스 프로그램' },
    { block: 'intro-experience', required: true },
    { block: 'intro-image', required: false },
    { block: 'intro-provider', required: true },
    { block: 'intro-card-grid', required: false, label: '포트폴리오' },
    { block: 'intro-howto', required: false },
    { block: 'intro-cta', required: true },
  ],
  SEMI_PACKAGE: [
    { block: 'intro-hook', required: true },
    { block: 'intro-text', required: true, label: '패키지 설명' },
    { block: 'intro-highlights', required: true },
    { block: 'intro-program', required: false, label: '주요 프로그램' },
    { block: 'intro-schedule', required: true },
    { block: 'intro-card-grid', required: false, label: '주요 방문지' },
    { block: 'intro-image', required: false },
    { block: 'intro-accommodation', required: true },
    { block: 'intro-stat', required: false },
    { block: 'intro-comparison', required: false },
    { block: 'intro-cta', required: true },
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
