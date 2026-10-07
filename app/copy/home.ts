/* The home page. "\n" in a string is a line break. */

const en = {
  news: "Meet us at the WACV 2027 SEAI Workshop",
  newsDate: "January 4–8, 2027",
  hero: {
    summary:
      "Control your AR glasses, smart glasses, headset, phone, laptop, PC, or robot without breaking the moment.",
    // Ends with the space before the rotating word.
    lead: "Control ",
    devices: [
      "your AR glasses",
      "your smart glasses",
      "your headset",
      "your phone",
      "your laptop",
      "your PC",
      "your robot",
    ],
    tail: "without breaking the moment.",
    subtitle: "Your world, at your fingertips.",
    cta: "Discover SynoRing",
    alt: "SynoRing seen from the front, its touch surface at the top",
  },
  intro: {
    line: ["SynoRing turns finger movements and thumb touches", "into controls for your AR glasses."],
    captions: [
      { label: "Meet SynoRing", text: "A gesture controller.\nMade to feel natural." },
      { label: "For your spatial world", text: "AR control.\nWithout the interruption." },
    ],
    title: "Your AR glasses.\nControlled from your ring.",
    gestures: "Select with a tap. Scroll with a glide. Adjust with a circle.",
  },
  factsLabel: "What SynoRing does",
  facts: [
    {
      stage: "01 / Input",
      title: "Touch + movement",
      text: "Thumb touches and finger motion work together. Tap, glide, hold, or circle to control what is in view.",
    },
    {
      stage: "02 / Experience",
      title: "A smaller gesture",
      text: "Designed for subtle control at your side, without speaking a command or reaching toward a floating screen.",
    },
    {
      stage: "03 / Application",
      title: "Made for spatial apps",
      text: "Explore music, reading, and navigation today in our interactive browser demo.",
    },
  ],
  lifestyle: {
    label: "SynoRing in everyday life",
    title: "Control your glasses.\nKeep your hands relaxed.",
    text: "Navigate, read, and change the music\nwith small movements at your side.",
  },
  demo: {
    eyebrow: "Interactive demo",
    title: "See through the glasses.\nControl it with the ring.",
    gestures: ["Tap to select", "Glide to scroll", "Circle to adjust", "Hold for apps"],
    cta: "Try the demo",
  },
  possibilities: {
    title: "One ring.\nSo many ways to stay present.",
    music: { title: "Your music.\nYour moment.", text: "Adjust the volume. Keep your rhythm." },
    readingArt: { text: "A little space", emphasis: "to think." },
    reading: { title: "Follow the thought.\nNot the screen.", text: "Move through a page with a glide." },
    navigation: { title: "Eyes up.\nWorld open.", text: "Your next direction, a tap away." },
  },
  technology: {
    title: "Motion and touch.\nWorking together.",
    text: "Sensors read your movement. Touch gives it intent.",
    alt: "SynoRing exploded view: ceramic shell, flexible circuit, arc battery, and steel inner band",
    layers: {
      shell: {
        title: "Ceramic shell",
        text: "A thin glazed shell. Six touch points line its outer face, right over the electrodes.",
      },
      circuit: {
        title: "Flexible circuit",
        text: "A translucent C-shaped board with six outward-facing electrodes and the electronics for motion sensing, gesture processing, and wireless connection.",
      },
      battery: {
        title: "Arc battery",
        text: "A curved cell that sits just inside the touch area.",
      },
      band: {
        title: "Steel inner band",
        text: "One piece of stainless steel. Its rims form the ring's two steel edges.",
      },
    },
    caption: "Illustrative exploded view. Parts are separated for clarity.",
  },
  connection: {
    eyebrow: "The connection",
    title: "From a small gesture\nto an action in view.",
    text: "Our integration direction connects ring input to spatial applications through a phone-side software layer. Device support will be confirmed through testing.",
    steps: [
      ["SynoRing", "Touch and motion input"],
      ["Software layer", "Interpret and map gestures"],
      ["Your AR app", "Select, scroll, and adjust"],
    ],
  },
  developers: {
    eyebrow: "For developers",
    title: "Your app.\nA new way in.",
    text: "Building a spatial reader, a media interface, or something we have not imagined? Help shape how ring input fits your application.",
    link: "Build with SynoRing",
    mappings: [
      ["Tap", "Select a track"],
      ["Glide", "Move through a page"],
      ["Circle", "Bring a map closer"],
    ],
    note: "Your context defines the action.",
  },
  closing: {
    title: "Get closer to\nthe first SynoRing.",
    text: "Join the waitlist for launch updates and developer pilots.",
    lineup: "Four finishes",
  },
  faq: {
    title: "A little more to know.",
    shipping: {
      question: "When can I get SynoRing?",
      answer:
        "Early means early. SynoRing R1 is open for pre-order and estimated to ship in Q1 2027, with free shipping within the US. Join the waitlist to follow developer pilots and production updates.",
    },
    compatibility: {
      question: "Which AR glasses will it work with?",
      answer:
        "Compatibility is being explored. Our direction is a phone-side SDK that connects with AR ecosystems. Supported devices will be announced after validation.",
    },
    developers: {
      question: "Can I get involved as a developer?",
      answer: "We would love to hear from people building spatial interfaces.",
      link: "Tell us what you are working on.",
    },
  },
};

