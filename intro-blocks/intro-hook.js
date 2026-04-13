// intro-blocks/intro-hook.js — 히어로: 뱃지 + 한줄 제목 + 부제목 + 대표 비주얼
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.title);
  },

  render(data, ctx) {
    const { image, title, subtitle, badges } = data;
    const hasImage = image?.url;

    // 뱃지 렌더링 (제목 위)
    const badgeList = badges || [];
    const badgesHtml = badgeList.length
      ? `<div class="mod-hero__badges">${badgeList
          .map((b) => `<span class="mod-hero__badge-item">${escapeHtml(b)}</span>`)
          .join('')}</div>`
      : '';

    return `<div class="mod-hero">
  ${hasImage
    ? `<img class="mod-hero__img" src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || title)}"${data.imagePosition ? ` style="object-position:${escapeHtml(data.imagePosition)}"` : ''} />`
    : `<div class="mod-hero__placeholder" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);"></div>`}
  <div class="mod-hero__overlay"></div>
  <div class="mod-hero__content mod-hero__content--left">
    ${badgesHtml}
    <h2 class="mod-hero__title" data-editable="title">${escapeHtml(title)}</h2>
    ${subtitle ? `<p class="mod-hero__subtitle" data-editable="subtitle">${escapeHtml(subtitle)}</p>` : ''}
  </div>
</div>`;
  },
};

registerBlock('intro-hook', renderer);
export default renderer;
