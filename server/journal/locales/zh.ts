import { getPost } from "../posts";
import type { LocaleEditorialContent } from "../editorial";
import { ZH_TRANSLATED_POSTS } from "./zh-posts";

const sourcePost = getPost("the-mvp-brief-is-your-first-product-decision");
if (!sourcePost) throw new Error("MVP source post is missing.");

export const ZH_EDITORIAL_CONTENT: LocaleEditorialContent = {
  copy: { journalName: "The Journal · 第一卷", journalTitle: "来自工作室的实地笔记。", journalDescription: "关于发布能在 Google 获得排名、被 AI 引述的 MVP 的观察：GEO、vibe-coding，以及 AI 在工作中的现状。", resourcesTitle: "构建和发布数字产品的实用指南。", resourcesDescription: "关于产品策略、AI 辅助交付、技术选择、所有权、交接以及 MVP 发布的实用资源。", read: "阅读笔记", minutes: "分钟阅读", allNotes: "全部笔记", sources: "来源", shortAnswer: "简短回答", language: "语言", translatedArticleTitle: "MVP 简报是你的第一个产品决策", translatedArticleDescription: "一份有用的 MVP 简报会明确首位用户、划定第一版边界，并定义下一次决策所需的证据。" },
  resources: {
    title: "构建和发布数字产品的实用指南。", description: "关于产品策略、AI 辅助交付、技术选择、所有权、交接以及 MVP 发布的实用资源。", eyebrow: "Start Apps Studio · 资源", primaryAction: "聊聊你的项目", journalAction: "阅读 Journal",
    routes: { title: "选择下一条路径", intro: "正确的第一个里程碑取决于你需要证明什么，而不是你能想象出多少软件。", cards: [
      { kicker: "01 · 方向", title: "从最小的有效证据开始", text: "发布网站能回答人们是否理解你的产品。原型能回答他们能否对体验作出反应。MVP 能回答真实用户会做什么。", bullets: ["选择下一次发布必须解锁的一个决策", "让第一版足够聚焦，以便从中学习", "使用与你所需证据相匹配的方案"] },
      { kicker: "02 · AI 辅助交付", title: "结构稳固时，速度才有价值", text: "AI 可以加快探索、编码和审查。它不能替代产品判断、架构、测试，或对结果负责的人。", bullets: ["用 AI 探索选择并减少重复工作", "依据真实用户流程审查生成的代码", "让已发布的系统易于理解和扩展"] },
      { kicker: "03 · 所有权", title: "问清交接时会交付什么", text: "成功的构建不只是最终展示。源代码、设计文件、账户、部署访问权限和背景信息都应为你或下一支团队准备妥当。", bullets: ["确认谁拥有账户和工作文件", "在最后一周之前审查可运行的进展", "带着有文档、可维护的基础离开"] },
      { kicker: "04 · 合作伙伴匹配度", title: "比较工作方式", text: "选择产品合作伙伴前，请比较范围清晰度、反馈循环、责任、发布后的支持，以及该路径是否适合你的业务阶段。", bullets: ["谁做产品决策？", "你何时能看到真实成果？", "另一支团队能否不从头开始就继续工作？"] },
    ] },
    packages: { title: "方案路径指南", intro: "将公开方案作为对话的起点。工作开始前会先商定范围。", columns: ["路径", "投入", "典型周期", "最适合你需要"], rows: [
      { route: "发布网站", investment: "$2,600", timing: "3–5 个工作日", bestFor: "解释产品并建立可信的数字形象" }, { route: "原型", investment: "$6,000", timing: "5–10 天", bestFor: "让想法变得可感知，用于验证、融资或早期沟通" }, { route: "MVP", investment: "$15,000–$30,000", timing: "3–8 周", bestFor: "将真实的 Web、iOS 或 Android 产品交到用户手中" }, { route: "定制", investment: "$25,000", timing: "1–6 个月", bestFor: "构建更大或更复杂、具有长期责任的系统" },
    ] },
    toolkit: { title: "工作背后的工具集", intro: "工具会根据产品成果、接手它的团队和业务所处阶段来选择。", groups: [
      { label: "让你的想法看得见", description: "概念如何变成可点击、可与投资人分享、可由真实用户测试的屏幕。", tools: [{ name: "Figma", note: "每个屏幕都在编码前完成设计", tone: "figma" }, { name: "Rork", note: "几天内就在真实手机上试用", tone: "rork" }, { name: "Lovable", note: "几天内让发布网站上线", tone: "lovable" }, { name: "Replit", note: "可运行、可编辑的工作产品", tone: "replit" }] },
      { label: "为持久使用而构建的产品", description: "支撑用户安装、打开并付费使用的应用的工程能力。", tools: [{ name: "React Native", note: "一套代码库，iOS + Android", tone: "expo" }, { name: "Swift", note: "原生 iOS，在 iPhone 上最快", tone: "swift" }, { name: "Kotlin", note: "原生 Android，完整覆盖 Play Store", tone: "kotlin" }, { name: "Node + PostgreSQL", note: "你的数据，安全且可由你导出", tone: "node" }] },
      { label: "从第一天起就考虑收入与发布", description: "支付、更新和代码安全从一开始就接入，而不是事后再补。", open: true, tools: [{ name: "Stripe", note: "一次性付款、订阅、升级", tone: "stripe" }, { name: "RevenueCat", note: "App Store 和 Play Store 计费", tone: "revenuecat" }, { name: "GitHub", note: "每日备份：你的代码始终安全", tone: "github" }, { name: "Automation", note: "n8n + Make 处理繁琐工作", tone: "hooks" }] },
      { label: "AI 在幕后，而不妨碍你", description: "AI 可以支持研究、实施和审查，同时由人负责方向和质量标准。", tools: [{ name: "Claude", note: "主要构建者和代码审查者", tone: "claude" }, { name: "Gemini", note: "一次审查整个产品", tone: "gemini" }, { name: "GPT-5", note: "文案、流程和创意方向", tone: "gpt" }, { name: "Llama 4", note: "适合敏感工作的自托管选项", tone: "llama" }] },
    ], footnote: "代码、账户和工作文件由你保留。出现更好的工具时，可以替换它，而不会让你的产品被绑住。" },
    journal: { title: "Journal 的实地笔记", text: "关于 MVP 策略、SEO、GEO、vibe-coded 应用，以及让产品更容易发布的决策的长篇笔记。", readAction: "阅读笔记", minutesLabel: "分钟阅读", allAction: "全部 Journal 笔记", fallbackCategory: "Journal", postSlugs: ["base44-vs-lovable-which-one-for-your-next-app", "the-mvp-brief-is-your-first-product-decision", "make-your-brand-visible-in-chatgpt", "vibe-coded-apps-have-an-seo-problem", "backlinks-still-decide-who-gets-recommended", "ai-overviews-citation-playbook-for-mvps"] },
    cta: { title: "心里已有路径了吗？", text: "告诉我们你目前所处的位置、需要证明什么，以及眼下卡在哪里。", action: "获得明确的下一步" },
  },
  post: { slug: sourcePost.slug, publishedAt: sourcePost.publishedAt, readMinutes: sourcePost.readMinutes, title: "MVP 简报是你的第一个产品决策", seoTitle: "MVP 简报：你的第一个产品决策 | Start Apps Studio", description: "一份有用的 MVP 简报不只是描述一个想法。它会明确用户、为第一版划出清晰边界，并定义告诉你是否继续构建的证据。", seoDescription: "你的 MVP 简报是产品决策，不是文书工作。了解在设计或编码开始前，有用的简报必须定义的三件事。", excerpt: "最好的 MVP 简报并不长。它决定产品服务谁、第一版明确不做什么，以及什么证据值得投入下一周的工作。", category: "实地笔记", tags: ["MVP", "产品策略", "创始人", "范围"], body: [
    { type: "answer", text: "一份有用的 MVP 简报会在设计开始前做出三个决定：产品服务谁、第一版将刻意省略什么，以及什么用户证据能证明下一笔投入合理。这就是简报不是文书工作的原因；它是第一个产品决策。" },
    { type: "p", text: "创始人常带着一份实际上只是想法说明的简报而来：几段市场介绍、一个功能清单，以及一句关于产品未来可能走向何处的话。它足以开启对话，却不足以据此发布产品。构建团队需要一份更小、更聚焦的文件，把雄心转化为一系列可验证的选择。" },
    { type: "h2", text: "有用的简报完成三项工作", id: "three-jobs" }, { type: "h3", text: "1. 明确遇到问题的人", id: "name-the-user" }, { type: "p", text: "“小企业”是一个市场，不是首位用户。一份好的简报会明确这个人、他们所处的时刻，以及他们今天使用的临时办法。试图填补明天取消预约的诊所经理，与正在寻找新预约的患者面对的是不同问题，即使两者都属于医疗领域。首位用户越具体，越容易决定产品下一步该做什么。" },
    { type: "h3", text: "2. 为第一版划出边界", id: "draw-the-line" }, { type: "p", text: "功能清单告诉你人们设想了什么；范围边界告诉你将构建什么。用一句话写下核心循环，然后列出让它可靠运行的工作：主屏幕、一个有意义的操作、背后的数据，以及告诉用户它成功了的反馈。其他一切都是以后再考虑的候选项，不是发布时默认的要求。" },
    { type: "h3", text: "3. 定义接下来的证明", id: "define-the-proof" }, { type: "p", text: "“发布后看看会发生什么”不是学习计划。决定你期待在最初几周观察到什么：完成的工作流程、重复操作、付费转化，或创始人与特定类型用户进行的访谈。这个衡量不必复杂；它需要足够接近用户行为，才能改变下一个产品决策。" },
    { type: "h2", text: "在设计屏幕前写下什么", id: "before-a-screen" }, { type: "ul", items: ["首位用户：一个角色、一种情境和一个痛苦的权宜办法", "核心循环：创造价值且可以重复发生的最小操作", "发布边界：第一版明确不在范围内的内容", "信任要求：用户行动前必须看到、控制或理解的内容", "下一个验证点：值得再进行一轮构建工作的行为或对话"] },
    { type: "h2", text: "我们使用的范围测试", id: "scope-test" }, { type: "p", text: "逐一审视每项拟议功能，并问一个问题：它会不会让核心循环更可能为首位用户成功？如果答案是否定的，就把它移出第一个版本。如果答案是可能，写下它在保护的假设，并找一种更便宜的方式测试该假设。这样可以防止一项有用功能成为永久拖延产品的借口。" },
    { type: "quote", text: "简报的目标不是记录你可能构建的一切，而是让下一项构建决策一目了然。", cite: "我们在产品启动时使用的一条规则" },
    { type: "callout", title: "我们在 Start Apps Studio 如何使用它", text: "在为构建报价前，我们会把创始人的想法变成一页范围说明：一个用户、一个核心循环、支持它的屏幕和基础设施，以及应当改变下一次决策的证据。这份文件成为策略、设计、工程和发布之间的交接，也是在新功能试图混进第一版时的参考点。" },
    { type: "h2", text: "常见问题", id: "faq" }, { type: "faq", items: [{ q: "MVP 简报应该多长？", a: "应当短到能一口气读完，又具体到足以做取舍。当它明确了首位用户、核心循环、发布边界、信任要求和下一个验证点时，一到两页通常已足够。" }, { q: "简报应该包含完整的功能清单吗？", a: "包含让核心循环运行所需的功能，然后把其他内容放在后续想法部分。单独的搁置区能保护好想法，又不让它们悄悄变成发布要求。" }, { q: "如果目标用户仍不确定怎么办？", a: "写下最有力的两个候选人，以及能区分他们的证据。不确定性在明确时是有用的；隐藏在宽泛产品范围中时就会变得昂贵。" }, { q: "设计开始前必须完成简报吗？", a: "它应该清晰到足以指导第一轮设计，而不必永远冻结。设计可以揭示更好的问题，但每项改变都应更新范围以及你正试图收集的证据。" }] },
  ] },
  translatedPosts: ZH_TRANSLATED_POSTS,
};

export default ZH_EDITORIAL_CONTENT;