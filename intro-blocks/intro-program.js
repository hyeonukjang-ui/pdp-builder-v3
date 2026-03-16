// intro-blocks/intro-program.js — 프로그램 상세 블록 (이미지+텍스트 리치 레이아웃)
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.title && data.items?.length);
  },

  render(data, ctx) {
    const { title, items } = data;

    const itemsHtml = items.map((item, i) => {
      const durationBadge = item.duration
        ? `<span class="mod-program__duration">${escapeHtml(item.duration)}</span>`
        : '';

      // 이미지 그리드: 1장이면 풀폭, 2장이면 2열, 3장이면 1+2 레이아웃
      let imagesHtml = '';
      const images = item.images || [];
      if (images.length === 1) {
        imagesHtml = `<div class="mod-program__images mod-program__images--1">
          <img class="mod-program__img" src="${escapeHtml(images[0].url)}" alt="${escapeHtml(images[0].alt || item.title)}" loading="lazy" />
        </div>`;
      } else if (images.length === 2) {
        imagesHtml = `<div class="mod-program__images mod-program__images--2">
          ${images.map(img => `<img class="mod-program__img" src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt || '')}" loading="lazy" />`).join('\n')}
        </div>`;
      } else if (images.length >= 3) {
        imagesHtml = `<div class="mod-program__images mod-program__images--3">
          <img class="mod-program__img mod-program__img--main" src="${escapeHtml(images[0].url)}" alt="${escapeHtml(images[0].alt || '')}" loading="lazy" />
          <div class="mod-program__images-sub">
            <img class="mod-program__img" src="${escapeHtml(images[1].url)}" alt="${escapeHtml(images[1].alt || '')}" loading="lazy" />
            <img class="mod-program__img" src="${escapeHtml(images[2].url)}" alt="${escapeHtml(images[2].alt || '')}" loading="lazy" />
          </div>
        </div>`;
      } else {
        // 이미지 없으면 플레이스홀더
        imagesHtml = `<div class="mod-program__images mod-program__images--placeholder">
          <div class="mod-program__placeholder">이미지를 추가해주세요</div>
        </div>`;
      }

      return `<div class="mod-program__item" data-item-index="${i}">
        <div class="mod-program__header">
          <span class="mod-program__label" data-editable="item-label">${escapeHtml(item.label || '')}</span>
          <h3 class="mod-program__title" data-editable="item-title">${escapeHtml(item.title)}</h3>
          ${durationBadge}
        </div>
        ${item.description ? `<p class="mod-program__desc" data-editable="item-desc">${escapeHtml(item.description)}</p>` : ''}
        ${imagesHtml}
      </div>`;
    }).join('\n');

    return `<section class="mod-text">
  <h2 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h2>
</section>
<div class="mod-program">
  ${itemsHtml}
</div>`;
  },
};

registerBlock('intro-program', renderer);
export default renderer;
