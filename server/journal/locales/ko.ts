import { getPost, type Block, type Post } from "../posts";
import type { LocaleEditorialContent } from "../editorial";
import { koreanText, KO_TRANSLATED_POSTS } from "./ko-posts";

const sourcePost = getPost("the-mvp-brief-is-your-first-product-decision");
if (!sourcePost) throw new Error("MVP source post is missing.");
const source = sourcePost;

const mvpCopy = [
  "유용한 MVP 브리프는 디자인을 시작하기 전에 세 가지를 결정합니다. 누구를 위한 제품인지, 첫 버전에서 의도적으로 무엇을 제외할지, 다음 투자를 정당화할 사용자 증거가 무엇인지 정합니다. 그래서 브리프는 문서 작업이 아니라 첫 번째 제품 결정입니다.",
  "창업자는 시장 설명 몇 단락과 기능 목록, 제품의 미래를 말하는 한 문장을 담은 아이디어 설명서를 가져오는 경우가 많습니다. 대화를 시작하기에는 충분하지만 출시하기에는 부족합니다. 제작팀에는 야심을 검증 가능한 선택으로 바꾸는 더 작고 집중된 문서가 필요합니다.",
  "유용한 브리프가 하는 세 가지 일", "1. 문제를 겪는 사람을 구체화하기",
  "소기업은 시장이지 첫 사용자가 아닙니다. 좋은 브리프는 그 사람과 상황, 그리고 오늘 사용하는 임시 해결책을 구체적으로 적습니다. 내일 예약을 취소할 병원 관리자가 겪는 문제와 새 예약을 찾는 환자의 문제는 다릅니다. 첫 사용자를 구체화할수록 다음 제품 결정을 내리기 쉬워집니다.",
  "2. 첫 버전의 경계를 정하기", "기능 목록은 사람들이 상상한 것을 말하지만 범위의 경계는 실제로 만들 것을 말합니다. 핵심 순환을 한 문장으로 쓰고, 그것을 안정적으로 작동시키는 화면·의미 있는 행동·데이터·성공을 알려 주는 피드백을 적으세요. 나머지는 출시 요구사항이 아니라 이후 후보입니다.",
  "3. 다음 증거를 정의하기", "출시 후 지켜보겠다는 말은 학습 계획이 아닙니다. 처음 몇 주에 관찰할 완료된 흐름, 반복 행동, 결제 전환 또는 특정 사용자와의 인터뷰를 정하세요. 복잡할 필요는 없지만 다음 제품 결정을 바꿀 만큼 실제 행동에 가까워야 합니다.",
  "화면을 디자인하기 전에 적을 것", ["첫 사용자: 역할, 상황, 고통스러운 임시 해결책", "핵심 순환: 가치를 만들고 반복할 수 있는 최소 행동", "출시 범위: 첫 버전에서 명확히 제외할 내용", "신뢰 요구사항: 사용자가 행동하기 전에 보고 통제하고 이해해야 할 것", "다음 검증 지점: 한 차례 더 만들 가치가 있는 행동이나 대화"],
  "우리가 사용하는 범위 테스트", "제안한 기능을 하나씩 살펴보며 묻습니다. 이 기능이 첫 사용자에게 핵심 순환이 성공할 가능성을 높이는가? 아니라면 첫 버전에서 제외합니다. 가능하다면 보호하는 가설을 쓰고 더 저렴하게 검증할 방법을 찾습니다. 이렇게 하면 유용한 기능이 제품을 영원히 미루는 핑계가 되는 것을 막을 수 있습니다.",
   "브리프의 목표는 만들 수 있는 모든 것을 기록하는 것이 아니라 다음 제작 결정을 한눈에 보이게 하는 것입니다.",
  { title: "Start Apps Studio에서의 활용법", text: "제작 견적을 내기 전에 창업자의 아이디어를 한 페이지 범위 설명으로 바꿉니다. 한 명의 사용자, 하나의 핵심 순환, 이를 뒷받침하는 화면과 인프라, 다음 결정을 바꿔야 하는 증거를 정리합니다. 이 문서는 전략·디자인·엔지니어링·출시 사이의 인수인계 자료가 되며 새 기능이 첫 버전에 몰래 들어오려 할 때 기준점이 됩니다." },
  "자주 묻는 질문", [
    { q: "MVP 브리프는 얼마나 길어야 하나요?", a: "한 번에 읽을 수 있을 만큼 짧고 선택을 내릴 만큼 구체적이어야 합니다. 첫 사용자, 핵심 순환, 출시 범위, 신뢰 요구사항과 다음 검증 지점을 정했다면 보통 한두 페이지면 충분합니다." },
    { q: "완전한 기능 목록을 브리프에 넣어야 하나요?", a: "핵심 순환에 필요한 기능만 넣고 나머지는 이후 아이디어로 분리하세요. 보류 목록은 좋은 아이디어를 보존하면서 출시 요구사항으로 몰래 변하는 것을 막습니다." },
    { q: "목표 사용자가 아직 확실하지 않으면 어떻게 하나요?", a: "가장 유력한 두 후보와 둘을 구분할 증거를 적으세요. 불확실성은 명확하게 드러나면 유용하지만 넓은 범위 속에 숨으면 비용이 커집니다." },
    { q: "디자인 전에 브리프를 완성해야 하나요?", a: "첫 디자인을 이끌 만큼 명확해야 하지만 영원히 고정할 필요는 없습니다. 디자인이 더 나은 질문을 제시할 수 있으므로, 바뀔 때마다 범위와 모으려는 증거를 함께 갱신하세요." },
  ],
] as const;

