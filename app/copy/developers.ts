/* The Developers page. "\n" in a string is a line break. The console's
   tags and events are code, so they stay in English. */

const en = {
  title: "Developers — Gesture Input for Spatial Apps",
  description:
    "Map SynoRing taps, glides, and circles to actions in your AR or smart glasses app. See the integration direction, follow us on GitHub, and join a pilot.",
  hero: {
    eyebrow: "SynoRing for developers",
    title: "Give your spatial app\na sense of touch.",
    text: "Explore a new input surface for AR. Map a tap, a glide, or a circular movement to the actions that matter in your application.",
    github: "View on GitHub",
    pilot: "Discuss a developer pilot",
    status: "Early development · Public SDK not yet available",
  },
  console: {
    label: "Conceptual gesture mapping",
    title: "Gesture mapping",
    badge: "Concept",
    result: "Mapped action",
    action: "Increase text size",
  },
  integration: {
    eyebrow: "Integration direction",
    title: "Keep the input small.\nMake the application yours.",
    text: "We are exploring a phone-side SDK that connects ring input with AR ecosystems. The following describes the intended flow, rather than an available API contract.",
    steps: [
      {
        stage: "01 / Sense",
        title: "Ring input",
        text: "Capture thumb interactions and movement of the ring-bearing finger.",
        items: ["Touch and glide", "Motion and rotation"],
      },
      {
        stage: "02 / Interpret",
        title: "Software layer",
        text: "Translate sensing into gestures that applications can map to actions.",
        items: ["Gesture interpretation", "Connection state"],
      },
      {
        stage: "03 / Respond",
        title: "Your application",
        text: "Decide what each gesture does in the active screen or mode.",
        items: ["Context-aware actions", "Visible user feedback"],
      },
    ],
  },
  mappings: {
    eyebrow: "Start with the interaction",
    title: "Same input.\nYour meaning.",
    text: "A circle can change volume, scale text, or zoom a scene. Start with the action your user needs, then choose a gesture that feels predictable.",
    link: "See these mappings in action",
    caption: "Example mappings used in our browser demo",
    headers: ["Input", "Application action"],
    rows: [
      ["Tap", "Select / Confirm / Play"],
      ["Glide", "Scroll / Browse / Move focus"],
      ["Clockwise circle", "Increase / Zoom in"],
      ["Counterclockwise circle", "Decrease / Zoom out"],
      ["Hold", "Open the app launcher"],
    ],
  },
  pilot: {
    eyebrow: "Early collaboration",
    title: "Bring a use case.\nHelp shape the interface.",
    text: "We want to understand what you are building before defining the integration around it.",
    cta: "Tell us about your project",
    questions: [
      {
        title: "Your application",
        text: "What task should someone complete without reaching for a screen?",
      },
      {
        title: "Your target environment",
        text: "Which glasses, operating system, and companion device are you working with?",
      },
      {
        title: "Your input needs",
        text: "Selection, scrolling, continuous adjustment, or another interaction?",
      },
    ],
  },
  status: {
    title: "Where things stand",
    items: [
      {
        title: "Available now",
        text: "The browser interaction demo and direct conversations about integration needs.",
      },
      {
        title: "Still in development",
        text: "The SDK, hardware pilot program, supported-device list, and technical specifications. No package installation or hardware access is available from this page yet.",
      },
    ],
  },
};

const zh: typeof en = {
  title: "开发者 — 为空间应用带来手势输入",
  description:
    "把 SynoRing 的轻点、滑动和画圈映射到你的 AR 或智能眼镜应用里的操作。了解集成方向，在 GitHub 上关注我们，申请加入开发者试点。",
  hero: {
    eyebrow: "面向开发者的 SynoRing",
    title: "让你的空间应用\n拥有触感。",
    text: "为 AR 探索一种新的输入方式。把一次轻点、一次滑动或一个画圈动作，映射到你的应用中最重要的操作上。",
    github: "在 GitHub 上查看",
    pilot: "洽谈开发者试点",
    status: "早期研发中 · 公开 SDK 尚未发布",
  },
  console: {
    label: "手势映射概念示意",
    title: "手势映射",
    badge: "概念",
    result: "映射的操作",
    action: "放大文字",
  },
  integration: {
    eyebrow: "集成方向",
    title: "输入保持轻巧，\n应用由你定义。",
    text: "我们正在探索一个手机端 SDK，用来把戒指输入接入各个 AR 生态。以下描述的是预期流程，而不是已经可用的 API 约定。",
    steps: [
      {
        stage: "01 / 感知",
        title: "戒指输入",
        text: "捕捉拇指的交互，以及佩戴戒指的那根手指的动作。",
        items: ["触控与滑动", "动作与旋转"],
      },
      {
        stage: "02 / 解析",
        title: "软件层",
        text: "把传感数据转化为手势，供应用映射到具体操作。",
        items: ["手势解析", "连接状态"],
      },
      {
        stage: "03 / 响应",
        title: "你的应用",
        text: "决定每个手势在当前界面或模式下做什么。",
        items: ["结合场景的操作", "清晰可见的反馈"],
      },
    ],
  },
  mappings: {
    eyebrow: "从交互出发",
    title: "同样的输入，\n由你赋予意义。",
    text: "一个画圈动作，可以调节音量、缩放文字，也可以缩放场景。先想清楚用户需要什么操作，再挑一个符合直觉的手势。",
    link: "看看这些映射的实际效果",
    caption: "我们在浏览器演示中使用的示例映射",
    headers: ["输入", "应用中的操作"],
    rows: [
      ["轻点", "选择 / 确认 / 播放"],
      ["滑动", "滚动 / 浏览 / 移动焦点"],
      ["顺时针画圈", "增大 / 放大"],
      ["逆时针画圈", "减小 / 缩小"],
      ["长按", "打开应用启动器"],
    ],
  },
  pilot: {
    eyebrow: "早期合作",
    title: "带上你的使用场景，\n一起塑造这套交互。",
    text: "在确定集成方式之前，我们想先了解你在做什么。",
    cta: "介绍一下你的项目",
    questions: [
      {
        title: "你的应用",
        text: "用户需要在不伸手够屏幕的情况下完成什么任务？",
      },
      {
        title: "你的目标环境",
        text: "你使用的是哪款眼镜、哪个操作系统，以及哪种配套设备？",
      },
      {
        title: "你的输入需求",
        text: "选择、滚动、连续调节，还是其他交互？",
      },
    ],
  },
  status: {
    title: "目前进展",
    items: [
      {
        title: "现已提供",
        text: "浏览器交互演示，以及关于集成需求的直接沟通。",
      },
      {
        title: "仍在研发中",
        text: "SDK、硬件试点计划、支持设备列表和技术规格。目前还无法通过本页面安装软件包或获取硬件。",
      },
    ],
  },
};

export const developersCopy = { en, zh };
