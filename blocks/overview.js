// blocks/overview.js — 상품 소개 (Convince)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-overview {
  padding: var(--pdp-content-padding, 20px);
}

.pdp-overview__content {
  /* 확장 상태: 기본 */
}

.pdp-overview__content--collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pdp-overview__content p {
  font-size: 15px;
  line-height: 1.7;
  color: #1D2229;
  margin: 0 0 12px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-overview__content p:last-child {
  margin-bottom: 0;
}

.pdp-overview__toggle {
  color: #2B96ED;
  font-size: 14px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 0;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-overview__toggle:hover {
  text-decoration: underline;
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-overview-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-overview-styles';
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
  _cleanup: null,

  /* ---- validate -------------------------------------------------- */
  validate(data) {
    return !!(data && (data.content || data.paragraphs?.length));
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    // paragraphs 우선, 없으면 content를 단일 문단으로
    let paragraphs;
    if (data.paragraphs?.length) {
      paragraphs = data.paragraphs;
    } else {
      // content 문자열을 줄바꿈 기준으로 분리
      paragraphs = String(data.content)
        .split(/\n\n+/)
        .filter((p) => p.trim());
    }

    const contentHtml = paragraphs
      .map((p, index) => `<p data-editable="paragraphs.${index}">${escapeHtml(p.trim())}</p>`)
      .join('\n    ');

    return `
<section class="pdp-section pdp-overview">
  <h2 class="pdp-section__title" data-editable="title">\uc0c1\ud488 \uc18c\uac1c</h2>
  <div class="pdp-overview__content pdp-overview__content--collapsed">
    ${contentHtml}
  </div>
  <button class="pdp-overview__toggle">\ub354 \ubcf4\uae30</button>
</section>`;
  },

  /* ---- mount ----------------------------------------------------- */
  mount() {
    const toggle = document.querySelector('.pdp-overview__toggle');
    const content = document.querySelector('.pdp-overview__content');
    if (!toggle || !content) return;

    const handleClick = () => {
      const isCollapsed = content.classList.contains('pdp-overview__content--collapsed');
      if (isCollapsed) {
        content.classList.remove('pdp-overview__content--collapsed');
        toggle.textContent = '\uc811\uae30';
      } else {
        content.classList.add('pdp-overview__content--collapsed');
        toggle.textContent = '\ub354 \ubcf4\uae30';
      }
    };

    toggle.addEventListener('click', handleClick);
    this._cleanup = () => {
      toggle.removeEventListener('click', handleClick);
    };
  },

  /* ---- unmount --------------------------------------------------- */
  unmount() {
    if (this._cleanup) {
      this._cleanup();
      this._cleanup = null;
    }
  },
};

registerBlock('overview', renderer);
export default renderer;
