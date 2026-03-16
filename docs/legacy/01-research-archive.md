# 리서치 아카이브

> 5개 에이전트 토론 결과 + 출처 정리 (2026.03.15)
> TF 발표 시 근거 자료로 활용

---

## 1. "콘텐츠 길이 ≠ CVR 상승" 근거

| 발견 | 수치 | 출처 |
|------|------|------|
| 요소 10개 미만 랜딩페이지가 40+ 대비 전환율 2배 | 2x CVR | [Envive AI](https://www.envive.ai/post/ecommerce-conversion-rate-statistics) |
| 79%의 사용자가 웹 콘텐츠를 읽지 않고 스캔 | 79% | [NNgroup](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/) |
| 페이지 텍스트의 약 25%만 실제로 읽힘 | 25% | [NNgroup](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/) |
| 정보량과 전환율은 역U자형 관계 | inverted U | [Frontiers in Neuroscience](https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2021.695852/full) |
| 정보 과부하 시 구매 후회 증가, 결정 만족도 하락 | — | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8567038/) |
| 최적 상품 설명 길이: 100-300 단어 | 100-300w | [Digital Applied](https://www.digitalapplied.com/blog/product-page-optimization-ecommerce-conversion-guide-2026) |
| 소비자 주의 집중 시간: 8.25초, 모바일 소셜: 1.7초 | 8.25s / 1.7s | [Retail Dive](https://www.retaildive.com/ex/mobilecommercedaily/goldfish-sized-attention-spans-the-marketers-new-challenge) |

---

## 2. 진짜 CVR 레버 (영향도 순)

> **출처 신뢰도 주의**: 아래 수치 중 벤더 자사 마케팅 데이터(★ 표시)가 포함되어 있다. 이들은 자사 제품 판매를 위한 자료이며, 도메인도 이커머스 전반이지 T&A OTA 특화가 아니다. **방향성 근거로만 활용**하고, 구체적 수치는 MRT 자체 A/B 테스트로 검증한다.

| 레버 | 영향 | 출처 | 출처 유형 | MRT 적용 가능성 |
|------|------|------|:---:|:---:|
| 리뷰/UGC 有 vs 無 | +354% CVR | [PowerReviews](https://www.powerreviews.com/how-ugc-impacts-conversion-2023/) | ★ 벤더 | **높음** — MRT 리뷰 데이터 존재. 현재 PDP 노출 방식 개선 필요 |
| UGC 인터랙션 시 | +103.9% CVR | [PowerReviews](https://www.powerreviews.com/how-ugc-impacts-conversion-2023/) | ★ 벤더 | **중간** — UGC 갤러리 신규 개발 필요 |
| UGC를 상품 페이지에 표시 | +166% CVR | [WiserNotify](https://wisernotify.com/blog/social-proof-statistics/) | ★ 벤더 | **중간** — 이커머스 전반 데이터. T&A 특성상 UGC 수집률이 일반 이커머스보다 낮을 수 있음 |
| 리뷰 별점 ATF 배치 | +153.1% CVR | [PowerReviews](https://www.powerreviews.com/how-ugc-impacts-conversion-2023/) | ★ 벤더 | **높음** — 위치 이동만으로 구현 가능. Quick Win |
| 페이지 로드 0.1초 개선 (여행) | +10.1% CVR | [NitroPack/Google](https://nitropack.io/blog/how-page-speed-affects-conversion/) | 업계 리포트 | **높음** — 여행 업계 특화 수치. MRT 현재 PDP 로딩 속도 측정 후 베이스라인 확보 필요 |
| 소셜 프루프 위젯 | +18% CVR, RPV +2.3% | [WiserNotify](https://wisernotify.com/blog/social-proof-statistics/) | ★ 벤더 | **중간** — 실시간 예약 데이터 파이프라인 구축 필요 |
| Trust Signal 추가 | +20% CVR | [Eklipse Creative](https://eklipsecreative.com/blog/how-trust-signals-improve-product-page-conversions/) | 에이전시 | **높음** — trustBadges 블록으로 즉시 적용 가능 |
| 체크아웃 UX 개선 | +35% CVR | [Baymard](https://baymard.com/blog/current-state-of-checkout-ux) | 독립 리서치 | **낮음** — PDP TF 범위 밖. 참고 지표로만 활용 |
| 고객 서비스 보증 모바일 표시 | +15% 모바일 예약 | [VWO](https://vwo.com/blog/increase-travel-website-bookings/) | A/B 테스트 플랫폼 | **높음** — 여행 업계 대상 실험. CTA 옆 trustText로 적용 가능 |
| CTA "Book Now" → "Check Availability" | 전환 4배 | TicketingHub | ★ 벤더 | **높음** — 투어/티켓 업계 사례. 텍스트 변경만으로 Quick Win. MRT 현재 CTA CVR 베이스라인 측정 필요 |

> **TF 발표 시 프레이밍**: 외부 벤치마크는 "이 방향이 맞다는 방향성 근거"로만 활용. 구체적 수치 약속은 하지 않으며, **"MRT 자체 A/B 테스트로 검증한다"**를 핵심 메시지로.

---

## 3. 사용자 행동 데이터

| 발견 | 수치 | 출처 |
|------|------|------|
| 이커머스 평균 스크롤 깊이 | 60-70% | [Real Agency](https://www.realagency.co.uk/blogs/insights/how-scroll-depth-affects-ecommerce-conversion-rates) |
| 50% 지점에서 절반 이탈 | 50% | [Hotjar](https://www.hotjar.com/blog/scroll-maps/) |
| 페이지 하단 CTA를 보는 비율 | 30% | [Fullstory](https://www.fullstory.com/blog/scroll-maps/) |
| 주의력의 ATF 집중도 | 57-80% | [CXL](https://cxl.com/blog/above-the-fold/) |
| 여행자 예약 전 리뷰 확인률 | 81% | [HotelSpeak](https://www.hotelspeak.com/2019/03/how-social-proof-influences-the-travel-booking-cycle/) |
| UGC를 브랜드 사진보다 신뢰하는 비율 | 60% vs 23% | [Skeepers](https://skeepers.io/en/blog/how-players-travel-tourism-industry-leveraging-user-generated-content-increase-booking/) |
| 여행 업계 장바구니 이탈률 | 80%+ | [Diggintravel](https://diggintravel.com/travel-booking-funnel-analytics/) |
| 이탈 원인 1위: 추가 비용 | 48% | [Baymard](https://baymard.com/blog/ecommerce-checkout-usability-report-and-benchmark) |
| 이탈 원인 2위: 둘러보는 중 | 43% | [Baymard](https://baymard.com/blog/ecommerce-checkout-usability-report-and-benchmark) |
| OTA 예약 이탈률 | 93.96% | [Paysafe](https://www.paysafe.com/en/resource-center/how-payment-friction-kills-travel-conversions/) |
| 여행 업계 평균 전환율 | 0.2-4% | [Unbounce](https://unbounce.com/conversion-benchmark-report/travel-hospitality-conversion-rate/) |

---

## 4. 경쟁사 2025-2026 주요 업데이트

### GetYourGuide
| 시기 | 업데이트 | 출처 |
|------|---------|------|
| 2025 Spring | AI Content Creator (공급자용 콘텐츠 자동생성) | [GYG Supply](https://www.getyourguide.supply/spring2025) |
| 2025 Spring | AI 리뷰 요약 (여행자 대상) | [GYG Supply](https://www.getyourguide.supply/spring2025) |
| 2025 Fall | AI Reply Optimizer (파트너 리뷰 답변 도우미) | [PhocusWire](https://www.phocuswire.com/getyourguide-experiences-ai-features-fall-product-release) |
| 2025 Fall | 60%+ 파트너 AI 도구 활용 | [GYG Press](https://www.getyourguide.press/blog/getyourguide-announces-unlocked-fall-2025-product-release) |
| — | A/B 테스트 인프라 스케일업 | [GYG Careers](https://www.getyourguide.careers/posts/how-we-scaled-up-a-b-testing-at-getyourguide) |

### Airbnb Experiences
| 시기 | 업데이트 | 출처 |
|------|---------|------|
| 2025.10 | "Who's Going" 소셜 기능 | [Airbnb News](https://news.airbnb.com/introducing-social-features-for-airbnb-experiences/) |
| 2025 Summer | "Lava" 3D 디자인 포맷 | [Airbnb News](https://news.airbnb.com/airbnb-2025-summer-release/) |
| 2025 Summer | 스큐어모피즘 UI 회귀 | [It's Nice That](https://www.itsnicethat.com/articles/airbnb-app-redesign-140525) |

### Viator
| 시기 | 업데이트 | 출처 |
|------|---------|------|
| 2025 | Good/Excellent 상품 품질 기준 도입 | [Arival](https://arival.travel/article/viator-plans-new-product-standards/) |
| 2025 | Reserve Now Pay Later | [Viator Partner](https://partnerresources.viator.com/blog/reservenowpaylater/) |

### Klook
| 시기 | 업데이트 | 출처 |
|------|---------|------|
| 2025 | AI 음성인식 리뷰 작성 도구 (75.4% 제출률) | [PRNewswire](https://www.prnewswire.com/apac/news-releases/klooks-study-of-374-000-reviews-finds-that-lesser-known-cities-create-deeper-emotional-connection-with-travelers-302665163.html) |

### Booking.com
| 시기 | 업데이트 | 출처 |
|------|---------|------|
| 2025 | OpenAI 협업 AI Trip Planner | [OpenAI](https://openai.com/index/booking-com/) |
| — | Social Proof + Urgency로 80% 매출이익 증가 | [Octalysis](https://octalysisgroup.com/booking-com-conversion-science/) |

---

## 5. 마이리얼트립 Gap Analysis

### 경쟁사 전사 보유, 마이리얼트립 미보유

| Gap | 보유 경쟁사 | 영향도 |
|-----|-----------|:---:|
| 하이라이트 섹션 | GYG, Klook, Viator, Traveloka, Airbnb | 높음 |
| 저압박 CTA ("Check Availability") | GYG, Viator | 높음 |
| 무료취소 상단 배치 | GYG, Viator | 높음 |
| Best Price Guarantee | GYG, Klook, Traveloka | 중~높음 |
| AI 리뷰 요약 | GYG | 중간 |
| 여행자 사진 전용 섹션 | Viator, Traveloka | 중간 |
| 여행자 유형별 리뷰 필터 | GYG | 중간 |
| 커뮤니티형 Q&A | Viator | 중간 |
| Reserve Now Pay Later | Viator, Airbnb | 중간 |
| 소셜 기능 (Who's Going) | Airbnb | 낮음 (혁신적이나 적용 범위 제한) |

---

## 6. 업계 트렌드 키워드

| 트렌드 | 설명 | 출처 |
|--------|------|------|
| Intent-Based Personalization | 같은 URL이라도 사용자 의도에 따라 다른 정보 우선순위 | [Voyado](https://voyado.com/resources/blog/turning-shopper-intent-into-personalized-experiences/), [Adobe Summit 2025](https://business.adobe.com/summit/2025/sessions/beyond-personalization-creating-intentbased-exp-s335.html) |
| Content Intelligence | 콘텐츠 "생성"이 아닌 콘텐츠 "진단/판단" | [Content Science Review](https://review.content-science.com/what-is-content-intelligence/) |
| Messy Middle | 탐색↔평가 반복, 6가지 인지 편향 | [Google](https://www.thinkwithgoogle.com/consumer-insights/consumer-journey/navigating-purchase-behavior-and-decision-making/) |
| Per-Segment Media Sequencing | 세그먼트별 블록 순서 최적화 | [MerchMetric](https://www.merchmetric.com/blog/the-next-generation-of-pdp-optimization/) |
| Personalization Fatigue | 67% 소비자가 데이터 사용을 이해 못함 | [MDPI](https://www.mdpi.com/2071-1050/18/2/1073) |
| Discovery ≠ Booking | 탐색과 예약은 근본적으로 다른 모드 | [Hospitality.today](https://www.hospitality.today/article/discovery-and-booking-are-fundamentally-different-in-travel) |

---

## 7. 에이전트 토론 요약 (5명)

| 에이전트 | 도구 사용 | 핵심 결론 |
|---------|:---:|----------|
| Devil's Advocate | 23회 | "3명 다 같은 질문에 답하고 있다. 질문 자체를 바꿔라" |
| CRO 전문가 | 20회 | "콘텐츠 길이≠CVR. 진짜 레버는 리뷰/UGC, 속도, 신뢰" |
| 사용자 여정 리서처 | 18회 | "사용자는 긴 설명을 원하지 않는다. 5가지 질문에 답을 찾는다" |
| 경쟁사 분석가 | 66회 | "MRT에 하이라이트, 저압박 CTA, 무료취소 상단 배치가 없다" |
| 프로덕트 전략가 | 18회 | "Conversion Architect + Content Intelligence로 리포지셔닝" |
| **총계** | **145회** | |