function makeMvp(): Post {
  return {
    ...source,
    title: koreanText(source.title, "MVP 브리프는 첫 번째 제품 결정입니다"),
    seoTitle: koreanText(source.seoTitle ?? source.title, "MVP 브리프: 첫 번째 제품 결정 | Start Apps Studio"),
    description: koreanText(source.description, "좋은 MVP 브리프는 사용자를 정하고 첫 버전의 경계를 그으며 다음 투자를 결정할 증거를 정의합니다."),
    seoDescription: koreanText(source.seoDescription ?? source.description, "MVP 브리프가 디자인과 코딩 전에 정의해야 할 세 가지를 알아보세요. 디자인 전에 범위와 검증 목표를 정하는 방법도 함께 설명합니다."),
    excerpt: koreanText(source.excerpt, "좋은 MVP 브리프는 짧습니다. 누구를 위한 제품인지, 무엇을 하지 않을지, 어떤 증거가 다음 작업을 정당화하는지 결정합니다."),
    category: "현장 노트", tags: ["MVP", "제품 전략", "창업자", "범위"],
    body: source.body.map((block, index): Block => {
      const value = mvpCopy[index];
      if (block.type === "ul" || block.type === "ol") {
        return {
          ...block,
          items: block.items.map((item, itemIndex) =>
            koreanText(item, (value as readonly string[])[itemIndex]),
          ),
        };
      }
      if (block.type === "faq") {
        return {
          ...block,
          items: block.items.map((item, itemIndex) => ({
            q: koreanText(item.q, (value as readonly { q: string; a: string }[])[itemIndex].q),
            a: koreanText(item.a, (value as readonly { q: string; a: string }[])[itemIndex].a),
          })),
        };
      }
      if (block.type === "callout") {
        const item = value as { title: string; text: string };
        return {
          ...block,
          title: koreanText(block.title ?? "", item.title),
          text: koreanText(block.text, item.text),
        };
      }
      if (block.type === "quote") {
        return {
          ...block,
          text: koreanText(block.text, value as string),
          cite: block.cite ? koreanText(block.cite, `실무 규칙: ${block.cite}`) : block.cite,
        };
      }
      return { ...block, text: koreanText(block.text, value as string) };
    }),
    sources: source.sources?.map((item) => ({ ...item, label: `출처 참고: ${item.label}` })),
  };
}

const mvp = makeMvp();

