// blocks/optionTable.js — 옵션/요금표 블록 (Convince)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-options__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pdp-options__card {
  position: relative;
  padding: 16px;
  border: 1.5px solid var(--pdp-border, #E5E7EB);
  border-radius: var(--pdp-radius-md, 12px);
  transition: border-color 200ms;
}

.pdp-options__card:hover {
  border-color: var(--pdp-primary, #2B96ED);
}

.pdp-options__card--soldout {
  opacity: 0.5;
  pointer-events: none;
}

.pdp-options__soldout-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.4);
  border-radius: var(--pdp-radius-md, 12px);
  z-index: 1;
}

.pdp-options__soldout-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--pdp-danger, #EF4444);
  background: #fff;
  padding: 4px 16px;
  border-radius: 4px;
  border: 1px solid var(--pdp-danger, #EF4444);
}

.pdp-options__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.pdp-options__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--pdp-text, #1D2229);
  margin: 0;
}

.pdp-options__badges {
  display: flex;
  gap: 4px;
}

.pdp-options__badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #FEF3C7;
  color: #D97706;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
}

.pdp-options__description {
  font-size: 14px;
  color: var(--pdp-text-secondary, #6B7280);
  margin: 0 0 10px;
  line-height: 1.4;
}

.pdp-options__price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.pdp-options__price-original {
  text-decoration: line-through;
  color: #9CA3AF;
  font-size: 13px;
}

.pdp-options__price-current {
  font-size: 18px;
  font-weight: 700;
  color: var(--pdp-primary, #2B96ED);
}

.pdp-options__price-unit {
  font-size: 13px;
  color: var(--pdp-text-secondary, #6B7280);
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-optionTable-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-optionTable-styles';
  style.textContent = STYLES;
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function formatPrice(value) {
  if (value == null) return '';
  return Number(value).toLocaleString('ko-KR');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */
const renderer = {
  /* ---- validate -------------------------------------------------- */
  validate(data) {
    return !!(data && data.options?.length >= 1);
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const options = data.options || [];

    const cardsHtml = options.map((opt) => {
      const available = opt.available !== false;
      const cardClass = available
        ? 'pdp-options__card'
        : 'pdp-options__card pdp-options__card--soldout';

      const soldoutOverlay = available
        ? ''
        : `<div class="pdp-options__soldout-overlay"><span class="pdp-options__soldout-text">매진</span></div>`;

      // 배지
      const badges = opt.badges || [];
      const badgesHtml = badges.length
        ? `<div class="pdp-options__badges">${badges
            .map((b) => `<span class="pdp-options__badge">${escapeHtml(typeof b === 'string' ? b : b.label)}</span>`)
            .join('')}</div>`
        : '';

      // 설명
      const descHtml = opt.description
        ? `<p class="pdp-options__description">${escapeHtml(opt.description)}</p>`
        : '';

      // 가격
      const originalHtml = opt.originalPrice != null
        ? `<span class="pdp-options__price-original">\u20A9${formatPrice(opt.originalPrice)}</span>`
        : '';
      const unitHtml = opt.unit
        ? `<span class="pdp-options__price-unit">/ ${escapeHtml(opt.unit)}</span>`
        : '';
      const priceHtml = opt.price != null
        ? `
        <div class="pdp-options__price">
          ${originalHtml}
          <span class="pdp-options__price-current">\u20A9${formatPrice(opt.price)}</span>
          ${unitHtml}
        </div>`
        : '';

      return `
      <div class="${cardClass}">
        ${soldoutOverlay}
        <div class="pdp-options__card-header">
          <h3 class="pdp-options__name">${escapeHtml(opt.name)}</h3>
          ${badgesHtml}
        </div>
        ${descHtml}
        ${priceHtml}
      </div>`;
    }).join('');

    return `
<section class="pdp-section pdp-options">
  <h2 class="pdp-section__title">옵션 안내</h2>
  <div class="pdp-options__list">
    ${cardsHtml}
  </div>
</section>`;
  },
};

registerBlock('optionTable', renderer);
export default renderer;
