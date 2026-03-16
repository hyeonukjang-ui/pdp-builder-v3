// blocks/notice.js — 주의사항 (Reassure)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-notice {
  padding: var(--pdp-section-gap, 32px) var(--pdp-content-padding, 20px);
}

.pdp-notice__groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 각 그룹 (아코디언) */
.pdp-notice__group {
  border-radius: var(--pdp-radius-sm, 8px);
  overflow: hidden;
}
.pdp-notice__group--critical {
  background: #FEF2F2;
  border-left: 3px solid #EF4444;
}
.pdp-notice__group--warning {
  background: #FFFBEB;
  border-left: 3px solid #F59E0B;
}
.pdp-notice__group--info {
  background: var(--pdp-primary-light, #F0F9FF);
  border-left: 3px solid var(--pdp-primary, #2B96ED);
}
.pdp-notice__group--tip {
  background: #ECFDF5;
  border-left: 3px solid var(--pdp-success, #059669);
}

/* summary */
.pdp-notice__summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 700;
  color: var(--pdp-text, #1D2229);
  cursor: pointer;
  list-style: none;
  user-select: none;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-notice__summary::-webkit-details-marker { display: none; }
.pdp-notice__summary::marker { display: none; }

.pdp-notice__subtitle {
  flex: 1;
}
.pdp-notice__chevron {
  color: var(--pdp-text-secondary, #6B7280);
  transition: transform 300ms ease;
  flex-shrink: 0;
}
details[open] > .pdp-notice__summary .pdp-notice__chevron {
  transform: rotate(180deg);
}

/* 리스트 */
.pdp-notice__list {
  padding: 0 14px 14px 42px;
  margin: 0;
}
.pdp-notice__list li {
  font-size: 13px;
  color: var(--pdp-text-secondary, #6B7280);
  line-height: 1.6;
  margin-bottom: 4px;
  list-style: disc;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-notice__list li:last-child {
  margin-bottom: 0;
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-notice-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-notice-styles';
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

/* severity별 SVG 아이콘 */
const SEVERITY_ICONS = {
  critical: '<svg width="16" height="16"><circle cx="8" cy="8" r="8" fill="#EF4444"/><path d="M8 4v5M8 11v1" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
  warning: '<svg width="16" height="16"><circle cx="8" cy="8" r="8" fill="#F59E0B"/><path d="M8 5v4M8 11v0.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
  info: '<svg width="16" height="16"><circle cx="8" cy="8" r="8" fill="#2B96ED"/><path d="M8 5v0.5M8 7v4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
  tip: '<svg width="16" height="16"><circle cx="8" cy="8" r="8" fill="#059669"/><path d="M5.5 8l2 2 3-3.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
};

/* severity별 기본 제목 */
const SEVERITY_TITLES = {
  critical: '안전 안내',
  warning: '참여 조건',
  info: '기타 안내',
  tip: '꿀팁',
};

/* severity 우선순위 (critical 먼저) */
const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2, tip: 3 };

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */
const renderer = {
  /* ---- validate -------------------------------------------------- */
  validate(data) {
    // groups 배열 기반 (스펙 정본) 또는 items 배열 기반 (요청 스펙) 둘 다 지원
    if (data && data.groups?.length >= 1) return true;
    if (data && data.items?.length >= 1) return true;
    return false;
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const title = data.title || '알아두세요';

    // groups 기반 데이터 또는 items 기반 데이터를 groups로 정규화
    let groups;
    if (data.groups) {
      groups = data.groups;
    } else if (data.items) {
      // items: [{ type, text }] -> severity별 그룹핑
      const grouped = {};
      data.items.forEach((item) => {
        const severity = item.type || 'info';
        if (!grouped[severity]) grouped[severity] = [];
        grouped[severity].push(item.text || item);
      });
      groups = Object.entries(grouped).map(([severity, items]) => ({
        severity,
        title: SEVERITY_TITLES[severity] || SEVERITY_TITLES.info,
        items,
      }));
    }

    // severity 우선순위로 정렬
    groups.sort((a, b) => {
      const orderA = SEVERITY_ORDER[a.severity || 'info'] ?? 99;
      const orderB = SEVERITY_ORDER[b.severity || 'info'] ?? 99;
      return orderA - orderB;
    });

    // 그룹이 1개면 아코디언 없이 그냥 펼쳐서 표시
    const singleGroup = groups.length === 1;

    const groupsHtml = groups.map((group, groupIndex) => {
      const severity = group.severity || 'info';
      const groupTitle = escapeHtml(group.title || SEVERITY_TITLES[severity] || '안내');
      const icon = SEVERITY_ICONS[severity] || SEVERITY_ICONS.info;
      const isCritical = severity === 'critical';
      const openAttr = isCritical || singleGroup ? ' open' : '';

      const itemsHtml = (group.items || [])
        .map((item, itemIndex) => {
          const text = typeof item === 'string' ? item : item.text || item;
          return `          <li data-editable="groups.${groupIndex}.items.${itemIndex}">${escapeHtml(String(text))}</li>`;
        })
        .join('\n');

      return `
      <details class="pdp-notice__group pdp-notice__group--${escapeHtml(severity)}"${openAttr}>
        <summary class="pdp-notice__summary">
          <span class="pdp-notice__severity" aria-hidden="true">${icon}</span>
          <span class="pdp-notice__subtitle" data-editable="groups.${groupIndex}.title">${groupTitle}</span>
          <svg class="pdp-notice__chevron" aria-hidden="true" width="12" height="12"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/></svg>
        </summary>
        <ul class="pdp-notice__list">
${itemsHtml}
        </ul>
      </details>`;
    }).join('\n');

    return `
<section class="pdp-section pdp-notice" aria-label="주의사항">
  <div class="pdp-notice__inner">
    <h2 class="pdp-section__title" data-editable="title">${escapeHtml(title)}</h2>
    <div class="pdp-notice__groups">
      ${groupsHtml}
    </div>
  </div>
</section>`;
  },
};

registerBlock('notice', renderer);
export default renderer;
