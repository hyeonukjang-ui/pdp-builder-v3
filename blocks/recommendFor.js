// blocks/recommendFor.js — 추천 대상 블록 (Convince)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-recommend__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pdp-recommend__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #F9FAFB;
  border-radius: var(--pdp-radius-md, 12px);
}

.pdp-recommend__icon {
  font-size: 24px;
  flex-shrink: 0;
  line-height: 1;
}

.pdp-recommend__text {
  font-size: 15px;
  color: var(--pdp-text, #1D2229);
  line-height: 1.4;
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-recommendFor-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-recommendFor-styles';
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
    return !!(data && data.targets?.length >= 1);
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const targets = data.targets || [];

    const itemsHtml = targets.map((target, index) => {
      const icon = typeof target === 'string' ? '' : target.icon;
      const text = typeof target === 'string' ? target : target.text;

      const iconHtml = icon
        ? `<span class="pdp-recommend__icon">${icon}</span>`
        : '';

      return `
      <li class="pdp-recommend__item">
        ${iconHtml}
        <span class="pdp-recommend__text" data-editable="targets.${index}.text">${escapeHtml(text)}</span>
      </li>`;
    }).join('');

    return `
<section class="pdp-section pdp-recommend">
  <h2 class="pdp-section__title" data-editable="title">이런 분에게 추천해요</h2>
  <ul class="pdp-recommend__list">
    ${itemsHtml}
  </ul>
</section>`;
  },
};

registerBlock('recommendFor', renderer);
export default renderer;
