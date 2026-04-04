// intro-blocks/intro-experience.js — 추천 대상: 사람 아이콘 + 추천 대상 리스트
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.items?.length >= 1);
  },

  render(data, ctx) {
    const { title, items } = data;
    const heading = title || '이런 분께 추천해요';

    const listHtml = items.map((item, i) => {
      return `<div class="mod-target__item">
    <span class="mod-target__icon">${escapeHtml(item.icon || '👤')}</span>
    <div class="mod-target__body">
      <span class="mod-target__label" data-editable="items.${i}.label">${escapeHtml(item.label)}</span>
      ${item.description ? `<span class="mod-target__desc" data-editable="items.${i}.description">${escapeHtml(item.description)}</span>` : ''}
    </div>
  </div>`;
    }).join('\n  ');

    return `<div class="mod-text">
  <h3 class="mod-text__title" data-editable="title">${escapeHtml(heading)}</h3>
</div>
<div class="mod-target">
  ${listHtml}
</div>`;
  },
};

registerBlock('intro-experience', renderer);
export default renderer;
