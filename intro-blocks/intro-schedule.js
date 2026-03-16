// intro-blocks/intro-schedule.js — 일정 미리보기 타임라인 블록 (시간 필드 포함)
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

function getDayType(type) {
  if (type === 'guided' || type === 'free' || type === 'travel') return type;
  return 'guided';
}

const TYPE_LABELS = {
  guided: '가이드 투어',
  free: '자유 일정',
  travel: '이동',
};

const renderer = {
  validate(data) {
    return !!(data && data.title && data.days?.length);
  },

  render(data, ctx) {
    const { title, days, totalDuration } = data;

    const totalBadge = totalDuration
      ? ` <span class="mod-badges__item">\u23F1 ${escapeHtml(totalDuration)}</span>`
      : '';

    const daysHtml = days.map(d => {
      const type = getDayType(d.type);
      const typeLabel = TYPE_LABELS[type] || '';

      return `<div class="mod-timeline__item">
    <div class="mod-timeline__badge mod-timeline__badge--${type}">D${Number(d.day)}</div>
    <div class="mod-timeline__content">
      <h4 class="mod-timeline__title" data-editable="day-title">${escapeHtml(d.title)}</h4>
      ${d.time ? `<span class="mod-timeline__time">${escapeHtml(d.time)}</span>` : ''}
      ${d.summary ? `<p class="mod-timeline__summary" data-editable="day-summary">${escapeHtml(d.summary)}</p>` : ''}
      ${typeLabel ? `<span class="mod-timeline__type mod-timeline__type--${type}">${typeLabel}</span>` : ''}
    </div>
  </div>`;
    }).join('\n');

    return `<section class="mod-text">
  <h2 class="mod-text__title" data-editable="title">${escapeHtml(title)}${totalBadge}</h2>
</section>
<div class="mod-timeline">
  ${daysHtml}
</div>`;
  },
};

registerBlock('intro-schedule', renderer);
export default renderer;
