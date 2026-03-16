// blocks/itinerary.js — 일정/코스 (Convince)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-itinerary {
  padding: var(--pdp-content-padding, 20px);
}

.pdp-itinerary__total {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 20px;
  padding: 8px 12px;
  background: #F9FAFB;
  border-radius: 8px;
  display: inline-block;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

/* Timeline 레이아웃 */
.pdp-itinerary__timeline {
  position: relative;
  padding-left: 24px;
}

.pdp-itinerary__timeline::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #E5E7EB;
}

.pdp-itinerary__stop {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  position: relative;
}
.pdp-itinerary__stop:last-child {
  margin-bottom: 0;
}

.pdp-itinerary__time {
  width: 48px;
  font-size: 13px;
  font-weight: 600;
  color: #2B96ED;
  flex-shrink: 0;
  text-align: right;
  padding-top: 2px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-itinerary__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #2B96ED;
  border: 2px solid #fff;
  flex-shrink: 0;
  margin-top: 4px;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 0 2px #E5E7EB;
}

.pdp-itinerary__content {
  flex: 1;
  min-width: 0;
}

.pdp-itinerary__stop-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2229;
  margin: 0 0 4px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-itinerary__description {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.5;
  margin: 0 0 6px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-itinerary__duration {
  font-size: 12px;
  color: #2B96ED;
  font-weight: 500;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

/* Day-by-day 레이아웃 */
.pdp-itinerary__day-group {
  margin-bottom: 24px;
}
.pdp-itinerary__day-group:last-child {
  margin-bottom: 0;
}

.pdp-itinerary__day-header {
  font-size: 15px;
  font-weight: 700;
  color: #1D2229;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E5E7EB;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-itinerary-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-itinerary-styles';
  style.textContent = STYLES;
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderStop(stop) {
  const timeHtml = stop.time
    ? `<div class="pdp-itinerary__time">${escapeHtml(stop.time)}</div>`
    : `<div class="pdp-itinerary__time"></div>`;

  const descHtml = stop.description
    ? `<p class="pdp-itinerary__description">${escapeHtml(stop.description)}</p>`
    : '';

  const durationHtml = stop.duration
    ? `<span class="pdp-itinerary__duration">\uc57d ${escapeHtml(stop.duration)}</span>`
    : '';

  return `
    <div class="pdp-itinerary__stop">
      ${timeHtml}
      <div class="pdp-itinerary__dot"></div>
      <div class="pdp-itinerary__content">
        <h3 class="pdp-itinerary__stop-title">${escapeHtml(stop.title || stop.name || '')}</h3>
        ${descHtml}
        ${durationHtml}
      </div>
    </div>`;
}

function groupByDay(stops) {
  const groups = new Map();
  for (const stop of stops) {
    const day = stop.day || 1;
    if (!groups.has(day)) {
      groups.set(day, []);
    }
    groups.get(day).push(stop);
  }
  return groups;
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */
const renderer = {
  /* ---- validate -------------------------------------------------- */
  validate(data) {
    return !!(data && data.stops?.length >= 1);
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const type = data.type || 'timeline';
    const stops = data.stops;

    // 총 소요 시간
    const totalHtml = data.totalDuration
      ? `<div class="pdp-itinerary__total">\ucd1d \uc57d ${escapeHtml(data.totalDuration)}</div>`
      : '';

    let bodyHtml;

    if (type === 'day_by_day') {
      // Day-by-day: stops를 day 기준 그룹핑
      const groups = groupByDay(stops);
      const groupEntries = [...groups.entries()].sort((a, b) => a[0] - b[0]);

      bodyHtml = groupEntries
        .map(
          ([day, dayStops]) => `
  <div class="pdp-itinerary__day-group">
    <h3 class="pdp-itinerary__day-header">Day ${day}</h3>
    <div class="pdp-itinerary__timeline">
      ${dayStops.map(renderStop).join('')}
    </div>
  </div>`
        )
        .join('');
    } else {
      // Timeline (기본)
      bodyHtml = `
  <div class="pdp-itinerary__timeline">
    ${stops.map(renderStop).join('')}
  </div>`;
    }

    return `
<section class="pdp-section pdp-itinerary">
  <h2 class="pdp-section__title">\ud22c\uc5b4 \uc77c\uc815</h2>
  ${totalHtml}
  ${bodyHtml}
</section>`;
  },
};

registerBlock('itinerary', renderer);
export default renderer;