export const KO_EDITORIAL_CONTENT: LocaleEditorialContent = {
  copy: {
    journalName: "The Journal · 제1권", journalTitle: "스튜디오에서 전하는 현장 노트.",
    journalDescription: "Google에서 순위에 오르고 AI에 인용되는 MVP를 만드는 이야기: GEO, vibe-coding, 그리고 업무 속 AI의 현재.",
    resourcesTitle: "디지털 제품을 만들고 출시하기 위한 실용 가이드.", resourcesDescription: "제품 전략, AI 지원 개발, 기술 선택, 소유권, 인수인계와 MVP 출시에 관한 실용 자료입니다.",
    read: "노트 읽기", minutes: "분 읽기", allNotes: "모든 노트", sources: "출처", shortAnswer: "짧은 답변", language: "언어",
    translatedArticleTitle: mvp.title, translatedArticleDescription: "유용한 MVP 브리프는 첫 사용자를 정하고 첫 버전의 경계를 세우며 다음 결정을 위한 증거를 정의합니다.",
  },
  resources: {
    title: "디지털 제품을 만들고 출시하기 위한 실용 가이드.", description: "제품 전략, AI 지원 개발, 기술 선택, 소유권, 인수인계와 MVP 출시에 관한 실용 자료입니다.",
    eyebrow: "Start Apps Studio · 리소스", primaryAction: "프로젝트 상담하기", journalAction: "Journal 읽기",
    routes: { title: "다음 경로 선택하기", intro: "첫 번째 이정표는 상상할 수 있는 소프트웨어의 양이 아니라 무엇을 증명해야 하는지에 달려 있습니다.", cards: [
      { kicker: "01 · 방향", title: "가장 작은 유효한 증거로 시작하기", text: "런치 사이트는 사람들이 제안을 이해하는지 답합니다. 프로토타입은 경험에 반응하는지 답합니다. MVP는 실제 사용자가 무엇을 하는지 답합니다.", bullets: ["다음 출시가 열어야 할 결정 하나를 고르기", "배울 수 있을 만큼 첫 버전을 좁게 유지하기", "필요한 증거에 맞는 패키지 사용하기"] },
      { kicker: "02 · AI 지원 개발", title: "구조가 견고할 때 속도가 가치 있습니다", text: "AI는 탐색·코딩·검토를 빠르게 하지만 제품 판단·아키텍처·테스트와 결과에 책임지는 사람을 대신하지 않습니다.", bullets: ["AI로 선택지를 탐색하고 반복을 줄이기", "실제 사용자 흐름에 맞춰 생성 코드를 검토하기", "출시 시스템을 이해하고 확장할 수 있게 유지하기"] },
      { kicker: "03 · 소유권", title: "인수인계 때 무엇을 받는지 묻기", text: "성공적인 제작은 최종 발표 이상입니다. 소스 코드·디자인 파일·계정·배포 권한과 맥락이 다음 팀을 위해 준비되어야 합니다.", bullets: ["계정과 작업 파일의 소유자 확인하기", "마지막 주 전에 작동하는 진행 상황 검토하기", "문서화되고 유지 가능한 기반을 남기기"] },
      { kicker: "04 · 파트너 적합성", title: "일하는 방식을 비교하기", text: "제품 파트너를 고르기 전 범위의 명확성, 피드백 주기, 책임, 출시 후 지원과 사업 단계의 적합성을 비교하세요.", bullets: ["제품 결정은 누가 내리나요?", "언제 실제 결과물을 보게 되나요?", "다른 팀이 처음부터 다시 시작하지 않고 이어갈 수 있나요?"] },
    ] },
    packages: { title: "패키지 경로 가이드", intro: "공개 패키지를 대화의 출발점으로 사용하세요. 작업 전 범위를 합의합니다.", columns: ["경로", "투자", "일반적인 기간", "이럴 때 적합"], rows: [
      { route: "Launch Site", investment: "$2,600", timing: "영업일 3–5일", bestFor: "제안을 설명하고 신뢰할 수 있는 디지털 존재감 만들기" }, { route: "Prototype", investment: "$6,000", timing: "5–10일", bestFor: "검증·투자 유치·초기 대화를 위해 아이디어를 구체화하기" }, { route: "MVP", investment: "$15,000–$30,000", timing: "3–8주", bestFor: "실제 Web, iOS 또는 Android 제품을 사용자에게 제공하기" }, { route: "Custom", investment: "$25,000", timing: "1–6개월", bestFor: "장기 책임이 필요한 더 크고 복잡한 시스템 만들기" },
    ] },
    toolkit: { title: "작업을 뒷받침하는 도구", intro: "제품 결과, 인수할 팀과 사업 단계에 맞춰 도구를 선택합니다.", groups: [
      { label: "아이디어를 눈에 보이게", description: "개념을 눌러 보고 공유하고 테스트할 수 있는 화면으로 바꾸는 방법입니다.", tools: [{ name: "Figma", note: "코딩 전 모든 화면을 디자인", tone: "figma" }, { name: "Rork", note: "며칠 만에 실제 휴대폰에서 테스트", tone: "rork" }, { name: "Lovable", note: "며칠 만에 런치 사이트 출시", tone: "lovable" }, { name: "Replit", note: "실행하고 편집할 수 있는 제품", tone: "replit" }] },
      { label: "오래가는 제품 만들기", description: "사용자가 설치하고 열고 결제하는 앱을 지탱하는 엔지니어링입니다.", tools: [{ name: "React Native", note: "하나의 코드베이스, iOS + Android", tone: "expo" }, { name: "Swift", note: "네이티브 iOS, iPhone에서 가장 빠르게", tone: "swift" }, { name: "Kotlin", note: "네이티브 Android, Play Store 전체 도달", tone: "kotlin" }, { name: "Node + PostgreSQL", note: "안전하고 내보낼 수 있는 데이터", tone: "node" }] },
      { label: "첫날부터 수익과 출시", description: "결제·업데이트·코드 안전을 나중이 아니라 처음부터 연결합니다.", open: true, tools: [{ name: "Stripe", note: "일회성 결제·구독·업그레이드", tone: "stripe" }, { name: "RevenueCat", note: "App Store 및 Play Store 결제", tone: "revenuecat" }, { name: "GitHub", note: "매일 백업되어 코드를 안전하게 보관", tone: "github" }, { name: "Automation", note: "n8n + Make가 반복 업무 처리", tone: "hooks" }] },
      { label: "방해하지 않는 백그라운드 AI", description: "AI는 리서치·구현·검토를 돕고 방향과 품질 기준은 사람이 책임집니다.", tools: [{ name: "Claude", note: "주요 빌더와 코드 리뷰어", tone: "claude" }, { name: "Gemini", note: "제품 전체를 한 번에 검토", tone: "gemini" }, { name: "GPT-5", note: "카피·플로우·크리에이티브 방향", tone: "gpt" }, { name: "Llama 4", note: "민감한 작업을 위한 자체 호스팅 옵션", tone: "llama" }] },
    ], footnote: "코드·계정·작업 파일은 여러분이 보유합니다. 더 나은 도구가 나와도 제품을 인질로 잡히지 않고 교체할 수 있습니다." },
    journal: { title: "Journal 현장 노트", text: "MVP 전략, SEO, GEO, vibe-coded 앱과 제품을 쉽게 출시하게 만드는 결정에 관한 긴 노트입니다.", readAction: "노트 읽기", minutesLabel: "분 읽기", allAction: "모든 Journal 노트", fallbackCategory: "Journal", postSlugs: ["base44-vs-lovable-which-one-for-your-next-app", "the-mvp-brief-is-your-first-product-decision", "make-your-brand-visible-in-chatgpt", "vibe-coded-apps-have-an-seo-problem", "backlinks-still-decide-who-gets-recommended", "ai-overviews-citation-playbook-for-mvps"] },
    cta: { title: "생각해 둔 경로가 있나요?", text: "현재 위치와 증명해야 할 것, 지금 막힌 지점을 알려 주세요.", action: "다음 단계 확인하기" },
  },
  post: mvp,
  translatedPosts: KO_TRANSLATED_POSTS,
};

export default KO_EDITORIAL_CONTENT;