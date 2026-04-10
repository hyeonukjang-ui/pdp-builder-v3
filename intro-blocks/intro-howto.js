// intro-blocks/intro-howto.js — 이용방법 스텝 블록 + 선택적 이미지
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.title && data.steps?.length);
  },

  render(data, ctx) {
    const { title, steps, image } = data;

    const stepsHtml = steps.map(s => {
      // Always use number circle, no emoji icons
      const indicator = `<div class="mod-steps__number">${Number(s.step)}</div>`;

      return `<div class="mod-steps__item">
    ${indicator}
    <div class="mod-steps__content">
      <h4 class="mod-steps__title" data-editable="step-title">${escapeHtml(s.title)}</h4>
      ${s.description ? `<p class="mod-steps__desc" data-editable="step-desc">${escapeHtml(s.description)}</p>` : ''}
    </div>
  </div>`;
    }).join('\n');

    const imageHtml = image?.url
      ? `<div class="mod-text__img-wrap" style="margin:0 20px 24px"><img class="mod-text__img" src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || title)}" loading="lazy"></div>`
      : '';

    return `<section class="mod-text">
  <h2 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h2>
</section>
<div class="mod-steps">
  ${stepsHtml}
</div>
${imageHtml}`;
  },
};

registerBlock('intro-howto', renderer);
export default renderer;
