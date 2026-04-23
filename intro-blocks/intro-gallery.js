// intro-blocks/intro-gallery.js — 다중 이미지 갤러리 (레이아웃 선택 가능)
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && Array.isArray(data.images) && data.images.length);
  },

  render(data) {
    const { title, layout, images } = data;
    const imgs = Array.isArray(images) ? images : [];
    if (!imgs.length) return '';
    const lay = layout || '2col';
    const cellsHtml = imgs.map((img, i) => {
      const url = img && img.url;
      const inner = url
        ? `<img class="mod-gallery__img" src="${escapeHtml(url)}" alt="${escapeHtml((img && img.alt) || '')}" loading="lazy">`
        : `<div class="mod-gallery__placeholder">📷</div>`;
      return `<div class="mod-gallery__cell" data-gal-idx="${i}">${inner}</div>`;
    }).join('');
    return `<div class="mod-gallery mod-gallery--${escapeHtml(lay)}">
  ${title ? `<h3 class="mod-gallery__title" data-editable="title">${escapeHtml(title)}</h3>` : ''}
  <div class="mod-gallery__grid">${cellsHtml}</div>
</div>`;
  },
};

registerBlock('intro-gallery', renderer);
export default renderer;
