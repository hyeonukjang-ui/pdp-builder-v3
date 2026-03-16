// blocks/cta.js — CTA 고정바 (Convert)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
/* 하단 고정 */
.pdp-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.1);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  transform: translateY(100%);
  transition: transform 300ms ease;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}
.pdp-cta--visible {
  transform: translateY(0);
}

/* 프리뷰 모드: sticky로 동작 */
.pdp-preview .pdp-cta,
.pdp-cta--preview {
  position: sticky;
  bottom: 0;
  transform: none;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.1);
}

/* 소셜 프루프 (CTA 상단) */
.pdp-cta__social-proof {
  padding: 4px var(--pdp-content-padding, 20px);
  background: #FFFBEB;
  border-bottom: 1px solid #FDE68A;
  text-align: center;
}
.pdp-cta__social-text {
  font-size: 12px;
  color: var(--pdp-text-secondary, #6B7280);
}

/* 메인 바 */
.pdp-cta__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px var(--pdp-content-padding, 20px);
}

/* 가격 */
.pdp-cta__price-area {
  flex: 1;
  min-width: 0;
}
.pdp-cta__price-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 1px;
}
.pdp-cta__price-original {
  font-size: 12px;
  color: var(--pdp-text-secondary, #6B7280);
  text-decoration: line-through;
}
.pdp-cta__price-discount {
  font-size: 11px;
  font-weight: 700;
  color: var(--pdp-danger, #EF4444);
  background: #FEF2F2;
  padding: 1px 5px;
  border-radius: 4px;
}
.pdp-cta__price-main {
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.pdp-cta__price-current {
  font-size: 22px;
  font-weight: 800;
  color: var(--pdp-text, #1D2229);
  letter-spacing: -0.02em;
}
.pdp-cta__price-current small {
  font-size: 14px;
  font-weight: 600;
}
.pdp-cta__price-unit {
  font-size: 12px;
  color: var(--pdp-text-secondary, #6B7280);
  margin-left: 2px;
}

/* 버튼 */
.pdp-cta__button {
  flex-shrink: 0;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: var(--pdp-primary, #2B96ED);
  border: none;
  border-radius: var(--pdp-radius-sm, 8px);
  cursor: pointer;
  white-space: nowrap;
  min-height: 48px;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
  transition: background var(--pdp-transition, 200ms cubic-bezier(0.4, 0, 0.2, 1)), transform 100ms ease;
}
.pdp-cta__button:hover {
  background: var(--pdp-primary-dark, #1A7AD4);
}
.pdp-cta__button:active {
  transform: scale(0.97);
}
.pdp-cta__button:disabled {
  background: #D1D5DB;
  color: #9CA3AF;
  cursor: not-allowed;
}

/* 신뢰 텍스트 */
.pdp-cta__trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px var(--pdp-content-padding, 20px);
  border-top: 1px solid #F3F4F6;
}
.pdp-cta__trust svg {
  color: var(--pdp-success, #059669);
}
.pdp-cta__trust span {
  font-size: 12px;
  font-weight: 500;
  color: var(--pdp-success, #059669);
}

/* 데스크톱: 사이드바 CTA */
@media (min-width: 769px) {
  .pdp-cta {
    position: sticky;
    top: 80px;
    bottom: auto;
    width: 320px;
    border-radius: var(--pdp-radius-md, 12px);
    border: 1px solid var(--pdp-border, #E5E7EB);
    box-shadow: var(--pdp-shadow-md, 0 4px 12px rgba(0,0,0,0.1));
    transform: none;
    padding-bottom: 0;
  }
  .pdp-cta__bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .pdp-cta__button {
    width: 100%;
  }
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-cta-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-cta-styles';
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
    // 최소한 buttonText 또는 price.current가 있어야 함
    if (!data) return false;
    // price 객체 기반 (요청 스펙) 또는 priceDisplay 기반 (문서 스펙) 둘 다 지원
    const hasPrice = !!(data.price?.current || data.priceDisplay?.currentPrice);
    const hasButton = !!data.buttonText;
    return hasPrice || hasButton;
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    // 가격 데이터 정규화: price 객체 또는 priceDisplay 객체 지원
    let currentPrice, originalPrice, currency, unit, discountPercent;

    if (data.price) {
      currentPrice = data.price.current;
      originalPrice = data.price.original;
      currency = data.price.currency || '원';
      unit = data.price.unit || '';
    } else if (data.priceDisplay) {
      currentPrice = data.priceDisplay.currentPrice;
      originalPrice = data.priceDisplay.originalPrice;
      currency = data.priceDisplay.currency || '원';
      unit = data.priceDisplay.unit || '';
      discountPercent = data.priceDisplay.discountPercent;
    }

    // 할인율 자동 계산
    if (!discountPercent && originalPrice && currentPrice && originalPrice > currentPrice) {
      discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    const buttonText = escapeHtml(data.buttonText || '날짜 확인하기');
    const buttonUrl = data.buttonUrl || '#';
    const trustText = data.trustText;
    const urgencyText = data.urgencyText;

    // 소셜 프루프 영역
    const socialProofHtml = urgencyText
      ? `
  <div class="pdp-cta__social-proof" role="status" aria-live="polite">
    <span class="pdp-cta__social-text">${escapeHtml(urgencyText)}</span>
  </div>`
      : '';

    // 가격 영역
    let priceHtml = '';
    if (currentPrice) {
      // 할인 행 (원가 + 할인율)
      const discountRowHtml = originalPrice && discountPercent
        ? `
      <div class="pdp-cta__price-row">
        <span class="pdp-cta__price-original" aria-label="정가 ${formatPrice(originalPrice)}${currency}">${formatPrice(originalPrice)}${currency}</span>
        <span class="pdp-cta__price-discount" aria-label="${discountPercent}% 할인">${discountPercent}%</span>
      </div>`
        : '';

      // 단위 표시
      const unitHtml = unit
        ? `<span class="pdp-cta__price-unit">/ ${escapeHtml(unit)}</span>`
        : '';

      priceHtml = `
    <div class="pdp-cta__price-area">
      ${discountRowHtml}
      <div class="pdp-cta__price-main">
        <span class="pdp-cta__price-current" aria-label="할인가 ${formatPrice(currentPrice)}${currency}">${formatPrice(currentPrice)}<small>${escapeHtml(currency)}</small></span>
        ${unitHtml}
      </div>
    </div>`;
    }

    // 신뢰 텍스트 영역
    const trustHtml = trustText
      ? `
  <div class="pdp-cta__trust">
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
    <span>${escapeHtml(trustText)}</span>
  </div>`
      : '';

    return `
<div class="pdp-cta pdp-cta--visible pdp-cta--preview" role="complementary" aria-label="예약하기">
  ${socialProofHtml}
  <div class="pdp-cta__bar">
    ${priceHtml}
    <button class="pdp-cta__button" type="button"${data.buttonUrl ? ` data-url="${escapeHtml(buttonUrl)}"` : ''}>
      ${buttonText}
    </button>
  </div>
  ${trustHtml}
</div>`;
  },

  /* ---- mount ----------------------------------------------------- */
  mount(data) {
    if (typeof document === 'undefined') return;

    const container = document.querySelector('.pdp-cta');
    if (!container) return;

    const button = container.querySelector('.pdp-cta__button');

    // CTA 버튼 클릭 이벤트
    if (button) {
      button.addEventListener('click', () => {
        const url = button.dataset.url;
        if (url && url !== '#') {
          window.location.href = url;
        } else {
          document.dispatchEvent(new CustomEvent('pdp:cta-click', {
            detail: {
              action: button.textContent.trim(),
              price: container.querySelector('.pdp-cta__price-current')?.textContent,
            },
          }));
        }
      });
    }

    // 옵션 선택 이벤트 수신 -> 가격 업데이트
    document.addEventListener('pdp:option-selected', (e) => {
      const priceEl = container.querySelector('.pdp-cta__price-current');
      if (priceEl && e.detail.price) {
        priceEl.innerHTML = e.detail.price;
      }
    });
  },
};

registerBlock('cta', renderer);
export default renderer;
