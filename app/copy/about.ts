/* The About page. "\n" in a string is a line break. */

const en = {
  title: "About SynoRing Labs",
  description:
    "SynoRing Labs makes controlling AR and smart glasses feel small and natural: touch and motion in a ring. Designed in the US, manufactured in China.",
  hero: {
    eyebrow: "About SynoRing",
    title: "Spatial computing\nneeds a smaller gesture.",
    lead: "AR glasses change where information lives.\nWe are exploring how we interact with it.",
    paragraphs: [
      "SynoRing is a wearable gesture controller in development at SynoRing Labs. Our focus is simple: give your hand a subtle, accessible way to control a spatial interface.",
      "Combining thumb touches with finger movements lets us explore selection, navigation, and continuous adjustment in a familiar form—a ring.",
    ],
  },
  statement: {
    emblemAlt: "SynoRing symbol",
    eyebrow: "The question behind the ring",
    title: "What if controlling your glasses\ndid not interrupt",
    emphasis: "what you were doing?",
    text: "Changing a track. Moving through a page. Bringing a map closer. These are small actions. We think the physical interaction should feel small, too.",
  },
  principles: {
    eyebrow: "Design principles",
    title: "What guides the work.",
    text: "We use these principles to evaluate the experience as the product develops.",
    items: [
      {
        title: "Intentional input",
        text: "A gesture should feel deliberate and its result should be understandable. Clear feedback matters as much as recognition.",
      },
      {
        title: "Everyday discretion",
        text: "Control should fit the setting. We are exploring small movements and touch as an alternative to spoken commands and reaching into space.",
      },
      {
        title: "Context comes first",
        text: "The same gesture should serve the current task. A circle changes volume in music and scale in a map.",
      },
    ],
  },
  development: {
    eyebrow: "Development, openly",
    title: "Prototype. Learn. Refine.",
    text: "SynoRing R1, our first generation, is open for pre-order and estimated to ship in Q1 2027. Developer pilots and production validation continue alongside it.",
  },
  contact: {
    eyebrow: "SynoRing Labs",
    title: "Let’s make the\nnext interaction better.",
    text: "Designed in the US. Manufactured in China.\nExploring a more natural connection to spatial computing.",
    general: "General enquiries",
    builders: "For builders",
    buildersLink: "Developer conversations",
    demo: "See the idea in action",
    demoLink: "Try the AR experience",
  },
};

const zh: typeof en = {
  title: "关于 SynoRing Labs",
  description:
    "SynoRing Labs 希望让操控 AR 与智能眼镜变得细微而自然：把触控与动作装进一枚戒指。美国设计，中国制造。",
  hero: {
    eyebrow: "关于 SynoRing",
    title: "空间计算，\n需要更小的手势。",
    lead: "AR 眼镜改变了信息所在的位置。\n我们在探索如何与它互动。",
    paragraphs: [
      "SynoRing 是 SynoRing Labs 正在研发的一款可穿戴手势控制器。我们的目标很简单：让你的手有一种细微、易用的方式来操控空间界面。",
      "把拇指触控和手指动作结合起来，我们得以用一种熟悉的形态——戒指——去探索选择、导航和连续调节。",
    ],
  },
  statement: {
    emblemAlt: "SynoRing 标志",
    eyebrow: "戒指背后的问题",
    title: "如果操控眼镜\n不会打断",
    emphasis: "你正在做的事呢？",
    text: "切换一首歌，翻过一页，拉近地图。这些都是小动作。我们认为，与之对应的身体操作也应该足够小。",
  },
  principles: {
    eyebrow: "设计原则",
    title: "指引我们工作的原则。",
    text: "在产品研发过程中，我们用这些原则来评估体验。",
    items: [
      {
        title: "有意图的输入",
        text: "手势应当是刻意为之的，结果也应当一目了然。清晰的反馈和准确的识别同样重要。",
      },
      {
        title: "日常中的低调",
        text: "操控应当适合所处的场合。我们在探索用细小的动作和触控，替代语音指令和对着空中伸手。",
      },
      {
        title: "场景优先",
        text: "同一个手势应当服务于当前的任务。在音乐里，画圈调节音量；在地图里，画圈调节缩放。",
      },
    ],
  },
  development: {
    eyebrow: "公开地研发",
    title: "原型，学习，打磨。",
    text: "我们的第一代产品 SynoRing R1 现已开放预订，预计 2027 年第一季度发货。开发者试点与量产验证也在同步推进。",
  },
  contact: {
    eyebrow: "SynoRing Labs",
    title: "一起让下一次交互\n变得更好。",
    text: "美国设计，中国制造。\n探索与空间计算更自然的连接。",
    general: "一般咨询",
    builders: "面向开发者",
    buildersLink: "开发者交流",
    demo: "看看实际效果",
    demoLink: "体验 AR 演示",
  },
};

export const aboutCopy = { en, zh };
