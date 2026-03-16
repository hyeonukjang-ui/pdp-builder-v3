// intro-blocks/intro-text.js — Text section block: 제목 + 서브타이틀 + 본문 단락
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.paragraphs?.length);
  },

  render(data, ctx) {
    const { title, subtitle, paragraphs, background } = data;
    const bgClass = background === 'gray' ? 'mod-text--gray' : 'mod-text--white';

    return `<div class="mod-text ${bgClass}">
  ${title ? `<h3 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h3>` : ''}
  ${subtitle ? `<p class="mod-text__subtitle" data-editable="subtitle">${escapeHtml(subtitle)}</p>` : ''}
  ${paragraphs.map((p, i) => `<p class="mod-text__body" data-editable="paragraphs.${i}">${escapeHtml(p)}</p>`).join('\n  ')}
</div>`;
  },
};

registerBlock('intro-text', renderer);
export default renderer;
