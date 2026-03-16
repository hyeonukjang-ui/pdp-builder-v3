// recipes/category-recipes.js

const RECIPES = {
  TICKET_THEME: [
    'hero', 'trustBadges', 'highlights', 'optionTable', 'imageGrid',
    'overview', 'inclusions', 'usageGuide', 'reviews', 'notice',
    'faq', 'socialProof', 'relatedProducts', 'cta',
  ],
  TICKET_TRANSPORT: [
    'hero', 'trustBadges', 'highlights', 'usageGuide', 'overview',
    'meetingPoint', 'inclusions', 'reviews', 'notice', 'faq',
    'socialProof', 'relatedProducts', 'cta',
  ],
  TICKET_CITYPASS: [
    'hero', 'trustBadges', 'highlights', 'comparison', 'imageGrid',
    'overview', 'inclusions', 'usageGuide', 'reviews', 'notice',
    'faq', 'socialProof', 'relatedProducts', 'cta',
  ],
  TICKET_EXPERIENCE: [
    'hero', 'trustBadges', 'highlights', 'imageGrid', 'itinerary',
    'overview', 'inclusions', 'meetingPoint', 'usageGuide', 'reviews',
    'notice', 'faq', 'socialProof', 'relatedProducts', 'cta',
  ],
  TOUR: [
    'hero', 'trustBadges', 'highlights', 'guideProfile', 'itinerary',
    'imageGrid', 'overview', 'optionTable', 'inclusions', 'meetingPoint',
    'usageGuide', 'reviews', 'recommendFor', 'notice', 'faq',
    'socialProof', 'relatedProducts', 'cta',
  ],
  SERVICE: [
    'hero', 'trustBadges', 'highlights', 'imageGrid', 'overview',
    'inclusions', 'guideProfile', 'meetingPoint', 'usageGuide', 'reviews',
    'notice', 'faq', 'socialProof', 'relatedProducts', 'cta',
  ],
  ACTIVITY: [
    'hero', 'trustBadges', 'highlights', 'imageGrid', 'overview',
    'itinerary', 'inclusions', 'meetingPoint', 'usageGuide', 'reviews',
    'recommendFor', 'notice', 'faq', 'socialProof', 'relatedProducts', 'cta',
  ],
  SEMI_PACKAGE: [
    'hero', 'trustBadges', 'highlights', 'overview', 'itinerary',
    'hotelInfo', 'optionTable', 'inclusions', 'comparison', 'meetingPoint',
    'usageGuide', 'reviews', 'recommendFor', 'notice', 'faq',
    'socialProof', 'relatedProducts', 'cta',
  ],
};

export function getRecipe(category) {
  return RECIPES[category] || null;
}

export function getCategories() {
  return Object.keys(RECIPES);
}
