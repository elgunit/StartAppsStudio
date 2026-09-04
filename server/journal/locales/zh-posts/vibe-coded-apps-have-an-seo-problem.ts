import { getPost, type Block, type Post } from "../../posts";

const source = getPost("vibe-coded-apps-have-an-seo-problem");
if (!source) {
  throw new Error('Missing journal source post "vibe-coded-apps-have-an-seo-problem".');
}
const sourcePost: Post = source;

type LocalizedBlock =
  | string
  | { title: string; text: string }
  | readonly string[]
  | readonly { q: string; a: string }[];

const copy: readonly LocalizedBlock[] = [
  "Vibe-coded 应用在客户端渲染，因此爬虫看到的是空的 <div>。要解决它，可以在你的域名与 Lovable 之间部署 Cloudflare Worker，向机器人返回服务器端渲染的 HTML；或者在投入营销前，将项目迁移到真正的技术栈（Claude Code + Supabase + Vercel）。",
  'Lovable、Bolt 和 v0 这类工具非常适合在一个下午发布一个想法，却不擅长 SEO。整页都是客户端 React bundle，这意味着 Googlebot 首次抓取时看到的是空的 <div id="root" />。没有内容，没有标题，没有 schema，也没有排名。对于依赖自然流量的 MVP，这会成为创业第一年的问题。',
  "以下是我们在 Start Apps Studio 使用的两种修复方法，按所需投入从小到大排列。",
  "修复方法 1：Cloudflare Worker SSR 代理",
  "Cloudflare Worker 位于你的域名和 Lovable 之间。请求到达时，Worker 会检查 User-Agent：真实访客照常被代理至 Lovable；机器人（Googlebot、Bingbot、GPTBot、PerplexityBot、ClaudeBot）则通过同一个 URL 获得带有真实内容和完整 schema markup 的服务器端渲染 HTML。",
  "正确实施时，这不是 cloaking。机器人收到的内容必须与用户在 JS 执行后最终看到的内容一致。设置分为两步：",
  [
    "在 DNS 中添加一条 CNAME，将你的自定义域名指向 Cloudflare Worker。",
    "在 Lovable 中粘贴一条 prompt，让 Worker 拥有可用于服务器端渲染的规范页面清单。",
  ],
  {
    title: "何时采用 Worker 方案",
    text: "如果你还没准备好迁离 Lovable，却需要在本周让页面被索引，Cloudflare Worker 是正确选择。它是唯一能完整保留 Lovable 可视化编辑流程的修复方法。",
  },
  "修复方法 2：使用 Claude Code 迁离 Lovable",
  "Worker 为你争取时间。但如果应用必须认真争取排名、处理动态内容，或在一年后仍由人维护，你会希望迁到“常规”的 Web 技术栈。我们见过最快的方式是让 Claude Code 替你完成迁移。",
  "10 步迁移方案",
  [
    "将 Lovable 项目推送到 GitHub，方便 Claude 使用。",
    "在本地安装 Claude Code，让它能够直接读取和编辑你的 repo。",
    "让 Claude 指向你的 repo（GitHub remote 或本地路径）。",
    "为数据库和 auth 创建一个 Supabase 项目（大约五分钟）。",
    "让 Claude 用以下 prompt 将项目迁离 Lovable：“将此 Lovable 项目迁移到常规 Web 技术栈，并清晰地整理 repo。”",
    "在 Vercel 上设置托管服务。免费层足以覆盖大多数 MVP。",
    "询问 Claude 需要哪些环境变量和 API keys；它很擅长识别这些内容。",
    "生成密钥并创建 .env 文件（Supabase keys、API tokens 等）。",
    "让 Claude 配置部署。它可以连接 GitHub → Vercel 流程并接入 Supabase。",
    "逐一让 Claude 调试每个出错项，修复任何故障。",
  ],
  "这一设置最终会比 Lovable 本身更灵活。你不再为应用改动按 prompt credits 付费，并且小改动可以改用免费模型，因为 Lovable 的大部分生成本来就在底层使用 Claude。",
  "Lovable + Claude 混合方案",
  "如果你的项目进行到一半、还不能迁移，还有一条中间路径，多个 r/lovable 用户已验证：将 Lovable 连接到 GitHub，然后让 Claude Code 访问同一 repo。Claude 位于 Lovable 之上的一层，引导它实现复杂功能、调试和增强；同时你直接在 Supabase 中运行 SQL 来修改数据库（Lovable 不会对运行查询收费，因此是免费的）。",
  "结果是：在阻塞性的组件上消耗的 credits 更少（用户报告单个组件节省了 100+ credits）、更能处理缠绕的逻辑，并且——对本文至关重要——你对输出 HTML 拥有足够控制力，可逐步补上 SSR 和 schema。",
  "应该选择哪种修复方法？",
  [
    "仅营销网站或落地页 → Cloudflare Worker SSR。最便宜，速度最快。",
    "需要获得排名的动态内容产品 → 迁移至 Claude Code + Supabase + Vercel。",
    "项目进行到一半且无法重建 → Lovable + Claude 混合方案，然后为重要页面补上 SSR。",
  ],
  {
    title: "我们如何参与",
    text: "Start Apps Studio 已使用这套方案将数个 Lovable MVP 迁离该平台。如果你不想花一周处理这些基础设施，我们可以从 prompt 一路做到已被索引的生产环境，通常不到两周。",
  },
  "常见问题",
  [
    {
      q: "为什么 Google 不能直接索引 Lovable 页面？",
      a: "Lovable 交付的是客户端渲染的 React bundle，因此初始 HTML 是空的 root div。Googlebot 的第一轮抓取会获取这份空 HTML；它可能（也可能不会）稍后回来渲染 JavaScript。对于没有权威性的新域名，这第二轮渲染通常根本不会触发。",
    },
    {
      q: "Cloudflare Worker 修复方法算 cloaking 吗？",
      a: "如果机器人看到的内容与用户在 JS 执行后最终看到的相同，就不算。向机器人提供预渲染 HTML 是成熟的 SEO 模式；只有向机器人和用户提供不同内容时，才会变成 cloaking。",
    },
    {
      q: "完整迁移要花多少钱？",
      a: "自己做：一个周末，加上 Vercel + Supabase 免费层账户。由 Start Apps Studio 交付：通常约一个 sprint，包含在我们的 MVP Production 套餐中。",
    },
    {
      q: "迁移后还能进行可视化编辑吗？",
      a: "你会失去 Lovable 的浏览器内编辑器，但会获得常规开发循环，并可在 repo 之上接入任何可视化工具（或其他 AI builder）。大多数团队看到 Claude Code 迭代有多快后，就不会怀念它了。",
    },
  ],
];

