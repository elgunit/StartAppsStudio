import { getPost, type Post } from "../../posts";

const SOURCE_SLUG = "base44-vs-lovable-which-one-for-your-next-app";
const sourcePost = getPost(SOURCE_SLUG);

if (!sourcePost) {
  throw new Error(`Missing journal source post "${SOURCE_SLUG}".`);
}

export const ZH_POST_7: Post = {
  slug: sourcePost.slug,
  title: "Base44 对比 Lovable：哪一个适合你的下一款应用？",
  seoTitle: "Base44 对比 Lovable：哪一个适合你的下一款应用？| Start Apps Studio",
  description: "Base44 和 Lovable 分别针对不同类型的速度进行了优化。在决定在哪里构建前，比较它们的后端控制、AI 工作流、SEO 和交接路径。",
  seoDescription: "Base44 是快速构建封闭式应用的路径。Lovable 提供更开放的后端，也是面向公开、可搜索页面的更强起点。构建前请比较这些取舍。",
  excerpt: "Base44 和 Lovable 都能让想法迅速启动。关键差异会在之后出现：当你的应用需要自定义认证、搜索可见性或清晰的交接时。",
  publishedAt: sourcePost.publishedAt,
  updatedAt: sourcePost.updatedAt,
  readMinutes: sourcePost.readMinutes,
  category: "实战笔记",
  tags: ["Base44", "Lovable", "氛围编程", "SEO", "产品策略"],
  body: [
    { type: "answer", text: "对于重视速度和内置约定的封闭式、需认证应用，Base44 更合适。当你需要开放的 Supabase 后端、自定义集成的空间，或搜索引擎可以读取的公开页面时，Lovable 更合适。如果产品变得对业务至关重要，应把两者都视作起点，并在构建过多之前规划交接。" },
    { type: "p", text: "当唯一衡量标准是多快能产出第一个屏幕时，选择 AI 应用构建器很容易。更难的问题是该屏幕之后会发生什么：登录流程变得不寻常时、数据模型需要改变时、Google 需要抓取落地页时，或者另一位工程师必须接手代码时。" },
    { type: "p", text: "Base44 和 Lovable 都擅长把粗略想法变成可工作的流程。为了做到这一点，它们做出了不同取舍。Base44 感觉更封闭，在运营上更方便。Lovable 围绕 Supabase 提供了更熟悉、更可移植的基础组件。没有哪一个在所有情况下都胜出。正确选择取决于你在哪些方面需要控制权。" },
    { type: "h2", text: "真正的决定在于你需要在哪些方面掌控", id: "where-you-need-control" },
    { type: "p", text: "构建器不只是编写提示词的界面。它也是对后端、部署模式、搜索入口以及未来维护循环的选择。在应用还很小时，这些选择可以一直不显眼。一旦用户、支付、私密数据和营销流量都依赖它们，它们就会变得昂贵。" },
    { type: "h2", text: "1. 后端：开放的基础组件还是封闭的平台？", id: "backend-control" },
    { type: "h3", text: "Lovable：熟悉的构建模块", id: "lovable-backend" },
    { type: "p", text: "Lovable 建立在 Supabase 之上，为项目提供了许多工程师已经理解的后端：用于数据的 Postgres、标准认证模式、存储和有文档说明的 API。这并不会自动让每一种实现都变好，但当产品需要自定义角色、较少见的 OAuth 提供商，或不适合常规路径的集成时，它为你提供了更可移植的基础。" },
    { type: "p", text: "实际好处不是 Supabase 消除了复杂性，而是复杂性是可见的。你可以检查数据库、推理认证流程，并找到以前使用过相同基础组件的工程师。" },
    { type: "h3", text: "Base44：在边界内更快", id: "base44-backend" },
    { type: "p", text: "Base44 将更多后端体验纳入自己的托管环境。这可能正是非技术创始人想要的：需要配置的服务更少、合理的默认设置，以及更少把第一版连接起来的时间。对于私有仪表盘、内部工具或直接的认证工作流，这种便利具有真正价值。" },
    { type: "p", text: "代价是，不寻常的需求可能会迫使你采用变通方案。专有后端的边界可能限制你自由设计自定义认证、引入专业身份提供商，或将系统的一部分迁往别处。因此，应最先而不是最后测试最难的需求。" },
    { type: "callout", title: "选择前先问这个问题", text: "这个产品必须完成的最不标准的事情是什么？在投入界面的其余部分之前测试该流程。一个能漂亮处理演示、却无法支持决定性约束的构建器，并没有为你节省时间。" },
    { type: "h2", text: "2. AI 工作流：便利还是有意识的选择？", id: "ai-workflow" },
    { type: "p", text: "两种工具在让你看到多少模型决策方面也不同。这对落地页影响较小；对具有错综复杂状态、陌生领域规则，或需要一致性胜过新颖性的调试问题的产品，影响则更大。" },
    { type: "h3", text: "Lovable 让循环保持无摩擦", id: "lovable-ai-workflow" },
    { type: "p", text: "Lovable 的自动模式会为任务选择模型，让体验保持简单。你描述改动、审查结果，然后继续推进。当主要瓶颈是将创始人的想法转化为可测试形式，而不是调校实现过程时，这很有用。" },
    { type: "h3", text: "Base44 提供模型选择器", id: "base44-ai-workflow" },
    { type: "p", text: "Base44 将更多选择交给构建者。你若知道某个模型更适合特定调试任务、集成或大型重构，在 Opus 或 Sonnet 等模型之间选择会很有用。这也让你更容易在项目的敏感部分持续使用偏好的模型。" },
    { type: "p", text: "模型控制不等于产品控制。更强的模型仍可能产出错误的抽象，更快的模型仍可能做出高风险改动。无论使用哪种工具，都应保留书面范围、审查数据模型，并在常规路径之外测试核心工作流。" },
    { type: "h2", text: "3. SEO：爬虫能看见产品吗？", id: "seo-and-crawling" },
    { type: "p", text: "SEO 只对产品中需要被发现的部分重要。私有运营仪表盘不需要排名。公开落地页、目录、对比页面或产品驱动的获客循环则绝对需要。" },
    { type: "h3", text: "Lovable 是公开页面更强的起点", id: "lovable-seo" },
    { type: "p", text: "Lovable 的服务器端渲染意味着，爬虫可以接收有意义的 HTML，而不必等待客户端包执行。这让 Googlebot 和其他发现系统能更好地初步查看解释页面内容的标题、文案、链接和结构化内容。" },
    { type: "p", text: "SSR 不是排名保证。你仍需要有用内容、稳定 URL、内部链接、元数据以及与用户所见相符的 schema。它只是比假设每个爬虫都会在第二次处理时正确渲染 React 应用好得多的基础。" },
    { type: "h3", text: "Base44 往往是私有应用的合理选择", id: "base44-seo" },
    { type: "p", text: "当应用位于认证之后、公开获客页面在别处时，Base44 的 React 和 Vite 方式可以完全够用。当 Base44 应用本身就是营销网站时，这便成为问题。元数据设置不一定意味着原始爬虫能看见完整页面内容，因此在投入自然增长计划前，请测试初始 HTML。" },
    { type: "h2", text: "4. 交接测试：你能负责任地离开吗？", id: "handoff" },
    { type: "p", text: "最好的构建器不只是能让你到达第一版的那个，也是你离开后不会失去产品的那个。开始前，请回答四个不那么光鲜的问题：" },
    { type: "ul", items: ["不使用构建器时，你能导出或检查代码、数据和配置吗？", "另一位工程师能在本地运行项目，并理解重要决策存放在哪里吗？", "如果产品超出承载能力，你能替换默认认证、支付或数据服务吗？", "如果第一版可行而需求不再标准，迁移路径是什么？"] },
    { type: "p", text: "这些问题不是反对托管工具的理由，而是有意识使用它们的方法。封闭的内部应用可能永远不需要迁移。拥有不断壮大团队的公开产品，很可能需要比第一个提示词所暗示的更清晰的所有权和交接计划。" },
    { type: "h2", text: "应该选择哪一个？", id: "decision-guide" },
    { type: "ul", items: ["为公开落地页、可搜索的产品入口，或需要 Supabase 开放后端基础组件的应用选择 Lovable。", "为私有仪表盘、内部工具，或托管配置是主要优势的直接认证工作流选择 Base44。", "当自定义认证、不寻常的数据关系或第三方集成是产品核心时，选择 Lovable。", "短期验证冲刺可选择任何一个，但在真实用户、支付或敏感数据到来前，写下交接计划。", "当产品价值依赖任何构建器都无法良好支持的需求时，更早选择常规代码库。"] },
    { type: "quote", text: "最快的工具，是让你的下一个产品决策成本更低的工具，而不是第一个下午生成代码最多的工具。", cite: "我们选择构建路径时使用的一条原则" },
    { type: "callout", title: "我们在 Start Apps Studio 的做法", text: "当 AI 构建器缩短获得证据的路径时，我们会使用它；而不是让团队借此推迟艰难决策时。构建前，我们会确定第一位用户、核心工作流、信任要求，以及系统中必须保持灵活的部分。这就是快速原型如何成为产品，而不只是令人印象深刻的初稿。" },
    { type: "h2", text: "常见问题", id: "faq" },
    { type: "faq", items: [
      { q: "Base44 比 Lovable 更好吗？", a: "没有哪一个在每种情况下都更好。对于托管配置和模型选择很重要的封闭式认证应用，Base44 很有吸引力。当你需要更开放的 Supabase 后端、自定义集成，或需要可抓取的公开页面时，Lovable 更合适。" },
      { q: "我可以使用 Base44 或 Lovable 构建 MVP 吗？", a: "可以，尤其当 MVP 被设计为回答一个聚焦的产品问题时。保持范围狭窄，尽早测试决定性约束，并决定如果实验赢得更大规模的构建，代码和数据将如何处理。" },
      { q: "哪个平台更适合 SEO？", a: "Lovable 是公开 SEO 更强的起点，因为服务器渲染的 HTML 会立即向爬虫提供可读内容。你仍应检查实际初始响应并测试元数据、链接和 schema，而不是依赖平台标签。" },
      { q: "我什么时候应该超越 AI 应用构建器？", a: "当产品的重要需求正在变成变通方案时就该迁移：自定义身份、复杂权限、不寻常的集成、性能约束，或需要可预测所有权的团队。若在第一版变得对业务至关重要前就规划退出，迁移会更容易。" },
    ] },
  ],
  sources: [
    { label: "为本实战笔记提供的对比来源：后端架构和认证讨论（0:55–13:05）。" },
    { label: "为本实战笔记提供的对比来源：AI 模型工作流和模型选择讨论（27:41–34:12）。" },
    { label: "为本实战笔记提供的对比来源：SEO、SSR 和最终平台建议（37:16–1:22:23）。" },
  ],
};

function structure(post: Post) {
  return post.body.map((block) => ({
    type: block.type,
    id: "id" in block ? block.id : undefined,
    items: block.type === "ul" || block.type === "ol" || block.type === "faq" ? block.items.length : undefined,
  }));
}

if (JSON.stringify(structure(ZH_POST_7)) !== JSON.stringify(structure(sourcePost))) {
  throw new Error(`Localized post "${SOURCE_SLUG}" does not retain the source body structure.`);
}