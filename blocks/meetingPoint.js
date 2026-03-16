// blocks/meetingPoint.js — 집합/픽업 장소 (Reassure)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-meeting {
  padding: var(--pdp-section-gap, 32px) var(--pdp-content-padding, 20px);
}

/* 지도 영역 */
.pdp-meeting__map {
  position: relative;
  border-radius: var(--pdp-radius-md, 12px);
  overflow: hidden;
  margin-bottom: 16px;
}
.pdp-meeting__map-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
  background: #F3F4F6;
}
.pdp-meeting__map-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--pdp-primary, #2B96ED);
  background: #fff;
  border: 1px solid var(--pdp-border, #E5E7EB);
  border-radius: var(--pdp-radius-sm, 8px);
  cursor: pointer;
  box-shadow: var(--pdp-shadow-sm, 0 1px 3px rgba(0,0,0,0.08));
  transition: background 200ms cubic-bezier(0.4, 0, 0.2, 1);
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-meeting__map-btn:hover {
  background: var(--pdp-primary-light, #F0F9FF);
}

/* 주소 + 교통편 */
.pdp-meeting__details {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.pdp-meeting__address,
.pdp-meeting__tips-section {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.pdp-meeting__icon {
  flex-shrink: 0;
  color: var(--pdp-primary, #2B96ED);
  margin-top: 2px;
}
.pdp-meeting__place {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--pdp-text, #1D2229);
  margin-bottom: 2px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-meeting__addr {
  font-size: 13px;
  color: var(--pdp-text-secondary, #6B7280);
  line-height: 1.4;
  margin: 0;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-meeting__desc {
  font-size: 13px;
  color: var(--pdp-text-secondary, #6B7280);
  line-height: 1.55;
  margin: 4px 0 0;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

/* 주소 복사 버튼 */
.pdp-meeting__copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--pdp-primary, #2B96ED);
  background: var(--pdp-primary-light, #F0F9FF);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 200ms;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-meeting__copy-btn:hover {
  background: #E0F2FE;
}
.pdp-meeting__copy-btn--done {
  color: var(--pdp-success, #059669);
  background: #ECFDF5;
}

/* 팁 리스트 */
.pdp-meeting__tips-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--pdp-text, #1D2229);
  margin-bottom: 6px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-meeting__tips {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pdp-meeting__tip {
  font-size: 13px;
  color: var(--pdp-text-secondary, #6B7280);
  line-height: 1.55;
  padding-left: 14px;
  position: relative;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-meeting__tip::before {
  content: '\u2022';
  position: absolute;
  left: 0;
  color: var(--pdp-primary, #2B96ED);
}

/* 전자 티켓 안내 */
.pdp-meeting__eticket {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--pdp-primary-light, #F0F9FF);
  border-radius: var(--pdp-radius-sm, 8px);
}
.pdp-meeting__eticket-icon {
  font-size: 24px;
  flex-shrink: 0;
}
.pdp-meeting__eticket-text {
  font-size: 14px;
  color: var(--pdp-text, #1D2229);
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-meetingPoint-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-meetingPoint-styles';
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

const PIN_SVG = `<svg class="pdp-meeting__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z" fill="currentColor"/></svg>`;
const LIGHTBULB_SVG = `<svg class="pdp-meeting__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a5 5 0 00-2 9.58V12a1 1 0 001 1h2a1 1 0 001-1v-1.42A5 5 0 008 1zM6.5 14h3a.5.5 0 010 1h-3a.5.5 0 010-1z" fill="currentColor"/></svg>`;
const COPY_SVG = `<svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M3 11V3a2 2 0 012-2h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const EXTERNAL_SVG = `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-3M9 2h5v5M15 1L7 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */
const renderer = {
  /* ---- validate -------------------------------------------------- */
  validate(data) {
    return !!(data && data.address);
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const type = data.type || 'meeting';

    // type="e_ticket" → 전자 티켓 안내
    if (type === 'e_ticket') {
      const title = data.title || '전자 티켓으로 입장';
      return `
<section class="pdp-section pdp-meeting" aria-label="${escapeHtml(title)}">
  <h2 class="pdp-section__title">${escapeHtml(title)}</h2>
  <div class="pdp-meeting__eticket">
    <span class="pdp-meeting__eticket-icon" aria-hidden="true">\uD83C\uDFAB</span>
    <span class="pdp-meeting__eticket-text">예약 확정 후 전자 티켓(QR코드)이 발송됩니다. 현장에서 QR코드를 제시하면 바로 입장할 수 있어요.</span>
  </div>
</section>`;
    }

    // 일반: meeting / pickup
    const titleMap = { meeting: '집합 장소', pickup: '픽업 장소' };
    const title = data.title || titleMap[type] || '집합 장소';
    const address = data.address;
    const placeName = data.placeName || data.description || '';
    const description = data.description || '';
    const coordinates = data.coordinates;
    const mapImageUrl = data.mapImageUrl || data.mapImage?.url || '';
    const tips = data.tips || [];

    // 지도 영역
    let mapHtml = '';
    if (mapImageUrl || coordinates) {
      const mapSrc = mapImageUrl || '';
      const mapAlt = placeName
        ? `${title} 지도: ${placeName}`
        : `${title} 지도`;

      const dataAttrs = coordinates
        ? ` data-lat="${coordinates.lat}" data-lng="${coordinates.lng}"`
        : '';

      mapHtml = `
    <div class="pdp-meeting__map"${dataAttrs}>
      ${mapSrc ? `<img class="pdp-meeting__map-img" src="${escapeHtml(mapSrc)}" alt="${escapeHtml(mapAlt)}" loading="lazy">` : `<div class="pdp-meeting__map-img" style="display:flex;align-items:center;justify-content:center;color:#9CA3AF;font-size:13px;">지도 이미지를 불러올 수 없습니다</div>`}
      ${coordinates ? `<button class="pdp-meeting__map-btn" aria-label="구글 지도에서 ${escapeHtml(title)} 보기">${EXTERNAL_SVG} 지도에서 보기</button>` : ''}
    </div>`;
    }

    // 주소 영역
    const placeNameHtml = placeName && placeName !== description
      ? `<strong class="pdp-meeting__place">${escapeHtml(placeName)}</strong>`
      : '';
    const descHtml = description
      ? `<p class="pdp-meeting__desc">${escapeHtml(description)}</p>`
      : '';

    const addressHtml = `
    <div class="pdp-meeting__address">
      ${PIN_SVG}
      <div>
        ${placeNameHtml}
        <p class="pdp-meeting__addr">${escapeHtml(address)}</p>
        ${descHtml}
        <button class="pdp-meeting__copy-btn" data-address="${escapeHtml(address)}">
          ${COPY_SVG}
          <span class="pdp-meeting__copy-label">주소 복사</span>
        </button>
      </div>
    </div>`;

    // 팁 리스트
    let tipsHtml = '';
    if (tips.length > 0) {
      const tipsItemsHtml = tips
        .map((tip) => `<li class="pdp-meeting__tip">${escapeHtml(tip)}</li>`)
        .join('');
      tipsHtml = `
    <div class="pdp-meeting__tips-section">
      ${LIGHTBULB_SVG}
      <div>
        <strong class="pdp-meeting__tips-title">알아두면 좋은 팁</strong>
        <ul class="pdp-meeting__tips">
          ${tipsItemsHtml}
        </ul>
      </div>
    </div>`;
    }

    return `
<section class="pdp-section pdp-meeting" aria-label="${escapeHtml(title)}">
  <h2 class="pdp-section__title">${escapeHtml(title)}</h2>
  ${mapHtml}
  <div class="pdp-meeting__details">
    ${addressHtml}
    ${tipsHtml}
  </div>
</section>`;
  },

  /* ---- mount (이벤트 바인딩) -------------------------------------- */
  mount(el) {
    const container = el || document.querySelector('.pdp-meeting');
    if (!container) return;

    // 주소 복사 버튼
    const copyBtn = container.querySelector('.pdp-meeting__copy-btn');
    if (copyBtn) {
      const handleCopy = async () => {
        const address = copyBtn.dataset.address;
        if (!address) return;

        try {
          await navigator.clipboard.writeText(address);
          const label = copyBtn.querySelector('.pdp-meeting__copy-label');
          copyBtn.classList.add('pdp-meeting__copy-btn--done');
          if (label) label.textContent = '복사 완료!';

          setTimeout(() => {
            copyBtn.classList.remove('pdp-meeting__copy-btn--done');
            if (label) label.textContent = '주소 복사';
          }, 2000);
        } catch {
          // 폴백: input 선택 방식
          const input = document.createElement('input');
          input.value = address;
          input.style.position = 'fixed';
          input.style.opacity = '0';
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);

          const label = copyBtn.querySelector('.pdp-meeting__copy-label');
          if (label) label.textContent = '복사 완료!';
          setTimeout(() => {
            if (label) label.textContent = '주소 복사';
          }, 2000);
        }
      };

      copyBtn.addEventListener('click', handleCopy);
      this._cleanupCopy = () => copyBtn.removeEventListener('click', handleCopy);
    }

    // 지도에서 보기 버튼
    const mapBtn = container.querySelector('.pdp-meeting__map-btn');
    if (mapBtn) {
      const handleMap = () => {
        const mapArea = container.querySelector('.pdp-meeting__map');
        const lat = mapArea?.dataset.lat;
        const lng = mapArea?.dataset.lng;
        if (lat && lng) {
          const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
          const url = isMobile
            ? `https://maps.google.com/maps?q=${lat},${lng}`
            : `https://www.google.com/maps?q=${lat},${lng}`;
          window.open(url, '_blank', 'noopener');
        }
      };

      mapBtn.addEventListener('click', handleMap);
      this._cleanupMap = () => mapBtn.removeEventListener('click', handleMap);
    }
  },

  /* ---- unmount --------------------------------------------------- */
  unmount() {
    if (this._cleanupCopy) {
      this._cleanupCopy();
      this._cleanupCopy = null;
    }
    if (this._cleanupMap) {
      this._cleanupMap();
      this._cleanupMap = null;
    }
  },
};

registerBlock('meetingPoint', renderer);
export default renderer;
