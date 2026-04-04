// intro-blocks/intro-text.js — Text section: 일반 텍스트 / FAQ / 테이블 모드
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && (data.paragraphs?.length || data.faq?.length || data.table?.length));
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

    // FAQ 모드
    if (faq && faq.length) {
      const faqHtml = faq.map((item, i) =>
        `<div class="mod-faq__item">
    <div class="mod-faq__q" data-editable="faq.${i}.q">Q. ${escapeHtml(item.q)}</div>
    <div class="mod-faq__a" data-editable="faq.${i}.a">${escapeHtml(item.a)}</div>
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
