import { getPost, type Block, type Post } from "../../posts";

type LocalizedBlock =
  | string
  | readonly string[]
  | readonly { q: string; a: string }[]
  | { text: string; cite: string }
  | { title: string; text: string };

const source = getPost("design-systems-matter-more-in-the-ai-era");
if (!source) {
  throw new Error(
    'Missing journal source post "design-systems-matter-more-in-the-ai-era".',
  );
}

const copy: readonly LocalizedBlock[] = [
  "在 AI 时代，设计系统不再是可有可无的锦上添花，而是决定 AI 生成界面最高能达到何种水平的上限。健壮的系统会放大自动化产出的效果；薄弱的系统则会形成一道无论怎样提示都无法跨越的质量天花板。",
  "一种很有诱惑力的说法正在流传：AI 会让设计系统变得无关紧要。既然模型可以按需渲染任何界面，何必还要维护设计令牌、组件和指南？诚实的答案恰恰相反。界面中由 AI 生成的部分越多，设计系统就越决定什么才算好。AI 不会凭空创造质量；它会放大你交给它的一切基础。",
  "每个 SaaS 团队正在面对的三项变化",
  "1. API 成为新的产品界面",
  "AI 智能体不会点击按钮或浏览菜单，它们调用 API。若你最重要的操作只能藏在模态窗口或多步骤向导之后，智能体就无法使用它们，并且会越来越多地完全绕开你的产品。如今的标准是：人类能够执行的每一项有意义操作，都应有清晰、完整、文档完善的端点。你的 API 不再只是后台，它正成为越来越多用户进入产品的前门。",
  "2. 设计系统是效率倍增器，而不是额外负担",
  "当 AI 按需组装屏幕时，你维护的组件、设计令牌和模式便构成模型所使用的词汇。一个命名清晰、间距可预测、且拥有少量经过充分测试的基础组件的严谨系统，能让模型每次都产出协调一致的界面。松散的系统则会带来漂移、不一致，以及信任感的缓慢流失。同一条提示词面对强大的系统和薄弱的系统，会产出肉眼可见不同的产品。",
  "3. 现在你要同时为两类用户设计",
  "现在每个产品都有两类受众。人类需要信任信号、撤销功能、审计轨迹，以及清楚了解系统正在代表自己做什么的能力。智能体则需要结构化数据、稳定标识符、幂等端点和机器可读的错误信息。同一条工作流往往需要同时具备两种界面：供人确认的屏幕，以及供智能体使用的 JSON 响应。从第一天起就把它们都视为平等的一等用户，是新的默认做法。",
  "为什么强大的设计系统是杠杆最高的投资",
  "想象两个团队在打造彼此竞争的产品。两者都使用同一个模型来生成部分界面。A 团队过去一年一直在加固设计系统：有文档化的设计令牌、无障碍组件、清晰的状态，以及关于间距和信息密度的书面指南。B 团队迅速上线，并积累了数十种一次性的样式。把同一条提示词交给两边：A 团队得到的是精致、统一、让用户立刻信任的屏幕；B 团队得到的东西乍看似乎可信，用得越久却越显得不对劲。模型相同，上限却不同。",
  [
    "用通俗英语为颜色、间距、圆角和动效命名的设计令牌",
    "覆盖 80 percent 布局的一小组基础组件：卡片、列表、表格、表单、对话框",
    "针对空状态、加载、错误、成功和部分数据的文档化状态",
    "将无障碍内建而非事后补上，确保生成的屏幕绝不会带着不可访问的默认设置上线",
    "简短的书面品牌声音与语调指南，让生成的文案保持你的品牌风格",
  ],
  "这对设计师意味着什么",
  "像素层面的工作会减少，判断层面的工作会增加。当模型能在几秒内渲染出一块尚可的屏幕时，设计师最有价值的工作是决定哪些应该生成、哪些不应该生成、哪些环节需要人参与，以及底层系统默认应该让什么变得容易。品味、克制，以及对用户心智模型的深刻理解，会成为护城河。设计师的职责是让复杂任务显得不言自明，然后把这种不言自明编码进模型所使用的系统。",
  {
    text: "键盘让我们摆脱打字机，犁让我们摆脱铁锹。AI 让我们摆脱搭建屏幕。我们仍然拥有的，是该构建什么，以及它为何重要。",
    cite: "原演讲内容的转述",
  },
  {
    title: "我们在 Start Apps Studio 如何看待这件事",
    text: "如今，我们交付的每个 MVP 在设计任何一个屏幕之前，都会先从两项产物开始：一份智能体可以端到端驱动的 API 合约，以及一套小而真实的设计系统。两者在上线时都刻意保持精简，并随产品成长。结果是，软件在第一天就显得协调一致；随着越来越多的界面由 AI 生成，它也能始终保持一致。",
  },
  "常见问题",
  [
    {
      q: "AI 会让设计系统变得不必要吗？",
      a: "不会。它让设计系统更重要。模型不会凭空创造质量，而会放大你交给它的一切基础。强大的设计系统如今就是 AI 生成界面所能达到水平的上限。",
    },
    {
      q: "小团队应从设计系统的哪里开始？",
      a: "选择五个设计令牌、五个组件和五个有文档记录的状态，并在所有地方使用它们。一个真正被遵循的小系统，胜过一个谁也不信任的庞大系统。只有真实的产品需求推动你时，才扩展它。",
    },
    {
      q: "实践中的 API-first 产品是什么样的？",
      a: "用户能在 UI 中执行的每一项操作，也都能通过带有稳定 ID、可预测错误和幂等行为的文档化端点访问。UI 成为多个客户端之一，而不是进入产品的唯一途径。",
    },
    {
      q: "设计作为一种职业会消失吗？",
      a: "恰恰相反。推动像素的部分会缩小，但判断力、品味、系统思维和对用户的共情，会成为软件构建中杠杆最高的技能。掌握模型据以组装的系统的设计师会更有价值，而不是更没价值。",
    },
  ],
];

