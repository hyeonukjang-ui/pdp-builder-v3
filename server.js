import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { extractProductData } from './lib/extractor.js';
import { generateBlockCopy } from './lib/generator.js';
import { calculateHealthScore } from './lib/health-scorer.js';
import { checkQuality } from './lib/quality-checker.js';
import { runBatch } from './lib/batch-runner.js';
import { generateProductImages, estimateImageCost } from './lib/image-generator.js';
import { generateIntroBlocks } from './lib/intro-generator.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// 정적 파일 서빙
app.use(express.static('public'));
app.use('/engine', express.static('engine'));
app.use('/blocks', express.static('blocks'));
app.use('/recipes', express.static('recipes'));
app.use('/samples', express.static('samples'));
app.use('/lib', express.static('lib'));
app.use('/intro-blocks', express.static('intro-blocks'));

// ─── POST /api/extract ───────────────────────────────────────
// MRT 상품 URL에서 데이터를 추출한다.
app.post('/api/extract', async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'url 필드가 필요합니다.',
      });
    }

    const urlPattern = /myrealtrip\.com\/(offers|products)\/(\d+)/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({
        error: 'INVALID_URL',
        message: '마이리얼트립 상품 URL 형식이 아닙니다. (예: https://myrealtrip.com/offers/12345 또는 https://experiences.myrealtrip.com/products/12345)',
      });
    }

    const result = await extractProductData(url);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/generate ──────────────────────────────────────
// 추출된 rawData + category로 블록별 카피를 생성한다.
app.post('/api/generate', async (req, res, next) => {
  try {
    const { rawData, category, targetBlocks } = req.body;

    if (!rawData || !category) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'rawData와 category 필드가 필요합니다.',
      });
    }

    const result = await generateBlockCopy({ rawData, category, targetBlocks });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/health-score ──────────────────────────────────
// 추출된 rawData + category로 Health Score를 산출한다.
app.post('/api/health-score', async (req, res, next) => {
  try {
    const { rawData, category } = req.body;

    if (!rawData || !category) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'rawData와 category 필드가 필요합니다.',
      });
    }

    const result = calculateHealthScore(rawData, category);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/quality-check ────────────────────────────────
// 생성된 블록 데이터의 품질을 검수한다.
app.post('/api/quality-check', async (req, res, next) => {
  try {
    const { blocks, rawData, category } = req.body;

    if (!blocks || !rawData || !category) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'blocks, rawData, category 필드가 필요합니다.',
      });
    }

    const result = checkQuality(blocks, rawData, category);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/batch ────────────────────────────────────────
// 여러 상품 URL을 일괄 처리한다 (추출 → Health Score → AI 생성 → 품질 검수).
app.post('/api/batch', async (req, res, next) => {
  try {
    const { urls, options } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'urls 배열이 필요합니다.',
      });
    }

    if (urls.length > 50) {
      return res.status(400).json({
        error: 'TOO_MANY_URLS',
        message: '한 번에 최대 50개까지 처리 가능합니다.',
      });
    }

    const result = await runBatch(urls, options);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/generate-intro ───────────────────────────────
// 상품소개 전용 블록 카피를 AI로 생성한다.
app.post('/api/generate-intro', async (req, res, next) => {
  try {
    const { rawData, category, depth2 } = req.body;

    if (!rawData) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'rawData 필드가 필요합니다.',
      });
    }

    const speed = req.body.speed || 'normal'; // 'fast' | 'normal'
    const result = await generateIntroBlocks({
      rawData,
      category: category || 'TOUR',
      depth2: depth2 || null,
      recipe: req.body.recipe || null,
      speed,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/generate-images ──────────────────────────────
// AI로 상품 이미지를 생성한다.
app.post('/api/generate-images', async (req, res, next) => {
  try {
    const { rawData, category, count } = req.body;

    if (!rawData) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'rawData 필드가 필요합니다.',
      });
    }

    const result = await generateProductImages({
      rawData,
      category: category || 'TOUR',
      count: count || 3,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    if (err.code === 'MISSING_API_KEY') {
      return res.status(400).json({
        error: 'MISSING_API_KEY',
        message: err.message,
      });
    }
    next(err);
  }
});

// ─── POST /api/estimate-images ──────────────────────────────
// 이미지 생성 비용을 미리 추정한다.
app.post('/api/estimate-images', (req, res) => {
  const { rawData, count } = req.body;
  if (!rawData) {
    return res.status(400).json({ error: 'INVALID_REQUEST', message: 'rawData 필드가 필요합니다.' });
  }
  res.json(estimateImageCost({ rawData, count: count || 3 }));
});

// ─── GET /api/proxy-image ────────────────────────────────────
// 외부 이미지를 프록시하여 CORS 우회 (html2canvas 캡처용)
// SSRF 방지: 허용 도메인만 프록시
const ALLOWED_IMAGE_HOSTS = [
  'cloudfront.net',
  'myrealtrip.com',
  'mrt-images-prod',
  'd2ur7st6jjikze.cloudfront.net', // MRT CDN
  'd3b9eqgmobbqho.cloudfront.net', // MRT CDN
  'scdn.myrealtrip.com',
];

function isAllowedImageUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    return ALLOWED_IMAGE_HOSTS.some((host) => parsed.hostname.endsWith(host) || parsed.hostname.includes(host));
  } catch {
    return false;
  }
}

