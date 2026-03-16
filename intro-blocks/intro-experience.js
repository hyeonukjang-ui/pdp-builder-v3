// intro-blocks/intro-experience.js — 여행 하이라이트: 다크배경 태그+제목+설명+이미지
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.title);
  },

  render(data, ctx) {
    const { image, title, description, tag } = data;
    const hasImage = image?.url;

    const tagHtml = tag
      ? `<span class="mod-highlight__tag">${escapeHtml(tag)}</span>`
      : '';

    const imageHtml = hasImage
      ? `<div class="mod-highlight__image"><img class="mod-highlight__img" src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || title)}" loading="lazy" /></div>`
      : `<div class="mod-highlight__image"><div class="mod-highlight__placeholder">이미지를 추가해주세요</div></div>`;

    return `<div class="mod-highlight">
  <div class="mod-highlight__text">
    ${tagHtml}
    <h3 class="mod-highlight__title" data-editable="title">${escapeHtml(title)}</h3>
    ${description ? `<p class="mod-highlight__desc" data-editable="description">${escapeHtml(description)}</p>` : ''}
  </div>
  ${imageHtml}
</div>`;
  },
};

registerBlock('intro-experience', renderer);
export default renderer;
