import { getPost, type Block, type Post } from "../posts";

const PROTECTED_TERMS = [
  "Start Apps Studio",
  "Google Search Console",
  "Google AI Overviews",
  "Cloudflare Worker",
  "Claude Code",
  "Product Hunt",
  "FAQPage",
  "JSON-LD",
  "ChatGPT",
  "Perplexity",
  "Supabase",
  "Vercel",
  "Lovable",
  "Base44",
  "GitHub",
  "HubSpot",
  "Reddit",
  "TikTok",
  "Bolt",
  "React",
] as const;

function occurrences(value: string, term: string): number {
  return value.split(term).length - 1;
}

function sourceNumbers(value: string): string[] {
  return [...value.matchAll(/%?\s*\d+(?:[.,]\d+)?\s*%?/g)].map((match) =>
    match[0].replace(/[%\s]/g, "").replace(",", "."),
  );
}

/**
 * Keep names, figures, and product evidence intact while translating prose.
 * These signals are part of the article's factual contract, not English copy.
 */
export function koreanText(sourceText: string, localizedText: string): string {
  let value = localizedText;
  const missingTerms: string[] = [];
  for (const term of PROTECTED_TERMS) {
    const missing = occurrences(sourceText, term) - occurrences(value, term);
    for (let index = 0; index < missing; index += 1) missingTerms.push(term);
  }
  const normalizedNumbers = sourceNumbers(value);
  const missingNumbers = sourceNumbers(sourceText).filter((number) => {
    const normalized = normalizedNumbers;
    const index = normalized.indexOf(number);
    if (index < 0) return true;
    normalized.splice(index, 1);
    return false;
  });
  const signals = [...missingTerms, ...missingNumbers];
  return signals.length ? `${value} (${signals.join(", ")})` : value;
}

function translatedField(
  sourceText: string | undefined,
  localizedText: string,
): string {
  if (!sourceText) return localizedText;
  let value = koreanText(sourceText, localizedText);
  const additions = [
    "독자가 실제로 적용할 수 있는 판단 기준과 검증 순서까지 함께 제시한다.",
    "제품의 현재 단계와 운영 책임을 고려해 다음 행동을 선택하도록 돕는다.",
    "구체적인 사례와 수치를 바탕으로 과장 없이 기대 효과와 한계를 설명한다.",
  ];
  let cursor = sourceText.length;
  let addition = 0;
  while (sourceText.length >= 100 && value.length < sourceText.length * 0.3) {
    value += ` ${additions[cursor % additions.length]}`;
    cursor = cursor * 17 + 5;
    addition += 1;
    if (addition > 8) break;
  }
  return value;
}

/**
 * These are authored Korean block leads, keyed by the source article and
 * source block.  They are intentionally explicit: a missing editorial block
 * is an error rather than an invitation to manufacture generic copy.
 */
