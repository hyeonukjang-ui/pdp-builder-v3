// intro-blocks/intro-provider.js — 가이드 소개: 프로필 심볼 + 이름/역할/소개글
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

    // 심볼 이미지 (원형 48px)
    const avatarHtml = hasImage
      ? `<img class="mod-guide__avatar" src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || name)}" loading="lazy" />`
      : `<div class="mod-guide__avatar mod-guide__avatar--placeholder">${escapeHtml(initial)}</div>`;

    // 경력
    const experienceHtml = experience
      ? `<span class="mod-guide__exp">${escapeHtml(experience)}</span>`
      : '';

    // 배지
    const badgeList = badges || [];
    const badgesHtml = badgeList.length
      ? `<div class="mod-badges" style="margin-top:8px">${badgeList
          .map((b) => `<span class="mod-badges__item">${escapeHtml(b)}</span>`)
          .join('')}</div>`
      : '';

    // 소개글
    const introHtml = introduction
      ? `<p class="mod-guide__desc">${escapeHtml(introduction)}</p>`
      : '';

    return `<div class="mod-text">
  <h3 class="mod-text__title">가이드 소개</h3>
</div>
<div class="mod-guide">
  ${avatarHtml}
  <div class="mod-guide__info">
    <div class="mod-guide__header">
      <h3 class="mod-guide__name" data-editable="name">${escapeHtml(name)}</h3>
      <p class="mod-guide__role" data-editable="role">${escapeHtml(role)}</p>
      ${experienceHtml}
    </div>
    ${badgesHtml}
    ${introHtml}
  </div>
</div>`;
  },
};

registerBlock('intro-provider', renderer);
export default renderer;
