// lib/field-mapper.js
// 블록 데이터 필드를 렌더러가 기대하는 정규 스키마로 정규화한다.
// 참고: docs/13-data-schema.md 부록 "샘플 데이터 vs 블록 렌더러 키 불일치 정리"

/**
 * 전체 blocks 객체의 필드를 정규화한다.
 * @param {object} blocks - { hero: {...}, highlights: {...}, ... }
 * @returns {object} 정규화된 blocks 객체
 */
export function normalizeBlocks(blocks) {
  if (!blocks || typeof blocks !== 'object') return blocks;

  const normalized = { ...blocks };

  // guideProfile: photo가 string이면 { url, alt } 객체로 변환
  if (normalized.guideProfile) {
    normalized.guideProfile = normalizeGuideProfile(normalized.guideProfile);
  }

  // itinerary: items[] → stops[] 변환
  if (normalized.itinerary) {
    normalized.itinerary = normalizeItinerary(normalized.itinerary);
  }

  // optionTable: columns/rows 테이블 구조 → options[] 카드 구조 변환
  if (normalized.optionTable) {
    normalized.optionTable = normalizeOptionTable(normalized.optionTable);
  }

  // usageGuide: stepNumber → step 변환
  if (normalized.usageGuide) {
    normalized.usageGuide = normalizeUsageGuide(normalized.usageGuide);
  }

  // inclusions: excluded[].detail → excluded[].tip 변환
  if (normalized.inclusions) {
    normalized.inclusions = normalizeInclusions(normalized.inclusions);
  }

  // recommendFor: items[].emoji → targets[].icon 변환
  if (normalized.recommendFor) {
    normalized.recommendFor = normalizeRecommendFor(normalized.recommendFor);
  }

  return normalized;
}

/**
 * guideProfile.photo: string → { url, alt } 객체 변환
 */
function normalizeGuideProfile(data) {
  const result = { ...data };
  if (typeof result.photo === 'string') {
    result.photo = { url: result.photo, alt: result.name || '' };
  }
  return result;
}

/**
 * itinerary.items → itinerary.stops 변환
 */
function normalizeItinerary(data) {
  const result = { ...data };
  if (result.items && !result.stops) {
    result.stops = result.items;
    delete result.items;
  }
  return result;
}

/**
 * optionTable: columns/rows 테이블 구조 → options[] 카드 구조 변환
 */
function normalizeOptionTable(data) {
  const result = { ...data };

  // 이미 options[] 형태면 그대로 반환
  if (result.options && Array.isArray(result.options)) {
    return result;
  }

  // columns/rows 테이블 구조 → options[] 카드 변환
  if (result.columns && result.rows) {
    const nameIdx = result.columns.indexOf('옵션명') !== -1
      ? result.columns.indexOf('옵션명')
      : 0;
    const priceIdx = result.columns.indexOf('가격') !== -1
      ? result.columns.indexOf('가격')
      : result.columns.length - 1;
    const descIdx = result.columns.indexOf('설명') !== -1
      ? result.columns.indexOf('설명')
      : -1;

    result.options = result.rows.map(row => {
      const option = {
        name: row[nameIdx] || '',
        available: true,
      };
      if (descIdx >= 0 && row[descIdx]) {
        option.description = row[descIdx];
      }
      const priceVal = row[priceIdx];
      if (typeof priceVal === 'number') {
        option.price = { amount: priceVal, currency: '₩', unit: '1인' };
      } else if (typeof priceVal === 'string') {
        const num = parseInt(priceVal.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num)) {
          option.price = { amount: num, currency: '₩', unit: '1인' };
        }
      }
      return option;
    });

    delete result.columns;
    delete result.rows;
  }

  return result;
}

/**
 * usageGuide.steps[].stepNumber → steps[].step 변환
 */
function normalizeUsageGuide(data) {
  const result = { ...data };
  if (result.steps && Array.isArray(result.steps)) {
    result.steps = result.steps.map((s, i) => {
      const step = { ...s };
      if (step.stepNumber !== undefined && step.step === undefined) {
        step.step = step.stepNumber;
        delete step.stepNumber;
      }
      if (step.step === undefined) {
        step.step = i + 1;
      }
      return step;
    });
  }
  return result;
}

/**
 * inclusions.excluded[].detail → excluded[].tip 변환
 */
function normalizeInclusions(data) {
  const result = { ...data };
  if (result.excluded && Array.isArray(result.excluded)) {
    result.excluded = result.excluded.map(item => {
      const normalized = { ...item };
      if (normalized.detail !== undefined && normalized.tip === undefined) {
        normalized.tip = normalized.detail;
        delete normalized.detail;
      }
      return normalized;
    });
  }
  return result;
}

/**
 * recommendFor: items[].emoji → targets[].icon 변환
 */
function normalizeRecommendFor(data) {
  const result = { ...data };

  // items → targets 변환
  if (result.items && !result.targets) {
    result.targets = result.items;
    delete result.items;
  }

  // emoji → icon 변환
  if (result.targets && Array.isArray(result.targets)) {
    result.targets = result.targets.map(t => {
      const target = { ...t };
      if (target.emoji !== undefined && target.icon === undefined) {
        target.icon = target.emoji;
        delete target.emoji;
      }
      return target;
    });
  }

  return result;
}
