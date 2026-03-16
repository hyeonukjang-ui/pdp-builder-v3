// blocks/socialProof.js — 소셜 프루프 (Convert)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-social-proof {
  padding: 10px var(--pdp-content-padding, 20px);
  background: var(--pdp-primary-light, #F0F9FF);
  border-radius: var(--pdp-radius-sm, 8px);
  overflow: hidden;
  min-height: 36px;
}

.pdp-social-proof__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pdp-social-proof__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--pdp-text-secondary, #6B7280);
  line-height: 1.4;
}

.pdp-social-proof__item--single {
  justify-content: center;
}

.pdp-social-proof__icon {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 1;
}

.pdp-social-proof__text strong {
  color: var(--pdp-text, #1D2229);
  font-weight: 700;
}

/* 메시지 로테이션 (여러 개일 때) */
.pdp-social-proof--rotating .pdp-social-proof__item {
  justify-content: center;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 400ms ease, transform 400ms ease;
  position: absolute;
  left: 0;
  right: 0;
  padding: 0 var(--pdp-content-padding, 20px);
}

.pdp-social-proof--rotating {
  position: relative;
}

.pdp-social-proof__item--active {
  opacity: 1 !important;
  transform: translateY(0) !important;
  position: relative !important;
}

@media (prefers-reduced-motion: reduce) {
  .pdp-social-proof__item {
    transition: none !important;
  }
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-socialProof-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-socialProof-styles';
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

const ICON_MAP = {
  fire: '\uD83D\uDD25',
  eye: '\uD83D\uDC41\uFE0F',
  calendar: '\uD83D\uDCC5',
  star: '\u2B50',
  people: '\uD83D\uDC65',
};

function getIconHtml(icon) {
  if (!icon) return '';
  const emoji = ICON_MAP[icon] || icon;
  return `<span class="pdp-social-proof__icon" aria-hidden="true">${emoji}</span>`;
}

function buildMessage(msg) {
  if (typeof msg === 'string') return escapeHtml(msg);
  // text 필드는 <strong> 태그를 허용 (스펙 요구)
  return msg.text || '';
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */
const renderer = {
  /* ---- validate -------------------------------------------------- */
  validate(data) {
    if (!data) return false;

    // messages 배열 방식
    if (data.messages?.length >= 1) return true;

    // 단일 필드 방식: todayBookings, recentViews, totalBookings 중 하나라도 있으면 OK
    return !!(data.todayBookings || data.recentViews || data.totalBookings);
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    // messages 배열이 있으면 그대로 사용
    let messages = data.messages || [];

    // 단일 필드 방식일 때 messages 자동 생성
    if (messages.length === 0) {
      if (data.todayBookings) {
        messages.push({
          icon: 'fire',
          text: `오늘 <strong>${escapeHtml(String(data.todayBookings))}명</strong>이 예약했어요`,
        });
      }
      if (data.recentViews) {
        messages.push({
          icon: 'eye',
          text: `최근 24시간 <strong>${escapeHtml(String(data.recentViews))}명</strong>이 조회했어요`,
        });
      }
      if (data.totalBookings) {
        messages.push({
          icon: 'people',
          text: `총 <strong>${escapeHtml(String(data.totalBookings))}명</strong>이 예약한 상품`,
        });
      }
    }

    if (messages.length === 0) return '';

    const isRotating = messages.length > 1;
    const containerClass = isRotating
      ? 'pdp-social-proof pdp-social-proof--rotating'
      : 'pdp-social-proof';

    const itemsHtml = messages
      .map((msg, i) => {
        const icon = typeof msg === 'string' ? '' : msg.icon;
        const activeClass = i === 0 ? ' pdp-social-proof__item--active' : '';
        const singleClass = !isRotating ? ' pdp-social-proof__item--single' : '';

        return `
      <div class="pdp-social-proof__item${activeClass}${singleClass}" data-index="${i}">
        ${getIconHtml(icon)}
        <span class="pdp-social-proof__text">${buildMessage(msg)}</span>
      </div>`;
      })
      .join('');

    return `
<section class="${containerClass}" role="status" aria-live="polite" aria-atomic="true">
  <div class="pdp-social-proof__list">
    ${itemsHtml}
  </div>
</section>`;
  },

  /* ---- mount (메시지 로테이션) ------------------------------------ */
  mount(el) {
    const container = el || document.querySelector('.pdp-social-proof');
    if (!container) return;

    const items = container.querySelectorAll('.pdp-social-proof__item');
    if (items.length <= 1) return;

    let current = 0;
    const total = items.length;

    const showNext = () => {
      items[current].classList.remove('pdp-social-proof__item--active');
      current = (current + 1) % total;
      items[current].classList.add('pdp-social-proof__item--active');
    };

    this._interval = setInterval(showNext, 5000);

    // 뷰포트 밖이면 일시정지 (성능)
    if (typeof IntersectionObserver !== 'undefined') {
      this._observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && this._interval) {
            clearInterval(this._interval);
            this._interval = null;
          } else if (entry.isIntersecting && !this._interval) {
            this._interval = setInterval(showNext, 5000);
          }
        });
      });
      this._observer.observe(container);
    }
  },

  /* ---- unmount --------------------------------------------------- */
  unmount() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  },
};

registerBlock('socialProof', renderer);
export default renderer;
