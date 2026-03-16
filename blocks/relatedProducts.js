// blocks/relatedProducts.js — 관련 상품 (Convert)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-related {
  padding: var(--pdp-section-gap, 32px) 0;
}

.pdp-related > .pdp-section__title {
  padding: 0 var(--pdp-content-padding, 20px);
}

.pdp-related__scroll {
  overflow: hidden;
}

.pdp-related__track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 var(--pdp-content-padding, 20px);
  scroll-snap-type: x mandatory;
}
.pdp-related__track::-webkit-scrollbar {
  display: none;
}

/* 카드 */
.pdp-related__card {
  flex: 0 0 calc(50% - 6px);
  scroll-snap-align: start;
  text-decoration: none;
  color: inherit;
  min-width: 0;
  border-radius: var(--pdp-radius-md, 12px);
  overflow: hidden;
  border: 1px solid var(--pdp-border, #E5E7EB);
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.pdp-related__card:hover {
  transform: translateY(-2px);
  box-shadow: var(--pdp-shadow-md, 0 4px 12px rgba(0,0,0,0.1));
}
.pdp-related__card:active {
  transform: scale(0.98);
}

/* 이미지 */
.pdp-related__img-wrap {
  position: relative;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: #F3F4F6;
}
.pdp-related__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pdp-related__card-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: var(--pdp-primary, #2B96ED);
  padding: 2px 8px;
  border-radius: 100px;
}

/* 카드 본문 */
.pdp-related__card-body {
  padding: 10px 12px 12px;
}
.pdp-related__card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--pdp-text, #1D2229);
  line-height: 1.4;
  margin: 0 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-related__card-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--pdp-text-secondary, #6B7280);
  margin-bottom: 6px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-related__card-stars {
  color: #F59E0B;
}
.pdp-related__card-review-count {
  opacity: 0.7;
}
.pdp-related__card-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.pdp-related__card-original {
  font-size: 12px;
  color: var(--pdp-text-secondary, #6B7280);
  text-decoration: line-through;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-related__card-current {
  font-size: 16px;
  font-weight: 700;
  color: var(--pdp-text, #1D2229);
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

/* 반응형 */
@media (min-width: 769px) {
  .pdp-related__card {
    flex: 0 0 calc(33.33% - 8px);
  }
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-relatedProducts-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-relatedProducts-styles';
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

function formatPrice(value) {
  if (value == null) return '';
  return Number(value).toLocaleString('ko-KR');
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */
const renderer = {
  /* ---- validate -------------------------------------------------- */
  validate(data) {
    return !!(data && data.products?.length >= 1);
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const title = data.title || '함께 많이 본 상품';
    const products = (data.products || []).slice(0, 6);

    const cardsHtml = products
      .map((product) => {
        const imageUrl = typeof product.image === 'string' ? product.image : product.image?.url;
        const imageAlt = typeof product.image === 'string' ? product.title : (product.image?.alt || product.title);
        const url = product.url || '#';

        // 이미지
        const imgHtml = imageUrl
          ? `<img class="pdp-related__img" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(imageAlt)}" loading="lazy">`
          : '';

        // 배지
        const badges = product.badges || [];
        const badgeHtml = badges.length
          ? `<span class="pdp-related__card-badge">${escapeHtml(typeof badges[0] === 'string' ? badges[0] : badges[0].label)}</span>`
          : '';

        // 별점
        const rating = product.rating;
        let ratingHtml = '';
        if (rating?.score != null) {
          const countHtml = rating.count != null
            ? `<span class="pdp-related__card-review-count">(${rating.count})</span>`
            : '';
          ratingHtml = `
          <div class="pdp-related__card-rating">
            <span class="pdp-related__card-stars" aria-hidden="true">\u2605</span>
            <span>${rating.score}</span>
            ${countHtml}
          </div>`;
        }

        // 가격
        const priceAmount = typeof product.price === 'number' ? product.price : product.price?.amount;
        const currency = (typeof product.price === 'object' ? product.price?.currency : null) || '\u20A9';
        const originalPrice = product.originalPrice;

        const originalHtml = originalPrice != null
          ? `<span class="pdp-related__card-original">${currency}${formatPrice(originalPrice)}</span>`
          : '';
        const currentHtml = priceAmount != null
          ? `<span class="pdp-related__card-current">${currency}${formatPrice(priceAmount)}</span>`
          : '';
        const priceHtml = priceAmount != null
          ? `<div class="pdp-related__card-price">${originalHtml}${currentHtml}</div>`
          : '';

        return `
        <a class="pdp-related__card" href="${escapeHtml(url)}">
          <div class="pdp-related__img-wrap">
            ${imgHtml}
            ${badgeHtml}
          </div>
          <div class="pdp-related__card-body">
            <h3 class="pdp-related__card-title">${escapeHtml(product.title)}</h3>
            ${ratingHtml}
            ${priceHtml}
          </div>
        </a>`;
      })
      .join('');

    return `
<section class="pdp-section pdp-related" aria-label="관련 상품">
  <h2 class="pdp-section__title">${escapeHtml(title)}</h2>
  <div class="pdp-related__scroll">
    <div class="pdp-related__track">
      ${cardsHtml}
    </div>
  </div>
</section>`;
  },
};

registerBlock('relatedProducts', renderer);
export default renderer;
