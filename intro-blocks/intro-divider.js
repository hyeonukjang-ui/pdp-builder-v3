// intro-blocks/intro-divider.js — Section divider: 구분선 또는 여백
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!data;
  },

  render(data, ctx) {
    const dividerStyle = data.style === 'line' ? 'mod-divider--line' : 'mod-divider--space';

    return `<div class="${dividerStyle}"></div>`;
  },
};

registerBlock('intro-divider', renderer);
export default renderer;