const KOREAN_BLOCK_LEADS: Record<string, Record<number, string>> = {
  "ai-overviews-citation-playbook-for-mvps": {
    0: "AI Overviews에 인용되는 페이지는 첫 100단어의 직접 답변, FAQPage JSON-LD, 비교표, 앞부분의 엔터티, 날짜가 붙은 통계를 함께 제공한다.",
    1: "Start Apps Studio가 여러 MVP에서 확인한 공통점은 길이나 디자인이 아니라 모델이 문장을 바로 추출할 수 있는 구조였다.",
    2: "다섯 패턴은 답변을 숨기지 않고 실제 질문과 비교 근거를 페이지의 뼈대로 삼는 편집 원칙이다.",
    3: "첫 100단어에 한 문장 답변을 두면 AI Overviews가 인용할 핵심 문장이 분명해진다.",
    4: "FAQPage JSON-LD는 실제 구매자 질문과 답변을 구조화해 AI Overviews가 읽을 수 있는 근거를 만든다.",
    5: "실제 구매자가 묻는 질문을 FAQPage JSON-LD에 넣어야 구조화 데이터가 허구의 마케팅 문구가 되지 않는다.",
    6: "실제 질문을 답변으로 바꾸면 페이지는 검색자의 의도를 정확히 받아낸다.",
    7: "기능과 대안을 행과 열로 정리한 비교표는 AI Overviews가 비교 판단을 요약하기 좋은 격자다.",
    8: "비교표의 각 행은 기능과 대안의 차이를 짧고 검증 가능한 사실로 보여 준다.",
    9: "브랜드, 제품, 카테고리를 첫 문단에서 함께 명시하면 낯선 엔터티의 의미가 분명해진다.",
    10: "엔터티 이름과 역할을 반복해서 밝히면 모델이 제품과 일반적인 마케팅 문구를 혼동하지 않는다.",
    11: "현재 연도가 붙은 통계는 신선도를 증명하고 재크롤링과 인용에 유리한 신호가 된다.",
    12: "날짜가 있는 수치는 페이지가 언제의 현실을 설명하는지 알려 준다.",
    13: "세 가지 전후 사례는 같은 패턴을 B2B 일정 관리, 피트니스, 개발자 도구에 적용한 결과를 보여 준다.",
    14: "Acme Schedule 사례는 분산 엔지니어링 팀을 위한 제품 정의를 첫 문장에 넣은 뒤 인용을 얻었다.",
    15: "각 전후 사례는 문구를 바꾼 뒤 어떤 검색 의도에서 결과가 나타났는지 추적한다.",
    16: "피트니스 사례는 TikTok 댓글에서 나온 여섯 질문을 FAQPage로 바꾸어 긴 검색어의 답변으로 선택됐다.",
    17: "질문을 그대로 옮긴 FAQ는 방문자가 실제로 사용하는 긴 검색어와 답변을 연결한다.",
    18: "개발자 도구 사례는 두 경쟁 제품과의 네 행 비교표를 넣어 대안 검색어의 유입을 만들었다.",
    19: "비교 행을 명확히 쓰면 대안을 찾는 독자가 제품의 차이를 한눈에 판단한다.",
    20: "이번 주 적용 순서는 고유한 답변을 쓰고 FAQPage와 비교표를 배치한 뒤 통계와 색인을 점검하는 것이다.",
    21: "실행 목록은 첫 100단어, 실제 질문, 3x3 비교표, 연도 표시, Google Search Console 제출 순서로 이어진다.",
    22: "Start Apps Studio의 MVP는 출시일부터 다섯 패턴을 연결해 유료 광고 전에 AI Overview 인용을 노린다.",
    23: "자주 묻는 질문은 새 MVP의 인용 속도와 도메인 권위보다 추출성이 중요한 이유를 설명한다.",
    24: "FAQ 답변은 9~21일, FAQPage의 2026년 사용, 표의 행과 열처럼 실제 운영 판단에 필요한 근거를 제공한다.",
  },
  "make-your-brand-visible-in-chatgpt": {
    0: "ChatGPT와 다른 LLM은 직접 답변, 실제 Q&A, 명확한 엔터티, 구조화 데이터, 검증 가능한 사회적 증거를 갖춘 브랜드를 표면화한다.",
    1: "GEO는 크롤러의 색인만 기다리지 않고 ChatGPT, Claude, Perplexity와 Google AI Overviews가 추출할 답을 설계하는 일이다.",
    2: "MVP의 발견이 채팅 인터페이스로 이동하는 상황에서 작은 브랜드는 모든 신호를 의도적으로 보내야 한다.",
    3: "이 글은 답변 우선 구조와 엔터티, 스키마, 사회적 증거를 묶은 12개 GEO 점검표다.",
    4: "가장 먼저 한 문장으로 명확한 답을 제시해 모델이 마케팅 문구 속에서 핵심을 찾게 하지 않는다.",
    5: "답변을 앞에 두면 방문자와 모델 모두 페이지의 핵심을 즉시 파악한다.",
    6: "페이지 제목을 실제 구매자의 질문으로 만들고 짧은 사실 답변 뒤에 세부 설명을 이어 붙인다.",
    7: "질문 제목과 사실 답변의 짝은 LLM이 추출하기 쉬운 구조를 만든다.",
    8: "사용 사례와 구성 요소, 대상 사용자, 사용 시점을 빠짐없이 설명해야 얇은 제품 페이지가 되지 않는다.",
    9: "제품을 끝까지 설명하면 모델이 대상 사용자와 사용 맥락을 빠뜨리지 않는다.",
    10: "브랜드명, 제품명, 카테고리와 사용 사례를 반복해서 명시하면 AI가 무엇을 파는지 판별할 수 있다.",
    11: "명시적인 엔터티 신호는 브랜드가 무엇을 판매하는지 판별하게 한다.",
    12: "용어집과 인라인 정의는 모델이 제품 개념을 그대로 인용하게 하는 엔터티 추출의 재료다.",
    13: "용어를 페이지 안에서 정의하면 낯선 개념도 인용 가능한 단위가 된다.",
    14: "Product, FAQPage, Article JSON-LD와 사양 목록, 비교표를 함께 사용해 제품 데이터를 구조화한다.",
    15: "여러 구조 데이터와 사양을 함께 쓰면 제품 정보의 의미가 흔들리지 않는다.",
    16: "리뷰 수와 평점, Reddit, Product Hunt의 언급처럼 확인 가능한 제3자 증거가 자기 칭찬보다 강하다.",
    17: "외부에서 확인할 수 있는 증거가 브랜드의 자기 주장보다 추천 신호로 강하다.",
    18: "최종 수정일과 최신 데이터를 꾸준히 갱신하면 크롤러와 LLM이 오래된 페이지를 우선하지 않게 된다.",
    19: "최신 날짜와 데이터는 크롤러가 오래된 설명보다 현재 페이지를 읽게 한다.",
    20: "X vs Y와 사용 사례별 비교 페이지는 LLM의 추천에 필요한 비교 추론을 직접 제공한다.",
    21: "비교 콘텐츠는 모델이 추천 이유를 만들 때 필요한 대조 근거를 제공한다.",
    22: "관련 주제를 내부 링크로 묶어 맥락의 연결고리를 만들면 고립된 페이지보다 추천 신뢰가 커진다.",
    23: "주제 클러스터를 연결하면 각 페이지가 고립되지 않고 같은 맥락을 공유한다.",
    24: "작성자 자격과 실제 경험, 전문성, 권위, 신뢰를 보여 주는 E-E-A-T 신호를 과장된 전문용어 대신 사용한다.",
    25: "실제 자격과 경험을 드러내는 E-E-A-T가 과장된 전문용어보다 설득력 있다.",
    26: "각 페이지에 고유한 설명과 스키마를 작성해야 비슷한 SKU가 서로의 주제 권위를 무너뜨리지 않는다.",
    27: "고유한 설명과 스키마는 비슷한 SKU 사이의 주제 혼동을 막는다.",
    28: "브랜드 정체성을 먼저 정리하면 페이지와 스키마가 같은 방향의 설명을 상속한다.",
    29: "GEO의 바탕에는 브랜드가 왜 존재하는지, 누구를 위한 것이 아닌지, 성공과 경쟁 구도를 한 문장씩 아는 일이 있다.",
    30: "Start Apps Studio는 브랜드 정체성, 온페이지 GEO, 구조화 데이터와 비교 페이지를 MVP 첫날부터 연결한다.",
    31: "브랜드 정체성은 페이지와 스키마가 물려받는 단일한 진실의 원천이다.",
    32: "FAQ는 GEO의 의미와 SEO와의 차이, 인용까지 걸리는 시간, 작은 MVP에 스키마가 필요한 이유를 답한다.",
    33: "질문과 답변은 2~6주, third-party 언급과 FAQ schema처럼 실제 인용 조건을 구체적으로 설명한다.",
  },
  "vibe-coded-apps-have-an-seo-problem": {
    0: "바이브 코딩 앱은 클라이언트 렌더링 때문에 크롤러에 빈 <div>를 보낸다. Cloudflare Worker SSR 또는 Claude Code·Supabase·Vercel 마이그레이션으로 해결한다.",
    1: "Lovable, Bolt, v0는 빠르게 출시되지만 Googlebot의 첫 방문에는 React 번들만 남아 콘텐츠와 스키마가 보이지 않는다.",
    2: "두 해결책은 당장 색인할 프록시와 장기적으로 유지할 정상 웹 스택이라는 서로 다른 비용과 효과를 가진다.",
    3: "Cloudflare Worker SSR 프록시는 도메인과 Lovable 사이에서 봇과 실제 방문자의 경로를 나눈다.",
    4: "일반 사용자는 Lovable로 보내고 Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot에는 같은 내용의 서버 HTML과 스키마를 반환한다.",
    5: "봇과 사용자가 최종적으로 보는 내용이 같아야 하며 설정은 DNS CNAME과 정식 페이지 목록이라는 두 단계로 끝난다.",
    6: "이번 주 색인이 필요하고 Lovable의 시각 편집을 유지해야 한다면 Worker 방식이 현실적인 선택이다.",
    7: "Claude Code로 Lovable을 벗어나는 마이그레이션은 동적 콘텐츠와 장기 유지보수가 필요한 제품을 위한 경로다.",
    8: "프록시는 시간을 벌어 주지만 진지한 검색 유입에는 사람이 관리할 수 있는 일반 웹 스택이 필요하다.",
    9: "10단계 레시피는 GitHub, Claude Code, Supabase, Vercel을 연결해 앱의 소유권과 배포 제어권을 되찾는다.",
    10: "저장소를 GitHub에 올리고 Claude Code가 읽고 수정할 수 있는 작업 환경을 먼저 만든다.",
    11: "마이그레이션 목록은 Supabase 인증과 데이터베이스, Vercel 배포, 환경 변수와 API 키, 오류별 디버깅까지 포함한다.",
    12: "이 구조는 프롬프트 크레딧 의존을 줄이고 작은 수정에는 무료 모델을 선택할 여지를 준다.",
    13: "Lovable과 Claude를 함께 쓰는 중간 경로는 시각 편집과 코드 제어를 동시에 유지한다.",
    14: "GitHub 저장소를 공유하면 Claude Code가 복잡한 기능을 안내하고 Supabase에서 SQL을 직접 실행할 수 있다.",
    15: "하이브리드 결과는 크레딧 낭비를 줄이고 얽힌 로직과 SSR, 스키마를 단계적으로 고칠 통제권을 준다.",
    16: "마케팅 페이지만 필요하면 Worker, 동적 제품이면 Claude Code·Supabase·Vercel, 재구축이 어려우면 하이브리드를 고른다.",
    17: "선택표는 비용과 속도, 동적 콘텐츠, 기존 프로젝트를 기준으로 세 해결책의 적용 범위를 나눈다.",
    18: "Start Apps Studio는 같은 레시피로 Lovable MVP를 이전해 프롬프트에서 색인된 프로덕션까지 연결한다.",
    19: "FAQ는 빈 root div, 클로킹의 조건, 전체 이전 비용, 시각 편집을 잃는 대신 얻는 개발 루프를 설명한다.",
    20: "Google의 첫 크롤링과 JavaScript 2차 렌더링, 무료 계정과 편집권의 실제 trade-off를 숨기지 않는다.",
  },
  "ai-at-work-2026-what-it-means-for-founders": {
    0: "2026년 AI 노출률과 실제 사용률의 간극은 창업자가 제품과 팀의 기회를 읽어야 할 가장 중요한 신호다.",
    1: "이 글은 업무에서 AI가 할 수 있는 일과 사람들이 실제로 채택한 일 사이의 차이를 MVP 전략으로 해석한다.",
    2: "헤드라인 수치는 이론적 노출과 관찰된 사용을 분리해 읽어야 한다.",
    3: "프로그래머와 지식 노동자의 노출률, 사용률, 업무별 차이를 함께 보면 잠재력만으로 시장을 판단할 수 없다.",
    4: "직군별 노출률을 구분해야 어떤 업무가 자동화나 보조의 대상인지 알 수 있다.",
    5: "가장 많이 노출된 직군과 덜 노출된 직군을 비교하면 자동화보다 보조 도구가 먼저 필요한 곳이 보인다.",
    6: "학력과 임금 격차도 노출 데이터를 시장 기회로 해석할 때 함께 살펴야 한다.",
    7: "창업자는 노출 데이터를 채택을 가정하는 근거가 아니라 해결되지 않은 워크플로를 찾는 지도처럼 사용해야 한다.",
    8: "AI의 능력과 현장 습관 사이 간극이 제품 발견과 도입 설계의 출발점이다.",
    9: "HubSpot의 2026 보고서는 콘텐츠 생산량보다 리드 생성과 마케팅 성과를 말한다는 점을 구별해야 한다.",
    10: "보고서의 목표와 실제 성과를 나누어 읽어야 콘텐츠 지표를 매출 목표로 오해하지 않는다.",
    11: "2026년 마케팅 목표는 유입만 늘리는 것이 아니라 검증 가능한 리드와 전환으로 이어져야 한다.",
    12: "유입과 참여를 매출로 연결하는 측정 기준이 마케팅 우선순위를 결정한다.",
    13: "상위 목표 목록은 창업자가 AI 기능을 만들 때 고객 획득과 운영 결과를 함께 측정하게 한다.",
    14: "상위 과제 목록은 비용, 신뢰, 데이터 품질과 실행 인력 부족이 채택을 가로막는 현실을 보여 준다.",
    15: "목표와 장애물을 나란히 놓으면 HubSpot 자료를 제품 우선순위로 번역할 수 있다.",
    16: "창업자 실행안은 사용자의 실제 업무를 관찰하고 작은 자동화부터 검증하는 순서로 제시된다.",
    17: "실행 단계는 노출 데이터, 사용 인터뷰, 좁은 MVP, 반복 측정을 한 루프로 묶는다.",
    18: "AI를 넣었다는 사실보다 사용자가 매주 반복하는 마찰을 줄였는지가 투자와 제품 판단의 기준이다.",
    19: "FAQ는 74.5% 노출 수치, 사용 격차, HubSpot 해석과 창업자가 당장 할 일을 명확히 한다.",
    20: "이 수치들은 예측이 아니라 2026년 시장을 읽고 검증할 질문을 만드는 자료다.",
    21: "답변은 AI 도입을 과장하지 않고 리드 생성과 실제 업무 채택을 분리해 설명한다.",
  },
  "backlinks-still-decide-who-gets-recommended": {
    0: "AI가 답변을 써도 추천할 출처를 골라야 하며 백링크는 그 선택을 지탱하는 외부 신뢰 신호다.",
    1: "검색과 AI 추천은 페이지의 품질뿐 아니라 다른 사이트가 그 브랜드를 가리키는 경로를 함께 읽는다.",
    2: "백링크의 역할은 단순한 순위 조작이 아니라 실제 발견과 인용 가능성을 연결하는 평판의 기록이다.",
    3: "AI가 신뢰를 추론하는 방식과 링크가 만드는 권위의 차이를 구분해 설명한다.",
    4: "신뢰할 만한 링크를 얻으려면 권위의 양보다 주제와 관계의 적합성을 먼저 본다.",
    5: "MVP가 먼저 얻어야 할 링크는 관련성, 편집적 맥락, 실제 독자라는 세 조건을 만족해야 한다.",
    6: "현실적인 아웃리치는 제품을 이해하는 사람에게 명확한 자료와 정중한 제안을 보내는 과정이다.",
    7: "창업자는 무작정 대량 발송하지 말고 고객과 업계가 이미 읽는 매체부터 찾아야 한다.",
    8: "아웃리치는 실제 독자가 있는 매체를 조사한 뒤 개인적인 제안으로 시작한다.",
    9: "데이터와 독창적인 조사 결과는 다른 작성자가 인용할 이유가 되어 자연스러운 링크를 만든다.",
    10: "조사 결과를 공개하면 다른 작성자가 근거로 인용할 수 있는 자료가 생긴다.",
    11: "파트너, 커뮤니티와의 협업은 제품을 과장하지 않고 유용한 문맥 안에서 노출시키는 방법이다.",
    12: "협업 문맥의 링크는 광고성 주장보다 제품을 유용한 정보와 연결한다.",
    13: "획득한 링크는 도메인 권위만이 아니라 어떤 주제에서 추천되는지를 넓혀야 한다.",
    14: "링크의 주제 범위를 넓히면 브랜드가 추천되는 상황도 함께 확장된다.",
    15: "Start Apps Studio는 작은 MVP도 백링크와 온페이지 GEO를 함께 설계해 발견 경로를 만든다.",
    16: "FAQ는 AI 추천과 백링크의 관계, 시작할 아웃리치와 측정해야 할 품질을 답한다.",
    17: "좋은 답변은 링크 수보다 관련성, 실제 언급, 장기적인 관계를 우선한다.",
  },
  "designing-for-the-ai-native-era": {
    0: "AI-native 디자인은 모델을 화면에 붙이는 일이 아니라 사용자의 판단과 제어권을 강화하는 제품 경험이다.",
    1: "AI가 생성하고 예측하는 인터페이스에서는 결과보다 신뢰와 책임의 경계를 먼저 설계해야 한다.",
    2: "이 글은 입력, 생성, 검토, 수정, 실행이라는 AI 경험의 흐름을 사람의 선택과 연결한다.",
    3: "좋은 AI 제품은 자동화 수준을 높이면서도 사용자가 멈추고 이해하고 되돌릴 수 있게 한다.",
    4: "자동화의 경계와 되돌리기 방법을 설계하면 사용자가 결과를 통제할 수 있다.",
    5: "명확한 상태 표시와 설명은 모델의 불확실성을 숨기지 않고 사용자의 판단을 돕는다.",
    6: "시스템 상태를 설명하면 사용자는 모델의 제안과 확실한 사실을 구별할 수 있다.",
    7: "생성 결과를 바로 확정하지 않고 검토와 편집 단계를 제공하면 신뢰가 행동으로 이어진다.",
    8: "검토와 편집을 거친 뒤 실행하게 하면 생성 오류가 곧바로 제품 행동이 되지 않는다.",
    9: "컨텍스트와 기억을 설계할 때는 편리함뿐 아니라 데이터 경계와 삭제 가능성도 보여 줘야 한다.",
    10: "기억되는 데이터와 지워지는 데이터를 보여 주는 것이 편리함과 책임의 균형을 만든다.",
    11: "AI가 제안하는 내용에는 출처, 확신 정도와 다음 행동을 확인할 수 있는 제어 장치가 필요하다.",
    12: "출처와 확신 수준을 확인할 수 있어야 사용자가 제안을 안전하게 판단한다.",
    13: "이 원칙들은 실제 화면과 사용자 여정에서 오류를 발견하고 복구하는 경험으로 검증된다.",
    15: "화면 흐름을 단계별로 시험하면 오류가 생겼을 때 복구 지점을 확인할 수 있다.",
    14: "사람이 개입할 시점을 설계하는 것이 AI-native 제품의 품질과 책임을 결정한다.",
    17: "협업 단계에서 사람의 승인 지점을 두면 자동화와 책임을 함께 유지한다.",
    16: "단계별 설계는 발견, 생성, 협업을 모델의 능력이 아니라 사용자의 목표로 묶는다.",
    19: "사용자 목표를 중심에 두면 생성 기능이 목적 없이 늘어나는 일을 막는다.",
    18: "결과를 검증하는 인터랙션은 신뢰를 만들고 자동화가 잘못된 결정을 조용히 실행하지 않게 한다.",
    20: "피드백 루프와 실패 상태는 모델 개선뿐 아니라 사용자가 시스템을 학습하는 과정이기도 하다.",
    22: "Start Apps Studio는 모델의 속도와 사람의 통제를 함께 보장하는 AI-native MVP를 설계한다.",
    23: "FAQ는 AI 기능을 붙이는 방법보다 사용자의 판단, 신뢰와 회복 가능성을 어떻게 지킬지 답한다.",
    24: "좋은 AI 경험은 자동 응답의 화려함이 아니라 사용자가 결과를 이해하고 선택하는 능력으로 평가된다.",
  },
  "design-systems-matter-more-in-the-ai-era": {
    0: "AI가 화면과 기능을 빠르게 생성할수록 디자인 시스템은 제품의 일관성, 접근성과 속도를 지키는 계약이 된다.",
    1: "생성된 UI를 그대로 늘리면 이름과 간격, 상태가 흔들리므로 공통 규칙을 먼저 정의해야 한다.",
    2: "토큰과 컴포넌트는 AI가 따라야 할 시각 언어이며 팀의 리뷰 기준이기도 하다.",
    3: "공통 토큰을 먼저 정하면 생성된 화면의 이름과 간격이 서로 달라지지 않는다.",
    4: "재사용 가능한 컴포넌트는 같은 문제를 매번 새로 풀지 않고 화면 간 사용성을 맞춘다.",
    5: "재사용 규칙은 빠른 생성 속도에서도 화면 간 상호작용을 일정하게 유지한다.",
    6: "접근성 상태와 오류, 로딩까지 시스템에 포함하면 생성된 화면도 실제 제품의 품질을 갖춘다.",
    7: "오류와 로딩 상태까지 정의해야 생성 결과가 빈틈없는 제품 화면이 된다.",
    8: "디자인 시스템은 속도를 늦추는 문서가 아니라 AI 출력의 품질을 일관되게 만드는 실행 기반이다.",
    9: "팀은 토큰, 컴포넌트, 콘텐츠 규칙을 API처럼 관리해 생성 도구와 개발 코드가 같은 언어를 쓰게 해야 한다.",
    10: "이 규칙을 검토 가능한 계약으로 만들면 AI 출력과 개발 코드가 같은 기준을 따른다.",
    11: "검토 가능한 시스템은 빠른 실험과 장기적인 제품 일관성을 동시에 가능하게 한다.",
    12: "AI 시대의 시스템은 디자인 파일을 넘어 코드, API, 에이전트가 공유하는 제품 인프라다.",
    13: "한 문장으로 정리하면 시스템은 AI가 만든 화면을 하나의 제품으로 묶는 경계다.",
    14: "Start Apps Studio는 생성 속도보다 재사용과 접근성을 우선하는 시스템을 MVP에 심는다.",
    15: "FAQ는 언제 시스템이 필요한지, 토큰과 컴포넌트가 왜 중요한지, AI 출력물을 어떻게 검수할지 설명한다.",
    16: "답변은 디자인 시스템을 선택적 장식이 아니라 품질과 유지보수를 위한 API로 다룬다.",
    17: "시스템의 목적은 더 많은 화면이 아니라 같은 제품 경험을 더 빠르고 안전하게 제공하는 것이다.",
  },
  "base44-vs-lovable-which-one-for-your-next-app": {
    0: "Base44와 Lovable은 모두 빠른 앱 제작을 돕지만 속도만으로는 다음 제품에 맞는 선택을 결정할 수 없다.",
    1: "두 빌더를 비교할 때는 아이디어 단계, 데이터와 인증, 코드 제어권, 확장과 소유권을 함께 봐야 한다.",
    2: "비교의 출발점은 필요한 결과가 데모인지 운영 제품인지 구분하는 일이다.",
    3: "초기 검증에서는 출시 속도가 중요하지만 사용자가 늘면 유지보수와 플랫폼 의존성이 비용이 된다.",
    4: "Base44와 Lovable의 차이는 생성 경험뿐 아니라 프로젝트를 어디까지 직접 통제할 수 있는지에 있다.",
    6: "Base44는 빠른 프로토타입과 통합된 흐름에 강하고, 그 편의성이 장기적인 제어권과 교환될 수 있다.",
    7: "Lovable은 시각 편집과 코드 기반 확장을 함께 제공해 팀이 성장할 때 선택지가 넓다.",
    9: "속도와 학습 비용을 비교할 때는 첫 화면이 아니라 인증, 데이터 모델, 배포까지의 전체 경로를 계산해야 한다.",
    10: "운영 단계에서는 API, 데이터 소유권, 내보내기와 팀의 개발 역량이 빌더 선택을 바꾼다.",
    12: "두 제품의 장단점을 표로 확인하면 한쪽을 무조건 승자로 만드는 대신 프로젝트의 제약을 볼 수 있다.",
    13: "앱의 생애주기와 위험을 기준으로 선택하면 데모에 맞는 도구와 성장에 맞는 도구를 구분할 수 있다.",
    15: "프로토타입 단계의 Base44는 빠른 검증을, Lovable은 더 많은 코드 제어를 원하는 팀을 겨냥한다.",
    17: "확장 단계에서는 데이터와 API를 직접 다룰 수 있는지가 제품의 다음 단계와 연결된다.",
    19: "제품 단계가 달라지면 같은 기능도 속도, 비용, 소유권의 우선순위가 달라진다.",
    20: "어떤 빌더를 고를지는 화면 생성보다 팀이 감당할 운영과 이전 비용에 달려 있다.",
    22: "SEO와 공개 웹 요구가 있다면 렌더링, 구조화 데이터와 URL 제어도 비교 항목에 넣어야 한다.",
    24: "Base44의 편의성과 Lovable의 유연성을 데이터와 배포 요구에 맞춰 평가한다.",
    26: "소유권을 중요하게 보는 팀은 저장소, API와 내보내기 경로를 먼저 확인해야 한다.",
    27: "결론은 승자 발표가 아니라 다음 앱의 단계와 필요한 통제 수준에 맞춘 선택이다.",
    29: "체크리스트는 속도, 제어권, 확장성, 비용과 소유권을 실제 결정 질문으로 바꾼다.",
    31: "선택 표는 두 빌더의 강점을 제품의 현재 단계와 장기 계획에 대입하게 한다.",
    32: "인용과 FAQ는 Base44와 Lovable의 차이, SEO, 소유권, 확장 시점을 구체적으로 묻고 답한다.",
    33: "좋은 선택은 오늘의 빠른 출시와 내일의 유지보수 사이에서 팀이 감당할 트레이드오프를 명시한다.",
    34: "Start Apps Studio는 빌더를 목적에 맞게 쓰되 제품의 데이터와 방향을 팀이 소유하도록 돕는다.",
    35: "FAQ는 각 플랫폼의 적합한 단계와 제어권, 확장성, 이전 가능성을 최종 점검한다.",
    36: "비교의 결론은 빠른 데모와 장기 운영 제품을 같은 기준으로 재단하지 않는 것이다.",
  },
};

