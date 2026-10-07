/* The Demo page and the interactive experience inside it. Tracks and
   stops follow the order in gesture-input.mjs. {name} placeholders are
   filled in by the demo. */

const en = {
  title: "Interactive Smart Glasses Demo",
  description:
    "Try SynoRing in your browser: control music, reading, and navigation on a smart glasses display with a tap, a glide, or a circle. No hardware needed.",
  heading: {
    eyebrow: "The interactive demo",
    title: "A little movement.\nSee what happens.",
    text: "Step into the view through smart glasses. Your cursor becomes the ring; your gestures control the display.",
    label: "Runs in your browser · No hardware needed",
  },
  guide: {
    eyebrow: "How to play",
    title: "Four gestures.\nA familiar way to interact.",
    text: "Start with a click and a scroll. Then draw a circle with your cursor and watch the same gesture adapt to each scene.",
    gestures: [
      {
        name: "Tap",
        text: "Click to select an item or play and pause the current track.",
        keys: "Mouse click / Touch tap",
      },
      {
        name: "Glide",
        text: "Scroll through tracks, move down a page, or choose a stop.",
        keys: "Scroll wheel / Vertical swipe",
      },
      {
        name: "Circle",
        text: "Draw clockwise to increase; counterclockwise to decrease.",
        keys: "Draw a circle / Rotate buttons",
      },
      {
        name: "Hold",
        text: "Press and hold an open area to bring up the app launcher.",
        keys: "Press and hold / H key",
      },
    ],
  },
  scenes: {
    eyebrow: "Inside the experience",
    title: "One language. Three scenes.",
    link: "Launch the experience",
    tryCircle: "Try a circle",
    items: [
      {
        title: "Music",
        text: "Browse a playlist and select a track.",
        circle: "Turn the volume up or down.",
        note: "Visual playback",
      },
      {
        title: "Reading",
        text: "Move through an article and bookmark it.",
        circle: "Make the text larger or smaller.",
        note: "Adjustable type",
      },
      {
        title: "Navigation",
        text: "Explore a route and select a waypoint.",
        circle: "Zoom the map in or out.",
        note: "Simulated route",
      },
    ],
    keyboard:
      "Prefer a keyboard? Focus the view, then use ↑ ↓ to glide, ← → to rotate, Enter to select, H for apps, and Esc to exit.",
  },
  cta: {
    eyebrow: "Make it your own",
    title: "What would you control?",
    text: "We are interested in how these inputs can work inside your spatial application.",
    button: "Explore Developers",
  },
  experience: {
    scenes: { music: "Music", reading: "Reading", navigation: "Navigation" },
    card: {
      title: "See through the glasses.\nControl it with the ring.",
      text: "Music, reading, navigation. Try the gestures for yourself.",
      button: "Try it",
    },
    header: {
      detail: "/ Smart glasses demo",
      scenes: "Demo scenes",
      close: "Close the demo",
      exit: "Exit",
      view: "Smart glasses view",
    },
    music: {
      meta: "Demo playlist · silent",
      playing: "Now playing",
      paused: "Paused",
      play: "Play selected track",
      pause: "Pause selected track",
      volume: "Volume",
      volumeMeter: "Demo volume",
      volumeLevel: "Volume level",
      tracks: [
        { title: "Open spaces", artist: "Morning collection" },
        { title: "A slower morning", artist: "Morning collection" },
        { title: "Room to breathe", artist: "Morning collection" },
        { title: "Soft focus", artist: "Evening collection" },
        { title: "Homeward", artist: "Evening collection" },
      ],
    },
    reading: {
      app: "Field notes / 01",
      bookmark: "Bookmark",
      bookmarked: "Bookmarked",
      title: "A calmer way to compute.",
      intro: "Information within reach. The rest of the world in view.",
      paragraphs: [
        "A walk can be a walk again. Your next turn is there when you need it, while the trees, the light, and the people around you stay in view.",
        "Spatial computing puts information into the world around us. The next question is how to interact with it without constantly reaching for another screen.",
        "A ring offers a small, familiar place for that interaction. A touch can select a track. A glide can move through this page. A circular movement can make the text a little larger.",
        "The same gesture can do something different in another setting. In your music player, a clockwise circle turns the volume up. In a map, it brings the route closer. Here, it gives the words more room.",
        "Try it as you read. Scroll to move down the page. Draw a clockwise circle with your cursor to increase the text size, or go counterclockwise to reduce it. Click the bookmark to save your place.",
        "Keeping the interaction small makes room for everything around it. You can stay with the task in front of you and let the controls sit quietly within reach.",
        "This is an interactive concept of the experience we are exploring. Hardware gestures and software mappings will continue to develop through testing.",
        "You have reached the end. Hold anywhere in the open view to bring up your apps, then try the same movements in music or navigation.",
      ],
      end: "End of article",
      read: "Read",
      progress: "Reading progress",
      textSize: "Text {percent}%",
    },
    navigation: {
      app: "Riverside walk",
      start: "Start",
      pause: "Pause",
      map: "Route map, {zoom} times zoom, {place} selected",
      goTo: "Navigate to {place}",
      stops: [
        { title: "Riverside path", instruction: "Follow the river", distance: "350 m" },
        { title: "Garden bridge", instruction: "Turn right at the bridge", distance: "180 m" },
        { title: "Willow grove", instruction: "Continue through the grove", distance: "240 m" },
        { title: "The lookout", instruction: "You’ve reached the lookout", distance: "Destination" },
      ],
    },
    launcher: {
      title: "Where next?",
      back: "Back to view",
      hint: "Or tap outside to go back",
    },
    adjustments: { music: "volume", reading: "text size", navigation: "map zoom" },
    legend: [
      ["Click", "Select"],
      ["Scroll / swipe", "Glide"],
      ["Draw a circle", "{adjustment}"],
      ["Hold", "Apps"],
    ],
    controls: {
      decrease: "Rotate counterclockwise to decrease {adjustment}",
      increase: "Rotate clockwise to increase {adjustment}",
      launcher: "Open app launcher",
      help: "Show interaction help",
      closeHelp: "Close interaction help",
    },
    help: {
      title: "Your mouse is the ring.",
      paragraphs: [
        "Move the ring cursor over a control and click to select. Use your wheel or trackpad to simulate a thumb glide.",
        "Draw a complete circle anywhere in the view. Clockwise increases {adjustment}; counterclockwise decreases it. Press and hold until the ring fills to open your apps.",
        "On touch screens, swipe to scroll, draw circles to adjust, and long-press for apps. The rotate buttons work too.",
      ],
      keyboardLabel: "Keyboard:",
      keyboard:
        "Focus the view, then use ↑ ↓ to glide, ← → to rotate, Enter to select, H for apps, and Esc to exit.",
      note: "Interactive concept. Final hardware gesture mappings may change.",
    },
    feedback: {
      intro: "Your cursor is the ring. Try scrolling the playlist.",
      scene: {
        music: "Scroll to browse. Click to play.",
        reading: "Scroll to read. Draw a circle to resize the text.",
        navigation: "Scroll through stops. Draw a circle to zoom.",
      },
      appsOpen: "Apps open · Choose a scene.",
      appsClosed: "Back to your view.",
      glide: {
        music: "Touch glide · Browsing your playlist",
        reading: "Touch glide · Moving through the page",
        navigation: "Touch glide · Exploring the route",
      },
      clockwise: "Clockwise",
      counterclockwise: "Counterclockwise",
      up: { music: "Volume up", reading: "Larger text", navigation: "Zoom in" },
      down: { music: "Volume down", reading: "Smaller text", navigation: "Zoom out" },
      track: "Tap · {track} selected",
      heading: "Tap · Heading to {place}",
      playing: "Tap · Playing {track}",
      paused: "Tap · Playback paused",
      bookmarked: "Tap · Page bookmarked",
      unbookmarked: "Tap · Bookmark removed",
      navigationPaused: "Tap · Navigation paused",
    },
  },
};

