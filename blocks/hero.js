// blocks/hero.js — 히어로 블록 (Hook)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-hero {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.pdp-hero__carousel {
  position: relative;
  aspect-ratio: 4 / 3;
}

.pdp-hero__track {
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}
.pdp-hero__track::-webkit-scrollbar {
  display: none;
}

.pdp-hero__slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
}

.pdp-hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pdp-hero__counter {
  position: absolute;
  bottom: 72px;
  right: 16px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
  z-index: 2;
  pointer-events: none;
}

.pdp-hero__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  z-index: 1;
}

.pdp-hero__badges {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.pdp-hero__badge {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-hero__title {
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 4px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-hero__subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  margin: 0 0 12px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-hero__meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.pdp-hero__rating {
  color: #fff;
  font-size: 14px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-hero__price {
  text-align: right;
}

.pdp-hero__price-original {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
  display: block;
}

.pdp-hero__price-current {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

.pdp-hero__price-unit {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
  margin-left: 2px;
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-hero-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-hero-styles';
  style.textContent = STYLES;
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function formatPrice(value) {
  if (value == null) return '';
  return Number(value).toLocaleString('ko-KR');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */
const renderer = {
  /* ---- validate -------------------------------------------------- */
  validate(data) {
    return !!(data && data.title && data.image?.url);
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    // 이미지 배열: 단일 image 또는 images 배열 지원
    const images = data.images?.length
      ? data.images
      : [data.image];
    const totalSlides = images.length;

    // 슬라이드 HTML
    const slidesHtml = images
      .map(
        (img) => `
      <div class="pdp-hero__slide">
        <img
          class="pdp-hero__image"
          src="${escapeHtml(img.url)}"
          alt="${escapeHtml(img.alt || data.title)}"
          loading="eager"
        >
      </div>`
      )
      .join('');

    // 카운터 (2장 이상일 때만)
    const counterHtml =
      totalSlides > 1
        ? `<span class="pdp-hero__counter">1 / ${totalSlides}</span>`
        : '';

    // 배지
    const badges = data.badges || [];
    const badgesHtml = badges.length
      ? `<div class="pdp-hero__badges">${badges
          .map((b) => `<span class="pdp-hero__badge">${escapeHtml(typeof b === 'string' ? b : b.label)}</span>`)
          .join('')}</div>`
      : '';

    // 부제목
    const subtitleHtml = data.subtitle
      ? `<p class="pdp-hero__subtitle">${escapeHtml(data.subtitle)}</p>`
      : '';

    // 별점
    const ratingHtml =
      data.rating?.score != null
        ? `<div class="pdp-hero__rating">\u2605 ${data.rating.score}${data.rating.count != null ? ` (${data.rating.count})` : ''}</div>`
        : '';

    // 가격
    let priceHtml = '';
    if (data.price?.current != null) {
      const originalHtml =
        data.price.original != null
          ? `<span class="pdp-hero__price-original">${formatPrice(data.price.original)}\uc6d0</span>`
          : '';
      const unitHtml = data.price.unit
        ? `<span class="pdp-hero__price-unit">/ ${escapeHtml(data.price.unit)}</span>`
        : '';
      priceHtml = `
        <div class="pdp-hero__price">
          ${originalHtml}
          <span class="pdp-hero__price-current">${formatPrice(data.price.current)}\uc6d0</span>
          ${unitHtml}
        </div>`;
    }

    return `
<section class="pdp-hero">
  <div class="pdp-hero__carousel">
    <div class="pdp-hero__track">
      ${slidesHtml}
    </div>
    ${counterHtml}
  </div>
  <div class="pdp-hero__overlay">
    ${badgesHtml}
    <h1 class="pdp-hero__title">${escapeHtml(data.title)}</h1>
    ${subtitleHtml}
    <div class="pdp-hero__meta">
      ${ratingHtml}
      ${priceHtml}
    </div>
  </div>
</section>`;
  },

  /* ---- mount ----------------------------------------------------- */
  mount() {
    const track = document.querySelector('.pdp-hero__track');
    const counter = document.querySelector('.pdp-hero__counter');
    if (!track || !counter) return;

    const slides = track.querySelectorAll('.pdp-hero__slide');
    if (slides.length <= 1) return;

    const total = slides.length;

    const updateCounter = () => {
      const slideWidth = track.clientWidth;
      if (slideWidth === 0) return;
      const index = Math.round(track.scrollLeft / slideWidth) + 1;
      counter.textContent = `${index} / ${total}`;
    };

    track.addEventListener('scroll', updateCounter, { passive: true });
    this._cleanup = () => {
      track.removeEventListener('scroll', updateCounter);
    };
  },

  /* ---- unmount --------------------------------------------------- */
  unmount() {
    if (this._cleanup) {
      this._cleanup();
      this._cleanup = null;
    }
  },
};

registerBlock('hero', renderer);
export default renderer;