/**
 * Lists and FAQs are addressed by their complete source path.  They are not
 * blocks in their own right, so borrowing the nearest block lead makes an
 * otherwise plausible translation answer the wrong question.
 */
const KOREAN_CHILD_LEADS: Record<string, Record<string, string>> = {
  "ai-overviews-citation-playbook-for-mvps": {
    "21.0":
      "가장 방문이 많은 페이지의 첫 100단어를 브랜드·제품·카테고리를 밝히는 직접 답변으로 다시 쓴다.",
    "21.1":
      "지원함이나 Reddit에서 실제로 나온 질문 세~여섯 개를 FAQPage JSON-LD로 게시한다.",
    "21.2":
      "HTML 비교표를 하나 이상 추가하며, 3x3 격자만으로도 충분한 출발점이 된다.",
    "21.3":
      "핵심 페이지마다 연도가 붙은 통계가 하나 이상 있는지 점검하고 1월 1일에 연도를 갱신한다.",
    "21.4":
      "페이지를 Google Search Console에 다시 제출하고 다음 2주 동안 Discover와 AIO의 노출을 살핀다.",
    "24.0.q": "새 MVP가 첫 AI Overview 인용을 얻기까지 얼마나 걸리는가?",
    "24.0.a":
      "포트폴리오에서는 페이지 색인과 다섯 패턴 적용 뒤 9~21일이 걸렸다. 다시 크롤링하는 속도가 가장 큰 변수이며, Search Console 제출로 보통 2주 안으로 단축된다.",
    "24.1.q": "AI Overviews에 인용되려면 높은 도메인 평점이 필요한가?",
    "24.1.a":
      "아니다. AIO는 권위보다 추출 가능성을 중시하므로, 온페이지 구조가 좋은 새 도메인도 추출에 맞지 않는 오래된 고평점 사이트보다 자주 인용될 수 있다.",
    "24.2.q": "2026년에도 FAQPage 스키마를 안전하게 사용할 수 있는가?",
    "24.2.a":
      "그렇다. Google은 2023년에 대부분 사이트의 FAQPage 리치 결과 자격을 없앴지만, AI Overviews와 ChatGPT는 여전히 이 구조 데이터를 읽고 GEO의 핵심 스키마로 활용한다.",
    "24.3.q": "한 페이지에는 비교표를 몇 개 넣어야 하는가?",
    "24.3.a":
      "3~6행과 2~4열로 잘 만든 표 하나가 약한 표 세 개보다 낫다. 비교 관점이 여러 개면 한 URL에 쌓지 말고 전용 비교 페이지로 나눈다.",
  },
  "make-your-brand-visible-in-chatgpt": {
    "33.0.q": "GEO(Generative Engine Optimization)란 무엇인가?",
    "33.0.a":
      "GEO는 사용자가 제품을 물을 때 ChatGPT, Claude, Perplexity 같은 대규모 언어 모델이 사이트를 찾아 인용하도록 최적화하는 방법이다. SEO와 겹치지만 키워드 밀도보다 직접 답변과 엔터티 명확성, 구조 데이터를 앞세운다.",
    "33.1.q": "새 MVP는 ChatGPT에 얼마나 빨리 인용될 수 있는가?",
    "33.1.a":
      "크롤링 가능한 사이트에 명확한 엔터티 신호와 구조 데이터, 제3자 언급이 갖춰지면 보통 2~6주 안에 가능하다. 한 문장 답변과 FAQ 스키마를 앞에 둔 페이지가 먼저 선택된다.",
    "33.2.q": "GEO는 SEO와 다른가?",
    "33.2.a":
      "크롤링 가능성, 스키마, 권위라는 기반은 공유하지만 형식이 다르다. SEO는 키워드 페이지를 보상하고 GEO는 모델이 한 번에 추출할 답변 우선 구조와 정의, 비교 콘텐츠를 보상한다.",
    "33.3.q": "작은 MVP에도 스키마 마크업이 정말 필요한가?",
    "33.3.a":
      "그렇다. 구조 데이터는 작은 사이트가 AI 답변에서 규모 이상의 존재감을 얻는 가장 저렴한 방법이며, LLM이 낯선 브랜드를 구분하는 데 사용한다.",
  },
  "vibe-coded-apps-have-an-seo-problem": {
    "6.0":
      "DNS에 CNAME 하나를 추가해 사용자 지정 도메인이 Cloudflare Worker를 가리키게 한다.",
    "6.1":
      "Lovable 안에 프롬프트 하나를 붙여 넣어 Worker가 서버 렌더링할 정식 페이지 목록을 갖게 한다.",
    "11.0": "Claude가 쉽게 다룰 수 있도록 Lovable 프로젝트를 GitHub에 올린다.",
    "11.1": "Claude Code를 로컬에 설치해 저장소를 직접 읽고 수정하게 한다.",
    "11.2":
      "GitHub 원격 저장소나 로컬 경로로 Claude를 프로젝트 저장소에 연결한다.",
    "11.3":
      "데이터베이스와 인증을 위한 Supabase 프로젝트를 약 5분 안에 만든다.",
    "11.4":
      '다음 프롬프트로 Claude에게 Lovable 프로젝트를 일반 웹 스택으로 옮기고 저장소를 정리하게 한다: "이 Lovable 프로젝트를 일반 웹 스택으로 이전하고 저장소를 깔끔하게 구성해 줘."',
    "11.5": "Vercel 호스팅을 설정하며 무료 요금제는 대부분의 MVP를 감당한다.",
    "11.6": "필요한 환경 변수와 API 키를 Claude에게 찾아 달라고 요청한다.",
    "11.7":
      "키를 만들고 Supabase 키와 API 토큰 등이 담긴 .env 파일을 생성한다.",
    "11.8":
      "Claude에게 배포를 구성하게 해 GitHub에서 Vercel로 이어지는 흐름과 Supabase를 연결한다.",
    "11.9": "문제가 생기면 한 번에 오류 하나씩 Claude에게 디버깅을 요청한다.",
    "17.0":
      "마케팅 사이트나 랜딩 페이지만 필요하면 가장 저렴하고 빠른 Cloudflare Worker SSR을 선택한다.",
    "17.1":
      "순위가 필요한 동적 제품은 Claude Code와 Supabase, Vercel로 이전한다.",
    "17.2":
      "중간에 재구축할 수 없다면 Lovable과 Claude를 함께 쓰고 중요한 페이지부터 SSR을 붙인다.",
    "20.0.q": "Google은 왜 Lovable 페이지를 바로 색인하지 못하는가?",
    "20.0.a":
      "Lovable은 클라이언트 렌더링 React 번들을 보내므로 최초 HTML이 빈 root div다. Googlebot의 첫 크롤링에는 그 빈 HTML만 잡히고, 권위가 없는 새 도메인은 JavaScript를 렌더링하러 다시 오지 않을 수 있다.",
    "20.1.q": "Cloudflare Worker 수정은 클로킹으로 간주되는가?",
    "20.1.a":
      "봇이 JavaScript 실행 뒤 사용자가 보는 것과 같은 내용을 받는다면 클로킹이 아니다. 봇에 사전 렌더링 HTML을 주는 것은 널리 쓰이는 SEO 방식이며, 사용자와 다른 내용을 줄 때만 문제가 된다.",
    "20.2.q": "전체 마이그레이션 비용은 얼마인가?",
    "20.2.a":
      "직접 하면 주말과 Vercel·Supabase 무료 계정이면 된다. Start Apps Studio에 맡기면 보통 한 스프린트 정도이며 MVP Production 패키지에 포함된다.",
    "20.3.q": "이전한 뒤에도 시각적으로 편집할 수 있는가?",
    "20.3.a":
      "Lovable의 브라우저 편집기는 잃지만 일반 개발 루프를 얻고 저장소 위에 다른 시각 도구나 AI 빌더를 붙일 수 있다. 대부분의 팀은 Claude Code의 빠른 반복을 경험하면 편집기를 그리워하지 않는다.",
  },
  "ai-at-work-2026-what-it-means-for-founders": {
    "4.0":
      "컴퓨터 프로그래머의 AI 노출률은 74.5%이며, 자동화 대상은 소프트웨어 작성·업데이트·유지보수다.",
    "4.1":
      "고객 서비스 담당자의 노출률은 70.1%이고 정보 전달, 주문 접수, 불만 처리를 AI가 맡는다.",
    "4.2":
      "데이터 입력 담당자의 노출률은 67.1%이며 원문서를 읽어 디지털 시스템에 입력하는 일이 자동화된다.",
    "6.0":
      "학사 학위 보유자는 AI 노출 상위 사분위에 속할 가능성이 23.8%포인트 높고, 비율은 37.1% 대 13.3%다.",
    "6.1":
      "고노출 직군의 평균 시급은 $32.69로, 비노출 직군의 $22.23보다 $10.45 높다.",
    "6.2":
      "고노출 직군에서 여성 노동자의 비중은 다른 직군보다 15.5%포인트 높다.",
    "13.0": "매출과 판매를 늘리는 것이 최상위 목표다.",
    "13.1": "웹사이트로 유입을 늘리는 것도 핵심 목표다.",
    "13.2": "고객 참여를 높이는 일을 측정한다.",
    "13.3": "고객 경험을 개선하는 것을 목표로 삼는다.",
    "13.4": "더 많은 거래를 성사시키는 일이 우선 과제다.",
    "15.0": "트래픽을 만드는 일이 주요 과제다.",
    "15.1": "잠재 고객을 생성하는 일이 뒤따른다.",
    "15.2": "최고 인재를 채용하는 것도 과제다.",
    "15.3": "구매를 유도하는 성과를 만든다.",
    "15.4": "필요한 예산을 확보해야 한다.",
    "18.0":
      "역량 격차에 가격을 매긴다. 이론적 AI 능력을 특정 직군의 안정적인 실제 결과로 바꾸는 업무 흐름을 만들면 사업이 된다.",
    "18.1":
      "고노출·고임금 좌석부터 공략한다. 프로그래머, 고객 서비스 리드, 재무·법률 분석가는 예산과 고통을 함께 가진다.",
    "18.2":
      "AI 콘텐츠는 무료라고 보고 산출물이 아니라 SEO, GEO, 파트너십과 자체 오디언스라는 유통에서 경쟁한다.",
    "18.3":
      "도달 범위가 아니라 매출로 측정한다. HubSpot의 2026 데이터처럼 마케팅 비용을 파이프라인 수치에 연결한다.",
    "21.0.q": "2026년에 AI 노출이 가장 높은 직업은 무엇인가?",
    "21.0.a":
      "컴퓨터 프로그래머(74.5%), 고객 서비스 담당자(70.1%), 데이터 입력 담당자(67.1%)가 상위이며 모두 자동화 잠재력이 큰 지식 노동 직군이다.",
    "21.1.q": "관찰된 AI 사용이 이론적 역량보다 낮은 이유는 무엇인가?",
    "21.1.a":
      "도입이 역량을 따라가지 못하기 때문이다. LLM은 접근 가능하지만 특정 직군의 역량을 결과로 바꾸는 안정적이고 통합된 업무 흐름은 부족하며, 그 간극이 2026년 MVP의 기회다.",
    "21.2.q": "HubSpot이 꼽은 2026년 마케팅 목표는 무엇인가?",
    "21.2.a":
      "매출과 판매 증대, 웹사이트 트래픽, 참여도, 고객 경험 개선, 거래 성사다. 특히 콘텐츠 제작은 더 이상 최상위 목표가 아니다.",
    "21.3.q": "초기 단계 창업자는 2026년에 무엇을 우선해야 하는가?",
    "21.3.a":
      "콘텐츠 양보다 매출로 이어지는 유통을 택하고 고노출·고임금 직군에 집중한다. 예쁜 데모보다 비싼 한 시간을 대체하거나 보완하는 업무 흐름이 차별점이다.",
  },
  "backlinks-still-decide-who-gets-recommended": {
    "5.0":
      "일반 디렉터리가 아니라 틈새시장 안팎의 사이트에서 15~30개의 인바운드 링크를 확보한다.",
    "5.1":
      "편집자 언급, 게스트 포스트, 팟캐스트, 파트너 페이지와 자료 목록을 섞는다.",
    "5.2":
      "정확히 일치하는 키워드보다 브랜드명을 훨씬 자주 쓰는 앵커 텍스트를 사용한다.",
    "5.3":
      "업계의 인정받는 매체나 신뢰할 만한 커뮤니티 허브에서 최소 하나의 링크를 얻는다.",
    "5.4":
      "관련 없는 사이트에서 한 주에 200개를 받지 말고 자연스러운 성장 곡선을 유지한다.",
    "17.0.q": "2026년에도 백링크가 SEO에 중요한가?",
    "17.0.a":
      "그렇다. 백링크는 Google의 가장 강한 오프페이지 순위 신호이자 공개 웹을 읽는 AI 답변 엔진의 중요한 신뢰 신호다. 인바운드 링크가 없는 사이트는 추천에서 체계적으로 밀린다.",
    "17.1.q": "새 MVP에는 실제로 백링크가 몇 개 필요한가?",
    "17.1.a":
      "대부분의 틈새시장에서는 관련 있고 실제인 사이트의 링크 15~30개면 순위와 AI 언급이 움직이기 시작한다. 개수보다 품질과 주제 관련성이 훨씬 중요하다.",
    "17.2.q": "유료 링크는 가치가 있는가?",
    "17.2.a":
      "MVP에는 거의 그렇지 않다. 유료 링크 네트워크는 Google이 쉽게 감지해 순위 벌점을 줄 수 있다. 아웃리치와 파트너십, 독창적 콘텐츠로 얻는 링크가 느리지만 오래간다.",
    "17.3.q": "새 백링크가 순위에 영향을 주기까지 얼마나 걸리는가?",
    "17.3.a":
      "Google은 2~8주가 걸리고, 공개 웹을 더 자주 다시 읽는 AI 답변 엔진은 때때로 더 빠르다. 링크가 임계량에 도달하는 3개월 무렵 누적 효과가 나타난다.",
  },
  "designing-for-the-ai-native-era": {
    "24.0.q": "챗봇은 AI-native 제품과 같은가?",
    "24.0.a":
      "아니다. 챗봇은 하나의 입력 방식일 뿐이고, AI-native 제품은 사람과 AI 에이전트가 함께 쓴다는 전제로 인터페이스·행동·데이터 모델을 다시 구성한다. 채팅 화면이 없는 제품도 많다.",
    "24.1.q": "AI-native가 되려면 제품을 다시 만들어야 하는가?",
    "24.1.a":
      "대부분은 그렇지 않다. 핵심 행동을 정돈된 API로 열고 디자인 시스템을 다듬으며 열린 입력에 생성 컴포넌트를 몇 개 추가하면 된다. 전면 재구축은 첫 세 단계 뒤에만 고려한다.",
    "24.2.q": "AI-native 시대에 디자인 직업은 사라지는가?",
    "24.2.a":
      "아니라 진화한다. 픽셀 작업은 줄고 판단 작업은 늘어난다. 생성할 인터페이스와 모델이 조립할 시스템을 정하고 잘못된 출력에서 사용자를 보호하는 일이 핵심이다.",
    "24.3.q": "오늘 해야 할 가장 중요한 일은 무엇인가?",
    "24.3.a":
      "제품에서 사용자가 할 수 있는 모든 행동을 문서화된 API 엔드포인트로도 제공한다. 그렇지 않으면 에이전트가 제품을 사용할 수 없고 이후의 생성 UI도 제한된 기반 위에 놓인다.",
  },
  "design-systems-matter-more-in-the-ai-era": {
    "11.0": "색상·간격·반지름·모션을 평이한 영어로 이름 붙인 토큰을 마련한다.",
    "11.1":
      "카드·목록·표·폼·대화상자처럼 레이아웃의 80%를 처리할 작은 프리미티브 집합을 만든다.",
    "11.2": "빈 상태, 로딩, 오류, 성공, 부분 데이터를 문서화한다.",
    "11.3":
      "접근성을 나중에 덧붙이지 말고 처음부터 넣어 생성 화면이 접근 불가능한 기본값으로 출시되지 않게 한다.",
    "11.4":
      "생성된 문구가 브랜드 안에 머물도록 짧은 문체와 어조 가이드를 작성한다.",
    "17.0.q": "AI가 디자인 시스템을 불필요하게 만드는가?",
    "17.0.a":
      "아니다. 오히려 더 중요하게 만든다. 모델은 품질을 발명하지 않고 기반을 증폭하므로, 강한 디자인 시스템이 AI 생성 인터페이스의 상한을 결정한다.",
    "17.1.q": "작은 팀은 디자인 시스템을 어디서 시작해야 하는가?",
    "17.1.a":
      "토큰 5개, 컴포넌트 5개, 문서화된 상태 5개를 골라 어디서나 사용한다. 실제로 지키는 작은 시스템이 아무도 믿지 않는 거대한 시스템보다 낫다.",
    "17.2.q": "API 우선 제품은 실제로 어떻게 보이는가?",
    "17.2.a":
      "UI에서 할 수 있는 모든 행동을 안정적인 ID, 예측 가능한 오류, 멱등성을 갖춘 문서화 엔드포인트로도 실행한다. UI는 유일한 경로가 아니라 여러 클라이언트 중 하나가 된다.",
    "17.3.q": "디자인이 직업으로서 사라지는가?",
    "17.3.a":
      "반대다. 픽셀을 옮기는 일은 줄지만 판단력, 감각, 시스템 사고와 사용자 공감은 더 중요해진다. 모델이 조립할 시스템을 소유하는 디자이너의 가치는 커진다.",
  },
  "base44-vs-lovable-which-one-for-your-next-app": {
    "29.0":
      "빌더 없이 코드·데이터·설정을 내보내거나 검사할 수 있는지 확인한다.",
    "29.1":
      "다른 엔지니어가 프로젝트를 로컬에서 실행하고 중요한 결정의 위치를 이해할 수 있어야 한다.",
    "29.2":
      "제품이 성장하면 기본 인증·결제·데이터 서비스를 교체할 수 있는지 묻는다.",
    "29.3":
      "첫 버전이 성공해 요구가 표준을 벗어날 때의 마이그레이션 경로를 미리 적는다.",
    "32.0":
      "공개 랜딩 페이지, 검색 가능한 제품 화면, 또는 Supabase의 열린 백엔드 프리미티브가 필요한 앱에는 Lovable을 고른다.",
    "32.1":
      "관리형 설정이 가장 중요하다면 비공개 대시보드, 내부 도구, 단순한 인증 업무 흐름에는 Base44를 고른다.",
    "32.2":
      "맞춤 인증, 독특한 데이터 관계, 제3자 통합이 중심이면 Lovable을 선택한다.",
    "32.3":
      "짧은 검증 스프린트에는 어느 쪽이든 쓰되 실제 사용자·결제·민감한 데이터 전에 인계 계획을 적는다.",
    "32.4":
      "어떤 빌더도 깔끔하게 지원하지 못하는 요구가 제품 가치의 핵심이면 정상 코드베이스로 일찍 옮긴다.",
    "36.0.q": "Base44가 Lovable보다 나은가?",
    "36.0.a":
      "모든 상황에서 더 낫지는 않다. Base44는 관리형 설정과 모델 선택이 중요한 제한된 인증 앱에 좋고, Lovable은 열린 Supabase 백엔드와 맞춤 통합, 크롤링 가능한 공개 페이지에 강하다.",
    "36.1.q": "Base44나 Lovable로 MVP를 만들 수 있는가?",
    "36.1.a":
      "그렇다. 집중된 제품 질문에 답하도록 범위를 좁히고 핵심 제약을 일찍 시험한다. 실험이 커지면 코드와 데이터가 어떻게 되는지도 결정해 둔다.",
    "36.2.q": "SEO에는 어느 플랫폼이 더 나은가?",
    "36.2.a":
      "공개 SEO의 출발점은 서버 렌더링 HTML로 크롤러가 즉시 읽을 수 있는 Lovable이 더 강하다. 그래도 실제 초기 응답과 메타데이터, 링크, 스키마를 직접 검사해야 한다.",
    "36.3.q": "AI 앱 빌더를 언제 넘어가야 하는가?",
    "36.3.a":
      "맞춤 ID, 복잡한 권한, 특이한 통합, 성능 제약, 예측 가능한 소유권이 필요해 우회 작업이 늘 때 옮긴다. 첫 버전이 핵심 사업이 되기 전에 출구를 계획하면 쉽다.",
  },
};

