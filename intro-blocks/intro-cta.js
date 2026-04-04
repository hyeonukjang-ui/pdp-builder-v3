// intro-blocks/intro-cta.js — 상품 추천: "이런 상품은 어때요?" 카드 리스트
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.items?.length >= 1);
  },

  render(data, ctx) {
    const { title, items } = data;
    const heading = title || '이런 상품은 어때요?';

    const cardsHtml = items.map((item, i) => {
      const imgHtml = item.image?.url
        ? `<img class="mod-recommend__img" src="${escapeHtml(item.image.url)}" alt="${escapeHtml(item.title || '')}">`
        : `<div class="mod-recommend__img mod-recommend__img--empty">📦</div>`;

      return `<a class="mod-recommend__card" ${item.url ? `href="${escapeHtml(item.url)}" target="_blank"` : ''}>
  ${imgHtml}
  <div class="mod-recommend__body">
    <p class="mod-recommend__title" data-editable="items.${i}.title">${escapeHtml(item.title || '상품명')}</p>
    ${item.price ? `<p class="mod-recommend__price" data-editable="items.${i}.price">${escapeHtml(item.price)}</p>` : ''}
    ${item.desc ? `<p class="mod-recommend__desc" data-editable="items.${i}.desc">${escapeHtml(item.desc)}</p>` : ''}
  </div>
</a>`;
    }).join('\n');

    return `<div class="mod-text">
  <h3 class="mod-text__title" data-editable="title">${escapeHtml(heading)}</h3>
</div>
<div class="mod-recommend">
  ${cardsHtml}
</div>`;
  },
};

registerBlock('intro-cta', renderer);
export default renderer;
