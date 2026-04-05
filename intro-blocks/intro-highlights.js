// intro-blocks/intro-highlights.js — Icon grid (핵심포인트): 아이콘 + 라벨 그리드
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.items?.length >= 2);
  },

  render(data, ctx) {
    const { title, items, columns } = data;
    const heading = title || '핵심 포인트';
    const colClass = columns === 4 ? 'mod-icon-grid--4col' : '';

    const gridHtml = items.map((item, i) => {
      return `<div class="mod-icon-grid__item">
    <span class="mod-icon-grid__icon" data-emoji="items.${i}.icon" style="cursor:pointer">${escapeHtml(item.icon)}</span>
    <span class="mod-icon-grid__label" data-editable="items.${i}.label">${escapeHtml(item.label)}</span>
    ${item.description ? `<span class="mod-icon-grid__desc" data-editable="items.${i}.description">${escapeHtml(item.description)}</span>` : ''}
  </div>`;
    }).join('\n  ');

    return `<div class="mod-text">
  <h3 class="mod-text__title" data-editable="title">${escapeHtml(heading)}</h3>
</div>
<div class="mod-icon-grid ${colClass}">
  ${gridHtml}
</div>`;
  },
};

registerBlock('intro-highlights', renderer);
export default renderer;
