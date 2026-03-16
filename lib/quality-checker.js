/**
 * AI 생성 카피 품질 자동 검수
 *
 * Phase 2 품질 검수 체크리스트 + Phase 5 자동 검수 기준 구현.
 * 참조: docs/phases/phase-2.md, docs/phases/phase-5.md, docs/06-copy-guidelines.md
 */

// AI가 생성하면 안 되는 필드 (원본 직접 사용)
const FORBIDDEN_AI_FIELDS = ['price', 'cancellationPolicy', 'coordinates', 'refundPolicy'];

/**
 * 생성된 블록 데이터의 품질을 검수한다.
 *
 * @param {object} blocks - 생성된 블록 데이터 { hero: {...}, highlights: {...}, ... }
 * @param {object} rawData - 원본 상품 데이터
 * @param {string} category - 상품 카테고리
 * @returns {{ pass: boolean, score: number, checks: Array<{ rule: string, pass: boolean, severity: string, detail: string }> }}
 */
export function checkQuality(blocks, rawData, category) {
  const checks = [];

  // 1. 필수 블록 존재
  checks.push(...checkRequiredBlocks(blocks, category));

  // 2. 금지 필드 분리 확인
  checks.push(...checkForbiddenFields(blocks));

  // 3. 카피 길이 검증
  checks.push(...checkCopyLength(blocks));

  // 4. 팩트 체크 (기본)
  checks.push(...checkFactConsistency(blocks, rawData));

  // 5. 톤 체크 (금지 표현)
  checks.push(...checkTone(blocks));

  const passCount = checks.filter((c) => c.pass).length;
  const score = checks.length > 0 ? Math.round((passCount / checks.length) * 100) : 0;
  const hasCritical = checks.some((c) => !c.pass && c.severity === 'critical');

  return {
    pass: !hasCritical && score >= 70,
    score,
    totalChecks: checks.length,
    passedChecks: passCount,
    failedChecks: checks.length - passCount,
    checks,
  };
}

// ─── 필수 블록 존재 확인 ────────────────────────────────────────

const CATEGORY_REQUIRED = {
  TOUR: ['hero', 'highlights', 'overview', 'itinerary', 'inclusions', 'trustBadges'],
  TICKET_THEME: ['hero', 'highlights', 'overview', 'inclusions', 'trustBadges'],
  TICKET_TRANSPORT: ['hero', 'highlights', 'usageGuide', 'inclusions', 'trustBadges'],
  TICKET_CITYPASS: ['hero', 'highlights', 'overview', 'inclusions', 'comparison'],
  TICKET_EXPERIENCE: ['hero', 'highlights', 'overview', 'inclusions', 'trustBadges'],
  ACTIVITY: ['hero', 'highlights', 'overview', 'inclusions', 'trustBadges'],
  SERVICE: ['hero', 'highlights', 'usageGuide', 'inclusions'],
  SEMI_PACKAGE: ['hero', 'highlights', 'overview', 'itinerary', 'inclusions', 'trustBadges'],
};

function checkRequiredBlocks(blocks, category) {
  const required = CATEGORY_REQUIRED[category] || [];
  return required.map((blockName) => ({
    rule: `필수 블록 존재: ${blockName}`,
    pass: blocks[blockName] != null && Object.keys(blocks[blockName]).length > 0,
    severity: 'critical',
    detail: blocks[blockName] ? '존재' : '누락',
  }));
}

// ─── 금지 필드 분리 확인 ────────────────────────────────────────

function checkForbiddenFields(blocks) {
  const checks = [];

  for (const [blockName, blockData] of Object.entries(blocks)) {
    if (!blockData || typeof blockData !== 'object') continue;

    const blockStr = JSON.stringify(blockData).toLowerCase();
    for (const field of FORBIDDEN_AI_FIELDS) {
      // hero 블록의 price는 직접 매핑이므로 허용
      if (blockName === 'hero' && field === 'price') continue;
      // optionTable의 price도 직접 매핑
      if (blockName === 'optionTable' && field === 'price') continue;

      if (blockStr.includes(`"${field}"`) && blockName !== 'hero' && blockName !== 'optionTable') {
        checks.push({
          rule: `금지 필드 분리: ${blockName}.${field}`,
          pass: false,
          severity: 'critical',
          detail: `${blockName} 블록에 ${field} 필드가 AI 생성됨 — 원본 직접 사용 필요`,
        });
      }
    }
  }

  if (checks.length === 0) {
    checks.push({
      rule: '금지 필드 분리',
      pass: true,
      severity: 'critical',
      detail: 'AI 생성 금지 필드 없음',
    });
  }

  return checks;
}

// ─── 카피 길이 검증 ─────────────────────────────────────────────

