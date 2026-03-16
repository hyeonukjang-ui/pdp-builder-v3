// intro-blocks/intro-course.js — 코스/동선 타임라인 블록
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.title && data.stops?.length);
  },

  render(data, ctx) {
    const { title, stops, totalDuration } = data;

    const totalBadge = totalDuration
      ? ` <span class="mod-badges__item">\u23F1 ${escapeHtml(totalDuration)}</span>`
      : '';

    const stopsHtml = stops.map((s, i) => {
      return `<div class="mod-steps__item">
    <div class="mod-steps__number">${i + 1}</div>
    <div class="mod-steps__content">
      <h4 class="mod-steps__title" data-editable="stop-name">${escapeHtml(s.name)}</h4>
      ${s.description ? `<p class="mod-steps__desc" data-editable="stop-desc">${escapeHtml(s.description)}</p>` : ''}
      ${s.duration ? `<span class="mod-steps__duration">${escapeHtml(s.duration)}</span>` : ''}
    </div>
  </div>`;
    }).join('\n');

    return `<section class="mod-text">
  <h2 class="mod-text__title" data-editable="title">${escapeHtml(title)}${totalBadge}</h2>
</section>
<div class="mod-steps">
  ${stopsHtml}
</div>`;
  },
};

registerBlock('intro-course', renderer);
export default renderer;