app.get('/api/proxy-image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url 파라미터가 필요합니다.' });

  if (!isAllowedImageUrl(url)) {
    return res.status(403).json({ error: 'FORBIDDEN', message: '허용되지 않은 이미지 도메인입니다.' });
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': process.env.USER_AGENT || 'Mozilla/5.0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (err) {
    res.status(502).json({ error: 'IMAGE_PROXY_FAILED', message: err.message });
  }
});

// ─── POST /api/render ────────────────────────────────────────
// productData를 받아서 렌더링된 HTML을 반환한다.
app.post('/api/render', async (req, res, next) => {
  try {
    const { productData } = req.body;
    if (!productData) {
      return res.status(400).json({ error: 'productData 필드가 필요합니다.' });
    }

    const { renderPDP } = await import('./engine/pdp-engine.js');
    // 블록 렌더러 로드
    await import('./blocks/hero.js');
    await import('./blocks/highlights.js');
    await import('./blocks/overview.js');
    await import('./blocks/itinerary.js');
    await import('./blocks/imageGrid.js');
    await import('./blocks/inclusions.js');
    await import('./blocks/optionTable.js');
    await import('./blocks/usageGuide.js');
    await import('./blocks/faq.js');
    await import('./blocks/recommendFor.js');
    await import('./blocks/guideProfile.js');
    await import('./blocks/notice.js');
    await import('./blocks/meetingPoint.js');
    await import('./blocks/reviews.js');
    await import('./blocks/socialProof.js');
    await import('./blocks/relatedProducts.js');
    await import('./blocks/cta.js');
    await import('./blocks/comparison.js');
    await import('./blocks/hotelInfo.js');

    const result = renderPDP(productData);

    // 전체 HTML 페이지로 감싸기
    const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=390, initial-scale=1.0">
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">
<style>
:root {
  --pdp-font: 'Pretendard Variable', 'Pretendard', -apple-system, sans-serif;
  --pdp-text: #1D2229;
  --pdp-text-secondary: #6B7280;
  --pdp-primary: #2B96ED;
  --pdp-primary-light: #F0F9FF;
  --pdp-border: #E5E7EB;
  --pdp-success: #059669;
  --pdp-danger: #EF4444;
  --pdp-content-padding: 20px;
  --pdp-section-gap: 32px;
  --pdp-radius-sm: 8px;
  --pdp-radius-md: 12px;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: var(--pdp-font); background: #fff; color: var(--pdp-text); max-width: 390px; margin: 0 auto; }
img { max-width: 100%; }
.pdp-section { padding: 20px; padding-top: 32px; padding-bottom: 32px; }
.pdp-section__title { font-size: 18px; font-weight: 700; color: #1D2229; margin-bottom: 16px; letter-spacing: -0.02em; }
</style>
</head>
<body>
${result.html}
</body>
</html>`;

    res.json({ success: true, html: fullHtml, renderedBlocks: result.renderedBlocks, skippedBlocks: result.skippedBlocks });
  } catch (err) {
    next(err);
  }
});

// ─── 에러 핸들러 ─────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[server] 에러:', err);

  // Anthropic API 에러
  if (err.status && err.type) {
    return res.status(502).json({
      error: 'AI_API_ERROR',
      message: `AI 서비스 에러: ${err.message}`,
      detail: err.type,
    });
  }

  // 추출 실패
  if (err.code === 'EXTRACT_FAILED') {
    return res.status(422).json({
      error: 'EXTRACT_FAILED',
      message: err.message,
      detail: err.detail || null,
    });
  }

  // 기타 서버 에러
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: '서버 내부 에러가 발생했습니다.',
  });
});

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT} 에서 실행 중`);
});