const zh: typeof en = {
  news: "WACV 2027 SEAI 研讨会，与我们相见",
  newsDate: "2027 年 1 月 4–8 日",
  hero: {
    summary:
      "掌控 AR 眼镜、智能眼镜、头显、手机、笔记本电脑、电脑或机器人，不必打断当下。",
    lead: "掌控\u2009",
    devices: ["AR 眼镜", "智能眼镜", "头显", "手机", "笔记本电脑", "电脑", "机器人"],
    tail: "不必打断当下。",
    subtitle: "你的世界，尽在指尖。",
    cta: "了解 SynoRing",
    alt: "SynoRing 正面视图，触控面位于顶部",
  },
  intro: {
    line: ["SynoRing 把手指的动作与拇指的触碰，", "变成操控 AR 眼镜的方式。"],
    captions: [
      { label: "认识 SynoRing", text: "一枚手势控制器。\n自然而然。" },
      { label: "为你的空间世界", text: "掌控 AR，\n不被打断。" },
    ],
    title: "你的 AR 眼镜，\n用戒指来掌控。",
    gestures: "轻点即选择，滑动即滚动，画圈即调节。",
  },
  factsLabel: "SynoRing 能做什么",
  facts: [
    {
      stage: "01 / 输入",
      title: "触控 + 动作",
      text: "拇指触控与手指动作协同工作。轻点、滑动、长按或画圈，即可控制眼前的内容。",
    },
    {
      stage: "02 / 体验",
      title: "更小的手势",
      text: "专为垂在身侧的细微操控而设计，无需说出指令，也不必伸手去够悬浮的屏幕。",
    },
    {
      stage: "03 / 应用",
      title: "为空间应用而生",
      text: "现在就能在我们的浏览器交互演示中，体验音乐、阅读和导航。",
    },
  ],
  lifestyle: {
    label: "日常生活中的 SynoRing",
    title: "操控眼镜，\n双手依然放松。",
    text: "在身侧轻轻一动，\n就能导航、阅读、切换音乐。",
  },
  demo: {
    eyebrow: "交互演示",
    title: "透过眼镜去看，\n用戒指来操控。",
    gestures: ["轻点选择", "滑动滚动", "画圈调节", "长按打开应用"],
    cta: "试玩演示",
  },
  possibilities: {
    title: "一枚戒指，\n多种方式，专注当下。",
    music: { title: "你的音乐，\n你的时刻。", text: "调节音量，不乱节奏。" },
    readingArt: { text: "留一点空间", emphasis: "去思考。" },
    reading: { title: "跟随思绪，\n而不是屏幕。", text: "轻轻一滑，翻过一页。" },
    navigation: { title: "抬起双眼，\n世界尽在眼前。", text: "下一个路口怎么走，轻点即知。" },
  },
  technology: {
    title: "动作与触控，\n协同工作。",
    text: "传感器读取你的动作，触控赋予它意图。",
    alt: "SynoRing 爆炸图：陶瓷外壳、柔性电路、弧形电池和钢制内圈",
    layers: {
      shell: {
        title: "陶瓷外壳",
        text: "一层轻薄的釉面外壳。外表面分布着六个触控点，正对着下方的电极。",
      },
      circuit: {
        title: "柔性电路",
        text: "一块半透明的 C 形电路板，带有六个朝外的电极，以及负责动作感应、手势处理和无线连接的电子元件。",
      },
      battery: {
        title: "弧形电池",
        text: "一块弧形电芯，紧贴在触控区域内侧。",
      },
      band: {
        title: "钢制内圈",
        text: "由一整块不锈钢制成，两侧的边沿构成戒指的两道钢边。",
      },
    },
    caption: "爆炸图仅作示意，各部件分开展示以便查看。",
  },
  connection: {
    eyebrow: "连接方式",
    title: "从一个小手势，\n到眼前的一个动作。",
    text: "我们的集成方向，是通过手机端的软件层把戒指输入接入空间应用。支持哪些设备，将在测试后确认。",
    steps: [
      ["SynoRing", "触控与动作输入"],
      ["软件层", "解析并映射手势"],
      ["你的 AR 应用", "选择、滚动与调节"],
    ],
  },
  developers: {
    eyebrow: "面向开发者",
    title: "你的应用，\n多一种交互方式。",
    text: "正在打造空间阅读器、媒体界面，或是我们还没想到的东西？欢迎一起探索戒指输入如何融入你的应用。",
    link: "用 SynoRing 构建",
    mappings: [
      ["轻点", "选择一首歌"],
      ["滑动", "翻阅页面"],
      ["画圈", "拉近地图"],
    ],
    note: "具体做什么，由你的应用场景决定。",
  },
  closing: {
    title: "离第一枚 SynoRing\n更近一步。",
    text: "加入候补名单，获取发布动态和开发者试点消息。",
    lineup: "四种配色",
  },
  faq: {
    title: "更多你想知道的。",
    shipping: {
      question: "什么时候能拿到 SynoRing？",
      answer:
        "我们还处在早期阶段。SynoRing R1 现已开放预订，预计 2027 年第一季度发货，美国境内包邮。加入候补名单，关注开发者试点和量产进展。",
    },
    compatibility: {
      question: "它能搭配哪些 AR 眼镜？",
      answer:
        "兼容性仍在探索中。我们的方向是通过手机端 SDK 接入各个 AR 生态。支持的设备将在验证后公布。",
    },
    developers: {
      question: "我可以作为开发者参与吗？",
      answer: "我们很想听听正在打造空间界面的人的想法。",
      link: "告诉我们你在做什么。",
    },
  },
};

export const homeCopy = { en, zh };
