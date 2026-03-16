// intro-blocks/intro-provider.js — 제공자 소개: 이름/역할/배지/소개글
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

function getInitial(name) {
  if (!name) return '?';
  return name.charAt(0);
}

const renderer = {
  validate(data) {
    return !!(data && data.name && data.role);
  },

  render(data, ctx) {
    const { image, name, role, experience, badges, introduction } = data;
    const initial = getInitial(name);
    const hasImage = image?.url;

    // 이미지 영역
    const imageHtml = hasImage
      ? `<div class="mod-media-card__image-wrap">
  <img class="mod-media-card__img" src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || name)}" loading="lazy" />
</div>`
      : `<div class="mod-media-card__image-wrap">
  <div class="mod-media-card__placeholder">${escapeHtml(initial)}</div>
</div>`;

    // 경력
    const experienceHtml = experience
      ? `<p class="mod-media-card__meta">${escapeHtml(experience)}</p>`
      : '';

    // 배지
    const badgeList = badges || [];
    const badgesHtml = badgeList.length
      ? `<div class="mod-badges">${badgeList
          .map((b) => `<span class="mod-badges__item">${escapeHtml(b)}</span>`)
          .join('')}</div>`
      : '';

    // 소개글
    const introHtml = introduction
      ? `<p class="mod-media-card__desc">${escapeHtml(introduction)}</p>`
      : '';

    return `<div class="mod-text">
  <h3 class="mod-text__title">제공자 소개</h3>
</div>
<div class="mod-media-card">
  ${imageHtml}
  <div class="mod-media-card__body">
    <h3 class="mod-media-card__name" data-editable="name">${escapeHtml(name)}</h3>
    <p class="mod-media-card__role" data-editable="role">${escapeHtml(role)}</p>
    ${experienceHtml}
    ${badgesHtml}
    ${introHtml}
  </div>
</div>`;
  },
};

registerBlock('intro-provider', renderer);
export default renderer;
