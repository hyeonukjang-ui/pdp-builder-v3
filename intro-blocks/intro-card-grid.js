// intro-blocks/intro-card-grid.js — 세로 나열 카드: 제목 → 설명 → 이미지 (최대 3개)
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.items?.length);
  },

  render(data, ctx) {
    const { title, items } = data;
    const visibleItems = items.slice(0, 3);

    const cardsHtml = visibleItems.map((card, i) => {
      const hasImage = card.image?.url;

      const imageHtml = hasImage
        ? `<img class="mod-vcard__img" src="${escapeHtml(card.image.url)}" alt="${escapeHtml(card.image.alt || card.title)}" loading="lazy" />`
        : `<div class="mod-vcard__img mod-vcard__placeholder">📷 이미지를 추가하세요</div>`;

      return `<div class="mod-vcard__item">
  <h3 class="mod-vcard__title" data-editable="items.${i}.title">${escapeHtml(card.title)}</h3>
  ${card.subtitle ? `<p class="mod-vcard__desc" data-editable="items.${i}.subtitle">${escapeHtml(card.subtitle)}</p>` : ''}
  <div class="mod-vcard__img-wrap">
    ${imageHtml}
  </div>
</div>`;
    }).join('\n');

    const titleHtml = title
      ? `<div class="mod-text"><h2 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h2></div>`
      : '';

    return `${titleHtml}
<div class="mod-vcard-list">
  ${cardsHtml}
</div>`;
  },
};

registerBlock('intro-card-grid', renderer);
export default renderer;
