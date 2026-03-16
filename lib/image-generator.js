/**
 * AI 이미지 생성 파이프라인
 *
 * 흐름:
 *   1. 기존 이미지 수 체크 → 충분하면 기존 이미지 반환
 *   2. Claude로 상품 데이터 기반 이미지 프롬프트 생성
 *   3. Google Imagen API로 이미지 생성
 *   4. 기존 이미지 + AI 이미지 합산 반환
 */

import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let genAI = null;
function getGenAI() {
  if (!genAI) {
    if (!process.env.GOOGLE_API_KEY) {
      throw Object.assign(new Error('GOOGLE_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.'), {
        code: 'MISSING_API_KEY',
      });
    }
    genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  }
  return genAI;
}

// 카테고리별 이미지 스타일 가이드
const IMAGE_STYLE_GUIDE = {
  TOUR: {
    style: 'travel photography, natural golden hour lighting, candid moments, local atmosphere',
    subjects: ['scenic landscape with travelers', 'local guide explaining at landmark', 'group enjoying cultural experience'],
  },
  TICKET_THEME: {
    style: 'vibrant theme park photography, bright colors, wide angle, exciting atmosphere',
    subjects: ['colorful theme park entrance', 'exciting attraction ride', 'families enjoying park activities'],
  },
  TICKET_TRANSPORT: {
    style: 'clean urban photography, modern transit, practical composition',
    subjects: ['modern transit station', 'comfortable transit interior', 'city skyline from transit'],
  },
  TICKET_CITYPASS: {
    style: 'landmark photography, iconic architecture, tourist perspective, clear sky',
    subjects: ['famous city landmark', 'museum or gallery interior', 'scenic city viewpoint'],
  },
  TICKET_EXPERIENCE: {
    style: 'atmospheric photography, immersive, dramatic lighting, sensory experience',
    subjects: ['unique cultural performance', 'hands-on workshop activity', 'scenic nighttime view'],
  },
  ACTIVITY: {
    style: 'action photography, dynamic angles, bright outdoor lighting, adventure feel',
    subjects: ['outdoor adventure activity', 'equipment and safety gear', 'scenic natural setting'],
  },
  SERVICE: {
    style: 'professional photography, clean composition, warm tones, premium feel',
    subjects: ['professional service in action', 'beautiful result or outcome', 'elegant setting'],
  },
  SEMI_PACKAGE: {
    style: 'resort photography, relaxing atmosphere, luxury comfort, panoramic views',
    subjects: ['comfortable hotel exterior', 'scenic destination overview', 'curated travel experience'],
  },
};

// ─── 공개 API ────────────────────────────────────────────────

export async function generateProductImages({ rawData, category, count = 3 }) {
  const existingImages = (rawData.images || []).filter((img) => img.url);

  // 기존 이미지가 충분하면 AI 생성 스킵
  if (existingImages.length >= count) {
    return {
      images: existingImages.slice(0, count).map((img) => ({
        url: img.url,
        alt: img.alt || rawData.title || '',
        isAiGenerated: false,
        prompt: null,
      })),
      skipped: true,
      reason: `기존 이미지 ${existingImages.length}장으로 충분`,
      cost: 0,
    };
  }

  // 부족한 수만큼 AI 생성
  const needed = count - existingImages.length;

  // 1. Claude로 이미지 프롬프트 생성
  const prompts = await generateImagePrompts(rawData, category, needed);

  // 2. Google Imagen으로 이미지 생성
  const { images: aiImages, billingError } = await generateWithImagen(prompts);

  // 3. 기존 이미지 + AI 이미지 합산
  const allImages = [
    ...existingImages.map((img) => ({
      url: img.url,
      alt: img.alt || rawData.title || '',
      isAiGenerated: false,
      prompt: null,
    })),
    ...aiImages,
  ];

  const realGenerated = aiImages.filter((img) => img.isAiGenerated).length;
  const placeholders = aiImages.filter((img) => img.isPlaceholder).length;
  const cost = realGenerated * 0.04;

  const result = {
    images: allImages.slice(0, count),
    generated: realGenerated,
    placeholders,
    cost,
  };

  if (billingError) {
    result.warning = 'Google AI 유료 플랜이 필요합니다. Placeholder 이미지가 삽입되었으며, 편집 모드에서 이미지를 교체할 수 있습니다. https://ai.dev/projects 에서 결제를 활성화하세요.';
  }

  return result;
}

// ─── Claude 프롬프트 생성 ────────────────────────────────────

