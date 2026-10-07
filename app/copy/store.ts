/* The store: the page, the pre-order panel and review, and the gallery.
   {name} placeholders are filled in by the page. */

const en = {
  title: "Pre-order SynoRing R1 — $99",
  description:
    "Pre-order SynoRing R1 for $99 (regularly $129) in Space Gray, Platinum, Rose Gold, or Gold. Ships Q1 2027 with free US shipping; a sizing kit comes first.",
  eyebrow: "SynoRing Store",
  tagline: "Four finishes. One natural connection.",
  specifications: {
    eyebrow: "A closer look",
    title: "Technical specifications.",
    text: "Product details at a glance. Development specifications may change; unconfirmed details are marked below.",
    /** Values starting with this are styled as not yet confirmed. */
    pending: "To be announced",
    groups: [
      {
        title: "Design & finish",
        rows: [
          ["Product", "SynoRing R1 wearable gesture controller"],
          ["Colors", "Space Gray · Platinum · Rose Gold · Gold"],
          ["Band width", "8 mm in every size"],
          ["Inner & outer diameter", "Varies by ring size"],
          ["Ring sizes", "Multiple sizes; confirmed with a sizing kit first"],
          ["Materials", "Zirconia ceramic outer shell · Stainless steel inner band"],
          ["Weight", "To be announced"],
        ],
      },
      {
        title: "Input & gestures",
        rows: [
          ["Input method", "Thumb touch + movement of the ring-bearing finger"],
          ["Touch gestures", "Tap · Glide · Press and hold"],
          ["Motion gestures", "Clockwise and counterclockwise circular movements"],
          ["Control functions", "Selection, scrolling, and continuous adjustment"],
          ["Gesture mapping", "Application-dependent; explore examples in the Demo"],
        ],
      },
      {
        title: "Connectivity & software",
        rows: [
          ["Device connection", "Wireless; protocol and version to be announced"],
          ["Intended applications", "AR glasses and spatial computing"],
          ["Compatible devices", "Validated device list to be announced"],
          ["Software integration", "Phone-side SDK planned; public release to be announced"],
          ["System requirements", "To be announced"],
        ],
      },
      {
        title: "Power & durability",
        rows: [
          ["Battery capacity", "12 mAh"],
          ["Battery life, typical use", "Up to 12 hours"],
          ["Battery life, intensive use", "Up to 1 hour"],
          ["Charging", "Full charge in about 1.5 hours"],
          ["Water & dust resistance", "Rating to be announced after validation"],
        ],
      },
      {
        title: "Pre-order & delivery",
        rows: [
          ["Pre-order price", "$99 USD"],
          ["Regular price", "$129 USD"],
          ["Sizing kit", "Ships first so you can confirm your size"],
          ["In the box", "SynoRing R1 · Charger"],
          ["Estimated shipping", "Q1 2027"],
          ["Shipping", "Free within the US; other regions pay shipping"],
          ["Taxes", "Confirmed by email before payment"],
        ],
      },
    ],
    views: {
      front: { label: "Front", alt: "SynoRing R1 front view" },
      side: { label: "Side", alt: "SynoRing R1 side view, 8 mm band width" },
      top: { label: "Top · touch surface", alt: "SynoRing R1 top view of the touch surface and logo" },
    },
    caption:
      "Shown in Space Gray at one scale. The band is 8 mm wide in every size; inner and outer diameter follow your ring size.",
  },
  questions: {
    title: "Before you pre-order.",
    text: "A few things to know about this release.",
    items: [
      {
        title: "How does pre-ordering work?",
        text: "Choose a finish and quantity, review your selection, and leave your email. Our team will contact you to confirm your size and the next steps; this website does not collect payment.",
      },
      {
        title: "When will my ring ship?",
        text: "SynoRing R1 is estimated to ship in Q1 2027. Shipping is free within the US; orders to other regions pay the shipping cost.",
      },
      {
        title: "How do I find my size?",
        text: "We send you a sizing kit first. Wear it, confirm your size, and your SynoRing R1 ships in that size. The band is 8 mm wide in every size; only the inner and outer diameter change.",
      },
    ],
    demo: {
      title: "Can I try the controls first?",
      before: "Yes. Explore music, reading, and navigation in our ",
      link: "interactive demo",
      after: ".",
    },
  },
  panel: {
    status: "Pre-order",
    subtitle: "Your world. At your fingertips.",
    text: "A wearable gesture controller for AR glasses. Tap, glide, and circle to select, scroll, and adjust.",
    preorderPrice: "Pre-order price: ",
    regularPrice: "Regular price: ",
    saving: "Save $30",
    priceCaption: "Pre-order pricing",
    finish: "Finish",
    quantity: "Quantity",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    cta: "Pre-order",
    dispatch: "Estimated shipping Q1 2027 · Free shipping within the US",
  },
  review: {
    eyebrow: "Pre-order",
    close: "Close pre-order review",
    title: "Your SynoRing.",
    line: "{finish} · Qty {quantity}",
    each: "${price} USD each",
    regularSubtotal: "Regular subtotal",
    savings: "Pre-order savings",
    subtotal: "Product subtotal",
    explainer:
      "Leave your email and our team will contact you to arrange your pre-order. A sizing kit ships first so you can confirm your size; your ring is estimated to ship in Q1 2027, free within the US. Taxes and shipping to other regions are confirmed by email. No payment is collected on this website.",
    submit: "Request pre-order",
    doneTitle: "Pre-order request received.",
    doneText: "We’ll email {email} to confirm your size and arrange your SynoRing R1 in {finish}.",
    closeDone: "Close",
    back: "Continue choosing",
  },
  gallery: {
    product: "{finish} product concept",
    inside: "Inside SynoRing: flexible circuit and battery",
    views: "Product views",
    ring: "The ring",
    insideButton: "Inside SynoRing",
  },
};