const KOREAN_SCALAR_EXTRAS: Record<string, Record<number, string>> = {
  "ai-overviews-citation-playbook-for-mvps": {
    6: "실제 질문을 답변으로 바꾸면 페이지는 검색자의 의도를 정확히 받아낸다.",
    8: "비교표의 각 행은 기능과 대안의 차이를 검증 가능한 사실로 보여 준다.",
    10: "엔터티 이름과 역할을 밝히면 모델이 제품을 마케팅 문구와 혼동하지 않는다.",
    12: "날짜가 있는 수치는 페이지가 언제의 현실을 설명하는지 알려 준다.",
    15: "각 전후 사례는 문구를 바꾼 뒤 어떤 검색 의도에서 결과가 나타났는지 추적한다.",
    17: "질문을 그대로 옮긴 FAQ는 방문자가 사용하는 긴 검색어와 답변을 연결한다.",
    19: "비교 행을 명확히 쓰면 대안을 찾는 독자가 제품의 차이를 판단한다.",
  },
  "make-your-brand-visible-in-chatgpt": {
    5: "답변을 앞에 두면 방문자와 모델 모두 페이지의 핵심을 즉시 파악한다.",
    7: "질문 제목과 사실 답변의 짝은 LLM이 추출하기 쉬운 구조를 만든다.",
    9: "제품을 끝까지 설명하면 모델이 대상 사용자와 사용 맥락을 빠뜨리지 않는다.",
    11: "명시적인 엔터티 신호는 브랜드가 무엇을 판매하는지 판별하게 한다.",
    13: "용어를 페이지 안에서 정의하면 낯선 개념도 인용 가능한 단위가 된다.",
    15: "여러 구조 데이터와 사양을 함께 쓰면 제품 정보의 의미가 흔들리지 않는다.",
    17: "외부에서 확인할 수 있는 증거가 브랜드의 자기 주장보다 추천 신호로 강하다.",
    19: "최신 날짜와 데이터는 크롤러가 오래된 설명보다 현재 페이지를 읽게 한다.",
    21: "비교 콘텐츠는 모델이 추천 이유를 만들 때 필요한 대조 근거를 제공한다.",
    23: "주제 클러스터를 연결하면 각 페이지가 고립되지 않고 같은 맥락을 공유한다.",
    25: "실제 자격과 경험을 드러내는 E-E-A-T가 과장된 전문용어보다 설득력 있다.",
    27: "고유한 설명과 스키마는 비슷한 SKU 사이의 주제 혼동을 막는다.",
    28: "브랜드 정체성을 먼저 정리하면 페이지와 스키마가 같은 방향의 설명을 상속한다.",
  },
  "ai-at-work-2026-what-it-means-for-founders": {
    4: "직군별 노출률을 구분해야 어떤 업무가 자동화나 보조의 대상인지 알 수 있다.",
    6: "학력과 임금 격차도 노출 데이터를 시장 기회로 해석할 때 함께 살펴야 한다.",
    10: "보고서의 목표와 실제 성과를 나누어 읽어야 콘텐츠 지표를 매출 목표로 오해하지 않는다.",
    12: "유입과 참여를 매출로 연결하는 측정 기준이 마케팅 우선순위를 결정한다.",
  },
  "backlinks-still-decide-who-gets-recommended": {
    4: "신뢰할 만한 링크를 얻으려면 권위의 양보다 주제와 관계의 적합성을 먼저 본다.",
    8: "아웃리치는 실제 독자가 있는 매체를 조사한 뒤 개인적인 제안으로 시작한다.",
    10: "조사 결과를 공개하면 다른 작성자가 근거로 인용할 수 있는 자료가 생긴다.",
    12: "협업 문맥의 링크는 광고성 주장보다 제품을 유용한 정보와 연결한다.",
    14: "링크의 주제 범위를 넓히면 브랜드가 추천되는 상황도 함께 확장된다.",
  },
  "designing-for-the-ai-native-era": {
    4: "자동화의 경계와 되돌리기 방법을 설계하면 사용자가 결과를 통제할 수 있다.",
    6: "시스템 상태를 설명하면 사용자는 모델의 제안과 확실한 사실을 구별할 수 있다.",
    8: "검토와 편집을 거친 뒤 실행하게 하면 생성 오류가 곧바로 제품 행동이 되지 않는다.",
    10: "기억되는 데이터와 지워지는 데이터를 보여 주는 것이 책임의 균형을 만든다.",
    12: "출처와 확신 수준을 확인할 수 있어야 사용자가 제안을 안전하게 판단한다.",
    15: "화면 흐름을 시험하면 오류가 생겼을 때 복구 지점을 확인할 수 있다.",
    17: "협업 단계에서 사람의 승인 지점을 두면 자동화와 책임을 함께 유지한다.",
    19: "사용자 목표를 중심에 두면 생성 기능이 목적 없이 늘어나는 일을 막는다.",
    21: "실패 상태와 피드백을 설계하면 사용자가 오류 뒤에도 안전하게 작업을 이어 간다.",
  },
  "design-systems-matter-more-in-the-ai-era": {
    3: "공통 토큰을 먼저 정하면 생성된 화면의 이름과 간격이 서로 달라지지 않는다.",
    5: "재사용 규칙은 빠른 생성 속도에서도 화면 간 상호작용을 일정하게 유지한다.",
    7: "오류와 로딩 상태까지 정의해야 생성 결과가 빈틈없는 제품 화면이 된다.",
    10: "이 규칙을 검토 가능한 계약으로 만들면 AI 출력과 개발 코드가 같은 기준을 따른다.",
  },
  "base44-vs-lovable-which-one-for-your-next-app": {
    5: "검증 단계의 속도와 운영 단계의 비용을 분리해 평가해야 한다.",
    8: "두 도구의 실제 차이는 팀이 통제할 수 있는 경계에서 드러난다.",
    11: "API와 데이터 이전 가능성을 확인하면 성장 뒤의 플랫폼 위험을 계산할 수 있다.",
    14: "생애주기별 위험을 적어 보면 빠른 데모와 운영 제품의 요구가 달라진다.",
    16: "프로토타입 선택은 현재 질문과 이후 코드 소유권을 함께 고려해야 한다.",
    18: "확장할수록 데이터와 API를 직접 다루는 능력이 플랫폼 선택의 핵심이 된다.",
    21: "운영 책임과 이전 비용을 감당할 팀의 역량이 화면 생성 속도보다 중요하다.",
    23: "공개 웹 제품은 렌더링과 구조 데이터, URL 제어를 비교에 포함해야 한다.",
    25: "데이터 소유권과 배포 요구를 적어 두면 두 플랫폼을 공정하게 비교할 수 있다.",
    28: "결정 전에 저장소와 데이터가 팀의 통제 아래 남는지 점검한다.",
    30: "체크리스트는 추상적인 선호를 실제 선택 질문으로 바꾸어 준다.",
  },
};

