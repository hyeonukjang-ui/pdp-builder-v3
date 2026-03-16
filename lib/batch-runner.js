/**
 * 배치 처리 — 여러 상품 URL을 일괄 처리
 *
 * 추출 → Health Score → (선택) AI 생성 → 품질 검수 파이프라인을 여러 URL에 대해 실행.
 * 참조: docs/phases/phase-5.md
 */

import { extractProductData } from './extractor.js';
import { generateBlockCopy } from './generator.js';
import { calculateHealthScore } from './health-scorer.js';
import { checkQuality } from './quality-checker.js';

const DEFAULT_OPTIONS = {
  generateCopy: false,    // AI 카피 생성 여부 (비용 발생)
  concurrency: 3,         // 동시 처리 수
  retryCount: 2,          // 실패 시 재시도 횟수
  retryDelay: 2000,       // 재시도 대기 (ms)
};

/**
 * 여러 URL을 일괄 처리한다.
 *
 * @param {string[]} urls - MRT 상품 URL 배열
 * @param {object} options - 옵션
 * @returns {{ summary: object, results: Array<object> }}
 */
export async function runBatch(urls, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  const results = [];

  // 동시 처리 제한을 위한 세마포어
  const chunks = chunkArray(urls, opts.concurrency);

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map((url) => processOne(url, opts)),
    );
    results.push(...chunkResults);
  }

  const elapsed = Date.now() - startTime;

  // 요약 통계
  const summary = buildSummary(results, elapsed, opts);

  return { success: true, summary, results };
}

/**
 * 단일 URL을 처리한다.
 */
async function processOne(url, opts) {
  const result = {
    url,
    status: 'pending',
    extractMethod: null,
    category: null,
    title: null,
    healthScore: null,
    grade: null,
    missingBlocks: null,
    generation: null,
    qualityCheck: null,
    error: null,
  };

  // 1. 추출
  try {
    const extracted = await retryAsync(
      () => extractProductData(url),
      opts.retryCount,
      opts.retryDelay,
    );

    result.extractMethod = extracted.extractMethod;
    result.category = extracted.suggestedCategory;
    result.title = extracted.rawData.title;
    result.rawData = extracted.rawData;

    // 2. Health Score 산출
    const health = calculateHealthScore(extracted.rawData, extracted.suggestedCategory);
    result.healthScore = health.score;
    result.grade = health.grade;
    result.missingBlocks = health.missing;

    // 3. AI 카피 생성 (옵션)
    if (opts.generateCopy) {
      try {
        const generated = await retryAsync(
          () => generateBlockCopy({
            rawData: extracted.rawData,
            category: extracted.suggestedCategory,
          }),
          opts.retryCount,
          opts.retryDelay,
        );

        result.generation = {
          success: true,
          blockCount: Object.keys(generated.productData?.blocks || {}).length,
          usage: generated.usage,
        };

        // 4. 품질 검수
        if (generated.productData?.blocks) {
          const qa = checkQuality(
            generated.productData.blocks,
            extracted.rawData,
            extracted.suggestedCategory,
          );
          result.qualityCheck = {
            pass: qa.pass,
            score: qa.score,
            failedChecks: qa.checks.filter((c) => !c.pass).length,
          };
        }

        result.productData = generated.productData;
      } catch (genErr) {
        result.generation = {
          success: false,
          error: genErr.message,
        };
      }
    }

    result.status = 'success';
  } catch (err) {
    result.status = 'error';
    result.error = err.message;
  }

  // rawData는 결과에서 제거 (용량 절약)
  delete result.rawData;
  if (!opts.generateCopy) delete result.productData;

  return result;
}

/**
 * 재시도 래퍼
 */
async function retryAsync(fn, retries, delay) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries) {
        await sleep(delay * (i + 1)); // 지수적 증가
      }
    }
  }
  throw lastErr;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * 배치 결과 요약 통계
 */
function buildSummary(results, elapsed, opts) {
  const total = results.length;
  const success = results.filter((r) => r.status === 'success').length;
  const errors = results.filter((r) => r.status === 'error').length;

  // Grade 분포
  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0 };
  for (const r of results) {
    if (r.grade) gradeDistribution[r.grade]++;
  }

  // Health Score 통계
  const scores = results.filter((r) => r.healthScore != null).map((r) => r.healthScore);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  // AI 생성 통계
  let generationStats = null;
  if (opts.generateCopy) {
    const generated = results.filter((r) => r.generation?.success);
    const qaPassed = results.filter((r) => r.qualityCheck?.pass);
    const totalCost = generated.reduce(
      (sum, r) => sum + (parseFloat(r.generation?.usage?.estimatedCost) || 0),
      0,
    );

    generationStats = {
      generated: generated.length,
      qaPassed: qaPassed.length,
      qaFailed: generated.length - qaPassed.length,
      totalCost: Math.round(totalCost * 10000) / 10000,
    };
  }

  return {
    total,
    success,
    errors,
    elapsedMs: elapsed,
    avgHealthScore: avgScore,
    gradeDistribution,
    generationStats,
  };
}
