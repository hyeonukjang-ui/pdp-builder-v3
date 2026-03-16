// intro-blocks/intro-accommodation.js — 숙소 소개 블록 (#17 레이아웃: 등급+이름+영문명+하이라이트+메타+1+4 이미지)
import { registerBlock } from '../engine/block-registry.js';
import { escapeHtml } from './utils.js';

const renderer = {
  validate(data) {
    return !!(data && data.name);
  },

  render(data, ctx) {
    const {
      name, nameEn, grade, highlights, meta, images,
      // legacy fields
      image, starRating, location, amenities,
    } = data;

    // ── 등급 뱃지
    const gradeHtml = grade
      ? `<span class="mod-hotel__grade">${escapeHtml(grade)}</span>`
      : (starRating != null ? `<span class="mod-hotel__grade">${'⭐'.repeat(Math.min(5, Math.round(Number(starRating) || 0)))}</span>` : '');

    // ── 영문명
    const nameEnHtml = nameEn
      ? `<p class="mod-hotel__name-en">${escapeHtml(nameEn)}</p>`
      : '';

    // ── 하이라이트 (아이콘+텍스트 리스트)
    const hlItems = highlights || [];
    const hlHtml = hlItems.length
      ? `<ul class="mod-hotel__highlights">${hlItems.map(h =>
          `<li class="mod-hotel__hl-item">${h.icon ? `<span class="mod-hotel__hl-icon">${escapeHtml(h.icon)}</span>` : ''}<span>${escapeHtml(h.text)}</span></li>`
        ).join('')}</ul>`
      : '';

    // ── 메타 행 (아이콘+텍스트 가로 나열) — fallback to location
    const metaItems = meta || [];
    let metaHtml = '';
    if (metaItems.length) {
      metaHtml = `<div class="mod-hotel__meta">${metaItems.map(m =>
        `<span class="mod-hotel__meta-item">${m.icon ? `<span class="mod-hotel__meta-icon">${escapeHtml(m.icon)}</span>` : ''}${escapeHtml(m.text)}</span>`
      ).join('')}</div>`;
    } else if (location) {
      metaHtml = `<div class="mod-hotel__meta"><span class="mod-hotel__meta-item"><span class="mod-hotel__meta-icon">📍</span>${escapeHtml(location)}</span></div>`;
    }

    // ── 이미지 그리드 (1+4 레이아웃)
    const imgs = images || (image?.url ? [image] : []);
    let imageGridHtml = '';
    if (imgs.length >= 5) {
      imageGridHtml = `<div class="mod-hotel__gallery">
  <div class="mod-hotel__gallery-main"><img src="${escapeHtml(imgs[0].url || imgs[0])}" alt="${escapeHtml(name)}" class="mod-hotel__img" loading="lazy" /></div>
  <div class="mod-hotel__gallery-sub">
    ${imgs.slice(1, 5).map(img => `<div class="mod-hotel__gallery-thumb"><img src="${escapeHtml(img.url || img)}" alt="" class="mod-hotel__img" loading="lazy" /></div>`).join('\n    ')}
  </div>
</div>`;
    } else if (imgs.length > 0) {
      imageGridHtml = `<div class="mod-hotel__gallery">
  <div class="mod-hotel__gallery-main"><img src="${escapeHtml(imgs[0].url || imgs[0])}" alt="${escapeHtml(name)}" class="mod-hotel__img" loading="lazy" /></div>
  ${imgs.length > 1 ? `<div class="mod-hotel__gallery-sub">${imgs.slice(1, 5).map(img => `<div class="mod-hotel__gallery-thumb"><img src="${escapeHtml(img.url || img)}" alt="" class="mod-hotel__img" loading="lazy" /></div>`).join('\n    ')}</div>` : ''}
</div>`;
    } else {
      imageGridHtml = `<div class="mod-hotel__gallery"><div class="mod-hotel__gallery-main"><div class="mod-hotel__placeholder">🏨 숙소 이미지를 추가해주세요</div></div></div>`;
    }

    // ── 어메니티 뱃지 (legacy fallback)
    const amenityList = amenities || [];
    const amenitiesHtml = amenityList.length
      ? `<div class="mod-badges" style="padding: 0 20px 20px;">${amenityList.map(a => `<span class="mod-badges__item">${escapeHtml(a)}</span>`).join('')}</div>`
      : '';

    return `<div class="mod-hotel">
  ${imageGridHtml}
  <div class="mod-hotel__body">
    ${gradeHtml}
    <h3 class="mod-hotel__name" data-editable="name">${escapeHtml(name)}</h3>
    ${nameEnHtml}
    ${hlHtml}
    ${metaHtml}
  </div>
</div>${amenitiesHtml}`;
  },
};

registerBlock('intro-accommodation', renderer);
export default renderer;
