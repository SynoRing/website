/* Copy shared across the site: titles, navigation, header, footer, the
   waitlist form, and the development roadmap. Each copy module keeps both
   languages side by side; the Chinese object must match the English one's
   shape, so a missing string fails the type check. */

const mailto = (subject: string, body: string) =>
  `mailto:contact@synoring.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

const en = {
  title: "SynoRing R1 — Gesture Control Ring for AR & Smart Glasses",
  description:
    "SynoRing R1 is a gesture control ring for AR and smart glasses. Tap, glide, and circle to control what you see. Pre-order for $99, shipping Q1 2027.",
  shortDescription: "A gesture control ring for AR and smart glasses.",
  navigation: {
    "/": "The ring",
    "/demo": "Demo",
    "/developers": "Developers",
    "/store": "Store",
    "/about": "About",
  },
  skipLink: "Skip to content",
  homeLabel: "SynoRing home",
  mainNavigation: "Main navigation",
  earlyAccess: "Get early access",
  mobileNavigation: {
    label: "Mobile navigation",
    open: "Open navigation",
    close: "Close navigation",
  },
  noteLabel: "See product note {number}",
  footer: {
    backToTop: "SynoRing — back to top",
    tagline: "Gesture becomes intent.",
    social: "SynoRing on {name}",
    groups: [
      {
        title: "Explore",
        links: [
          ["/#why", "The ring"],
          ["/demo", "Demo"],
          ["/store", "Store"],
        ],
      },
      {
        title: "Build with us",
        links: [
          ["/developers", "Developers"],
          ["/#technology", "Technology"],
          ["/about#development", "Development"],
        ],
      },
      {
        title: "SynoRing",
        links: [
          ["/about", "About"],
          ["mailto:contact@synoring.ai", "Contact"],
          ["/#faq", "Questions"],
        ],
      },
    ],
    copyright: "© 2026 SynoRing Labs",
    origin: "Designed in the US. Manufactured in China.",
    notesTitle: "Product notes",
    notes: [
      "Product imagery is a concept rendering for illustrative purposes. Final industrial design, materials, dimensions, controls, and finish may change.",
      "Roadmap stages and launch timing reflect current development plans and may change as testing and validation progress.",
      "Features, materials, compatibility, sensing architecture, and other specifications are development targets, not final shipping specifications.",
      "Joining the waitlist or sending a pre-order request is free and is not a purchase, deposit, reservation, or guarantee of prototype access or product availability. No payment is collected on this website.",
      "The browser demo is an interaction concept. Music is silent, the route is fictional, and final hardware mappings may evolve.",
    ],
  },
  developmentSteps: [
    {
      stage: "01 / Current focus",
      title: "Interaction prototype",
      text: "Refining the gestures, feedback, and everyday control experience.",
    },
    {
      stage: "02 / Next",
      title: "Developer pilots",
      text: "Explore real applications and device integrations with early partners.",
    },
    {
      stage: "03 / Ahead",
      title: "Production validation",
      text: "Validate the hardware and publish confirmed specifications before launch.",
    },
  ],
  developerEmail: mailto(
    "SynoRing Developer Pilot",
    "Hi SynoRing team,\n\nI'm interested in a developer pilot.\n\nProject:\nTarget device:\nInteraction use case:\n",
  ),
  product: {
    description:
      "A gesture control ring for AR and smart glasses. Tap, glide, hold, or circle to select, scroll, and adjust what you see.",
    category: "Wearable gesture controller",
    material: "Zirconia ceramic, stainless steel",
  },
  renderAlt: "SynoRing in {finish}",
  circuitAlt: "SynoRing flexible circuit wrapped around its arc battery",
  finishes: {
    "space-gray": "Space Gray",
    platinum: "Platinum",
    "rose-gold": "Rose Gold",
    gold: "Gold",
  },
  waitlist: {
    email: "Email address",
    join: "Join the waitlist",
    sending: "Sending…",
    invalidEmail: "Please enter a valid email address.",
    rateLimited: "Too many attempts from this connection. Please try again later.",
    failed: "Something went wrong. Please try again, or email",
    joined: "You’re on the list.",
    joinedDetail: "We’ll email {email} with launch updates.",
    already: "You’re already on the list.",
    alreadyDetail: "We’ll keep {email} posted.",
  },
};

export type SiteCopy = typeof en;

const zh: SiteCopy = {
  title: "SynoRing R1 — 为 AR 与智能眼镜打造的手势控制戒指",
  description:
    "SynoRing R1 是一枚为 AR 与智能眼镜打造的手势控制戒指。轻点、滑动、画圈，就能控制眼前所见。现可预订，售价 $99，预计 2027 年第一季度发货。",
  shortDescription: "为 AR 与智能眼镜打造的手势控制戒指。",
  navigation: {
    "/": "戒指",
    "/demo": "演示",
    "/developers": "开发者",
    "/store": "商店",
    "/about": "关于",
  },
  skipLink: "跳到正文",
  homeLabel: "SynoRing 首页",
  mainNavigation: "主导航",
  earlyAccess: "抢先体验",
  mobileNavigation: {
    label: "移动端导航",
    open: "打开导航",
    close: "关闭导航",
  },
  noteLabel: "查看产品说明 {number}",
  footer: {
    backToTop: "SynoRing — 返回顶部",
    tagline: "手势，即意图。",
    social: "在 {name} 上关注 SynoRing",
    groups: [
      {
        title: "探索",
        links: [
          ["/#why", "戒指"],
          ["/demo", "演示"],
          ["/store", "商店"],
        ],
      },
      {
        title: "一起构建",
        links: [
          ["/developers", "开发者"],
          ["/#technology", "技术"],
          ["/about#development", "研发进展"],
        ],
      },
      {
        title: "SynoRing",
        links: [
          ["/about", "关于我们"],
          ["mailto:contact@synoring.ai", "联系我们"],
          ["/#faq", "常见问题"],
        ],
      },
    ],
    copyright: "© 2026 SynoRing Labs",
    origin: "美国设计，中国制造。",
    notesTitle: "产品说明",
    notes: [
      "产品图片为概念渲染图，仅作示意。最终的工业设计、材质、尺寸、操控方式和表面处理可能会有所调整。",
      "路线图各阶段与上市时间反映的是当前研发计划，可能随测试与验证的进展而变化。",
      "功能、材质、兼容性、传感架构及其他规格均为研发目标，并非最终出货规格。",
      "加入候补名单或提交预订申请均免费，不构成购买、定金或预留，也不保证能获得原型机或产品。本网站不收取任何款项。",
      "浏览器演示是交互概念展示：音乐为静音，路线为虚构，最终的硬件手势映射可能会有所调整。",
    ],
  },
  developmentSteps: [
    {
      stage: "01 / 当前重点",
      title: "交互原型",
      text: "打磨手势、反馈与日常操控体验。",
    },
    {
      stage: "02 / 下一步",
      title: "开发者试点",
      text: "与早期合作伙伴一起，探索真实应用与设备集成。",
    },
    {
      stage: "03 / 未来",
      title: "量产验证",
      text: "完成硬件验证，并在发布前公布确认后的规格。",
    },
  ],
  developerEmail: mailto(
    "SynoRing 开发者试点",
    "SynoRing 团队你好，\n\n我对开发者试点感兴趣。\n\n项目：\n目标设备：\n交互场景：\n",
  ),
  product: {
    description:
      "为 AR 与智能眼镜打造的手势控制戒指。轻点、滑动、长按或画圈，就能选择、滚动和调节眼前所见。",
    category: "可穿戴手势控制器",
    material: "氧化锆陶瓷、不锈钢",
  },
  renderAlt: "{finish} SynoRing",
  circuitAlt: "SynoRing 的柔性电路包裹着弧形电池",
  finishes: {
    "space-gray": "深空灰",
    platinum: "铂金色",
    "rose-gold": "玫瑰金",
    gold: "金色",
  },
  waitlist: {
    email: "邮箱地址",
    join: "加入候补名单",
    sending: "提交中…",
    invalidEmail: "请输入有效的邮箱地址。",
    rateLimited: "该网络的尝试次数过多，请稍后再试。",
    failed: "出了点问题。请重试，或发邮件至",
    joined: "你已加入候补名单。",
    joinedDetail: "我们会把发布动态发送到 {email}。",
    already: "你已经在候补名单中了。",
    alreadyDetail: "我们会持续向 {email} 发送最新动态。",
  },
};

export const siteCopy = { en, zh };

export type WaitlistCopy = SiteCopy["waitlist"];
