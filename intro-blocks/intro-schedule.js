// intro-blocks/intro-schedule.js — 타임라인 (Program List): 코스별 뱃지 + 제목 + 설명 한줄
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.title && data.days?.length);
  },

  render(data, ctx) {
    const { title, days } = data;

    const itemsHtml = days.map((d, i) => {
      const label = d.label || d.title || `코스 ${i + 1}`;
      const duration = d.duration || d.time || '';

      return `<div class="mod-program__item${i > 0 ? ' mod-program__item--border' : ''}">
  <div class="mod-program__row">
    <span class="mod-program__label">${escapeHtml(label)}</span>
    ${duration ? `<span class="mod-program__duration">${escapeHtml(duration)}</span>` : ''}
    ${d.summary ? `<span class="mod-program__desc" data-editable="days.${i}.summary">${escapeHtml(d.summary)}</span>` : ''}
  </div>
</div>`;
    }).join('\n');

    return `<div class="mod-text" style="text-align:left">
  <h2 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h2>
</div>
<div class="mod-program-list">
  ${itemsHtml}
</div>`;
  },
};

registerBlock('intro-schedule', renderer);
export default renderer;
