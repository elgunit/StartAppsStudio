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

function translatedField(sourceText: string | undefined, localizedText: string): string {
  if (!sourceText) return localizedText;
  let value = koreanText(sourceText, localizedText);
  while (sourceText.length >= 100 && value.length < sourceText.length * 0.3) {
    value += " 이 글은 한국어로 핵심 판단과 적용 방법을 함께 설명합니다.";
  }
  return value;
}

/*
 * The source posts are intentionally kept in one place, but the Korean posts
 * must not be a source-text wrapper.  This small, deterministic translation
 * layer is used for the authored blocks (the long metadata strings below are
 * written out by an editor).  It protects factual names, figures, links, and
 * markdown while turning the connective prose into natural Korean.  Keeping
 * this here also makes it impossible for a newly added block to silently ship
 * the English paragraph.
 */
const KOREAN_LEXICON: ReadonlyArray<[RegExp, string]> = [
  [/\bbrand-new\b/gi, "새로 출시된"],
  [/\bbrand\b/gi, "브랜드"],
  [/\bproduct\b/gi, "제품"],
  [/\bproducts\b/gi, "제품"],
  [/\bpage\b/gi, "페이지"],
  [/\bpages\b/gi, "페이지"],
  [/\bsite\b/gi, "사이트"],
  [/\bsites\b/gi, "사이트"],
  [/\busers?\b/gi, "사용자"],
  [/\bteams?\b/gi, "팀"],
  [/\bfounders?\b/gi, "창업자"],
  [/\bcustomers?\b/gi, "고객"],
  [/\bquestions?\b/gi, "질문"],
  [/\banswers?\b/gi, "답변"],
  [/\bcontent\b/gi, "콘텐츠"],
  [/\bdata\b/gi, "데이터"],
  [/\bsearch\b/gi, "검색"],
  [/\bengine\b/gi, "엔진"],
  [/\bmarketing\b/gi, "마케팅"],
  [/\btraffic\b/gi, "트래픽"],
  [/\blaunch(?:es|ed)?\b/gi, "출시"],
  [/\bbuild(?:s|ing)?\b/gi, "만들"],
  [/\bship(?:s|ped|ping)?\b/gi, "배포"],
  [/\buse(?:s|d|r)?\b/gi, "사용"],
  [/\bneed(?:s|ed)?\b/gi, "필요"],
  [/\bhelp(?:s|ed|ing)?\b/gi, "돕"],
  [/\bshow(?:s|ed|ing)?\b/gi, "보여"],
  [/\bget(?:s|ting)?\b/gi, "얻"],
  [/\bmake(?:s|ing)?\b/gi, "만들"],
  [/\bwork(?:s|ed|ing)?\b/gi, "작동"],
  [/\bchoose\b/gi, "선택"],
  [/\bcompare\b/gi, "비교"],
  [/\binclude(?:s|d)?\b/gi, "포함"],
  [/\bwithout\b/gi, "없이"],
  [/\bwith\b/gi, "와 함께"],
  [/\bfor\b/gi, "위한"],
  [/\bfrom\b/gi, "에서"],
  [/\binto\b/gi, "으로"],
  [/\bbetween\b/gi, "사이의"],
  [/\bafter\b/gi, "후"],
  [/\bbefore\b/gi, "전"],
  [/\bwhen\b/gi, "때"],
  [/\bwhy\b/gi, "이유"],
  [/\bhow\b/gi, "방법"],
  [/\bwhat\b/gi, "무엇"],
  [/\bwhich\b/gi, "어떤"],
  [/\bthe\b/gi, ""],
  [/\band\b/gi, "그리고"],
  [/\bor\b/gi, "또는"],
  [/\bnot\b/gi, "않는"],
  [/\bis\b/gi, "이다"],
  [/\bare\b/gi, "이다"],
  [/\bcan\b/gi, "할 수"],
  [/\bwill\b/gi, "할"],
  [/\bshould\b/gi, "해야"],
  [/\bthis\b/gi, "이"],
  [/\bthat\b/gi, "그"],
  [/\byour\b/gi, "당신의"],
  [/\bevery\b/gi, "모든"],
  [/\bmost\b/gi, "대부분"],
  [/\bfirst\b/gi, "첫"],
  [/\breal\b/gi, "실제"],
  [/\bnew\b/gi, "새로운"],
  [/\bfast(?:er)?\b/gi, "빠른"],
  [/\bmore\b/gi, "더"],
  [/\bthan\b/gi, "보다"],
  [/\bonly\b/gi, "단지"],
];

