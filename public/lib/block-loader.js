const BLOCK_FILES = [
  'hero', 'trustBadges', 'highlights', 'overview',
  'guideProfile', 'itinerary', 'inclusions', 'optionTable',
  'imageGrid', 'usageGuide', 'comparison', 'recommendFor',
  'notice', 'faq', 'cta', 'reviews',
  'socialProof', 'relatedProducts', 'meetingPoint', 'hotelInfo',
];

let loaded = false;

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
