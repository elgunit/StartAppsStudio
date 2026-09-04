import { getPost, type Block, type Post } from "../posts";
import { ZH_POST_1 } from "./zh-posts/make-your-brand-visible-in-chatgpt";
import { ZH_POST_2 } from "./zh-posts/vibe-coded-apps-have-an-seo-problem";
import { ZH_POST_3 } from "./zh-posts/ai-at-work-2026-what-it-means-for-founders";
import { ZH_POST_4 } from "./zh-posts/backlinks-still-decide-who-gets-recommended";
import { ZH_POST_5 } from "./zh-posts/designing-for-the-ai-native-era";
import { ZH_POST_6 } from "./zh-posts/design-systems-matter-more-in-the-ai-era";
import { ZH_POST_7 } from "./zh-posts/base44-vs-lovable-which-one-for-your-next-app";

type LocalizedBlock =
  | string
  | { title: string; text: string }
  | readonly string[]
  | readonly { q: string; a: string }[];

/**
 * Keep authored structure (including heading anchors) with the English post.
 * The Chinese copy is deliberately supplied in reading order: this makes a
 * changed source block fail loudly rather than quietly publishing mismatched
 * content.
 */
function translated(
  slug: string,
  fields: Pick<Post, "title" | "seoTitle" | "description" | "seoDescription" | "excerpt" | "category" | "tags">,
  copy: readonly LocalizedBlock[],
  sourceLabels: readonly string[],
): Post {
  const source = getPost(slug);
  if (!source) throw new Error(`Missing journal source post "${slug}".`);
  if (source.body.length !== copy.length) {
    throw new Error(`Chinese translation block count does not match "${slug}".`);
  }
  if ((source.sources?.length ?? 0) !== sourceLabels.length) {
    throw new Error(`Chinese translation source count does not match "${slug}".`);
  }
  return {
    ...source,
    ...fields,
    body: source.body.map((block, index): Block => {
      const value = copy[index];
      if (block.type === "ul" || block.type === "ol") {
        if (!Array.isArray(value) || value.length !== block.items.length) throw new Error(`Chinese list does not match "${slug}" at block ${index}.`);
        return { ...block, items: [...value] as string[] };
      }
      if (block.type === "faq") {
        if (!Array.isArray(value) || value.length !== block.items.length) throw new Error(`Chinese FAQ does not match "${slug}" at block ${index}.`);
        return { ...block, items: [...value] as { q: string; a: string }[] };
      }
      if (block.type === "callout") {
        if (!value || typeof value !== "object" || Array.isArray(value) || !("title" in value)) {
          throw new Error(`Chinese callout does not match "${slug}" at block ${index}.`);
        }
        return { ...block, title: value.title, text: value.text };
      }
      if (typeof value !== "string") throw new Error(`Chinese text does not match "${slug}" at block ${index}.`);
      return { ...block, text: value };
    }),
    sources: source.sources?.map((item, index) => ({ ...item, label: sourceLabels[index] })),
  };
}

