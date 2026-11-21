/* The About page. "\n" in a string is a line break. */

const en = {
  title: "About Syno Ring R1",
  description:
    "Explore the design of Syno Ring R1, a wearable controller that uses thumb touches and finger movements to select, scroll and adjust content on smart glasses.",
  hero: {
    eyebrow: "About Syno Ring R1",
    title: "Why a ring?",
    lead: "With your hand resting at your side, your thumb can already reach your index finger.",
    paragraphs: [
      "Syno Ring R1 puts a touch surface within that reach. A tap selects an item on your glasses. A glide moves through a list.",
      "The ring also senses motion. A small circle can turn the volume up during a song or bring a map closer.",
    ],
  },
  statement: {
    ringAlt: "Syno Ring R1 in Space Gray",
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
    text: "Syno Ring R1, our first generation, is open for pre-order and estimated to ship in Q1 2027. Developer pilots and production validation continue alongside it.",
  },
  contact: {
    title: "Explore the R1.",
    text: "Try the gestures in your browser, or get in touch about using R1 with your device.",
    general: "Ring enquiries",
    builders: "For builders",
    buildersLink: "Developer conversations",
    demo: "See the idea in action",
    demoLink: "Try the AR experience",
    companyLink: "About Syno Labs, the team behind R1",
  },
};

const zh: typeof en = {
  title: "关于 Syno Ring R1",
  description:
    "了解 Syno Ring R1 的设计与研发。通过拇指触控和手指动作，这枚戒指让你能在 AR 与智能眼镜上选择内容、滚动页面和调节音量。",
  hero: {
    eyebrow: "关于 Syno Ring R1",
    title: "为什么是戒指？",
    lead: "手自然垂在身侧时，拇指刚好能碰到食指。",
    paragraphs: [
      "Syno Ring R1 的触控区就在拇指能碰到的位置。轻点可以选中眼镜里的内容，沿着戒面滑动就能翻阅列表。",
      "戒指也能感知手指的动作。听歌时画个小圈可以调节音量，查看地图时，同样的动作可以改变比例尺。",
    ],
  },
  statement: {
    ringAlt: "深空灰色的 Syno Ring R1 戒指",
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
    text: "我们的第一代产品 Syno Ring R1 现已开放预订，预计 2027 年第一季度发货。开发者试点与量产验证也在同步推进。",
  },
  contact: {
    title: "进一步了解 R1",
    text: "在浏览器中体验戒指的手势，也可以联系我们，讨论如何把 R1 接入你的设备。",
    general: "产品咨询",
    builders: "面向开发者",
    buildersLink: "开发者交流",
    demo: "看看实际效果",
    demoLink: "体验 AR 演示",
    companyLink: "了解 R1 的研发团队 Syno Labs",
  },
};

export const aboutCopy = { en, zh };
