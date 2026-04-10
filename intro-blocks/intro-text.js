// intro-blocks/intro-text.js — Text section: 일반 텍스트 / FAQ / 테이블 모드
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && (data.paragraphs?.length || data.faq?.length || data.table?.length || data.includes?.length || data.excludes?.length));
  },

  render(data, ctx) {
    const { title, subtitle, paragraphs, faq, table, image, background } = data;
    const bgClass = background === 'gray' ? 'mod-text--gray' : 'mod-text--white';

    // 이미지: 있을 때만 노출
    const imageHtml = image?.url
      ? `<div class="mod-text__img-wrap"><img class="mod-text__img" src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || title || '')}" loading="lazy"></div>`
      : '';

    // 테이블 모드: 옵션명/이용대상/특징
    if (table && table.length) {
      const rows = table.map((row, i) =>
        `<tr>
    <td class="mod-table__cell mod-table__name" data-editable="table.${i}.name">${escapeHtml(row.name)}</td>
    <td class="mod-table__cell" data-editable="table.${i}.target">${escapeHtml(row.target || '')}</td>
    <td class="mod-table__cell" data-editable="table.${i}.feature">${escapeHtml(row.feature || '')}</td>
  </tr>`
      ).join('\n  ');

      return `<div class="mod-text ${bgClass}">
  ${title ? `<h3 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h3>` : ''}
  <table class="mod-table">
    <thead><tr><th class="mod-table__th">옵션명</th><th class="mod-table__th">이용대상</th><th class="mod-table__th">특징</th></tr></thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</div>`;
    }

    // 포함·불포함 모드
    const { includes, excludes } = data;
    if ((includes && includes.length) || (excludes && excludes.length)) {
      const yesItems = (includes || []).map(item =>
        `<div class="mod-includes__item"><span class="mod-includes__check">✓</span> ${escapeHtml(item)}</div>`
      ).join('\n      ');
      const noItems = (excludes || []).map(item =>
        `<div class="mod-includes__item"><span class="mod-includes__check">✕</span> ${escapeHtml(item)}</div>`
      ).join('\n      ');

      return `<div class="mod-text ${bgClass}">
  ${title ? `<h3 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h3>` : `<h3 class="mod-text__title">포함·불포함</h3>`}
</div>
<div class="mod-includes">
  <div class="mod-includes__grid">
    <div class="mod-includes__card mod-includes__card--yes">
      <div class="mod-includes__label">포함</div>
      ${yesItems}
    </div>
    <div class="mod-includes__card mod-includes__card--no">
      <div class="mod-includes__label">불포함</div>
      ${noItems}
    </div>
  </div>
</div>`;
    }

    // FAQ 모드 — Q뱃지 + A뱃지 구조 (Figma 시안)
    if (faq && faq.length) {
      const faqHtml = faq.map((item, i) =>
        `<div class="mod-faq__item">
    <div class="mod-faq__row">
      <span class="mod-faq__badge mod-faq__badge--q">Q</span>
      <span class="mod-faq__q" data-editable="faq.${i}.q">${escapeHtml(item.q)}</span>
    </div>
    <div class="mod-faq__row">
      <span class="mod-faq__badge mod-faq__badge--a">A</span>
      <span class="mod-faq__a" data-editable="faq.${i}.a">${escapeHtml(item.a)}</span>
    </div>
  </div>`
      ).join('\n  ');

      return `<div class="mod-text ${bgClass}">
  ${title ? `<h3 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h3>` : ''}
  <div class="mod-faq">
    ${faqHtml}
  </div>
</div>`;
    }

    // 일반 텍스트 모드
    return `<div class="mod-text ${bgClass}">
  ${title ? `<h3 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h3>` : ''}
  ${subtitle ? `<p class="mod-text__subtitle" data-editable="subtitle">${escapeHtml(subtitle)}</p>` : ''}
  ${(paragraphs || []).map((p, i) => `<p class="mod-text__body" data-editable="paragraphs.${i}">${escapeHtml(p)}</p>`).join('\n  ')}
  ${imageHtml}
</div>`;
  },
};

registerBlock('intro-text', renderer);
export default renderer;
