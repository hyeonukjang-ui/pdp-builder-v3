// intro-blocks/intro-image.js — Standalone full-width image: 독립 이미지 + 캡션
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && (data.image?.url || data.imagePrompt));
  },

  render(data, ctx) {
    const { image, caption, imagePrompt } = data;
    const hasImage = image?.url;

    let imageHtml;
    if (hasImage) {
      imageHtml = `<img class="mod-full-image__img" src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || caption || '')}" loading="lazy" />`;
    } else {
      imageHtml = `<div class="mod-full-image__placeholder">${escapeHtml(imagePrompt ? '이미지 생성 예정' : '')}</div>`;
    }

    return `<div class="mod-full-image">
  ${imageHtml}
  ${caption ? `<p class="mod-full-image__caption" data-editable="caption">${escapeHtml(caption)}</p>` : ''}
</div>`;
  },
};

registerBlock('intro-image', renderer);
export default renderer;
