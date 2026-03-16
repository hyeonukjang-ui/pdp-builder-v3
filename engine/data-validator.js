// engine/data-validator.js

const VALID_CATEGORIES = [
  'TICKET_THEME', 'TICKET_TRANSPORT', 'TICKET_CITYPASS', 'TICKET_EXPERIENCE',
  'TOUR', 'SERVICE', 'ACTIVITY', 'SEMI_PACKAGE',
];

// 전 카테고리 공통 필수 블록 (warning only — graceful skip)
const REQUIRED_BLOCKS = ['hero', 'highlights', 'overview', 'inclusions', 'notice', 'faq', 'cta'];

export function validateProductData(data) {
  const errors = [];
  const warnings = [];

  if (!data || typeof data !== 'object') {
    errors.push('데이터가 비어있거나 객체가 아닙니다.');
    return { valid: false, errors, warnings };
  }

  if (!data.category) {
    errors.push('category 필드가 없습니다.');
  } else if (!VALID_CATEGORIES.includes(data.category)) {
    errors.push(`유효하지 않은 카테고리: "${data.category}". 가능한 값: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (!data.blocks || typeof data.blocks !== 'object') {
    errors.push('blocks 필드가 없거나 객체가 아닙니다.');
    return { valid: errors.length === 0, errors, warnings };
  }

  // 필수 블록 체크 (warning only)
  for (const blockType of REQUIRED_BLOCKS) {
    if (!data.blocks[blockType]) {
      warnings.push(`필수 블록 "${blockType}"이(가) 누락되었습니다. 해당 블록은 건너뜁니다.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export { VALID_CATEGORIES, REQUIRED_BLOCKS };
