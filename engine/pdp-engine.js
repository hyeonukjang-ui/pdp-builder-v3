// engine/pdp-engine.js
import { getBlock } from './block-registry.js';
import { validateProductData } from './data-validator.js';
import { getRecipe } from '../recipes/category-recipes.js';

/**
 * PDP를 렌더링한다.
 * @param {object} productData - { category, blocks: { hero: {...}, ... } }
 * @returns {{ html: string, renderedBlocks: string[], skippedBlocks: string[], warnings: string[] }}
 */
export function renderPDP(productData) {
  const validation = validateProductData(productData);
  const warnings = [...validation.warnings];

  if (!validation.valid) {
    return {
      html: `<div class="pdp-error"><p>데이터 오류: ${validation.errors.join(', ')}</p></div>`,
      renderedBlocks: [],
      skippedBlocks: [],
      warnings: validation.errors,
    };
  }

  const { category, blocks } = productData;
  const recipe = getRecipe(category);

  if (!recipe) {
    warnings.push(`"${category}" 카테고리의 레시피가 없습니다. 등록된 블록을 순서대로 렌더링합니다.`);
  }

  const blockOrder = recipe || Object.keys(blocks);
  const renderedBlocks = [];
  const skippedBlocks = [];
  const htmlParts = [];

  for (const blockType of blockOrder) {
    const blockData = blocks[blockType];
    const renderer = getBlock(blockType);

    // 블록 데이터가 없으면 스킵
    if (!blockData) {
      skippedBlocks.push(blockType);
      continue;
    }

    // 렌더러가 없으면 스킵
    if (!renderer) {
      skippedBlocks.push(blockType);
      warnings.push(`"${blockType}" 블록의 렌더러가 등록되지 않았습니다.`);
      continue;
    }

    // validate가 있으면 실행
    if (typeof renderer.validate === 'function' && !renderer.validate(blockData)) {
      skippedBlocks.push(blockType);
      warnings.push(`"${blockType}" 블록 데이터가 유효하지 않습니다.`);
      continue;
    }

    try {
      const blockHtml = renderer.render(blockData);
      if (blockHtml) {
        // data-block-type 래퍼로 감싸기 (빌더용)
        htmlParts.push(`<div data-block-type="${blockType}">${blockHtml}</div>`);
        renderedBlocks.push(blockType);
      } else {
        skippedBlocks.push(blockType);
      }
    } catch (err) {
      skippedBlocks.push(blockType);
      warnings.push(`"${blockType}" 블록 렌더링 오류: ${err.message}`);
    }
  }

  const html = `<div class="pdp-container">${htmlParts.join('\n')}</div>`;

  return { html, renderedBlocks, skippedBlocks, warnings };
}

/**
 * 렌더링된 블록들의 mount() 함수를 실행한다 (이벤트 바인딩 등).
 * 브라우저 환경에서만 호출.
 */
export function mountPDP(productData) {
  if (!productData?.blocks) return;

  const recipe = getRecipe(productData.category) || Object.keys(productData.blocks);

  for (const blockType of recipe) {
    const renderer = getBlock(blockType);
    const blockData = productData.blocks[blockType];
    if (renderer?.mount && blockData) {
      try {
        renderer.mount(blockData);
      } catch (err) {
        console.warn(`[pdp-engine] "${blockType}" mount 오류:`, err.message);
      }
    }
  }
}

/**
 * 렌더링된 블록들의 unmount() 함수를 실행한다 (이벤트 해제 등).
 */
export function unmountPDP(productData) {
  if (!productData?.blocks) return;

  const recipe = getRecipe(productData.category) || Object.keys(productData.blocks);

  for (const blockType of recipe) {
    const renderer = getBlock(blockType);
    if (renderer?.unmount) {
      try {
        renderer.unmount();
      } catch (err) {
        console.warn(`[pdp-engine] "${blockType}" unmount 오류:`, err.message);
      }
    }
  }
}