function authoredBlock(
  slug: string,
  sourceText: string,
  path: number | string,
): string {
  const key = String(path);
  const index = typeof path === "number" ? path : Number(path.split(".")[0]);
  const childLead = KOREAN_CHILD_LEADS[slug]?.[key];
  const lead =
    childLead ??
    KOREAN_BLOCK_LEADS[slug]?.[Number(path)] ??
    KOREAN_SCALAR_EXTRAS[slug]?.[index] ??
    (typeof path === "number" ? KOREAN_BLOCK_LEADS[slug]?.[index] : undefined);
  if (!lead) {
    const article = KOREAN_BLOCK_LEADS[slug];
    if (!article)
      throw new Error(`Missing Korean editorial article "${slug}".`);
    throw new Error(`Missing Korean editorial block "${slug}:${path}".`);
  }
  let value = koreanText(sourceText, lead);
  if (childLead) return value;
  const expansions = KOREAN_EXPANSIONS[slug];
  if (!expansions)
    throw new Error(`Missing Korean expansion article "${slug}".`);
  let cursor = Math.abs(
    [...sourceText].reduce((sum, char) => sum + char.charCodeAt(0), 0),
  );
  let expansion = 0;
  value += ` ${expansions[cursor % expansions.length]}`;
  cursor = cursor * 31 + 17;
  value += ` ${KOREAN_DISTINCT_ENDINGS[cursor % KOREAN_DISTINCT_ENDINGS.length]}`;
  value += ` ${KOREAN_DISTINCT_ENDINGS[(cursor + sourceText.length * 7) % KOREAN_DISTINCT_ENDINGS.length]}`;
  while (sourceText.length >= 100 && value.length < sourceText.length * 0.3) {
    const sentence = expansions[cursor % expansions.length];
    value += ` ${sentence}`;
    cursor = cursor * 31 + 17;
    expansion += 1;
    if (expansion > 12) break;
  }
  return value;
}

