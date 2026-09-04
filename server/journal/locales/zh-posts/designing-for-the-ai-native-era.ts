import { getPost, type Post } from "../../posts";

const slug = "designing-for-the-ai-native-era";
const source = getPost(slug);

if (!source) {
  throw new Error(`Missing journal source post "${slug}".`);
}

export const ZH_POST_5: Post = {
  ...source,
  title: "为 AI 原生时代设计：生成式 UI 与面向智能体的构建",
  seoTitle: "AI 原生时代：生成式 UI 与智能体 | Start Apps Studio",
  description:
    "面向创始人的实地指南：从静态仪表盘转向生成式界面，了解每个 AI 原生产品都会经历的四个阶段，以及今天必须完成的三件事，让 AI 智能体真正能使用你的产品。",
  seoDescription:
    "一份关于生成式 UI 和 AI 原生产品的实地指南：产品经历的四个阶段，以及让你的产品立即具备智能体就绪能力的三个步骤。",
  excerpt:
    "把仪表盘换成聊天栏是一种降级。真正的转变，是为当前任务即时生成界面，以及让智能体无需触碰 UI 就能驱动的后端。",
  category: "随笔",
  tags: ["AI 原生", "生成式 UI", "设计", "API"],
  body: [
    {
      type: "answer",
      text:
        "AI 原生产品不会用聊天机器人取代仪表盘。它们会为每项任务生成恰当的界面，通过简洁的 API 暴露每一个操作，让智能体能直接驱动产品，并同时为两类用户设计：需要信任与监督的人类，以及需要结构化数据和可靠端点的智能体。",
    },
    {
      type: "p",
      text:
        "大多数团队仍在传统仪表盘上加装一个聊天栏，便称其为 AI 原生。并不是。聊天栏用视觉密度和上下文换来一个文本输入框，再要求用户记住每一条命令。下一代产品反其道而行：界面为任务而生成，后端同样为智能体而非仅为人类构建，设计则从排列像素转向塑造判断。",
    },
    { type: "h2", text: "为什么聊天栏是降级，而非升级", id: "chat-is-a-downgrade" },
    {
      type: "p",
      text:
        "一个优秀的仪表盘能让人一眼接收数百个信号。用聊天输入框替代它，会丢弃这种信息密度，迫使用户通过输入重新找回本已看得见的信息。聊天非常适合模糊、开放式的请求，却不适合取代精心设计界面形成的肌肉记忆。正确的方向不是用聊天代替 UI，而是让模型根据请求生成 UI。",
    },
    { type: "h2", text: "AI 原生产品的四个阶段", id: "four-stages" },
    { type: "h3", text: "1. 基础文本界面", id: "stage-text" },
    {
      type: "p",
      text:
        "这是如今大多数产品所处的起点：一个聊天输入框、一连串文本回复，也许还有几个按钮。它适合探索；对于重复工作流却很薄弱，因为没有任何内容会持续保留，每个答案都得重新输入。",
    },
    { type: "h3", text: "2. 内嵌生成式组件", id: "stage-inline" },
    {
      type: "p",
      text:
        "模型返回的不再只是文本。表格、图表、表单和小型交互式组件会出现在对话中，其大小与所提问题相配。界面开始像一张会随着你交谈自行搭建的工作表。",
    },
    { type: "h3", text: "3. 持久化 UI 构建器", id: "stage-builders" },
    {
      type: "p",
      text:
        "生成的组件被固定、保存并重新排列成用户可再次访问的页面。产品成为个人工作台：模型按需组装屏幕，用户保留真正有效的那些。未来两年，大多数有雄心的 AI 原生产品都会处在这一阶段。",
    },
    { type: "h3", text: "4. 环境式自主界面", id: "stage-ambient" },
    {
      type: "p",
      text:
        "这是终局。产品预判用户所需，无需请求就呈现正确的界面、操作或摘要。提示变得罕见。UI 的职责是确认、纠正和批准，而不是下达命令。迄今为止，极少有产品赢得了在这里运作所需的信任。",
    },
    { type: "h2", text: "设计的新角色", id: "design-role" },
    {
      type: "p",
      text:
        "当模型能在数秒内渲染出尚可的界面，设计便不再关乎推像素，而开始关乎判断：哪些问题值得生成界面，哪些值得固定界面；哪些操作需要阻力；哪些状态需要人类介入。品位、克制，以及对用户心智模型的深刻理解，成为护城河。获胜的团队并非能渲染最多组件的团队，而是能决定哪些东西根本不应生成的团队。",
    },
    { type: "h2", text: "为 AI 智能体构建：现在就该交付的三件事", id: "build-for-agents" },
    { type: "h3", text: "1. API 优先架构", id: "api-first" },
    {
      type: "p",
      text:
        "智能体不会点击按钮，而是调用 API。人类能在 UI 中完成的每项有意义操作，也应能通过简洁且有文档的端点完成。如果取消订阅、导出报告或邀请队友的唯一方式是通过模态框，那么对于正在迅速成为工作完成方式的智能体层而言，你的产品便是不可见的。",
    },
    { type: "h3", text: "2. 模型可依托的设计系统", id: "design-system" },
    {
      type: "p",
      text:
        "生成式 UI 的好坏，取决于它被允许组装的组件。一个拥有命名令牌、可预测间距和少量文档完善原语的强大设计系统，会赋予模型一种词汇，使其每次都能产出一致、符合品牌的界面。没有它，每个生成的屏幕都会略显不对劲，信任也会迅速流失。",
    },
    { type: "h3", text: "3. 双用户支持：人类与智能体", id: "dual-user" },
    {
      type: "p",
      text:
        "同时为两类用户设计。人类需要信任信号、撤销功能、审计轨迹，以及对每一项变更的清晰所有权。智能体需要结构化数据、稳定的 ID、幂等端点和机器可读的错误信息。同一个操作往往需要两个界面：给人的确认屏幕，以及给智能体的 JSON 响应。从第一天起就将两者平等对待。",
    },
    {
      type: "callout",
      title: "我们如何在 Start Apps Studio 应用这一方法",
      text:
        "如今我们交付的每个 MVP 都从 API 契约开始，而不是从屏幕开始。我们会像把智能体视为首位用户那样记录每个端点，在第一张页面线框图出现前构建小型设计系统，并仅将生成式 UI 用于输入确实开放的产品部分。结果是：人类今天会喜爱的软件，智能体明天也能驱动。",
    },
    { type: "h2", text: "常见问题", id: "faq" },
    {
      type: "faq",
      items: [
        {
          q: "聊天机器人和 AI 原生产品是一回事吗？",
          a: "不是。聊天机器人只是一种输入模式。AI 原生产品围绕人类和 AI 智能体都会使用它这一前提，重新塑造其界面、操作和数据模型。许多 AI 原生产品根本没有聊天界面。",
        },
        {
          q: "要让产品变成 AI 原生，我需要重建产品吗？",
          a: "很少需要。大多数团队可以通过 API 暴露核心操作、收紧设计系统，并在输入开放的地方加入少量内嵌生成式组件来推进。只有当前三个阶段已就位，且你准备好为环境式使用设计时，全面重建才值得。",
        },
        {
          q: "AI 原生时代会让设计工作消失吗？",
          a: "不会，只会演变。像素工作缩减，判断工作增长。选择哪些界面要生成、定义模型组装时所依据的系统，以及保护用户免受糟糕模型输出的影响，如今都是杠杆最高的设计任务。",
        },
        {
          q: "今天最重要的一件事是什么？",
          a: "确保用户能在产品中完成的每项操作，也能通过有文档的 API 端点完成。没有这一点，智能体无法使用你的产品；而你日后添加的任何生成式 UI，都会建立在限制其发展上限的基础之上。",
        },
      ],
    },
  ],
};

const sourceStructure = source.body.map((block) => ({
  type: block.type,
  id: "id" in block ? block.id : undefined,
  items: block.type === "ul" || block.type === "ol" || block.type === "faq" ? block.items.length : undefined,
}));
const localizedStructure = ZH_POST_5.body.map((block) => ({
  type: block.type,
  id: "id" in block ? block.id : undefined,
  items: block.type === "ul" || block.type === "ol" || block.type === "faq" ? block.items.length : undefined,
}));

if (JSON.stringify(sourceStructure) !== JSON.stringify(localizedStructure)) {
  throw new Error(`Chinese translation structure does not match "${slug}".`);
}