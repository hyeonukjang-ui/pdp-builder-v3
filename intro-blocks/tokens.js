// intro-blocks/tokens.js — 카테고리별 컬러/무드 디자인 토큰

export const INTRO_TOKENS = {
  TOUR: { accent: '#2B96ED', mood: 'warm', gradient: 'rgba(0,0,0,0.55)' },
  TICKET_THEME: { accent: '#F59E0B', mood: 'bright', gradient: 'rgba(0,0,0,0.45)' },
  TICKET_TRANSPORT: { accent: '#2B96ED', mood: 'clean', gradient: 'rgba(0,0,0,0.5)' },
  TICKET_CITYPASS: { accent: '#7C3AED', mood: 'elegant', gradient: 'rgba(0,0,0,0.5)' },
  TICKET_EXPERIENCE: { accent: '#EC4899', mood: 'dramatic', gradient: 'rgba(0,0,0,0.55)' },
  ACTIVITY: { accent: '#059669', mood: 'fresh', gradient: 'rgba(0,0,0,0.5)' },
  SERVICE: { accent: '#F59E0B', mood: 'premium', gradient: 'rgba(0,0,0,0.5)' },
  SEMI_PACKAGE: { accent: '#2B96ED', mood: 'balanced', gradient: 'rgba(0,0,0,0.5)' },
};

export function getTokens(category) {
  return INTRO_TOKENS[category] || INTRO_TOKENS.TOUR;
}