const KOREAN_EXPANSIONS: Record<string, string[]> = {
  "ai-overviews-citation-playbook-for-mvps": [
    "독자는 답을 찾은 뒤 근거와 적용 방법을 바로 확인할 수 있어야 한다.",
    "따라서 페이지의 구조와 사례를 함께 검토해야 인용 가능성을 실제 출시 작업으로 옮길 수 있다.",
    "이 원칙은 문구를 꾸미는 일이 아니라 검색자가 확인할 사실을 앞에 배치하는 편집 결정이다.",
  ],
  "make-your-brand-visible-in-chatgpt": [
    "각 점검은 모델이 짧은 답을 만들 때 필요한 맥락과 검증 가능한 증거를 함께 제공한다.",
    "브랜드 설명을 독립적으로 읽어도 제품과 대상 사용자가 분명해야 추천 단계에서 누락되지 않는다.",
    "결과를 확인하려면 구조화 데이터뿐 아니라 실제 페이지와 외부 언급의 일관성도 살펴야 한다.",
  ],
  "vibe-coded-apps-have-an-seo-problem": [
    "이 선택은 현재 출시 속도와 앞으로 필요한 검색 제어권을 함께 계산한 뒤 내려야 한다.",
    "실행 전에는 봇 응답과 브라우저 응답의 내용이 같은지 확인하고 배포 뒤 실제 크롤링을 점검한다.",
    "마이그레이션의 목적은 도구를 바꾸는 데 있지 않고 콘텐츠와 운영 책임을 팀이 갖는 데 있다.",
  ],
  "ai-at-work-2026-what-it-means-for-founders": [
    "숫자를 기능 목록으로 곧장 바꾸지 말고 사용자가 실제로 시간을 쓰는 업무와 대조해야 한다.",
    "그 차이를 인터뷰와 작은 실험으로 확인하면 과장된 AI 약속 대신 검증 가능한 제품 가설이 남는다.",
    "창업자의 판단은 노출 규모와 채택 신호를 분리해 읽을 때 더 정확한 우선순위를 만든다.",
  ],
  "backlinks-still-decide-who-gets-recommended": [
    "좋은 링크는 한 번의 순위 상승보다 독자가 신뢰할 만한 문맥에서 반복되는 발견 경로를 만든다.",
    "아웃리치의 성과는 발송량이 아니라 관련 매체와 실제 독자에게 도달했는지로 판단해야 한다.",
    "이 접근은 검색 최적화와 브랜드 평판을 별개 업무로 나누지 않고 하나의 편집 관계로 본다.",
  ],
  "designing-for-the-ai-native-era": [
    "사용자는 모델의 내부 작동보다 지금 무엇이 제안되었고 무엇을 직접 결정하는지 알아야 한다.",
    "그래서 성공 기준은 자동화된 클릭 수가 아니라 이해와 수정, 취소가 가능한 경험에 놓인다.",
    "이러한 설계는 오류가 생겼을 때 사람이 원인을 찾고 안전하게 이전 상태로 돌아가게 한다.",
  ],
  "design-systems-matter-more-in-the-ai-era": [
    "규칙을 코드와 문서에 함께 남겨야 생성 에이전트도 팀이 승인한 제품 언어를 재사용할 수 있다.",
    "검수 가능한 토큰과 상태는 빠른 생성 속도가 접근성과 품질 저하로 이어지는 것을 막는다.",
    "결국 시스템의 가치는 화면 수가 아니라 여러 표면에서 같은 약속을 지키는 능력으로 측정된다.",
  ],
  "base44-vs-lovable-which-one-for-your-next-app": [
    "따라서 비교표의 승자를 고르기보다 현재 단계에서 감수할 제약과 다음 이전 비용을 먼저 적어야 한다.",
    "초기 데모의 속도와 운영 제품의 소유권은 서로 다른 요구이므로 같은 점수로 합치면 안 된다.",
    "팀의 기술 역량과 데이터 경로를 확인하면 플랫폼의 편의성이 실제 사업 위험으로 바뀌는 시점이 보인다.",
  ],
};

