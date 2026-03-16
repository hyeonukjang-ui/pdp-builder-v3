# 상품소개 자동 생성 도구 — 구현 계획

## 목적
MRT T&A 상품 중 "상품소개" 섹션이 비어있는 상품에 AI로 이미지+카피를 생성하는 도구.

## 현재 상태
- URL → 데이터 추출 → Claude 카피 생성 → 블록 프리뷰 → HTML 내보내기 (완료)
- AI 이미지 생성 (미구현)
- 빌더(편집) 기능 (미구현)
- 상품소개 포맷 내보내기 (미구현)

## Phase A: AI 이미지 생성 파이프라인
- `lib/image-generator.js` — Claude 프롬프트 생성 → DALL-E 3 이미지 생성
- `POST /api/generate-images` 엔드포인트
- 기존 이미지 3장 이상이면 AI 생성 스킵

## Phase B: 빌더(편집) 기능
- `public/builder.js` + `public/builder.css`
- 블록 on/off, 순서 변경, 인라인 텍스트 편집, 이미지 교체

## Phase C: 상품소개 내보내기
- 인라인 CSS HTML 패키지 (CMS 붙여넣기용)
- JSON 스냅샷 저장/불러오기

## 기존 docs/
`docs/legacy/`로 이동 (방향 변경으로 인해 아카이브)
