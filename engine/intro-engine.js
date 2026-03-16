// engine/intro-engine.js — 상품소개 세로 스크롤 페이지 렌더링 엔진
import { getBlock } from './block-registry.js';
import { INTRO_TOKENS } from '../intro-blocks/tokens.js';

/**
 * 상품소개 블록을 세로 페이지로 렌더링한다.
 * @param {object} introData - { category, introBlocks: [{ blockType, data }] }
 * @returns {{ html: string, sections: string[], renderedBlocks: string[], warnings: string[] }}
 */
export function renderIntro(introData) {
  const warnings = [];

  if (!introData?.introBlocks?.length) {
    return {
      html: '<div class="intro-empty"><p>상품소개 데이터가 없습니다</p></div>',
      sections: [],
      renderedBlocks: [],
      warnings: ['introBlocks 배열이 비어있습니다.'],
    };
  }

  const sections = [];
  const renderedBlocks = [];
  const total = introData.introBlocks.length;

  // 카테고리 토큰 → CSS 커스텀 프로퍼티
  const tokens = INTRO_TOKENS[introData.category] || INTRO_TOKENS.TOUR;
  const tokenStyle = `--intro-accent:${tokens.accent};--intro-gradient:${tokens.gradient};`;

  for (let i = 0; i < total; i++) {
    const item = introData.introBlocks[i];
    const { blockType, data } = item;

    // 빈 데이터는 스킵
    if (!data || Object.keys(data).length === 0) continue;

    const renderer = getBlock(blockType);

    if (!renderer) {
      warnings.push(`"${blockType}" 블록의 렌더러가 등록되지 않았습니다.`);
      continue;
    }

    if (typeof renderer.validate === 'function' && !renderer.validate(data)) {
      warnings.push(`"${blockType}" 블록 데이터가 유효하지 않습니다.`);
      continue;
    }

    try {
      const blockHtml = renderer.render(data, { category: introData.category, index: i, total });
      if (blockHtml) {
        const sectionHtml = `<section class="intro-section" data-block-type="${blockType}" data-block-index="${i}">
${blockHtml}
</section>`;
        sections.push(sectionHtml);
        renderedBlocks.push(blockType);
      }
    } catch (err) {
      warnings.push(`"${blockType}" 렌더링 오류: ${err.message}`);
    }
  }

  const html = `<div class="intro-page" style="${tokenStyle}">
${sections.join('\n')}
</div>`;

  return { html, sections, renderedBlocks, warnings };
}

/**
 * 세로 페이지 마운트 (lazy loading 등)
 */
export function mountIntroPage() {
  if (typeof document === 'undefined') return;

  // Lazy load images
  const images = document.querySelectorAll('.intro-page img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });
    images.forEach(img => observer.observe(img));
  }
}