export type StoreCopy = typeof en;

const zh: StoreCopy = {
  title: "预订 SynoRing R1 — $99",
  description:
    "以 $99 预订 SynoRing R1（原价 $129），提供深空灰、铂金色、玫瑰金和金色四种配色。预计 2027 年第一季度发货，美国境内包邮；我们会先寄出尺码套件。",
  eyebrow: "SynoRing 商店",
  tagline: "四种配色，一种自然的连接。",
  specifications: {
    eyebrow: "细节一览",
    title: "技术规格。",
    text: "产品详情一览。研发阶段的规格可能会调整，尚未确认的信息已在下方标注。",
    pending: "待公布",
    groups: [
      {
        title: "设计与配色",
        rows: [
          ["产品", "SynoRing R1 可穿戴手势控制器"],
          ["颜色", "深空灰 · 铂金色 · 玫瑰金 · 金色"],
          ["戒圈宽度", "所有尺码均为 8 毫米"],
          ["内径与外径", "随戒指尺码变化"],
          ["戒指尺码", "多种尺码；先用尺码套件确认"],
          ["材质", "氧化锆陶瓷外壳 · 不锈钢内圈"],
          ["重量", "待公布"],
        ],
      },
      {
        title: "输入与手势",
        rows: [
          ["输入方式", "拇指触控 + 佩戴戒指的手指动作"],
          ["触控手势", "轻点 · 滑动 · 长按"],
          ["动作手势", "顺时针与逆时针画圈"],
          ["控制功能", "选择、滚动与连续调节"],
          ["手势映射", "取决于具体应用；可在演示中查看示例"],
        ],
      },
      {
        title: "连接与软件",
        rows: [
          ["设备连接", "无线连接；协议与版本待公布"],
          ["目标应用", "AR 眼镜与空间计算"],
          ["兼容设备", "经验证的设备列表待公布"],
          ["软件集成", "计划提供手机端 SDK；公开发布时间待公布"],
          ["系统要求", "待公布"],
        ],
      },
      {
        title: "续航与耐用性",
        rows: [
          ["电池容量", "12 mAh"],
          ["续航（日常使用）", "最长 12 小时"],
          ["续航（高强度使用）", "最长 1 小时"],
          ["充电", "约 1.5 小时充满"],
          ["防水防尘", "等级将在验证后公布"],
        ],
      },
      {
        title: "预订与配送",
        rows: [
          ["预订价", "$99 USD"],
          ["原价", "$129 USD"],
          ["尺码套件", "先行寄出，方便你确认尺码"],
          ["包装内含", "SynoRing R1 · 充电器"],
          ["预计发货", "2027 年第一季度"],
          ["运费", "美国境内包邮；其他地区需支付运费"],
          ["税费", "付款前通过邮件确认"],
        ],
      },
    ],
    views: {
      front: { label: "正面", alt: "SynoRing R1 正面视图" },
      side: { label: "侧面", alt: "SynoRing R1 侧面视图，戒圈宽 8 毫米" },
      top: { label: "顶部 · 触控面", alt: "SynoRing R1 顶部视图，可见触控面与标志" },
    },
    caption: "以深空灰为例，按同一比例展示。所有尺码的戒圈宽度均为 8 毫米，内径与外径随你的戒指尺码变化。",
  },
  questions: {
    title: "预订前须知。",
    text: "关于这次发布，有几件事需要了解。",
    items: [
      {
        title: "预订流程是怎样的？",
        text: "选择配色和数量，确认你的选择，然后留下邮箱。我们的团队会联系你确认尺码和后续步骤；本网站不收取任何款项。",
      },
      {
        title: "我的戒指什么时候发货？",
        text: "SynoRing R1 预计在 2027 年第一季度发货。美国境内包邮；寄往其他地区的订单需支付运费。",
      },
      {
        title: "怎么确定我的尺码？",
        text: "我们会先寄给你一套尺码套件。试戴后确认尺码，你的 SynoRing R1 就会按这个尺码发货。所有尺码的戒圈宽度都是 8 毫米，只有内径和外径不同。",
      },
    ],
    demo: {
      title: "可以先试试操控吗？",
      before: "可以。在我们的",
      link: "交互演示",
      after: "中体验音乐、阅读和导航。",
    },
  },
  panel: {
    status: "预订",
    subtitle: "你的世界，尽在指尖。",
    text: "一款为 AR 眼镜打造的可穿戴手势控制器。轻点、滑动、画圈，即可选择、滚动和调节。",
    preorderPrice: "预订价：",
    regularPrice: "原价：",
    saving: "立省 $30",
    priceCaption: "预订价格",
    finish: "配色",
    quantity: "数量",
    decrease: "减少数量",
    increase: "增加数量",
    cta: "预订",
    dispatch: "预计 2027 年第一季度发货 · 美国境内包邮",
  },
  review: {
    eyebrow: "预订",
    close: "关闭预订确认",
    title: "你的 SynoRing。",
    line: "{finish} · 数量 {quantity}",
    each: "单价 ${price} USD",
    regularSubtotal: "原价小计",
    savings: "预订优惠",
    subtotal: "商品小计",
    explainer:
      "留下邮箱，我们的团队会联系你安排预订。我们会先寄出尺码套件，方便你确认尺码；戒指预计 2027 年第一季度发货，美国境内包邮。税费以及寄往其他地区的运费会通过邮件确认。本网站不收取任何款项。",
    submit: "提交预订申请",
    doneTitle: "已收到你的预订申请。",
    doneText: "我们会发邮件到 {email}，确认你的尺码，并为你安排{finish}的 SynoRing R1。",
    closeDone: "关闭",
    back: "继续选择",
  },
  gallery: {
    product: "{finish}产品概念图",
    inside: "SynoRing 内部：柔性电路与电池",
    views: "产品视图",
    ring: "戒指",
    insideButton: "内部结构",
  },
};

export const storeCopy = { en, zh };