if (source.body.length !== copy.length) {
  throw new Error(
    'Chinese translation block count does not match "design-systems-matter-more-in-the-ai-era".',
  );
}

export const ZH_POST_6: Post = {
  ...source,
  title: "在 AI 时代，你的设计系统更重要，而非更不重要",
  seoTitle: "在 AI 时代，设计系统更重要 | Start Apps Studio",
  description:
    "当 AI 生成你的界面时，产出质量受设计系统质量所限。本文探讨为何 API 成为新的产品界面、为何强大的系统如今是效率倍增器、为何每个产品都有两类用户，以及为何作为判断力的设计比以往更有价值。",
  seoDescription:
    "当 AI 生成你的 UI 时，设计系统决定质量上限。了解为何 API 成为产品界面，以及设计判断力为何更加重要。",
  excerpt:
    "如果 AI 将要生成你的屏幕，它所能产出的上限就是你的设计系统。薄弱的系统每次都会带来薄弱的产出。以下是正在改变的事。",
  category: "随笔",
  tags: ["设计系统", "AI 原生", "API", "设计"],
  body: source.body.map((block, index): Block => {
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
    if (block.type === "quote") {
      if (typeof value === "string" || !("cite" in value)) {
        throw new Error(`Chinese quote does not match source at block ${index}.`);
      }
      return { ...block, text: value.text, cite: value.cite };
    }
    if (block.type === "callout") {
      if (typeof value === "string" || !("title" in value)) {
        throw new Error(`Chinese callout does not match source at block ${index}.`);
      }
      return { ...block, title: value.title, text: value.text };
    }
    if (typeof value !== "string") throw new Error(`Chinese text does not match source at block ${index}.`);
    return { ...block, text: value };
  }),
};