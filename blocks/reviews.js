// blocks/reviews.js — 리뷰 하이라이트 (Reassure)
import { registerBlock } from '../engine/block-registry.js';

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const STYLES = `
.pdp-reviews {
  padding: var(--pdp-section-gap, 32px) var(--pdp-content-padding, 20px);
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
}

/* 요약 영역 */
.pdp-reviews__summary {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--pdp-border, #E5E7EB);
}
.pdp-reviews__score-block {
  text-align: center;
  flex-shrink: 0;
  min-width: 80px;
}
.pdp-reviews__avg-score {
  display: block;
  font-size: 40px;
  font-weight: 800;
  color: var(--pdp-text, #1D2229);
  line-height: 1;
  letter-spacing: -0.03em;
}
.pdp-reviews__avg-stars {
  color: #F59E0B;
  font-size: 14px;
  margin: 4px 0;
}
.pdp-reviews__total-count {
  font-size: 13px;
  color: var(--pdp-text-secondary, #6B7280);
}

/* 별점 분포 바 */
.pdp-reviews__distribution {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pdp-reviews__dist-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pdp-reviews__dist-label {
  font-size: 12px;
  color: var(--pdp-text-secondary, #6B7280);
  width: 24px;
  text-align: right;
  flex-shrink: 0;
}
.pdp-reviews__dist-bar {
  flex: 1;
  height: 8px;
  background: #F3F4F6;
  border-radius: 4px;
  overflow: hidden;
}
.pdp-reviews__dist-fill {
  height: 100%;
  background: #F59E0B;
  border-radius: 4px;
  min-width: 2px;
  transition: width 600ms ease-out;
}
.pdp-reviews__dist-count {
  font-size: 12px;
  color: var(--pdp-text-secondary, #6B7280);
  width: 28px;
  text-align: right;
  flex-shrink: 0;
}

/* AI 리뷰 요약 */
.pdp-reviews__ai-summary {
  background: linear-gradient(135deg, #F0F9FF, #EEF2FF);
  border-radius: var(--pdp-radius-sm, 8px);
  padding: 14px;
  margin-bottom: 20px;
}
.pdp-reviews__ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--pdp-primary, #2B96ED);
  background: rgba(43,150,237,0.1);
  padding: 2px 8px;
  border-radius: 100px;
  margin-bottom: 8px;
}
.pdp-reviews__ai-text {
  font-size: 14px;
  color: var(--pdp-text-secondary, #6B7280);
  line-height: 1.6;
  margin: 0;
}
.pdp-reviews__ai-text strong {
  color: var(--pdp-text, #1D2229);
  font-weight: 600;
}

/* 긍정/부정 요약 */
.pdp-reviews__sentiment {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}
.pdp-reviews__sentiment-group {
  padding: 12px 14px;
  border-radius: var(--pdp-radius-sm, 8px);
}
.pdp-reviews__sentiment-group--positive {
  background: #ECFDF5;
}
.pdp-reviews__sentiment-group--negative {
  background: #FEF2F2;
}
.pdp-reviews__sentiment-label {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.pdp-reviews__sentiment-group--positive .pdp-reviews__sentiment-label {
  color: var(--pdp-success, #059669);
}
.pdp-reviews__sentiment-group--negative .pdp-reviews__sentiment-label {
  color: var(--pdp-danger, #EF4444);
}
.pdp-reviews__sentiment-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pdp-reviews__sentiment-item {
  font-size: 13px;
  color: var(--pdp-text-secondary, #6B7280);
  background: rgba(255,255,255,0.7);
  padding: 3px 10px;
  border-radius: 100px;
}

/* 추천 리뷰 카드 */
.pdp-reviews__featured {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
.pdp-reviews__card {
  border: 1px solid var(--pdp-border, #E5E7EB);
  border-radius: var(--pdp-radius-md, 12px);
  padding: 16px;
}
.pdp-reviews__card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.pdp-reviews__card-author {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pdp-reviews__card-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--pdp-primary-light, #F0F9FF);
  color: var(--pdp-primary, #2B96ED);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.pdp-reviews__card-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--pdp-text, #1D2229);
}
.pdp-reviews__card-meta {
  display: block;
  font-size: 12px;
  color: var(--pdp-text-secondary, #6B7280);
}
.pdp-reviews__card-stars {
  color: #F59E0B;
  font-size: 13px;
  flex-shrink: 0;
}
.pdp-reviews__card-text {
  font-size: 14px;
  color: var(--pdp-text-secondary, #6B7280);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 전체 리뷰 보기 버튼 */
.pdp-reviews__all-btn {
  display: block;
  width: 100%;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  color: var(--pdp-primary, #2B96ED);
  background: none;
  border: 1px solid var(--pdp-primary, #2B96ED);
  border-radius: var(--pdp-radius-sm, 8px);
  cursor: pointer;
  font-family: var(--pdp-font, 'Pretendard', -apple-system, sans-serif);
  transition: background var(--pdp-transition, 200ms cubic-bezier(0.4, 0, 0.2, 1));
}
.pdp-reviews__all-btn:hover {
  background: var(--pdp-primary-light, #F0F9FF);
}

/* 빈 상태 */
.pdp-reviews__empty {
  text-align: center;
  padding: 32px 0;
}
.pdp-reviews__empty-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}
.pdp-reviews__empty-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--pdp-text, #1D2229);
  margin: 0 0 4px;
}
.pdp-reviews__empty-sub {
  font-size: 14px;
  color: var(--pdp-text-secondary, #6B7280);
  margin: 0;
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .pdp-reviews__summary {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
@media (min-width: 769px) {
  .pdp-reviews__featured {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
`;