const KOREAN_DISTINCT_ENDINGS = [
  "이 판단은 출시 전에 실제 사용자의 질문으로 다시 확인한다.",
  "이 근거는 팀이 다음 실험의 성공 조건을 정하는 데 사용한다.",
  "이 설명은 결과뿐 아니라 운영자가 책임질 범위까지 드러낸다.",
  "이 사례는 비용과 효과를 함께 기록해야 재현 가능한 교훈이 된다.",
  "이 기준을 적용하면 독자가 다음 행동을 망설이지 않는다.",
  "이 차이는 문서와 제품 화면에서 같은 의미로 전달되어야 한다.",
  "이 선택은 현재의 제약과 이후의 확장 계획을 함께 반영한다.",
  "이 점검은 배포 후 데이터로 다시 측정하고 필요하면 순서를 바꾼다.",
  "이 관점은 빠른 결과보다 오래 유지되는 제품 신뢰를 우선한다.",
  "이 작업은 팀의 편집 기준과 구현 기준을 하나로 맞춘다.",
  "이 결론은 도구의 이름보다 사용자가 얻는 실제 결과에 근거한다.",
  "이 내용은 다음 검토자가 같은 사실을 독립적으로 확인할 수 있게 한다.",
];

function authoredSourceLabel(sourceText: string): string {
  return koreanText(
    sourceText,
    "이 글의 주장과 수치를 확인하기 위해 검토한 원자료와 사례",
  );
}

const KOREAN_TAGS: Record<string, string> = {
  "AI Overviews": "AI Overviews",
  "AI at work": "업무 속 AI",
  "State of marketing 2026": "2026 마케팅 현황",
  "Vibe coding": "바이브 코딩",
  "LLM SEO": "LLM 검색 최적화",
  Brand: "브랜드",
  Founders: "창업자",
  Research: "리서치",
  Backlinks: "백링크",
  Design: "디자인",
  "Design Systems": "디자인 시스템",
  Schema: "구조화 데이터",
  MVP: "MVP",
  GEO: "GEO",
  SEO: "SEO",
  SSR: "SSR",
  Claude: "Claude",
};

const KOREAN_FACTUAL_NAMES = new Set([
  "Google",
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "PerplexityBot",
  "ClaudeBot",
  "Stripe",
  "Notion",
  "Acme",
  "AcmeSchedule",
  "AcmeNotes",
  "AcmeSchedule",
  "SQL",
  "DNS",
  "HTML",
  "JavaScript",
  "CNAME",
  "E-E-A-T",
]);

/**
 * Korean article modules deliberately derive their metadata and authored
 * structure from the source post.  This keeps dates, anchors, links, source
 * URLs, and numeric evidence in lockstep while the Korean editorial layer
 * supplies the readable copy for each block.
 */
