// blocks/inclusions.js — 포함/불포함 블록 (Reassure)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-inclusions__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 640px) {
  .pdp-inclusions__grid {
    grid-template-columns: 1fr;
  }
}

.pdp-inclusions__subtitle {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--pdp-text, #1D2229);
}

.pdp-inclusions__column ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.pdp-inclusions__item {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  align-items: flex-start;
}

.pdp-inclusions__icon {
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.4;
}

.pdp-inclusions__item--included .pdp-inclusions__icon {
  color: var(--pdp-success, #059669);
}

.pdp-inclusions__item--excluded .pdp-inclusions__icon {
  color: var(--pdp-danger, #EF4444);
}

.pdp-inclusions__text {
  font-size: 14px;
  color: var(--pdp-text, #1D2229);
  line-height: 1.4;
}

.pdp-inclusions__detail {
  font-size: 12px;
  color: var(--pdp-text-secondary, #6B7280);
  display: block;
}

.pdp-inclusions__tip {
  font-size: 12px;
  color: #D97706;
  display: block;
  margin-top: 2px;
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-inclusions-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-inclusions-styles';
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

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */
const renderer = {
  /* ---- validate -------------------------------------------------- */
  validate(data) {
    return !!(data && (data.included?.length || data.excluded?.length));
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const includedItems = data.included || [];
    const excludedItems = data.excluded || [];

    const renderIncludedItem = (item) => {
      const text = typeof item === 'string' ? item : item.text;
      const detail = typeof item === 'string' ? '' : item.detail;
      const detailHtml = detail
        ? `<span class="pdp-inclusions__detail">${escapeHtml(detail)}</span>`
        : '';

      return `
        <li class="pdp-inclusions__item pdp-inclusions__item--included">
          <span class="pdp-inclusions__icon">\u2713</span>
          <div>
            <span class="pdp-inclusions__text">${escapeHtml(text)}</span>
            ${detailHtml}
          </div>
        </li>`;
    };

    const renderExcludedItem = (item) => {
      const text = typeof item === 'string' ? item : item.text;
      const tip = typeof item === 'string' ? '' : item.tip;
      const tipHtml = tip
        ? `<span class="pdp-inclusions__tip">\uD83D\uDCA1 ${escapeHtml(tip)}</span>`
        : '';

      return `
        <li class="pdp-inclusions__item pdp-inclusions__item--excluded">
          <span class="pdp-inclusions__icon">\u2715</span>
          <div>
            <span class="pdp-inclusions__text">${escapeHtml(text)}</span>
            ${tipHtml}
          </div>
        </li>`;
    };

    const includedHtml = includedItems.length
      ? `
      <div class="pdp-inclusions__column pdp-inclusions__column--included">
        <h3 class="pdp-inclusions__subtitle">\u2705 포함</h3>
        <ul>${includedItems.map(renderIncludedItem).join('')}</ul>
      </div>`
      : '';

    const excludedHtml = excludedItems.length
      ? `
      <div class="pdp-inclusions__column pdp-inclusions__column--excluded">
        <h3 class="pdp-inclusions__subtitle">\u274C 불포함</h3>
        <ul>${excludedItems.map(renderExcludedItem).join('')}</ul>
      </div>`
      : '';

    return `
<section class="pdp-section pdp-inclusions">
  <h2 class="pdp-section__title">포함 / 불포함</h2>
  <div class="pdp-inclusions__grid">
    ${includedHtml}
    ${excludedHtml}
  </div>
</section>`;
  },
};

registerBlock('inclusions', renderer);
export default renderer;