// 스타일 주입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('pdp-reviews-styles')) {
  const style = document.createElement('style');
  style.id = 'pdp-reviews-styles';
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

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '\u2605'.repeat(full) + (half ? '\u00BD' : '') + '\u2606'.repeat(empty);
}

function getInitial(name) {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */
const renderer = {
  /* ---- validate -------------------------------------------------- */
  validate(data) {
    if (!data) return false;
    // score/count 기반 (요청 스펙) 또는 summary 기반 (문서 스펙) 둘 다 지원
    if (data.summary?.averageScore != null) return true;
    if (data.score != null) return true;
    return true; // 빈 상태 (리뷰 없음)도 렌더 가능
  },

  /* ---- render ---------------------------------------------------- */
  render(data) {
    const title = data.title || '여행자 리뷰';

    // 데이터 정규화
    let score, count, distribution, aiSummary, featured, positiveSummary, negativeSummary;

    if (data.summary) {
      score = data.summary.averageScore;
      count = data.summary.totalCount;
      distribution = data.summary.distribution;
      aiSummary = data.summary.aiSummary;
      positiveSummary = data.summary.positive;
      negativeSummary = data.summary.negative;
    } else {
      score = data.score;
      count = data.count;
      positiveSummary = data.summary?.positive;
      negativeSummary = data.summary?.negative;
    }

    featured = data.featured || [];

    // 빈 상태: 리뷰가 없을 때
    if (!count || count === 0) {
      return `
<section class="pdp-section pdp-reviews pdp-reviews--empty" aria-label="여행자 리뷰">
  <div class="pdp-reviews__inner">
    <h2 class="pdp-section__title">${escapeHtml(title)}</h2>
    <div class="pdp-reviews__empty">
      <span class="pdp-reviews__empty-icon" aria-hidden="true">\uD83D\uDCAC</span>
      <p class="pdp-reviews__empty-text">\uC544\uC9C1 \uCCAB \uBC88\uC9F8 \uB9AC\uBDF0\uB97C \uAE30\uB2E4\uB9AC\uACE0 \uC788\uC5B4\uC694</p>
      <p class="pdp-reviews__empty-sub">\uC774 \uC0C1\uD488\uC744 \uC774\uC6A9\uD558\uC168\uB2E4\uBA74 \uB9AC\uBDF0\uB97C \uB0A8\uACA8\uC8FC\uC138\uC694!</p>
    </div>
  </div>
</section>`;
    }

    // 점수 + 별점 영역
    const scoreHtml = score != null ? `
    <div class="pdp-reviews__summary">
      <div class="pdp-reviews__score-block">
        <span class="pdp-reviews__avg-score">${Number(score).toFixed(1)}</span>
        <div class="pdp-reviews__avg-stars" aria-hidden="true">${renderStars(score)}</div>
        <span class="pdp-reviews__total-count">${count}\uAC1C \uB9AC\uBDF0</span>
      </div>
      ${distribution ? renderDistribution(distribution) : ''}
    </div>` : '';

    // AI 요약 영역
    const aiSummaryHtml = aiSummary ? `
    <div class="pdp-reviews__ai-summary">
      <div class="pdp-reviews__ai-badge">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14"><path d="M7 1l1.5 3.5L12 6l-3.5 1.5L7 11 5.5 7.5 2 6l3.5-1.5z" fill="currentColor"/></svg>
        AI \uB9AC\uBDF0 \uC694\uC57D
      </div>
      <p class="pdp-reviews__ai-text">${escapeHtml(aiSummary)}</p>
    </div>` : '';

    // 긍정/부정 요약
    let sentimentHtml = '';
    if ((positiveSummary && positiveSummary.length) || (negativeSummary && negativeSummary.length)) {
      const positiveHtml = positiveSummary?.length ? `
      <div class="pdp-reviews__sentiment-group pdp-reviews__sentiment-group--positive">
        <div class="pdp-reviews__sentiment-label">\uD83D\uDC4D \uC88B\uC558\uB358 \uC810</div>
        <ul class="pdp-reviews__sentiment-items">
          ${positiveSummary.map((item) => `<li class="pdp-reviews__sentiment-item">${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>` : '';

      const negativeHtml = negativeSummary?.length ? `
      <div class="pdp-reviews__sentiment-group pdp-reviews__sentiment-group--negative">
        <div class="pdp-reviews__sentiment-label">\uD83D\uDC4E \uC544\uC26C\uC6E0\uB358 \uC810</div>
        <ul class="pdp-reviews__sentiment-items">
          ${negativeSummary.map((item) => `<li class="pdp-reviews__sentiment-item">${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>` : '';

      sentimentHtml = `
    <div class="pdp-reviews__sentiment">
      ${positiveHtml}
      ${negativeHtml}
    </div>`;
    }

    // 추천 리뷰 카드
    let featuredHtml = '';
    if (featured.length > 0) {
      const cardsHtml = featured.map((review) => {
        const initial = getInitial(review.author);
        const rating = review.rating || review.score || 5;
        const stars = '\u2605'.repeat(Math.min(Math.floor(rating), 5));
        const meta = review.date || '';

        return `
      <article class="pdp-reviews__card">
        <div class="pdp-reviews__card-header">
          <div class="pdp-reviews__card-author">
            <span class="pdp-reviews__card-avatar" aria-hidden="true">${escapeHtml(initial)}</span>
            <div>
              <span class="pdp-reviews__card-name">${escapeHtml(review.author || '\uC775\uBA85')}</span>
              ${meta ? `<span class="pdp-reviews__card-meta">${escapeHtml(meta)}</span>` : ''}
            </div>
          </div>
          <div class="pdp-reviews__card-stars" aria-label="${rating}\uC810">${stars}</div>
        </div>
        <p class="pdp-reviews__card-text">${escapeHtml(review.text)}</p>
      </article>`;
      }).join('');

      featuredHtml = `
    <div class="pdp-reviews__featured">
      ${cardsHtml}
    </div>`;
    }

    // 전체 리뷰 보기 버튼
    const allBtnHtml = count > 0 ? `
    <button class="pdp-reviews__all-btn">\uC804\uCCB4 \uB9AC\uBDF0 ${count}\uAC1C \uBCF4\uAE30</button>` : '';

    return `
<section class="pdp-section pdp-reviews" aria-label="여행자 리뷰">
  <div class="pdp-reviews__inner">
    <h2 class="pdp-section__title">${escapeHtml(title)}</h2>
    ${scoreHtml}
    ${aiSummaryHtml}
    ${sentimentHtml}
    ${featuredHtml}
    ${allBtnHtml}
  </div>
</section>`;
  },

  /* ---- mount ----------------------------------------------------- */
  mount(data) {
    if (typeof document === 'undefined') return;

    const section = document.querySelector('.pdp-reviews');
    if (!section) return;

    // "전체 리뷰 보기" 버튼 이벤트
    const allBtn = section.querySelector('.pdp-reviews__all-btn');
    if (allBtn) {
      allBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('pdp:open-all-reviews'));
      });
    }
  },
};

/* ------------------------------------------------------------------ */
/*  별점 분포 렌더 헬퍼                                               */
/* ------------------------------------------------------------------ */
function renderDistribution(dist) {
  // dist: { "5": 256, "4": 49, "3": 16, "2": 4, "1": 2 }
  const total = Object.values(dist).reduce((sum, v) => sum + Number(v), 0);
  if (total === 0) return '';

  const rows = [5, 4, 3, 2, 1].map((star) => {
    const count = Number(dist[star] || dist[String(star)] || 0);
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
        <div class="pdp-reviews__dist-row">
          <span class="pdp-reviews__dist-label">${star}\uC810</span>
          <div class="pdp-reviews__dist-bar">
            <div class="pdp-reviews__dist-fill" style="width: ${percent}%" aria-label="${percent}%"></div>
          </div>
          <span class="pdp-reviews__dist-count">${count}</span>
        </div>`;
  }).join('');

  return `
      <div class="pdp-reviews__distribution" aria-label="별점 분포">
        ${rows}
      </div>`;
}

registerBlock('reviews', renderer);
export default renderer;
