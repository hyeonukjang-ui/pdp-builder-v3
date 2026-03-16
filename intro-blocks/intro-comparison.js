// intro-blocks/intro-comparison.js — 가격 비교/절약 블록
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

function formatPrice(num) {
  return Number(num).toLocaleString('ko-KR');
}

const renderer = {
  validate(data) {
    return !!(data && data.items?.length && data.packagePrice != null);
  },

  render(data, ctx) {
    const { title, items, totalIndividual, packagePrice, savings, savingsPercent } = data;

    const itemsHtml = items.map(item => {
      const includedClass = item.included ? ' mod-comparison__item--included' : '';

      return `<div class="mod-comparison__item${includedClass}">
      <span class="mod-comparison__item-name">${escapeHtml(item.name)}</span>
      <span class="mod-comparison__item-price">${formatPrice(item.price)}\uC6D0</span>
    </div>`;
    }).join('\n');

    const totalHtml = `<div class="mod-comparison__total">
    <span class="mod-comparison__total-label">\uC774 \uD328\uC2A4 \uAC00\uACA9</span>
    <span class="mod-comparison__total-price">${formatPrice(packagePrice)}\uC6D0</span>
  </div>`;

    const savingsHtml = savings != null && savingsPercent != null
      ? `<div class="mod-comparison__savings">${formatPrice(savings)}\uC6D0 \uC808\uC57D (${savingsPercent}%)</div>`
      : '';

    return `<section class="mod-text">
  <h2 class="mod-text__title" data-editable="title">${escapeHtml(title || '')}</h2>
</section>
<div class="mod-comparison">
  <div class="mod-comparison__items">
    ${itemsHtml}
  </div>
  ${totalHtml}
  ${savingsHtml}
</div>`;
  },
};

registerBlock('intro-comparison', renderer);
export default renderer;
