// intro-blocks/intro-cta.js — 마무리 CTA: 감성 이미지 + CTA 문구
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.headline && data.buttonText);
  },

  render(data, ctx) {
    const { image, headline, buttonText, subText } = data;
    const hasImage = image?.url;

    // 이미지 있음 → mod-hero 배경 + 중앙 CTA 오버레이
    if (hasImage) {
      return `<div class="mod-hero">
  <img class="mod-hero__img" src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || headline)}" />
  <div class="mod-hero__overlay"></div>
  <div class="mod-hero__content mod-hero__content--center">
    <h2 class="mod-cta__headline" data-editable="headline">${escapeHtml(headline)}</h2>
    <span class="mod-cta__button" data-editable="buttonText">${escapeHtml(buttonText)}</span>
    ${subText ? `<p class="mod-cta__subtext" data-editable="subText">${escapeHtml(subText)}</p>` : ''}
  </div>
</div>`;
    }

    // 이미지 없음 → mod-cta 액센트 배경
    return `<div class="mod-cta">
  <h2 class="mod-cta__headline" data-editable="headline">${escapeHtml(headline)}</h2>
  <span class="mod-cta__button" data-editable="buttonText">${escapeHtml(buttonText)}</span>
  ${subText ? `<p class="mod-cta__subtext" data-editable="subText">${escapeHtml(subText)}</p>` : ''}
</div>`;
  },
};

registerBlock('intro-cta', renderer);
export default renderer;
