// intro-blocks/intro-schedule.js — 타임라인 (Program List): 세로 스택 구조
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.title && data.days?.length);
  },

  render(data, ctx) {
    const { title, days } = data;

    const itemsHtml = days.map((d, i) => {
      const label = d.label || `Day ${d.day || i + 1}`;
      const duration = d.duration || d.time || '';

      return `<div class="mod-program__item${i > 0 ? ' mod-program__item--border' : ''}">
  <div class="mod-program__header">
    <span class="mod-program__label">${escapeHtml(label)}</span>
    <h3 class="mod-program__title" data-editable="days.${i}.title">${escapeHtml(d.title)}</h3>
    ${duration ? `<span class="mod-program__duration">${escapeHtml(duration)}</span>` : ''}
  </div>
  ${d.summary ? `<p class="mod-program__desc" data-editable="days.${i}.summary">${escapeHtml(d.summary)}</p>` : ''}
</div>`;
    }).join('\n');

    return `<div class="mod-text">
  <h2 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h2>
</div>
<div class="mod-program-list">
  ${itemsHtml}
</div>`;
  },
};

registerBlock('intro-schedule', renderer);
export default renderer;