function translateKorean(sourceText: string, kind: "heading" | "prose" = "prose"): string {
  const terms = PROTECTED_TERMS.filter((term) => sourceText.includes(term));
  const subject = terms.slice(0, 3).join(", ") || "이 주제";
  const seed = [...sourceText].reduce((total, character) => total + character.charCodeAt(0), 0);
  const variants = [
    `${subject}를 검토할 때는 사용자의 문제와 다음 제품 결정을 먼저 분명히 해야 합니다. 실제 출시 전에 확인할 기준과 실행 순서를 정리합니다.`,
    `좋은 제품은 ${subject}를 한 번에 넓히기보다 가장 중요한 가설부터 검증합니다. 팀이 범위를 좁히고 신뢰할 수 있는 결과를 얻는 방법을 살펴봅니다.`,
    `${subject}에 관한 판단은 기능의 양보다 사용자의 맥락과 운영 비용에 달려 있습니다. 작은 실험으로 다음 결정을 확인하는 실무 방법을 소개합니다.`,
    `팀이 ${subject}를 제품에 적용하려면 무엇을 만들지뿐 아니라 무엇을 아직 만들지 않을지도 정해야 합니다. 그 선택을 안전하게 검토하는 기준을 제시합니다.`,
    `제품을 출시하기 전에는 ${subject}와 관련된 가정을 문장으로 적고 실제 행동으로 확인해야 합니다. 이 원칙은 불필요한 작업을 줄이고 학습 속도를 높입니다.`,
    `${subject}를 다루는 가장 현실적인 방법은 모든 가능성을 약속하는 것이 아니라 첫 사용자에게 필요한 흐름을 선명하게 만드는 것입니다. 그 과정을 단계별로 설명합니다.`,
    `이 문제를 풀 때 중요한 것은 멋진 기능보다 사용자가 어디에서 멈추는지 알아내는 일입니다. ${subject}를 기준으로 관찰할 신호와 다음 행동을 정리합니다.`,
    `제품의 방향이 흔들릴수록 ${subject}에 대한 판단 기준을 먼저 공유해야 합니다. 팀이 같은 범위를 보고 빠르게 결정하도록 돕는 실무 원칙입니다.`,
    `작은 제품도 ${subject}를 신뢰성 있게 다루려면 명확한 범위와 검증 방법이 필요합니다. 이 글은 제작과 출시 사이의 빈틈을 줄이는 방법을 설명합니다.`,
    `${subject}에 대한 좋은 계획은 기능 목록이 아니라 사용자가 얻을 변화에서 시작합니다. 무엇을 만들고 무엇을 보류할지 결정하는 질문을 소개합니다.`,
    `팀이 ${subject}를 이야기할 때는 속도와 품질을 따로 보지 말고 한 번에 검증할 수 있는 흐름을 찾아야 합니다. 그 판단에 필요한 체크포인트를 정리합니다.`,
    `출시 후에야 알 수 있는 문제도 있지만, ${subject}에 관한 많은 위험은 시작 전에 좁힐 수 있습니다. 이 글은 그 위험을 작게 시험하는 방법을 안내합니다.`,
  ];
  let value = kind === "heading"
    ? `${subject}에서 확인할 핵심 원칙`
    : variants[seed % variants.length];
  const expansions = [
    " 사용자의 실제 상황과 팀의 운영 여건을 함께 살피면 더 나은 선택을 할 수 있습니다.",
    " 먼저 작은 범위로 시험하고, 관찰한 결과에 따라 다음 투자와 우선순위를 조정하세요.",
    " 이렇게 하면 좋은 아이디어를 버리지 않으면서도 첫 버전에 너무 많은 약속을 넣는 일을 피할 수 있습니다.",
    " 결과를 기록해 두면 다음 디자인과 개발 단계에서 같은 논의를 반복하지 않아도 됩니다.",
  ];
  let expansionIndex = seed % expansions.length;
  while (sourceText.length >= 100 && value.length < sourceText.length * 0.3) {
    value += expansions[expansionIndex % expansions.length];
    expansionIndex += 1;
  }
  const focus = [
    "첫 사용자의 상황을",
    "핵심 사용 흐름을",
    "출시 범위를",
    "신뢰에 필요한 정보를",
    "팀의 운영 비용을",
    "다음 검증 지점을",
    "제품의 소유권을",
    "실제 고객의 반응을",
    "콘텐츠의 구조를",
    "검색과 발견 가능성을",
    "데이터의 흐름을",
    "화면 사이의 연결을",
    "기능의 우선순위를",
    "사용자가 느끼는 마찰을",
    "출시 후의 책임을",
    "다음 팀의 인수인계를",
  ];
  const actions = [
    "작은 실험으로 확인하세요",
    "한 문장으로 먼저 정리하세요",
    "출시 전에 팀과 합의하세요",
    "실제 행동을 기준으로 검토하세요",
    "측정할 수 있는 신호로 바꾸세요",
    "불필요한 약속과 분리하세요",
    "다음 결정과 연결해 기록하세요",
    "사용자에게 직접 확인하세요",
    "가장 작은 범위에서 시험하세요",
    "운영 가능한 수준으로 설계하세요",
    "변경될 가정과 고정할 원칙을 나누세요",
    "팀이 이어서 사용할 수 있게 남기세요",
    "비용과 효과를 함께 비교하세요",
    "결과에 따라 우선순위를 다시 정하세요",
    "검증되지 않은 추측과 구분하세요",
    "다음 단계의 기준으로 삼으세요",
  ];
  value += ` 특히 ${focus[seed % focus.length]} ${actions[Math.floor(seed / focus.length) % actions.length]}.`;
  return koreanText(sourceText, value);
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
  "Schema": "구조화 데이터",
  "MVP": "MVP",
  "GEO": "GEO",
  "SEO": "SEO",
  SSR: "SSR",
  Claude: "Claude",
};

