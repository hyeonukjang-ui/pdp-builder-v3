// intro-blocks/intro-hook.js — 한줄 훅: 상품 핵심 매력을 한 문장 + 대표 비주얼
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.title);
  },

  render(data, ctx) {
    const { image, title, subtitle, textAlign } = data;
    const align = textAlign === 'center' ? 'center' : 'left';
    const hasImage = image?.url;

    return `<div class="mod-hero">
  ${hasImage
    ? `<img class="mod-hero__img" src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || title)}" />`
    : `<div class="mod-hero__placeholder" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);"></div>`}
  <div class="mod-hero__overlay"></div>
  <div class="mod-hero__content mod-hero__content--${align}">
    <h2 class="mod-hero__title" data-editable="title">${escapeHtml(title)}</h2>
    ${subtitle ? `<p class="mod-hero__subtitle" data-editable="subtitle">${escapeHtml(subtitle)}</p>` : ''}
  </div>
</div>`;
  },
};

registerBlock('intro-hook', renderer);
export default renderer;
