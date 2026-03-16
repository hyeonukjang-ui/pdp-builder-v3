// intro-blocks/intro-howto.js — 이용방법 스텝 블록
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.title && data.steps?.length);
  },

  render(data, ctx) {
    const { title, steps } = data;

    const stepsHtml = steps.map(s => {
      const indicator = s.icon
        ? `<div class="mod-steps__icon">${s.icon}</div>`
        : `<div class="mod-steps__number">${Number(s.step)}</div>`;

      return `<div class="mod-steps__item">
    ${indicator}
    <div class="mod-steps__content">
      <h4 class="mod-steps__title" data-editable="step-title">${escapeHtml(s.title)}</h4>
      ${s.description ? `<p class="mod-steps__desc" data-editable="step-desc">${escapeHtml(s.description)}</p>` : ''}
    </div>
  </div>`;
    }).join('\n');

    return `<section class="mod-text">
  <h2 class="mod-text__title" data-editable="title">${escapeHtml(title)}</h2>
</section>
<div class="mod-steps">
  ${stepsHtml}
</div>`;
  },
};

registerBlock('intro-howto', renderer);
export default renderer;
