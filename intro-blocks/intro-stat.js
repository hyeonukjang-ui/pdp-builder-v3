// intro-blocks/intro-stat.js — 핵심 수치 + 프로필 변형 (가이드/파트너 소개)
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.items?.length >= 1);
  },

  render(data, ctx) {
    const { items, background, profile } = data;
    const bgClass = background === 'gray' ? 'mod-stat-row--gray' : '';

    // ── 프로필 섹션 (가이드/파트너 소개)
    let profileHtml = '';
    if (profile) {
      const { title, image, name, bio } = profile;
      const imgHtml = image?.url
        ? `<img class="mod-profile__img" src="${escapeHtml(image.url)}" alt="${escapeHtml(name || '')}" loading="lazy" />`
        : `<div class="mod-profile__img mod-profile__img--placeholder">👤</div>`;

      profileHtml = `<div class="mod-profile">
  ${title ? `<p class="mod-profile__label">${escapeHtml(title)}</p>` : ''}
  <div class="mod-profile__card">
    ${imgHtml}
    <div class="mod-profile__info">
      <h4 class="mod-profile__name" data-editable="profile.name">${escapeHtml(name || '')}</h4>
      ${bio ? `<p class="mod-profile__bio" data-editable="profile.bio">${escapeHtml(bio)}</p>` : ''}
    </div>
  </div>
</div>`;
    }

    // ── 수치 그리드
    const itemsHtml = items.map((item, i) => {
      const highlightClass = item.highlight ? ' mod-stat-row__value--highlight' : '';
      return `<div class="mod-stat-row__item">
    <div class="mod-stat-row__value${highlightClass}" data-editable="items.${i}.value">${escapeHtml(item.value)}${item.unit ? `<span class="mod-stat-row__unit">${escapeHtml(item.unit)}</span>` : ''}</div>
    <div class="mod-stat-row__label" data-editable="items.${i}.label">${escapeHtml(item.label)}</div>
  </div>`;
    }).join('\n  ');

    return `${profileHtml}<div class="mod-stat-row ${bgClass}">
  ${itemsHtml}
</div>`;
  },
};

registerBlock('intro-stat', renderer);
export default renderer;
