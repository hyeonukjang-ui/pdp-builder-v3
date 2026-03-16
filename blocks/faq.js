// blocks/faq.js — FAQ (Reassure)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-faq {
  padding: var(--pdp-section-gap, 32px) var(--pdp-content-padding, 20px);
}

.pdp-faq__list {
  border-top: 1px solid var(--pdp-border, #E5E7EB);
}

.pdp-faq__item {
  border-bottom: 1px solid var(--pdp-border, #E5E7EB);
}

/* 질문 (summary) */
.pdp-faq__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 0;
  cursor: pointer;
  list-style: none;
  user-select: none;
}
.pdp-faq__question::-webkit-details-marker { display: none; }
.pdp-faq__question::marker { display: none; }

.pdp-faq__q-badge {
  font-size: 14px;
  font-weight: 800;
  color: var(--pdp-primary, #2B96ED);
  flex-shrink: 0;
  line-height: 1;
}

.pdp-faq__q-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--pdp-text, #1D2229);
  line-height: 1.45;
  flex: 1;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
  transition: color var(--pdp-transition, 200ms cubic-bezier(0.4, 0, 0.2, 1));
}

.pdp-faq__chevron {
  color: var(--pdp-text-secondary, #6B7280);
  transition: transform 300ms ease;
  flex-shrink: 0;
}
details[open] > .pdp-faq__question .pdp-faq__chevron {
  transform: rotate(180deg);
}

/* 호버 상태 */
.pdp-faq__question:hover .pdp-faq__q-text {
  color: var(--pdp-primary, #2B96ED);
}

/* 답변 */
.pdp-faq__answer {
  padding: 0 0 16px 0;
  display: flex;
  gap: 8px;
}

.pdp-faq__a-badge {
  font-size: 14px;
  font-weight: 800;
  color: var(--pdp-text-secondary, #6B7280);
  flex-shrink: 0;
  line-height: 1.65;
}

.pdp-faq__answer-text {
  font-size: 14px;
  color: var(--pdp-text-secondary, #6B7280);
  line-height: 1.65;
  margin: 0;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

/* 단일 항목 (아코디언 아닌 일반 텍스트) */
.pdp-faq__single {
  padding: 16px 0;
}
.pdp-faq__single-question {
  font-size: 15px;
  font-weight: 600;
  color: var(--pdp-text, #1D2229);
  margin: 0 0 8px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-faq__single-answer {
  font-size: 14px;
  color: var(--pdp-text-secondary, #6B7280);
  line-height: 1.65;
  margin: 0;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-faq-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-faq-styles';
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
    const title = data.title || '자주 묻는 질문';
    const items = data.items || [];

    // 1개 항목이면 아코디언이 아닌 일반 텍스트로 표시
    if (items.length === 1) {
      const item = items[0];
      return `
<section class="pdp-section pdp-faq" aria-label="자주 묻는 질문">
  <div class="pdp-faq__inner">
    <h2 class="pdp-section__title" data-editable="title">${escapeHtml(title)}</h2>
    <div class="pdp-faq__single">
      <p class="pdp-faq__single-question" data-editable="items.0.question">Q. ${escapeHtml(item.question)}</p>
      <p class="pdp-faq__single-answer" data-editable="items.0.answer">A. ${escapeHtml(item.answer)}</p>
    </div>
  </div>
</section>`;
    }

    // 2개 이상: 아코디언
    const listHtml = items
      .map((item, index) => {
        return `
      <details class="pdp-faq__item">
        <summary class="pdp-faq__question">
          <span class="pdp-faq__q-badge">Q</span>
          <span class="pdp-faq__q-text" data-editable="items.${index}.question">${escapeHtml(item.question)}</span>
          <svg class="pdp-faq__chevron" aria-hidden="true" width="12" height="12">
            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </summary>
        <div class="pdp-faq__answer">
          <span class="pdp-faq__a-badge">A</span>
          <p class="pdp-faq__answer-text" data-editable="items.${index}.answer">${escapeHtml(item.answer)}</p>
        </div>
      </details>`;
      })
      .join('');

    return `
<section class="pdp-section pdp-faq" aria-label="자주 묻는 질문">
  <div class="pdp-faq__inner">
    <h2 class="pdp-section__title" data-editable="title">${escapeHtml(title)}</h2>
    <div class="pdp-faq__list">
      ${listHtml}
    </div>
  </div>
</section>`;
  },

  /* ---- mount (선택적: JSON-LD FAQ 스키마 생성) -------------------- */
  mount(data) {
    if (typeof document === 'undefined') return;
    const items = data.items || [];
    if (items.length === 0) return;

    const faqEntries = items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }));

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntries,
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'pdp-faq-jsonld';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  },

  /* ---- unmount --------------------------------------------------- */
  unmount() {
    if (typeof document === 'undefined') return;
    const existing = document.getElementById('pdp-faq-jsonld');
    if (existing) existing.remove();
  },
};

registerBlock('faq', renderer);
export default renderer;