function checkCopyLength(blocks) {
  const checks = [];

  // highlights: 3~5개 항목, 각 40자 이내
  if (blocks.highlights?.items) {
    const items = blocks.highlights.items;
    checks.push({
      rule: 'highlights 항목 수',
      pass: items.length >= 3 && items.length <= 5,
      severity: 'high',
      detail: `${items.length}개 (기준: 3~5개)`,
    });

    const longItems = items.filter((i) => (i.text || '').length > 40);
    checks.push({
      rule: 'highlights 항목 길이',
      pass: longItems.length === 0,
      severity: 'medium',
      detail: longItems.length > 0
        ? `40자 초과 ${longItems.length}개: ${longItems.map((i) => `"${(i.text || '').slice(0, 20)}..." (${(i.text || '').length}자)`).join(', ')}`
        : '전부 40자 이내',
    });
  }

  // overview: 3단락, 총 100~300자
  if (blocks.overview?.paragraphs) {
    const paras = blocks.overview.paragraphs;
    checks.push({
      rule: 'overview 단락 수',
      pass: paras.length === 3,
      severity: 'high',
      detail: `${paras.length}개 (기준: 3개)`,
    });

    const totalLength = paras.join('').length;
    checks.push({
      rule: 'overview 총 길이',
      pass: totalLength >= 100 && totalLength <= 600,
      severity: 'medium',
      detail: `${totalLength}자 (기준: 100~600자)`,
    });
  }

  // itinerary stops: description 80자 이내
  if (blocks.itinerary?.stops) {
    const longStops = blocks.itinerary.stops.filter(
      (s) => (s.description || '').length > 80,
    );
    checks.push({
      rule: 'itinerary 설명 길이',
      pass: longStops.length === 0,
      severity: 'medium',
      detail: longStops.length > 0
        ? `80자 초과 ${longStops.length}개`
        : '전부 80자 이내',
    });
  }

  // faq: 3~5개
  if (blocks.faq?.items) {
    checks.push({
      rule: 'FAQ 항목 수',
      pass: blocks.faq.items.length >= 3 && blocks.faq.items.length <= 5,
      severity: 'low',
      detail: `${blocks.faq.items.length}개 (기준: 3~5개)`,
    });
  }

  return checks;
}

// ─── 팩트 일치 기본 검증 ────────────────────────────────────────

function checkFactConsistency(blocks, rawData) {
  const checks = [];

  // hero 제목이 원본과 일치하는지
  if (blocks.hero?.title && rawData.title) {
    checks.push({
      rule: '제목 일치',
      pass: blocks.hero.title === rawData.title,
      severity: 'critical',
      detail: blocks.hero.title === rawData.title
        ? '원본 제목과 일치'
        : `원본: "${rawData.title.slice(0, 30)}", 생성: "${blocks.hero.title.slice(0, 30)}"`,
    });
  }

  // overview에 원본에 없는 장소명이나 수치가 들어가있진 않은지 (기본 체크)
  if (blocks.overview?.paragraphs && rawData.title) {
    const overviewText = blocks.overview.paragraphs.join(' ');
    // 4자리 이상 숫자가 있으면, 원본에도 있는지 확인
    const numbers = overviewText.match(/\d{4,}/g) || [];
    const rawText = JSON.stringify(rawData);
    const suspiciousNumbers = numbers.filter((n) => !rawText.includes(n));
    checks.push({
      rule: 'overview 수치 검증',
      pass: suspiciousNumbers.length === 0,
      severity: 'high',
      detail: suspiciousNumbers.length > 0
        ? `원본에 없는 수치 발견: ${suspiciousNumbers.join(', ')}`
        : '수치 일관성 OK',
    });
  }

  return checks;
}

// ─── 톤 검증 (금지 표현) ────────────────────────────────────────

const FORBIDDEN_EXPRESSIONS = [
  { pattern: /최고의|최상의|완벽한|압도적인|독보적인/g, label: '검증 불가 최상급' },
  { pattern: /마감 임박|한정 수량|서두르세요/g, label: '가짜 긴급성' },
  { pattern: /경험하실 수 있습니다|제공됩니다|이용하실 수 있습니다/g, label: '번역체' },
  { pattern: /꿈같은|환상적인|일생일대의/g, label: '과장 표현' },
];

function checkTone(blocks) {
  const checks = [];
  const allText = extractAllText(blocks);

  for (const { pattern, label } of FORBIDDEN_EXPRESSIONS) {
    const matches = allText.match(pattern);
    checks.push({
      rule: `금지 표현: ${label}`,
      pass: !matches,
      severity: 'high',
      detail: matches ? `발견: "${matches.join('", "')}"` : '없음',
    });
  }

  return checks;
}

function extractAllText(blocks) {
  const texts = [];
  for (const blockData of Object.values(blocks)) {
    if (!blockData || typeof blockData !== 'object') continue;
    collectTexts(blockData, texts);
  }
  return texts.join(' ');
}

function collectTexts(obj, result) {
  if (typeof obj === 'string') {
    result.push(obj);
    return;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) collectTexts(item, result);
    return;
  }
  if (obj && typeof obj === 'object') {
    for (const value of Object.values(obj)) collectTexts(value, result);
  }
}
