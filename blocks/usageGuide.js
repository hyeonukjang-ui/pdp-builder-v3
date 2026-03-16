// blocks/usageGuide.js — 이용 방법 블록 (Reassure)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-usage__steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pdp-usage__step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.pdp-usage__number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--pdp-primary, #2B96ED);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.pdp-usage__icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F0F9FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.pdp-usage__content {
  flex: 1;
  min-width: 0;
}

.pdp-usage__step-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--pdp-text, #1D2229);
  margin: 0 0 4px;
}

.pdp-usage__step-desc {
  font-size: 14px;
  color: var(--pdp-text-secondary, #6B7280);
  line-height: 1.5;
  margin: 0;
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-usageGuide-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-usageGuide-styles';
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
    return !!(data && data.steps?.length >= 1);
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const steps = data.steps || [];

    const stepsHtml = steps.map((step, index) => {
      const number = step.step || (index + 1);

      // icon이 있으면 icon, 없으면 number
      const indicatorHtml = step.icon
        ? `<div class="pdp-usage__icon">${step.icon}</div>`
        : `<div class="pdp-usage__number">${number}</div>`;

      const titleHtml = step.title
        ? `<h3 class="pdp-usage__step-title" data-editable="steps.${index}.title">${escapeHtml(step.title)}</h3>`
        : '';

      const descHtml = step.description
        ? `<p class="pdp-usage__step-desc" data-editable="steps.${index}.description">${escapeHtml(step.description)}</p>`
        : '';

      return `
      <div class="pdp-usage__step">
        ${indicatorHtml}
        <div class="pdp-usage__content">
          ${titleHtml}
          ${descHtml}
        </div>
      </div>`;
    }).join('');

    return `
<section class="pdp-section pdp-usage">
  <h2 class="pdp-section__title" data-editable="title">이용 방법</h2>
  <div class="pdp-usage__steps">
    ${stepsHtml}
  </div>
</section>`;
  },
};

registerBlock('usageGuide', renderer);
export default renderer;
