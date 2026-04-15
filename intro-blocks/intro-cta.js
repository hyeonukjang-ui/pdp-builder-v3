// intro-blocks/intro-cta.js — 상품 추천: 이미지 + 오버레이 CTA
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.title);
  },

  render(data, ctx) {
    const { title, desc, image, url } = data;
    const heading = title || '이런 상품은 어때요?';
    const hasImage = image?.url;

    // URL 보안: myrealtrip.com 도메인만 허용 + noopener,noreferrer
    const safeUrl = url && /^https?:\/\/([a-z0-9-]+\.)*myrealtrip\.com(\/|$)/i.test(url) ? url : '';

    return `<div class="mod-recommend-v2" ${safeUrl ? `onclick="window.open('${escapeHtml(safeUrl)}','_blank','noopener,noreferrer')"` : ''}>
  ${hasImage
    ? `<img class="mod-recommend-v2__img" src="${escapeHtml(image.url)}" alt="${escapeHtml(heading)}">`
    : `<div class="mod-recommend-v2__img mod-recommend-v2__placeholder"></div>`}
  <div class="mod-recommend-v2__overlay"></div>
  <div class="mod-recommend-v2__content">
    <h3 class="mod-recommend-v2__title" data-editable="title">${escapeHtml(heading)}</h3>
    ${desc ? `<p class="mod-recommend-v2__desc" data-editable="desc">${escapeHtml(desc)}</p>` : ''}
    <span class="mod-recommend-v2__btn">추천 상품 보러가기 →</span>
  </div>
</div>`;
  },
};

registerBlock('intro-cta', renderer);
export default renderer;