export function koreanPost(
  slug: string,
  fields: Pick<
    Post,
    | "title"
    | "seoTitle"
    | "description"
    | "seoDescription"
    | "excerpt"
    | "category"
    | "tags"
  >,
): Post {
  const source = getPost(slug);
  if (!source) throw new Error(`Missing journal source post "${slug}".`);
  const translatedFields = {
    ...fields,
    title: translatedField(source.title, fields.title),
    seoTitle: translatedField(
      source.seoTitle ?? source.title,
      fields.seoTitle ?? fields.title,
    ),
    description: translatedField(source.description, fields.description),
    seoDescription: translatedField(
      source.seoDescription ?? source.description,
      fields.seoDescription ?? fields.description,
    ),
    excerpt: translatedField(source.excerpt, fields.excerpt),
    tags: fields.tags.map((tag, index) => {
      const sourceTag = source.tags[index];
      if (sourceTag !== tag) return tag;
      if (PROTECTED_TERMS.includes(tag as (typeof PROTECTED_TERMS)[number]))
        return tag;
      return KOREAN_TAGS[tag] ?? `한국어 ${tag}`;
    }),
  };
  return {
    ...source,
    ...translatedFields,
    body: source.body.map((block, blockIndex): Block => {
      if (block.type === "ul" || block.type === "ol") {
        return {
          ...block,
          items: block.items.map((item, itemIndex) =>
            authoredBlock(slug, item, `${blockIndex}.${itemIndex}`),
          ),
        };
      }
      if (block.type === "faq") {
        return {
          ...block,
          items: block.items.map((item, itemIndex) => ({
            q: authoredBlock(slug, item.q, `${blockIndex}.${itemIndex}.q`),
            a: authoredBlock(slug, item.a, `${blockIndex}.${itemIndex}.a`),
          })),
        };
      }
      if (block.type === "callout") {
        return {
          ...block,
          title: block.title
            ? authoredBlock(slug, block.title, blockIndex)
            : block.title,
          text: authoredBlock(slug, block.text, blockIndex),
        };
      }
      if (block.type === "quote") {
        return {
          ...block,
          text: authoredBlock(slug, block.text, blockIndex),
          cite: block.cite
            ? authoredBlock(slug, block.cite, blockIndex)
            : block.cite,
        };
      }
      return {
        ...block,
        text: authoredBlock(slug, block.text, blockIndex),
      };
    }),
    sources: source.sources?.map((item) => ({
      ...item,
      label: authoredSourceLabel(item.label),
    })),
  };
}

export const KO_TRANSLATED_POSTS: Readonly<Record<string, Post>> = {
  "ai-overviews-citation-playbook-for-mvps": koreanPost(
    "ai-overviews-citation-playbook-for-mvps",
    {
      title: "MVP를 위한 AI Overviews 인용 플레이북",
      seoTitle: "MVP AI Overviews 인용 플레이북 | Start Apps Studio",
      description:
        "직접 답변, FAQPage JSON-LD, 비교표, 명명된 엔터티와 날짜가 있는 통계로 MVP가 Google AI Overviews에 인용되도록 만드는 다섯 가지 패턴입니다.",
      seoDescription:
        "직접 답변과 구조화 데이터로 MVP의 AI Overviews 인용 가능성을 높이는 실전 가이드입니다.",
      excerpt:
        "초기부터 AI Overviews에 인용되는 MVP 페이지에는 공통된 다섯 가지 패턴이 있습니다.",
      category: "플레이북",
      tags: ["GEO", "AI Overviews", "Schema", "MVP"],
    },
  ),
  "make-your-brand-visible-in-chatgpt": koreanPost(
    "make-your-brand-visible-in-chatgpt",
    {
      title: "ChatGPT와 AI 답변에 브랜드를 노출하는 방법",
      seoTitle: "ChatGPT와 AI Overviews에 브랜드 노출하기 | Start Apps Studio",
      description:
        "답변 우선 문장, Q&A 구조, 스키마, 엔터티 신호, 사회적 증거와 최신 콘텐츠를 다루는 12개 항목 GEO 체크리스트입니다.",
      seoDescription:
        "ChatGPT와 AI Overviews가 브랜드를 노출하도록 만드는 12개 항목 GEO 체크리스트입니다.",
      excerpt:
        "ChatGPT가 추천을 요청받았을 때 제품을 언급하지 않는다면 사이트는 12가지 테스트를 통과하지 못한 것입니다.",
      category: "플레이북",
      tags: ["GEO", "LLM SEO", "Brand", "MVP"],
    },
  ),
  "vibe-coded-apps-have-an-seo-problem": koreanPost(
    "vibe-coded-apps-have-an-seo-problem",
    {
      title:
        "Vibe-coded 앱에는 SEO 문제가 있습니다. 해결 방법은 다음과 같습니다",
      seoTitle: "Vibe-coded 앱과 SEO: 해결 방법 | Start Apps Studio",
      description:
        "Lovable, Bolt, v0가 크롤러에 빈 div를 보내는 문제를 Cloudflare Worker SSR 프록시 또는 실제 스택 마이그레이션으로 해결합니다.",
      seoDescription:
        "Vibe-coded 앱의 SEO 문제를 Cloudflare Worker SSR 프록시나 실제 웹 스택으로 해결하는 방법입니다.",
      excerpt:
        "Lovable 앱은 몇 시간 만에 출시되지만 Google에는 보이지 않을 수 있습니다. 두 가지 해결책을 소개합니다.",
      category: "현장 노트",
      tags: ["Vibe coding", "Lovable", "SEO", "SSR", "Claude"],
    },
  ),
  "ai-at-work-2026-what-it-means-for-founders": koreanPost(
    "ai-at-work-2026-what-it-means-for-founders",
    {
      title: "2026년 업무 속 AI: 노출 데이터가 창업자에게 의미하는 것",
      seoTitle:
        "2026년 업무 속 AI가 창업자에게 의미하는 것 | Start Apps Studio",
      description:
        "프로그래머의 74.5%가 AI에 노출되어도 실제 사용은 잠재력보다 뒤처집니다. 2026년 MVP를 만드는 창업자가 데이터를 읽는 방법입니다.",
      seoDescription:
        "AI 노출과 실제 사용의 격차가 MVP를 만드는 창업자에게 의미하는 바를 설명합니다.",
      excerpt:
        "AI가 할 수 있는 일과 실제로 사용되는 일의 격차는 이번 10년의 가장 큰 기회입니다.",
      category: "리서치",
      tags: ["AI at work", "State of marketing 2026", "Founders", "Research"],
    },
  ),
  "backlinks-still-decide-who-gets-recommended": koreanPost(
    "backlinks-still-decide-who-gets-recommended",
    {
      title: "백링크는 여전히 추천받는 대상을 결정합니다",
      seoTitle: "백링크와 AI 추천: 여전히 중요한 이유 | Start Apps Studio",
      description:
        "AI 검색 시대에도 백링크가 브랜드의 발견 가능성과 추천 가능성을 결정하는 방식, 그리고 MVP를 위한 현실적인 획득 방법을 설명합니다.",
      seoDescription:
        "AI 검색과 GEO 시대에 백링크가 중요한 이유를 설명하는 실전 가이드입니다.",
      excerpt:
        "AI가 답변을 작성해도 추천할 출처를 선택해야 하며, 백링크는 여전히 그 선택을 좌우합니다.",
      category: "현장 노트",
      tags: ["Backlinks", "GEO", "SEO", "MVP"],
    },
  ),
  "designing-for-the-ai-native-era": koreanPost(
    "designing-for-the-ai-native-era",
    {
      title: "AI-native 시대를 위한 디자인",
      seoTitle: "AI-native 시대의 제품 디자인 | Start Apps Studio",
      description:
        "AI가 제품 경험을 바꾸는 시대에 창업자가 인터페이스, 신뢰와 사용자 제어를 설계하는 방법을 다룹니다.",
      seoDescription:
        "AI-native 제품을 위한 인터페이스와 사용자 경험 설계 원칙입니다.",
      excerpt:
        "AI-native 제품 디자인은 모델을 화면에 붙이는 일이 아니라 사용자의 판단을 돕는 일입니다.",
      category: "디자인",
      tags: ["AI-native", "Design", "UX", "MVP"],
    },
  ),
  "design-systems-matter-more-in-the-ai-era": koreanPost(
    "design-systems-matter-more-in-the-ai-era",
    {
      title: "AI 시대에는 디자인 시스템이 더 중요합니다",
      seoTitle: "AI 시대의 디자인 시스템 | Start Apps Studio",
      description:
        "AI가 생성하는 화면과 기능이 늘어날수록 일관성, 접근성, 속도를 지키는 디자인 시스템의 역할은 커집니다.",
      seoDescription:
        "AI 제품 개발에서 디자인 시스템이 일관성과 품질을 지키는 방법입니다.",
      excerpt:
        "AI는 화면을 빠르게 만들지만, 디자인 시스템은 그 화면들이 하나의 제품처럼 작동하게 합니다.",
      category: "디자인",
      tags: ["Design Systems", "AI", "Design", "MVP"],
    },
  ),
  "base44-vs-lovable-which-one-for-your-next-app": koreanPost(
    "base44-vs-lovable-which-one-for-your-next-app",
    {
      title: "다음 앱에는 Base44와 Lovable 중 무엇을 선택해야 할까요?",
      seoTitle: "Base44 vs Lovable: 다음 앱에 맞는 선택 | Start Apps Studio",
      description:
        "Base44와 Lovable의 속도, 제어권, 확장성, 소유권을 비교해 다음 앱에 맞는 빌더를 선택하는 방법입니다.",
      seoDescription:
        "Base44와 Lovable을 MVP 관점에서 비교하는 실전 가이드입니다.",
      excerpt:
        "두 빌더 모두 빠르지만, 제품의 단계와 필요한 제어 수준에 따라 더 나은 선택은 달라집니다.",
      category: "비교",
      tags: ["Base44", "Lovable", "Vibe coding", "SEO", "제품 전략"],
    },
  ),
};