export type DemoCopy = typeof en;
export type ExperienceCopy = DemoCopy["experience"];

const zh: DemoCopy = {
  title: "智能眼镜交互演示",
  description:
    "在浏览器中试用 SynoRing：在智能眼镜画面上，用轻点、滑动或画圈来控制音乐、阅读和导航。无需任何硬件。",
  heading: {
    eyebrow: "交互演示",
    title: "动一动手指，\n看看会发生什么。",
    text: "走进智能眼镜里的画面。你的光标就是戒指，你的手势控制着显示的内容。",
    label: "在浏览器中运行 · 无需硬件",
  },
  guide: {
    eyebrow: "玩法",
    title: "四种手势，\n一种熟悉的交互方式。",
    text: "先点一下、滚一滚。再用光标画个圈，看看同一个手势如何适应不同的场景。",
    gestures: [
      {
        name: "轻点",
        text: "点击以选择项目，或播放、暂停当前曲目。",
        keys: "鼠标点击 / 触屏轻点",
      },
      {
        name: "滑动",
        text: "滚动浏览曲目、向下翻阅页面，或选择站点。",
        keys: "滚轮 / 上下滑动",
      },
      {
        name: "画圈",
        text: "顺时针画圈为增大，逆时针为减小。",
        keys: "画圈 / 旋转按钮",
      },
      {
        name: "长按",
        text: "在空白处按住不放，打开应用启动器。",
        keys: "长按 / H 键",
      },
    ],
  },
  scenes: {
    eyebrow: "演示里有什么",
    title: "一套手势，三个场景。",
    link: "开始体验",
    tryCircle: "试试画圈",
    items: [
      {
        title: "音乐",
        text: "浏览播放列表并选择曲目。",
        circle: "调大或调小音量。",
        note: "可视化播放",
      },
      {
        title: "阅读",
        text: "翻阅文章并添加书签。",
        circle: "放大或缩小文字。",
        note: "字号可调",
      },
      {
        title: "导航",
        text: "查看路线并选择途经点。",
        circle: "放大或缩小地图。",
        note: "模拟路线",
      },
    ],
    keyboard:
      "更习惯用键盘？先选中画面，然后用 ↑ ↓ 滑动、← → 旋转、回车选择、H 打开应用、Esc 退出。",
  },
  cta: {
    eyebrow: "为你所用",
    title: "你想用它控制什么？",
    text: "我们很想知道，这些输入方式能如何在你的空间应用中发挥作用。",
    button: "了解开发者计划",
  },
  experience: {
    scenes: { music: "音乐", reading: "阅读", navigation: "导航" },
    card: {
      title: "透过眼镜去看，\n用戒指来操控。",
      text: "音乐、阅读、导航。亲手试试这些手势。",
      button: "试一试",
    },
    header: {
      detail: "/ 智能眼镜演示",
      scenes: "演示场景",
      close: "关闭演示",
      exit: "退出",
      view: "智能眼镜画面",
    },
    music: {
      meta: "演示播放列表 · 静音",
      playing: "正在播放",
      paused: "已暂停",
      play: "播放所选曲目",
      pause: "暂停所选曲目",
      volume: "音量",
      volumeMeter: "演示音量",
      volumeLevel: "音量大小",
      tracks: [
        { title: "开阔之地", artist: "清晨合集" },
        { title: "慢一点的早晨", artist: "清晨合集" },
        { title: "呼吸的空间", artist: "清晨合集" },
        { title: "柔焦", artist: "傍晚合集" },
        { title: "归途", artist: "傍晚合集" },
      ],
    },
    reading: {
      app: "田野笔记 / 01",
      bookmark: "书签",
      bookmarked: "已加书签",
      title: "一种更平静的计算方式。",
      intro: "信息触手可及，世界仍在眼前。",
      paragraphs: [
        "散步可以重新只是散步。需要转弯时，下一个路口的提示就在那里；而树木、光线和身边的人，始终都在视野之中。",
        "空间计算把信息放进了我们周围的世界。接下来的问题是：如何与它互动，而不必总是伸手去够另一块屏幕。",
        "戒指为这种互动提供了一个小巧而熟悉的位置。轻触一下可以选择一首歌，滑动一下可以翻阅这一页，画一个圈可以让文字稍稍变大。",
        "同一个手势，在不同场景里可以做不同的事。在音乐播放器里，顺时针画圈会调大音量；在地图里，它会拉近路线；在这里，它让文字有更多空间。",
        "边读边试试吧。滚动可以向下翻页。用光标顺时针画圈可以放大文字，逆时针则缩小。点击书签可以记住读到的位置。",
        "让交互保持细微，就为周围的一切留出了空间。你可以专注于眼前的事，让操控安静地待在触手可及之处。",
        "这是我们正在探索的体验的交互概念。硬件手势与软件映射会在测试中持续完善。",
        "你已经读到结尾了。在空白处按住不放，打开你的应用，然后在音乐或导航中试试同样的动作。",
      ],
      end: "全文完",
      read: "已读",
      progress: "阅读进度",
      textSize: "字号 {percent}%",
    },
    navigation: {
      app: "河畔漫步",
      start: "开始",
      pause: "暂停",
      map: "路线地图，{zoom} 倍缩放，已选择{place}",
      goTo: "导航到{place}",
      stops: [
        { title: "河畔小径", instruction: "沿河前行", distance: "350 米" },
        { title: "花园桥", instruction: "在桥头右转", distance: "180 米" },
        { title: "柳树林", instruction: "穿过树林继续前行", distance: "240 米" },
        { title: "观景台", instruction: "你已到达观景台", distance: "目的地" },
      ],
    },
    launcher: {
      title: "接下来去哪？",
      back: "返回画面",
      hint: "或点击外部区域返回",
    },
    adjustments: { music: "音量", reading: "字号", navigation: "地图缩放" },
    legend: [
      ["点击", "选择"],
      ["滚轮 / 轻扫", "滑动"],
      ["画圈", "{adjustment}"],
      ["长按", "应用"],
    ],
    controls: {
      decrease: "逆时针旋转以减小{adjustment}",
      increase: "顺时针旋转以增大{adjustment}",
      launcher: "打开应用启动器",
      help: "显示操作说明",
      closeHelp: "关闭操作说明",
    },
    help: {
      title: "你的鼠标就是戒指。",
      paragraphs: [
        "把戒指光标移到控件上，点击即可选择。用滚轮或触控板模拟拇指滑动。",
        "在画面任意位置画一个完整的圆。顺时针增大{adjustment}，逆时针减小。按住不放，直到光环填满，即可打开应用。",
        "在触屏上，滑动即可滚动，画圈即可调节，长按打开应用。也可以使用旋转按钮。",
      ],
      keyboardLabel: "键盘：",
      keyboard: "先选中画面，然后用 ↑ ↓ 滑动、← → 旋转、回车选择、H 打开应用、Esc 退出。",
      note: "交互概念演示。最终的硬件手势映射可能会有所调整。",
    },
    feedback: {
      intro: "你的光标就是戒指。试着滚动播放列表。",
      scene: {
        music: "滚动浏览，点击播放。",
        reading: "滚动阅读，画圈调整字号。",
        navigation: "滚动切换站点，画圈缩放地图。",
      },
      appsOpen: "应用已打开 · 选择一个场景。",
      appsClosed: "回到你的画面。",
      glide: {
        music: "触控滑动 · 浏览播放列表",
        reading: "触控滑动 · 翻阅页面",
        navigation: "触控滑动 · 查看路线",
      },
      clockwise: "顺时针",
      counterclockwise: "逆时针",
      up: { music: "音量调大", reading: "文字放大", navigation: "地图放大" },
      down: { music: "音量调小", reading: "文字缩小", navigation: "地图缩小" },
      track: "轻点 · 已选择《{track}》",
      heading: "轻点 · 正前往{place}",
      playing: "轻点 · 正在播放《{track}》",
      paused: "轻点 · 已暂停播放",
      bookmarked: "轻点 · 已添加书签",
      unbookmarked: "轻点 · 已移除书签",
      navigationPaused: "轻点 · 导航已暂停",
    },
  },
};

export const demoCopy = { en, zh };
