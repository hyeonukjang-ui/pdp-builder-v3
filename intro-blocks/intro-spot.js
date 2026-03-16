// intro-blocks/intro-spot.js — 스팟/장소: 특정 장소 1개를 이미지 + 설명으로 소개
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.name);
  },

  render(data, ctx) {
    const { image, name, description } = data;
    const hasImage = image?.url;

    return `<div class="mod-hero">
  ${hasImage
    ? `<img class="mod-hero__img" src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || name)}" />`
    : `<div class="mod-hero__placeholder" style="background:linear-gradient(135deg,#1a472a 0%,#2d6a4f 50%,#40916c 100%);"></div>`}
  <div class="mod-hero__overlay"></div>
  <div class="mod-hero__content mod-hero__content--left">
    <span class="mod-hero__badge">\u{1F4CD} ${escapeHtml(name)}</span>
    <h3 class="mod-hero__title" data-editable="name">${escapeHtml(name)}</h3>
    ${description ? `<p class="mod-hero__subtitle" data-editable="description">${escapeHtml(description)}</p>` : ''}
  </div>
</div>`;
  },
};

registerBlock('intro-spot', renderer);
export default renderer;
