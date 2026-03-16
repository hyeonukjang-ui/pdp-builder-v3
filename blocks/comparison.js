// blocks/comparison.js — 가격 비교표 블록 (Convert)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-comparison__table {
  margin-bottom: 0;
}

.pdp-comparison__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #F3F4F6;
}

.pdp-comparison__row:last-child {
  border-bottom: none;
}

.pdp-comparison__name {
  font-size: 14px;
  color: var(--pdp-text, #1D2229);
  flex: 1;
  min-width: 0;
}

.pdp-comparison__price {
  font-size: 14px;
  color: var(--pdp-text-secondary, #6B7280);
  margin: 0 12px;
  white-space: nowrap;
}

.pdp-comparison__price--included {
  text-decoration: line-through;
  color: #9CA3AF;
}

.pdp-comparison__check {
  color: var(--pdp-success, #059669);
  font-weight: 700;
  flex-shrink: 0;
}

.pdp-comparison__summary {
  margin-top: 16px;
  padding: 16px;
  background: #F9FAFB;
  border-radius: var(--pdp-radius-md, 12px);
}

.pdp-comparison__total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--pdp-text-secondary, #6B7280);
}

.pdp-comparison__total-price {
  text-decoration: line-through;
  color: #9CA3AF;
}

.pdp-comparison__package {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--pdp-text, #1D2229);
}

.pdp-comparison__package-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--pdp-primary, #2B96ED);
}

.pdp-comparison__savings {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--pdp-text, #1D2229);
}

.pdp-comparison__savings-amount {
  color: var(--pdp-success, #059669);
  font-weight: 700;
}

.pdp-comparison__bar {
  height: 8px;
  background: var(--pdp-border, #E5E7EB);
  border-radius: 4px;
  margin-top: 12px;
  overflow: hidden;
}

.pdp-comparison__bar-package {
  height: 100%;
  background: var(--pdp-primary, #2B96ED);
  border-radius: 4px;
  transition: width 600ms ease-out;
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-comparison-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-comparison-styles';
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
    return !!(data && data.items?.length >= 1 && data.packagePrice != null);
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const items = data.items || [];
    const packagePrice = Number(data.packagePrice);

    // 개별 합산
    const totalIndividual = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const savings = totalIndividual - packagePrice;
    const savingsPercent = totalIndividual > 0
      ? Math.round((savings / totalIndividual) * 100)
      : 0;
    const packageRatio = totalIndividual > 0
      ? Math.round((packagePrice / totalIndividual) * 100)
      : 100;

    // 타이틀
    const titleText = savings > 0
      ? `개별 구매보다 \u20A9${formatPrice(savings)} 절약`
      : '가격 비교';

    // 행
    const rowsHtml = items.map((item) => `
      <div class="pdp-comparison__row">
        <span class="pdp-comparison__name">${escapeHtml(item.name)}</span>
        <span class="pdp-comparison__price pdp-comparison__price--included">\u20A9${formatPrice(item.price)}</span>
        <span class="pdp-comparison__check">\u2713</span>
      </div>`
    ).join('');

    // 절약 표시
    const savingsHtml = savings > 0
      ? `
      <div class="pdp-comparison__savings">
        <span>절약</span>
        <span class="pdp-comparison__savings-amount">\u20A9${formatPrice(savings)} (${savingsPercent}%)</span>
      </div>`
      : '';

    // 비교 바
    const barHtml = savings > 0
      ? `
      <div class="pdp-comparison__bar">
        <div class="pdp-comparison__bar-package" style="width: ${packageRatio}%"></div>
      </div>`
      : '';

    return `
<section class="pdp-section pdp-comparison">
  <h2 class="pdp-section__title">${escapeHtml(titleText)}</h2>
  <div class="pdp-comparison__table">
    ${rowsHtml}
  </div>
  <div class="pdp-comparison__summary">
    <div class="pdp-comparison__total">
      <span>개별 구매 시</span>
      <span class="pdp-comparison__total-price">\u20A9${formatPrice(totalIndividual)}</span>
    </div>
    <div class="pdp-comparison__package">
      <span>이 패키지</span>
      <span class="pdp-comparison__package-price">\u20A9${formatPrice(packagePrice)}</span>
    </div>
    ${savingsHtml}
  </div>
  ${barHtml}
</section>`;
  },
};

registerBlock('comparison', renderer);
export default renderer;
