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
    const { rawData, category } = req.body;

    if (!rawData) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'rawData 필드가 필요합니다.',
      });
    }

    const result = await generateIntroBlocks({
      rawData,
      category: category || 'TOUR',
      recipe: req.body.recipe || null,
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