// The prose below is intentionally compact only in code formatting; each
// entry corresponds one-for-one to the authored block in posts.ts.
export const ZH_TRANSLATED_POSTS: Readonly<Record<string, Post>> = {
  "ai-overviews-citation-playbook-for-mvps": translated("ai-overviews-citation-playbook-for-mvps", {
    title: "MVP 获得 AI Overviews 引述的行动手册", seoTitle: "MVP 的 AI Overviews 引述行动手册 | Start Apps Studio", description: "让 MVP 被 Google AI Overviews 引述的五个具体模式：直接回答、FAQPage 架构、对比表、命名实体和带日期的统计数据。已应用于 Start Apps Studio 的三个 MVP。", seoDescription: "用直接回答、FAQPage、对比表、命名实体和最新统计数据，让 MVP 获得 AI Overviews 引述。", excerpt: "多数 MVP 要等待数月才会被 Google AI Overviews 引述；早期被收录的页面都做对了同样五件事。", category: "行动手册", tags: ["GEO", "AI Overviews", "架构", "MVP"],
  }, [
    "Google AI Overviews 所引述的页面有五项共同特征：前 100 个词内有一句直接回答、包含真实买家问题的 FAQPage JSON-LD、至少一张对比表、尽早出现的命名实体，以及带日期的统计数据。全部具备后，全新的 MVP 可在被索引两周内获得首个 AIO 引述。",
    "我们在 Start Apps Studio 发布了足够多的 MVP，已经看清这一模式：被 Google AI Overviews 选中的页面并非最长、最漂亮或 DR 最高，而是最容易提取。以下是我们用于每个 MVP 发布页的五项做法。",
    "五个模式","1. 在前 100 个词中给出一句直接答案","AI Overviews 会提取一句话作为标题答案。若把答案埋在营销文案里，模型就会转向没有这样做的竞争者。每页都以你希望被原样引用的句子开头。",
    "2. 使用包含真实买家问题的 FAQPage JSON-LD","FAQPage 架构是 AIO 引述中杠杆最高的结构化数据。使用支持、销售和 Reddit 讨论中用户真正提出的问题，而不是杜撰的营销问题。每页三到六组问答最合适。",
    "3. 至少提供一张对比表","AI Overviews 很依赖比较推理。以功能为行、替代方案为列的简单 HTML 表格，会提供模型可提取并概述的网格；即使 3x3 表格也胜过一段文字。",
    "4. 在前 100 个词中出现命名实体（品牌、产品、类别）","模型通过实体接近度消除陌生品牌的歧义。在开篇说明品牌名、产品名和所属类别。“Acme Notes 是重视隐私的笔记应用”胜过“我们相信写作应当私密”。",
    "5. 使用带当年年份的统计数据","新鲜度是决胜因素。至少加入一项带年份的统计数据（“截至 2026 年，38% 的……”）。有当年语境的页面会被更频繁重新抓取，也比没有时间信号的常青页面更受 AIO 青睐。",
    "三个前后对比示例","示例 1：一款 B2B 排程 MVP","之前：首屏只有“重新想象会议”的标语，没有回答段落。之后：首句改为“Acme Schedule 是面向需要轮流分配且不按席位收费的分布式工程团队的日历应用。”重新索引 11 天后，首次出现在“工程团队日历应用”的 AIO 引述中。",
    "示例 2：一款消费者健身 MVP","之前：冗长、以推荐语为主的落地页，没有 FAQ。之后：添加六个问题的 FAQPage，回答品牌 TikTok 评论中的原话。两周内，AIO 在三个品牌未定位的长尾查询中引用了这些回答。",
    "示例 3：一款开发者工具 MVP","之前：“为什么我们更好”的散文段落。之后：换成与两家指名在先公司的 4 行对比表，并在上方加一句摘要。九天内 AIO 开始在“X vs Y 替代方案”查询中展示该品牌。",
    "本周如何将其应用到你的 MVP",["重写最高流量页面的前 100 个词，以一句直接回答开头，并点出品牌、产品和类别。","发布含三至六个真实问题的 FAQPage JSON-LD，问题来自支持收件箱或 Reddit 讨论。","至少添加一张 HTML 对比表；即使 3x3 网格也可以。","审查每个关键页面，确保至少有一项带年份的统计数据；每年 1 月 1 日更新年份。","在 Google Search Console 重新提交页面，并在未来两周关注 Discover 和 AIO 面板的覆盖情况。"],
    { title: "我们如何参与", text: "Start Apps Studio 发布的每个 MVP 从第一天就接入这五项模式：直接答案、FAQPage 架构、对比表、命名实体和带日期的统计数据。因此，我们作品集中的 MVP 在花一分钱付费获客前便开始积累 AI Overview 引述。" },
    "常见问题",[{q:"全新的 MVP 多快能获得首个 AI Overview 引述？",a:"在我们的作品集中，页面被索引且五项模式就位后为 9 至 21 天。最大变量是 Google 重新抓取页面的速度；改写后在 Search Console 提交 URL 通常可缩短至两周以内。"},{q:"被 AI Overviews 引述需要高域名评级吗？",a:"不需要。AIO 引述更看重可提取性而非权威性。页面结构强的新域名经常比未为提取优化的老牌高 DR 网站获得更多引述。"},{q:"2026 年使用 FAQPage 架构仍安全吗？",a:"对 AI Overviews 和 ChatGPT 提取而言安全。Google 在 2023 年取消了多数网站 FAQPage 富结果资格，但 AI 界面仍会使用这类结构化数据，它仍是 GEO 中杠杆最高的架构块。"},{q:"一个页面应有多少张对比表？",a:"一张构建良好的表（3–6 行、2–4 列）胜过三张薄弱的表。若有多个比较角度，应建成独立的专门比较页，而非在一个 URL 堆叠表格。"}],
  ], ["Start Apps Studio 内部作品集分析：14 次 MVP 发布中 AI Overview 引述的时间。","Google Search Central：FAQPage 和 Article 架构的结构化数据指南。"]),
  "make-your-brand-visible-in-chatgpt": ZH_POST_1,
  "vibe-coded-apps-have-an-seo-problem": ZH_POST_2,
  "ai-at-work-2026-what-it-means-for-founders": ZH_POST_3,
  "backlinks-still-decide-who-gets-recommended": ZH_POST_4,
  "designing-for-the-ai-native-era": ZH_POST_5,
  "design-systems-matter-more-in-the-ai-era": ZH_POST_6,
  "base44-vs-lovable-which-one-for-your-next-app": ZH_POST_7,
};