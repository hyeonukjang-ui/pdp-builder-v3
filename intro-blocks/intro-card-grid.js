// intro-blocks/intro-card-grid.js — 카드 그리드 블록 (2열 이미지 카드 + 태그)
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.items?.length);
  },

  render(data, ctx) {
    const { title, items } = data;

    const cardsHtml = items.map((card, i) => {
      const hasImage = card.image?.url;
      const tagHtml = card.tag
        ? `<span class="mod-card-grid__tag">${escapeHtml(card.tag)}</span>`
        : '';

      const imageHtml = hasImage
        ? `<img class="mod-card-grid__img" src="${escapeHtml(card.image.url)}" alt="${escapeHtml(card.image.alt || card.title)}" loading="lazy" />`
        : `<div class="mod-card-grid__placeholder"></div>`;

      return `<div class="mod-card-grid__card" data-item-index="${i}">
        <div class="mod-card-grid__image-wrap">
          ${imageHtml}
          ${tagHtml}
        </div>
        <div class="mod-card-grid__body">
          <h4 class="mod-card-grid__title" data-editable="card-title">${escapeHtml(card.title)}</h4>
          ${card.subtitle ? `<p class="mod-card-grid__subtitle" data-editable="card-subtitle">${escapeHtml(card.subtitle)}</p>` : ''}
        </div>
      </div>`;
    }).join('\n');

    const titleHtml = title
      ? `<section class="mod-text"><h2 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h2></section>`
      : '';

    return `${titleHtml}
<div class="mod-card-grid">
  ${cardsHtml}
</div>`;
  },
};

registerBlock('intro-card-grid', renderer);
export default renderer;