async function generateImagePrompts(rawData, category, count) {
  const guide = IMAGE_STYLE_GUIDE[category] || IMAGE_STYLE_GUIDE.TOUR;

  const prompt = `너는 여행 상품 이미지를 위한 이미지 생성 프롬프트를 작성하는 전문가야.

## 상품 정보
- 제목: ${rawData.title || ''}
- 설명: ${(rawData.description || '').slice(0, 300)}
- 도시: ${rawData.city || rawData.location || ''}
- 카테고리: ${category}

## 이미지 스타일
${guide.style}

## 참고 피사체
${guide.subjects.join(', ')}

## 규칙
- 장소 고유명사(예: "에펠탑", "센소지")는 쓰지 마. 대신 분위기와 특징으로 묘사해 (예: "iconic iron tower in European city at sunset")
- 사람의 정면 얼굴은 피해. 뒷모습이나 실루엣으로.
- 여행 상품 광고에 적합한 매력적인 이미지로.
- 텍스트/워터마크/로고 포함 금지
- 각 프롬프트는 영어로, 한 줄로.

## 출력
아래 형식의 JSON 배열만 출력해. 설명 없이 JSON만.

\`\`\`json
[
  { "prompt": "이미지 생성 프롬프트 영어 한 줄", "alt": "한국어 이미지 설명 (20자)" }
]
\`\`\`

${count}개의 프롬프트를 생성해줘.`;

  const message = await anthropic.messages.create({
    model: process.env.AI_MODEL_COPY || 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0]?.text || '';
  return parsePromptResponse(text, count);
}

function parsePromptResponse(text, count) {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : text;

  try {
    const parsed = JSON.parse(jsonStr.trim());
    if (Array.isArray(parsed)) return parsed.slice(0, count);
  } catch {
    // 폴백
  }

  // 폴백: 기본 프롬프트
  return Array.from({ length: count }, (_, i) => ({
    prompt: `Beautiful travel destination photography, scenic landscape, golden hour lighting, professional quality, no text, no watermark, composition ${i + 1}`,
    alt: '여행지 풍경',
  }));
}

// ─── Google Imagen 이미지 생성 ───────────────────────────────

async function generateWithImagen(prompts) {
  const ai = getGenAI();
  const results = [];
  let billingError = false;

  for (const item of prompts) {
    // 결제 에러가 이미 확인됐으면 나머지도 같은 결과이므로 스킵
    if (billingError) {
      results.push(generatePlaceholder(item));
      continue;
    }

    try {
      // Imagen 4.0 시도
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-fast-generate-001',
        prompt: item.prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '4:3',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const imageData = response.generatedImages[0].image;
        const dataUrl = `data:image/png;base64,${imageData.imageBytes}`;
        results.push({
          url: dataUrl,
          alt: item.alt || '',
          isAiGenerated: true,
          prompt: item.prompt,
        });
        continue;
      }
    } catch (err) {
      console.warn('[image-generator] Imagen 생성 실패:', err.message);

      // 결제/할당량 에러 감지
      if (isBillingError(err)) {
        billingError = true;
        results.push(generatePlaceholder(item));
        continue;
      }
    }

    // Gemini 폴백 시도
    try {
      const fallbackResult = await generateWithGemini(ai, item);
      if (fallbackResult) {
        results.push(fallbackResult);
        continue;
      }
    } catch (fallbackErr) {
      console.warn('[image-generator] Gemini 폴백도 실패:', fallbackErr.message);
      if (isBillingError(fallbackErr)) billingError = true;
    }

    // 최종 폴백: placeholder
    results.push(generatePlaceholder(item));
  }

  return { images: results, billingError };
}

function isBillingError(err) {
  const msg = err.message || '';
  return msg.includes('paid plans') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
}

// Gemini 모델의 이미지 생성 기능으로 폴백
async function generateWithGemini(ai, item) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: item.prompt,
    config: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        const dataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        return {
          url: dataUrl,
          alt: item.alt || '',
          isAiGenerated: true,
          prompt: item.prompt,
        };
      }
    }
  }

  return null;
}

// ─── Placeholder SVG 생성 ────────────────────────────────────

const PLACEHOLDER_COLORS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a18cd1', '#fbc2eb'],
];

function generatePlaceholder(item, index = 0) {
  const [c1, c2] = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  const alt = item.alt || '이미지 placeholder';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs>
    <rect width="800" height="600" fill="url(#g)"/>
    <text x="400" y="280" text-anchor="middle" fill="white" font-family="sans-serif" font-size="20" opacity="0.8">AI 이미지 생성 필요</text>
    <text x="400" y="320" text-anchor="middle" fill="white" font-family="sans-serif" font-size="14" opacity="0.6">편집 모드에서 이미지를 교체하세요</text>
  </svg>`;
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  return {
    url: dataUrl,
    alt,
    isAiGenerated: false,
    isPlaceholder: true,
    prompt: item.prompt,
  };
}

// ─── 비용 추정 (생성 전) ─────────────────────────────────────

export function estimateImageCost({ rawData, count = 3 }) {
  const existingCount = (rawData.images || []).filter((img) => img.url).length;
  const needed = Math.max(0, count - existingCount);

  return {
    existingImages: existingCount,
    toGenerate: needed,
    estimatedCost: needed * 0.04,
    skipped: needed === 0,
  };
}
