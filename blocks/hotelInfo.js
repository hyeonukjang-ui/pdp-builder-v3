// blocks/hotelInfo.js — 숙소 안내 (Convince)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-hotel {
  padding: var(--pdp-section-gap, 32px) var(--pdp-content-padding, 20px);
}

/* 호텔 카드 (복수 호텔 시 반복) */
.pdp-hotel__cards {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pdp-hotel__card {
  border: 1px solid var(--pdp-border, #E5E7EB);
  border-radius: var(--pdp-radius-md, 12px);
  overflow: hidden;
}

/* 캐러셀 */
.pdp-hotel__carousel {
  position: relative;
  overflow: hidden;
}
.pdp-hotel__track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.pdp-hotel__track::-webkit-scrollbar {
  display: none;
}
.pdp-hotel__slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
}
.pdp-hotel__img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  background: #F3F4F6;
}
.pdp-hotel__dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
}
.pdp-hotel__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 200ms;
}
.pdp-hotel__dot--active {
  background: #fff;
  width: 16px;
  border-radius: 3px;
}

/* 호텔 정보 */
.pdp-hotel__info {
  padding: 16px;
}
.pdp-hotel__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.pdp-hotel__name {
  font-size: 17px;
  font-weight: 700;
  color: var(--pdp-text, #1D2229);
  margin: 0;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-hotel__stars {
  color: #F59E0B;
  font-size: 14px;
  flex-shrink: 0;
}

/* 위치 */
.pdp-hotel__location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--pdp-text-secondary, #6B7280);
  margin-bottom: 12px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-hotel__location-icon {
  flex-shrink: 0;
  color: var(--pdp-primary, #2B96ED);
}

/* 편의시설 태그 */
.pdp-hotel__amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 0;
}
.pdp-hotel__amenity {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--pdp-text-secondary, #6B7280);
  padding: 4px 10px;
  background: #F3F4F6;
  border-radius: 100px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

/* 이미지 없을 때 (이름만 있는 카드) */
.pdp-hotel__card--simple {
  padding: 16px;
}
.pdp-hotel__card--simple .pdp-hotel__info {
  padding: 0;
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-hotelInfo-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-hotelInfo-styles';
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

const PIN_SVG = `<svg class="pdp-hotel__location-icon" aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z" fill="currentColor"/></svg>`;

function renderStars(count) {
  if (!count || count < 1) return '';
  const stars = '\u2605'.repeat(Math.min(count, 5));
  return `<div class="pdp-hotel__stars" aria-label="${count}\uC131\uAE09"><span aria-hidden="true">${stars}</span></div>`;
}

function renderHotelCard(hotel, hotelIndex) {
  const name = hotel.name;
  const stars = hotel.stars || hotel.starRating;
  const location = hotel.location || hotel.address || '';
  const amenities = hotel.amenities || [];
  const image = hotel.image;
  const images = hotel.images || (image ? [image] : []);

  // 이미지 캐러셀
  let carouselHtml = '';
  if (images.length > 0) {
    const slidesHtml = images
      .map((img) => {
        const url = typeof img === 'string' ? img : img.url;
        const alt = typeof img === 'string' ? `${name} 사진` : (img.alt || `${name} 사진`);
        return `
        <div class="pdp-hotel__slide">
          <img class="pdp-hotel__img" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy">
        </div>`;
      })
      .join('');

    // 도트 (2장 이상일 때만)
    let dotsHtml = '';
    if (images.length > 1) {
      const dots = images
        .map((_, i) =>
          `<button class="pdp-hotel__dot${i === 0 ? ' pdp-hotel__dot--active' : ''}" role="tab" aria-selected="${i === 0}" aria-label="${i + 1}번째 사진"></button>`
        )
        .join('');
      dotsHtml = `<div class="pdp-hotel__dots" role="tablist">${dots}</div>`;
    }

    carouselHtml = `
      <div class="pdp-hotel__carousel" data-hotel-index="${hotelIndex}" role="region" aria-roledescription="carousel" aria-label="${escapeHtml(name)} 사진">
        <div class="pdp-hotel__track">
          ${slidesHtml}
        </div>
        ${dotsHtml}
      </div>`;
  }

  // 위치
  const locationHtml = location
    ? `<div class="pdp-hotel__location">${PIN_SVG} ${escapeHtml(location)}</div>`
    : '';

  // 편의시설
  const amenitiesHtml = amenities.length
    ? `<div class="pdp-hotel__amenities" aria-label="편의시설">${amenities
        .map((a) => `<span class="pdp-hotel__amenity">${escapeHtml(a)}</span>`)
        .join('')}</div>`
    : '';

  const cardClass = images.length > 0 ? 'pdp-hotel__card' : 'pdp-hotel__card pdp-hotel__card--simple';

  return `
    <div class="${cardClass}">
      ${carouselHtml}
      <div class="pdp-hotel__info">
        <div class="pdp-hotel__name-row">
          <h3 class="pdp-hotel__name">${escapeHtml(name)}</h3>
          ${renderStars(stars)}
        </div>
        ${locationHtml}
        ${amenitiesHtml}
      </div>
    </div>`;
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */
const renderer = {
  /* ---- validate -------------------------------------------------- */
  validate(data) {
    if (!data) return false;
    // hotels 배열 방식
    if (data.hotels?.length >= 1) return true;
    // 단일 호텔 (name 직접 전달)
    return !!data.name;
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const title = data.title || '숙소 안내';

    // hotels 배열이 있으면 사용, 없으면 단일 호텔로 변환
    const hotels = data.hotels || [data];

    const cardsHtml = hotels
      .filter((h) => h && h.name)
      .map((hotel, i) => renderHotelCard(hotel, i))
      .join('');

    if (!cardsHtml) return '';

    return `
<section class="pdp-section pdp-hotel" aria-label="${escapeHtml(title)}">
  <h2 class="pdp-section__title">${escapeHtml(title)}</h2>
  <div class="pdp-hotel__cards">
    ${cardsHtml}
  </div>
</section>`;
  },

  /* ---- mount (캐러셀 도트 연동) ---------------------------------- */
  mount(el) {
    const container = el || document.querySelector('.pdp-hotel');
    if (!container) return;

    const carousels = container.querySelectorAll('.pdp-hotel__carousel');
    this._cleanups = [];

    carousels.forEach((carousel) => {
      const track = carousel.querySelector('.pdp-hotel__track');
      const dots = carousel.querySelectorAll('.pdp-hotel__dot');
      const slides = carousel.querySelectorAll('.pdp-hotel__slide');

      if (!track || dots.length <= 1 || slides.length <= 1) return;

      // 스크롤 → 도트 업데이트
      const handleScroll = () => {
        const slideWidth = track.clientWidth;
        if (slideWidth === 0) return;
        const currentIndex = Math.round(track.scrollLeft / slideWidth);

        dots.forEach((dot, i) => {
          dot.classList.toggle('pdp-hotel__dot--active', i === currentIndex);
          dot.setAttribute('aria-selected', String(i === currentIndex));
        });
      };

      track.addEventListener('scroll', handleScroll, { passive: true });

      // 도트 클릭 → 해당 슬라이드로 이동
      const dotHandlers = [];
      dots.forEach((dot, i) => {
        const handler = () => {
          slides[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        };
        dot.addEventListener('click', handler);
        dotHandlers.push(() => dot.removeEventListener('click', handler));
      });

      this._cleanups.push(() => {
        track.removeEventListener('scroll', handleScroll);
        dotHandlers.forEach((cleanup) => cleanup());
      });
    });
  },

  /* ---- unmount --------------------------------------------------- */
  unmount() {
    if (this._cleanups) {
      this._cleanups.forEach((cleanup) => cleanup());
      this._cleanups = null;
    }
  },
};

registerBlock('hotelInfo', renderer);
export default renderer;
