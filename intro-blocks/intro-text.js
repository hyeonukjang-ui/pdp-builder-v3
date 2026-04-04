// intro-blocks/intro-text.js — Text section block: 제목 + 본문 단락 / FAQ 모드
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && (data.paragraphs?.length || data.faq?.length));
  },

  render(data, ctx) {
    const { title, subtitle, paragraphs, faq, background } = data;
    const bgClass = background === 'gray' ? 'mod-text--gray' : 'mod-text--white';

    // FAQ 모드: Q&A 아코디언 형태
    if (faq && faq.length) {
      const faqHtml = faq.map((item, i) =>
        `<div class="mod-faq__item">
    <div class="mod-faq__q" data-editable="faq.${i}.q">Q. ${escapeHtml(item.q)}</div>
    <div class="mod-faq__a" data-editable="faq.${i}.a">${escapeHtml(item.a)}</div>
  </div>`
      ).join('\n  ');

      return `<div class="mod-text ${bgClass}">
  ${title ? `<h3 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h3>` : ''}
  <div class="mod-faq">
    ${faqHtml}
  </div>
</div>`;
    }

    // 일반 텍스트 모드
    return `<div class="mod-text ${bgClass}">
  ${title ? `<h3 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h3>` : ''}
  ${subtitle ? `<p class="mod-text__subtitle" data-editable="subtitle">${escapeHtml(subtitle)}</p>` : ''}
  ${(paragraphs || []).map((p, i) => `<p class="mod-text__body" data-editable="paragraphs.${i}">${escapeHtml(p)}</p>`).join('\n  ')}
</div>`;
  },
};

registerBlock('intro-text', renderer);
export default renderer;
