// intro-blocks/intro-schedule.js — 타임라인: 좌측 핀+연결선 + 우측 코스 정보
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const TYPE_LABELS = {
  이동: { text: '이동', cls: 'travel' },
  '가이드 투어': { text: '가이드 투어', cls: 'guided' },
  '자유 일정': { text: '자유 일정', cls: 'free' },
  travel: { text: '이동', cls: 'travel' },
  guided: { text: '가이드 투어', cls: 'guided' },
  free: { text: '자유 일정', cls: 'free' },
};

const renderer = {
  validate(data) {
    return !!(data && data.title && data.days?.length);
  },

  render(data, ctx) {
    const { title, days, totalDuration } = data;

    const durationBadge = totalDuration
      ? ` <span class="mod-tl__total">⏱ ${escapeHtml(totalDuration)}</span>`
      : '';

    const itemsHtml = days.map((d, i) => {
      const pin = d.label || `D${i + 1}`;
      const typeInfo = TYPE_LABELS[d.type] || null;
      const isLast = i === days.length - 1;

      return `<div class="mod-tl__item${isLast ? ' mod-tl__item--last' : ''}">
  <div class="mod-tl__pin-col">
    <div class="mod-tl__pin">${escapeHtml(pin)}</div>
    ${!isLast ? '<div class="mod-tl__line"></div>' : ''}
  </div>
  <div class="mod-tl__content">
    <h3 class="mod-tl__title" data-editable="days.${i}.title">${escapeHtml(d.title)}</h3>
    ${d.summary ? `<p class="mod-tl__summary" data-editable="days.${i}.summary">${escapeHtml(d.summary)}</p>` : ''}
    ${typeInfo ? `<span class="mod-tl__type mod-tl__type--${typeInfo.cls}">${typeInfo.text}</span>` : ''}
  </div>
</div>`;
    }).join('\n');

    return `<div class="mod-text" style="text-align:left">
  <h2 class="mod-text__title" data-editable="title">${escapeHtml(title)}${durationBadge}</h2>
</div>
<div class="mod-tl">
  ${itemsHtml}
</div>`;
  },
};

registerBlock('intro-schedule', renderer);
export default renderer;