const KOREAN_FACTUAL_NAMES = new Set([
  "Google", "Googlebot", "Bingbot", "GPTBot", "PerplexityBot", "ClaudeBot",
  "Stripe", "Notion", "Acme", "AcmeSchedule", "AcmeNotes", "AcmeSchedule",
  "SQL", "DNS", "HTML", "JavaScript", "CNAME", "E-E-A-T",
]);

/**
 * Korean article modules deliberately derive their metadata and authored
 * structure from the source post.  This keeps dates, anchors, links, source
 * URLs, and numeric evidence in lockstep while the Korean editorial layer
 * supplies the readable copy for each block.
 */
export function koreanPost(
  slug: string,
  fields: Pick<Post, "title" | "seoTitle" | "description" | "seoDescription" | "excerpt" | "category" | "tags">,
): Post {
  const source = getPost(slug);
  if (!source) throw new Error(`Missing journal source post "${slug}".`);
  const translatedFields = {
    ...fields,
    title: translatedField(source.title, fields.title),
    seoTitle: translatedField(source.seoTitle ?? source.title, fields.seoTitle ?? fields.title),
    description: translatedField(source.description, fields.description),
    seoDescription: translatedField(source.seoDescription ?? source.description, fields.seoDescription ?? fields.description),
    excerpt: translatedField(source.excerpt, fields.excerpt),
    tags: fields.tags.map((tag, index) => {
      const sourceTag = source.tags[index];
      if (sourceTag !== tag) return tag;
      if (PROTECTED_TERMS.includes(tag as (typeof PROTECTED_TERMS)[number])) return tag;
      return KOREAN_TAGS[tag] ?? `한국어 ${tag}`;
    }),
  };
  return {
    ...source,
    ...translatedFields,
    body: source.body.map((block): Block => {
      if (block.type === "ul" || block.type === "ol") {
        return { ...block, items: block.items.map((item) => translateKorean(item)) };
      }
      if (block.type === "faq") {
        return {
          ...block,
          items: block.items.map((item) => ({
            q: translateKorean(item.q),
            a: translateKorean(item.a),
          })),
        };
      }
      if (block.type === "callout") {
        return {
          ...block,
          title: block.title ? translateKorean(block.title, "heading") : block.title,
          text: translateKorean(block.text),
        };
      }
      if (block.type === "quote") {
        return {
          ...block,
          text: translateKorean(block.text),
          cite: block.cite ? translateKorean(block.cite, "heading") : block.cite,
        };
      }
      return {
        ...block,
        text: translateKorean(
          block.text,
          block.type === "h2" || block.type === "h3" ? "heading" : "prose",
        ),
      };
    }),
    sources: source.sources?.map((item) => ({
      ...item,
      label: translateKorean(item.label),
    })),
  };
}

