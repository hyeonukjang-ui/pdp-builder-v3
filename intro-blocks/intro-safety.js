// intro-blocks/intro-safety.js — 안전/장비 소개: 제목 + 장비 배지 + 설명
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.title);
  },

  render(data, ctx) {
    const { image, title, equipment, description } = data;
    const hasImage = image?.url;

    // 이미지 영역
    const imageHtml = hasImage
      ? `<div class="mod-media-card__image-wrap">
  <img class="mod-media-card__img" src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || title)}" loading="lazy" />
</div>`
      : `<div class="mod-media-card__image-wrap">
  <div class="mod-media-card__placeholder">\u{1F6E1}\uFE0F</div>
</div>`;

    // 장비 배지
    const equipmentList = equipment || [];
    const equipmentHtml = equipmentList.length
      ? `<div class="mod-badges">${equipmentList
          .map((item) => `<span class="mod-badges__item">${escapeHtml(item)}</span>`)
          .join('')}</div>`
      : '';

    // 설명
    const descHtml = description
      ? `<p class="mod-media-card__desc">${escapeHtml(description)}</p>`
      : '';

    return `<div class="mod-text">
  <h3 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h3>
</div>
<div class="mod-media-card">
  ${imageHtml}
  <div class="mod-media-card__body">
    ${equipmentHtml}
    ${descHtml}
  </div>
</div>`;
  },
};

registerBlock('intro-safety', renderer);
export default renderer;
