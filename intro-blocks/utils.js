// intro-blocks/utils.js — 공유 유틸리티

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 이미지 없을 때 그라데이션 플레이스홀더 HTML 반환
 */
export function placeholderBg(gradient = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)') {
  return `style="background:${gradient};"`;
}