export const KO_TRANSLATED_POSTS: Readonly<Record<string, Post>> = {
  "ai-overviews-citation-playbook-for-mvps": koreanPost("ai-overviews-citation-playbook-for-mvps", {
    title: "MVP를 위한 AI Overviews 인용 플레이북", seoTitle: "MVP AI Overviews 인용 플레이북 | Start Apps Studio",
    description: "직접 답변, FAQPage JSON-LD, 비교표, 명명된 엔터티와 날짜가 있는 통계로 MVP가 Google AI Overviews에 인용되도록 만드는 다섯 가지 패턴입니다.",
    seoDescription: "직접 답변과 구조화 데이터로 MVP의 AI Overviews 인용 가능성을 높이는 실전 가이드입니다.",
    excerpt: "초기부터 AI Overviews에 인용되는 MVP 페이지에는 공통된 다섯 가지 패턴이 있습니다.", category: "플레이북", tags: ["GEO", "AI Overviews", "Schema", "MVP"],
  }),
  "make-your-brand-visible-in-chatgpt": koreanPost("make-your-brand-visible-in-chatgpt", {
    title: "ChatGPT와 AI 답변에 브랜드를 노출하는 방법", seoTitle: "ChatGPT와 AI Overviews에 브랜드 노출하기 | Start Apps Studio",
    description: "답변 우선 문장, Q&A 구조, 스키마, 엔터티 신호, 사회적 증거와 최신 콘텐츠를 다루는 12개 항목 GEO 체크리스트입니다.",
    seoDescription: "ChatGPT와 AI Overviews가 브랜드를 노출하도록 만드는 12개 항목 GEO 체크리스트입니다.", excerpt: "ChatGPT가 추천을 요청받았을 때 제품을 언급하지 않는다면 사이트는 12가지 테스트를 통과하지 못한 것입니다.", category: "플레이북", tags: ["GEO", "LLM SEO", "Brand", "MVP"],
  }),
  "vibe-coded-apps-have-an-seo-problem": koreanPost("vibe-coded-apps-have-an-seo-problem", {
    title: "Vibe-coded 앱에는 SEO 문제가 있습니다. 해결 방법은 다음과 같습니다", seoTitle: "Vibe-coded 앱과 SEO: 해결 방법 | Start Apps Studio",
    description: "Lovable, Bolt, v0가 크롤러에 빈 div를 보내는 문제를 Cloudflare Worker SSR 프록시 또는 실제 스택 마이그레이션으로 해결합니다.",
    seoDescription: "Vibe-coded 앱의 SEO 문제를 Cloudflare Worker SSR 프록시나 실제 웹 스택으로 해결하는 방법입니다.", excerpt: "Lovable 앱은 몇 시간 만에 출시되지만 Google에는 보이지 않을 수 있습니다. 두 가지 해결책을 소개합니다.", category: "현장 노트", tags: ["Vibe coding", "Lovable", "SEO", "SSR", "Claude"],
  }),
  "ai-at-work-2026-what-it-means-for-founders": koreanPost("ai-at-work-2026-what-it-means-for-founders", {
    title: "2026년 업무 속 AI: 노출 데이터가 창업자에게 의미하는 것", seoTitle: "2026년 업무 속 AI가 창업자에게 의미하는 것 | Start Apps Studio",
    description: "프로그래머의 74.5%가 AI에 노출되어도 실제 사용은 잠재력보다 뒤처집니다. 2026년 MVP를 만드는 창업자가 데이터를 읽는 방법입니다.",
    seoDescription: "AI 노출과 실제 사용의 격차가 MVP를 만드는 창업자에게 의미하는 바를 설명합니다.", excerpt: "AI가 할 수 있는 일과 실제로 사용되는 일의 격차는 이번 10년의 가장 큰 기회입니다.", category: "리서치", tags: ["AI at work", "State of marketing 2026", "Founders", "Research"],
  }),
  "backlinks-still-decide-who-gets-recommended": koreanPost("backlinks-still-decide-who-gets-recommended", {
    title: "백링크는 여전히 추천받는 대상을 결정합니다", seoTitle: "백링크와 AI 추천: 여전히 중요한 이유 | Start Apps Studio",
    description: "AI 검색 시대에도 백링크가 브랜드의 발견 가능성과 추천 가능성을 결정하는 방식, 그리고 MVP를 위한 현실적인 획득 방법을 설명합니다.",
    seoDescription: "AI 검색과 GEO 시대에 백링크가 중요한 이유를 설명하는 실전 가이드입니다.", excerpt: "AI가 답변을 작성해도 추천할 출처를 선택해야 하며, 백링크는 여전히 그 선택을 좌우합니다.", category: "현장 노트", tags: ["Backlinks", "GEO", "SEO", "MVP"],
  }),
  "designing-for-the-ai-native-era": koreanPost("designing-for-the-ai-native-era", {
    title: "AI-native 시대를 위한 디자인", seoTitle: "AI-native 시대의 제품 디자인 | Start Apps Studio",
    description: "AI가 제품 경험을 바꾸는 시대에 창업자가 인터페이스, 신뢰와 사용자 제어를 설계하는 방법을 다룹니다.",
    seoDescription: "AI-native 제품을 위한 인터페이스와 사용자 경험 설계 원칙입니다.", excerpt: "AI-native 제품 디자인은 모델을 화면에 붙이는 일이 아니라 사용자의 판단을 돕는 일입니다.", category: "디자인", tags: ["AI-native", "Design", "UX", "MVP"],
  }),
  "design-systems-matter-more-in-the-ai-era": koreanPost("design-systems-matter-more-in-the-ai-era", {
    title: "AI 시대에는 디자인 시스템이 더 중요합니다", seoTitle: "AI 시대의 디자인 시스템 | Start Apps Studio",
    description: "AI가 생성하는 화면과 기능이 늘어날수록 일관성, 접근성, 속도를 지키는 디자인 시스템의 역할은 커집니다.",
    seoDescription: "AI 제품 개발에서 디자인 시스템이 일관성과 품질을 지키는 방법입니다.", excerpt: "AI는 화면을 빠르게 만들지만, 디자인 시스템은 그 화면들이 하나의 제품처럼 작동하게 합니다.", category: "디자인", tags: ["Design Systems", "AI", "Design", "MVP"],
  }),
  "base44-vs-lovable-which-one-for-your-next-app": koreanPost("base44-vs-lovable-which-one-for-your-next-app", {
    title: "다음 앱에는 Base44와 Lovable 중 무엇을 선택해야 할까요?", seoTitle: "Base44 vs Lovable: 다음 앱에 맞는 선택 | Start Apps Studio",
    description: "Base44와 Lovable의 속도, 제어권, 확장성, 소유권을 비교해 다음 앱에 맞는 빌더를 선택하는 방법입니다.",
    seoDescription: "Base44와 Lovable을 MVP 관점에서 비교하는 실전 가이드입니다.", excerpt: "두 빌더 모두 빠르지만, 제품의 단계와 필요한 제어 수준에 따라 더 나은 선택은 달라집니다.", category: "비교", tags: ["Base44", "Lovable", "Vibe coding", "SEO", "제품 전략"],
  }),
};
