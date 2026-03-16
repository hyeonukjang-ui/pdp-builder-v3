// blocks/highlights.js — 핵심 매력 포인트 (Hook)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-highlights {
  padding: var(--pdp-content-padding, 20px);
}

.pdp-section__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--pdp-text, #1D2229);
  margin: 0 0 16px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-highlights__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pdp-highlights__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: #F9FAFB;
  border-radius: 12px;
}

.pdp-highlights__icon {
  font-size: 20px;
  flex-shrink: 0;
  width: 28px;
  text-align: center;
  line-height: 1.4;
}

.pdp-highlights__text {
  font-size: 15px;
  color: #1D2229;
  line-height: 1.5;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-highlights-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-highlights-styles';
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
    return !!(data && data.items?.length >= 1);
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const items = data.items;

    const listHtml = items
      .map((item, index) => {
        const icon = item.icon || '';
        const text = typeof item === 'string' ? item : item.text;
        return `
    <li class="pdp-highlights__item">
      <span class="pdp-highlights__icon">${escapeHtml(icon)}</span>
      <span class="pdp-highlights__text" data-editable="items.${index}.text">${escapeHtml(text)}</span>
    </li>`;
      })
      .join('');

    return `
<section class="pdp-section pdp-highlights">
  <h2 class="pdp-section__title" data-editable="title">\uc774 \uc0c1\ud488\uc758 \ub9e4\ub825</h2>
  <ul class="pdp-highlights__list">
    ${listHtml}
  </ul>
</section>`;
  },
};

registerBlock('highlights', renderer);
export default renderer;
