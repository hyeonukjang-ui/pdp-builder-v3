// blocks/trustBadges.js — 신뢰 배지 바 (Hook)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-trust-badges {
  padding: 12px 20px;
  background: #F0F9FF;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.pdp-trust-badges::-webkit-scrollbar {
  display: none;
}

.pdp-trust-badges__list {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.pdp-trust-badges__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1D2229;
  border: 1px solid #E5E7EB;
  flex-shrink: 0;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-trust-badges__icon {
  font-size: 16px;
  line-height: 1;
}

.pdp-trust-badges__label {
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-trust-badges-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-trust-badges-styles';
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
    return !!(data && data.badges?.length >= 1);
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    // 최대 4개까지만 표시
    const badges = data.badges.slice(0, 4);

    const itemsHtml = badges
      .map((badge) => {
        const icon = badge.icon || '';
        const label = typeof badge === 'string' ? badge : badge.label;
        const iconHtml = icon
          ? `<span class="pdp-trust-badges__icon">${escapeHtml(icon)}</span>`
          : '';
        return `
    <div class="pdp-trust-badges__item">
      ${iconHtml}
      <span class="pdp-trust-badges__label">${escapeHtml(label)}</span>
    </div>`;
      })
      .join('');

    return `
<section class="pdp-trust-badges">
  <div class="pdp-trust-badges__list">
    ${itemsHtml}
  </div>
</section>`;
  },
};

registerBlock('trustBadges', renderer);
export default renderer;
