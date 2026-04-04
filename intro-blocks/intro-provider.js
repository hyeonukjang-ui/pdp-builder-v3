// intro-blocks/intro-provider.js — 가이드 소개: 회사 이미지 + 가이드 리스트
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

function getInitial(name) {
  if (!name) return '?';
  return name.charAt(0);
}

function renderGuide(g, i) {
  const hasImg = g.image?.url;
  const avatar = hasImg
    ? `<img class="mod-guide__avatar" src="${escapeHtml(g.image.url)}" alt="${escapeHtml(g.image.alt || g.name)}" loading="lazy" />`
    : `<div class="mod-guide__avatar mod-guide__avatar--placeholder">${escapeHtml(getInitial(g.name))}</div>`;

  const badges = (g.badges || []).length
    ? `<div class="mod-badges" style="margin-top:6px">${g.badges.map(b => `<span class="mod-badges__item">${escapeHtml(b)}</span>`).join('')}</div>`
    : '';

  return `<div class="mod-guide__card">
  ${avatar}
  <div class="mod-guide__info">
    <h3 class="mod-guide__name" data-editable="guides.${i}.name">${escapeHtml(g.name)}</h3>
    <p class="mod-guide__role" data-editable="guides.${i}.role">${escapeHtml(g.role || '')}</p>
    ${g.experience ? `<span class="mod-guide__exp">${escapeHtml(g.experience)}</span>` : ''}
    ${badges}
    ${g.introduction ? `<p class="mod-guide__desc">${escapeHtml(g.introduction)}</p>` : ''}
  </div>
</div>`;
}

const renderer = {
  validate(data) {
    // 기존 단일(name/role) 또는 새 배열(guides) 모두 지원
    return !!(data && (data.guides?.length || data.name));
  },

  render(data, ctx) {
    const { companyImage } = data;

    // 회사 이미지: 있을 때만 노출
    const companyImgHtml = companyImage?.url
      ? `<div class="mod-guide__company-img"><img src="${escapeHtml(companyImage.url)}" alt="회사/업체" loading="lazy"></div>`
      : '';

    // guides 배열 또는 기존 단일 구조 호환
    let guides = data.guides;
    if (!guides || !guides.length) {
      guides = [{ name: data.name, role: data.role, experience: data.experience, badges: data.badges, introduction: data.introduction, image: data.image }];
    }

    const guidesHtml = guides.map((g, i) => renderGuide(g, i)).join('\n');

    return `<div class="mod-text">
  <h3 class="mod-text__title">가이드 소개</h3>
</div>
${companyImgHtml}
<div class="mod-guide">
  ${guidesHtml}
</div>`;
  },
};

registerBlock('intro-provider', renderer);
export default renderer;