const sourceLabels = [
  "r/lovable 展示帖：“我解决了 Lovable 最大的 SEO 问题”（Cloudflare Worker 模式）。",
  "r/lovable 教程：u/EIAMM 撰写的“Lovable <> Claude = 10X 性能”。",
  "r/lovable：迁移至 Claude Code + Supabase + Vercel 的 10 步指南。",
] as const;

function localizedBody(): Block[] {
  if (sourcePost.body.length !== copy.length) {
    throw new Error('Chinese translation block count does not match "vibe-coded-apps-have-an-seo-problem".');
  }

  return sourcePost.body.map((block, index): Block => {
    const value = copy[index];
    if (block.type === "ul" || block.type === "ol") {
      if (!Array.isArray(value) || value.length !== block.items.length) {
        throw new Error(`Chinese list does not match source at block ${index}.`);
      }
      return { ...block, items: [...value] };
    }
    if (block.type === "faq") {
      if (!Array.isArray(value) || value.length !== block.items.length) {
        throw new Error(`Chinese FAQ does not match source at block ${index}.`);
      }
      return { ...block, items: [...value] };
    }
    if (block.type === "callout") {
      if (typeof value !== "object" || Array.isArray(value) || !("title" in value)) {
        throw new Error(`Chinese callout does not match source at block ${index}.`);
      }
      return { ...block, title: value.title, text: value.text };
    }
    if (typeof value !== "string") {
      throw new Error(`Chinese text does not match source at block ${index}.`);
    }
    return { ...block, text: value };
  });
}

const body = localizedBody();
if (
  JSON.stringify(
    body.map((block) => ({
      type: block.type,
      id: "id" in block ? block.id : undefined,
      items: block.type === "ul" || block.type === "ol" || block.type === "faq" ? block.items.length : undefined,
    })),
  ) !==
  JSON.stringify(
    sourcePost.body.map((block) => ({
      type: block.type,
      id: "id" in block ? block.id : undefined,
      items: block.type === "ul" || block.type === "ol" || block.type === "faq" ? block.items.length : undefined,
    })),
  )
) {
  throw new Error('Chinese translation structure does not match "vibe-coded-apps-have-an-seo-problem".');
}
if ((sourcePost.sources?.length ?? 0) !== sourceLabels.length) {
  throw new Error('Chinese translation source count does not match "vibe-coded-apps-have-an-seo-problem".');
}

export const ZH_POST_2: Post = {
  ...sourcePost,
  title: "Vibe-coded 应用存在 SEO 问题：该如何修复",
  seoTitle: "Vibe-Coded 应用与 SEO：如何修复 | Start Apps Studio",
  description: "Lovable、Bolt 和 v0 向爬虫交付空 div。可通过 Cloudflare Worker SSR 代理修复，或在需要排名时完整迁移至 Claude Code + Supabase + Vercel。",
  seoDescription: "Lovable、Bolt 和 v0 向爬虫交付空 div。要快速见效可使用 Cloudflare Worker SSR 代理；当排名重要时则迁移至真正的技术栈。",
  excerpt: "Lovable 构建可在数小时内完成，却能在数秒内对 Google 隐形。两种修复方法：快速见效的 Cloudflare Worker 代理，以及认真争取排名时的完整迁移方案。",
  category: "实地笔记",
  tags: ["Vibe coding", "Lovable", "SEO", "SSR", "Claude"],
  body,
  sources: sourcePost.sources?.map((item, index) => ({
    ...item,
    label: sourceLabels[index],
  })),
};