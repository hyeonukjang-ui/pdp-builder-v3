// blocks/guideProfile.js — 가이드 소개 (Convince)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-guide {
  padding: var(--pdp-content-padding, 20px);
}

.pdp-guide__header {
  display: flex;
  gap: 16px;
  align-items: center;
}

.pdp-guide__avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #E5E7EB;
}

.pdp-guide__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pdp-guide__initial {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #2B96ED;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-guide__info {
  flex: 1;
  min-width: 0;
}

.pdp-guide__name {
  font-size: 18px;
  font-weight: 700;
  color: #1D2229;
  margin: 0 0 4px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-guide__experience {
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 2px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-guide__languages {
  font-size: 13px;
  color: #6B7280;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-guide__certifications {
  margin-top: 12px;
}

.pdp-guide__cert {
  display: inline-block;
  padding: 4px 10px;
  background: #F0F9FF;
  color: #2B96ED;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 6px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-guide__intro {
  font-size: 15px;
  line-height: 1.6;
  color: #1D2229;
  margin: 12px 0 0;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-guide-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-guide-styles';
  style.textContent = STYLES;
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getInitial(name) {
  if (!name) return '?';
  return name.charAt(0);
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */
const renderer = {
  /* ---- validate -------------------------------------------------- */
  validate(data) {
    return !!(data && data.name);
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const name = data.name;
    const initial = getInitial(name);

    // 아바타: photo가 있으면 이미지 + 이니셜 폴백, 없으면 이니셜만
    const photoUrl = typeof data.photo === 'string' ? data.photo : data.photo?.url;
    let avatarHtml;
    if (photoUrl) {
      avatarHtml = `
      <img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div class="pdp-guide__initial" style="display:none;">${escapeHtml(initial)}</div>`;
    } else {
      avatarHtml = `
      <div class="pdp-guide__initial">${escapeHtml(initial)}</div>`;
    }

    // 경력
    const experienceHtml = data.experience
      ? `<p class="pdp-guide__experience">${escapeHtml(data.experience)}</p>`
      : '';

    // 사용 언어
    const languages = data.languages || [];
    const languagesHtml = languages.length
      ? `<div class="pdp-guide__languages">${escapeHtml(languages.join(' \u00b7 '))}</div>`
      : '';

    // 인증/배지
    const certifications = data.certifications || [];
    const certsHtml = certifications.length
      ? `<div class="pdp-guide__certifications">${certifications
          .map((c) => `<span class="pdp-guide__cert">${escapeHtml(typeof c === 'string' ? c : c.label)}</span>`)
          .join('')}</div>`
      : '';

    // 소개글
    const introHtml = data.intro
      ? `<p class="pdp-guide__intro">${escapeHtml(data.intro)}</p>`
      : '';

    return `
<section class="pdp-section pdp-guide">
  <div class="pdp-guide__header">
    <div class="pdp-guide__avatar">
      ${avatarHtml}
    </div>
    <div class="pdp-guide__info">
      <h2 class="pdp-guide__name">${escapeHtml(name)}</h2>
      ${experienceHtml}
      ${languagesHtml}
    </div>
  </div>
  ${certsHtml}
  ${introHtml}
</section>`;
  },
};

registerBlock('guideProfile', renderer);
export default renderer;
