// blocks/imageGrid.js — 이미지 그리드/캐러셀 블록 (Convince)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-image-grid__carousel {
  overflow: hidden;
  position: relative;
}

.pdp-image-grid__track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.pdp-image-grid__track::-webkit-scrollbar {
  display: none;
}

.pdp-image-grid__slide {
  flex: 0 0 85%;
  scroll-snap-align: start;
  margin-right: 8px;
  border-radius: var(--pdp-radius-md, 12px);
  overflow: hidden;
}

.pdp-image-grid__slide img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.pdp-image-grid__caption {
  font-size: 13px;
  color: var(--pdp-text-secondary, #6B7280);
  padding: 8px 0;
  margin: 0;
}

.pdp-image-grid__dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 12px 0;
}

.pdp-image-grid__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #D1D5DB;
  transition: background 200ms;
}

.pdp-image-grid__dot--active {
  background: var(--pdp-primary, #2B96ED);
}

/* Grid 모드 */
.pdp-image-grid__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.pdp-image-grid__grid-item {
  border-radius: var(--pdp-radius-md, 12px);
  overflow: hidden;
}

.pdp-image-grid__grid-item img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.pdp-image-grid__grid-caption {
  font-size: 13px;
  color: var(--pdp-text-secondary, #6B7280);
  padding: 6px 0;
  margin: 0;
}

/* 모바일: grid → carousel 전환 */
@media (max-width: 640px) {
  .pdp-image-grid__grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 0;
  }
  .pdp-image-grid__grid::-webkit-scrollbar {
    display: none;
  }
  .pdp-image-grid__grid-item {
    flex: 0 0 85%;
    scroll-snap-align: start;
    margin-right: 8px;
  }
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-imageGrid-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-imageGrid-styles';
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

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */
const renderer = {
  _cleanup: null,

  /* ---- validate -------------------------------------------------- */
  validate(data) {
    return !!(data && data.images?.length >= 1);
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const images = data.images || [];
    const layout = data.layout || 'carousel';
    const title = data.title || '상품 이미지';

    if (layout === 'grid') {
      return this._renderGrid(images, title);
    }
    return this._renderCarousel(images, title);
  },

  /* ---- carousel 렌더링 ------------------------------------------- */
  _renderCarousel(images, title) {
    const slidesHtml = images.map((img) => {
      const captionHtml = img.caption
        ? `<p class="pdp-image-grid__caption">${escapeHtml(img.caption)}</p>`
        : '';
      return `
        <div class="pdp-image-grid__slide">
          <img
            src="${escapeHtml(img.url)}"
            alt="${escapeHtml(img.alt || '')}"
            loading="lazy"
            onerror="this.src='/placeholder.jpg'"
          >
          ${captionHtml}
        </div>`;
    }).join('');

    const dotsHtml = images.length > 1
      ? `
      <div class="pdp-image-grid__dots">
        ${images.map((_, i) =>
          `<span class="pdp-image-grid__dot${i === 0 ? ' pdp-image-grid__dot--active' : ''}" data-index="${i}"></span>`
        ).join('')}
      </div>`
      : '';

    return `
<section class="pdp-section pdp-image-grid">
  <h2 class="pdp-section__title">${escapeHtml(title)}</h2>
  <div class="pdp-image-grid__carousel">
    <div class="pdp-image-grid__track">
      ${slidesHtml}
    </div>
    ${dotsHtml}
  </div>
</section>`;
  },

  /* ---- grid 렌더링 ----------------------------------------------- */
  _renderGrid(images, title) {
    const itemsHtml = images.map((img) => {
      const captionHtml = img.caption
        ? `<p class="pdp-image-grid__grid-caption">${escapeHtml(img.caption)}</p>`
        : '';
      return `
        <div class="pdp-image-grid__grid-item">
          <img
            src="${escapeHtml(img.url)}"
            alt="${escapeHtml(img.alt || '')}"
            loading="lazy"
            onerror="this.src='/placeholder.jpg'"
          >
          ${captionHtml}
        </div>`;
    }).join('');

    return `
<section class="pdp-section pdp-image-grid">
  <h2 class="pdp-section__title">${escapeHtml(title)}</h2>
  <div class="pdp-image-grid__grid">
    ${itemsHtml}
  </div>
</section>`;
  },

  /* ---- mount ----------------------------------------------------- */
  mount(data) {
    const track = document.querySelector('.pdp-image-grid__track');
    const dotsContainer = document.querySelector('.pdp-image-grid__dots');
    if (!track || !dotsContainer) return;

    const dots = dotsContainer.querySelectorAll('.pdp-image-grid__dot');
    const slides = track.querySelectorAll('.pdp-image-grid__slide');
    if (slides.length <= 1) return;

    const updateDots = () => {
      const slideWidth = slides[0]?.offsetWidth || 1;
      const gap = 8;
      const index = Math.round(track.scrollLeft / (slideWidth + gap));
      dots.forEach((dot, i) => {
        dot.classList.toggle('pdp-image-grid__dot--active', i === index);
      });
    };

    track.addEventListener('scroll', updateDots, { passive: true });
    this._cleanup = () => {
      track.removeEventListener('scroll', updateDots);
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

registerBlock('imageGrid', renderer);
export default renderer;
