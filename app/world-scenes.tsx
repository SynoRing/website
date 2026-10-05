import { useId } from "react";

export type WorldSceneId = "music" | "reading" | "navigation";

/* The outdoor scenes share a one-point perspective: x runs across the view,
   y rises from the ground, and z recedes toward the horizon. */
const VX = 800;
const HORIZON = 500;
const EYE = 500;
const F = 300;
type Point = readonly [number, number];

function p(x: number, y: number, z: number): Point {
  const s = F / (F + z);
  return [VX + x * s, HORIZON + (EYE - y) * s];
}
const scale = (z: number) => F / (F + z);
const pts = (...list: Point[]) =>
  list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
/** A vertical plane at x, running from z0 to z1. */
const wall = (x: number, z0: number, z1: number, y0: number, y1: number) =>
  pts(p(x, y0, z0), p(x, y1, z0), p(x, y1, z1), p(x, y0, z1));
/** A horizontal strip on the ground. */
const ground = (x0: number, x1: number, z0: number, z1: number, y = 0) =>
  pts(p(x0, y, z0), p(x1, y, z0), p(x1, y, z1), p(x0, y, z1));

function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const fixed = (value: number) => Number(value.toFixed(1));

/* ---- Music: a city street on a clear morning ---- */
type Block = { z0: number; z1: number; h: number };
const leftBlocks: Block[] = [
  { z0: -200, z1: 820, h: 2300 },
  { z0: 880, z1: 1500, h: 1500 },
  { z0: 1560, z1: 2500, h: 2700 },
  { z0: 2560, z1: 3200, h: 1400 },
  { z0: 3260, z1: 4500, h: 2200 },
  { z0: 4560, z1: 7000, h: 1700 },
];
const rightBlocks: Block[] = [
  { z0: -200, z1: 600, h: 1800 },
  { z0: 660, z1: 1700, h: 2500 },
  { z0: 1760, z1: 2300, h: 1300 },
  { z0: 2360, z1: 3600, h: 2100 },
  { z0: 3660, z1: 4400, h: 1500 },
  { z0: 4460, z1: 7000, h: 2400 },
];
const leftTones = ["#46505d", "#505b68", "#3f4854"];
const rightTones = ["#bca589", "#ab9884", "#c6b39a"];

function cityWindows(blocks: Block[], x: number, seed: number, palette: string[]) {
  const rand = random(seed);
  const windows: { points: string; fill: string }[] = [];
  for (const block of blocks)
    for (let z = block.z0 + 90; z + 130 < block.z1; z += 210) {
      if (scale(z) < 0.1) continue;
      for (let y = 160; y + 170 < block.h; y += 250) {
        const roll = rand();
        if (p(x, y, z)[1] < -20) continue;
        windows.push({
          points: wall(x, z, z + 120, y, y + 150),
          fill: roll < 0.16 ? palette[2] : roll < 0.45 ? palette[1] : palette[0],
        });
      }
    }
  return windows;
}
const leftWindows = cityWindows(leftBlocks, -820, 11, ["#2e3946", "#7890a6", "#f3cd8c"]);
const rightWindows = cityWindows(rightBlocks, 820, 29, ["#5b6774", "#b4cadb", "#f7dcaa"]);
const streetTrees = [250, 1150, 2050, 2950, 3850].flatMap((z) =>
  [-690, 690].map((x) => {
    const s = scale(z);
    const [cx, cy] = p(x, 640, z);
    const [bx, by] = p(x, 0, z);
    return { x, cx: fixed(cx), cy: fixed(cy), r: fixed(230 * s), bx: fixed(bx), by: fixed(by), w: fixed(26 * s) };
  }),
);
const streetLamps = [700, 1600, 2500, 3400].flatMap((z) =>
  [-560, 560].map((x) => {
    const [bx, by] = p(x, 0, z);
    const [tx, ty] = p(x, 700, z);
    return { bx: fixed(bx), by: fixed(by), tx: fixed(tx), ty: fixed(ty), w: fixed(12 * scale(z)), r: fixed(26 * scale(z)) };
  }),
);
const pedestrians = [
  { x: 640, z: 900 },
  { x: -680, z: 1500 },
  { x: 600, z: 2300 },
  { x: -620, z: 3100 },
].map(({ x, z }) => {
  const s = scale(z);
  const [hx, hy] = p(x, 168, z);
  const [fx, fy] = p(x, 0, z);
  return { hx: fixed(hx), hy: fixed(hy), r: fixed(15 * s), fx: fixed(fx), fy: fixed(fy), w: fixed(52 * s) };
});

function CityScene({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fa2c2" />
          <stop offset="0.55" stopColor="#c8d8e3" />
          <stop offset="1" stopColor="#f1e4cf" />
        </linearGradient>
        <linearGradient id={`${id}-road`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a9b9b" />
          <stop offset="0.25" stopColor="#5d6168" />
          <stop offset="1" stopColor="#383c42" />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1f262e" stopOpacity="0.55" />
          <stop offset="1" stopColor="#1f262e" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor="#fff6dc" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff6dc" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-haze`}>
          <stop offset="0" stopColor="#efe6d6" stopOpacity="0.85" />
          <stop offset="1" stopColor="#efe6d6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-lamp`}>
          <stop offset="0" stopColor="#fff2cf" />
          <stop offset="1" stopColor="#fff2cf" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${id}-sky)`} />
      <circle cx="760" cy="150" r="380" fill={`url(#${id}-sun)`} />
      <g fill="#a5b0ba" opacity="0.8" filter={`url(#${id}-soft)`}>
        <rect x="690" y="420" width="46" height="90" />
        <rect x="742" y="380" width="30" height="130" />
        <rect x="780" y="440" width="54" height="70" />
        <rect x="842" y="400" width="34" height="110" />
        <rect x="882" y="450" width="40" height="60" />
      </g>
      {[...leftBlocks].reverse().map((block, i) => (
        <polygon key={`l${i}`} points={wall(-820, block.z0, block.z1, 0, block.h)} fill={leftTones[i % 3]} />
      ))}
      {[...rightBlocks].reverse().map((block, i) => (
        <polygon key={`r${i}`} points={wall(820, block.z0, block.z1, 0, block.h)} fill={rightTones[i % 3]} />
      ))}
      {leftBlocks.slice(1).map((block, i) => (
        <polygon key={`la${i}`} points={wall(-820, leftBlocks[i].z1, block.z0, 0, Math.min(block.h, leftBlocks[i].h))} fill="#262d35" />
      ))}
      {rightBlocks.slice(1).map((block, i) => (
        <polygon key={`ra${i}`} points={wall(820, rightBlocks[i].z1, block.z0, 0, Math.min(block.h, rightBlocks[i].h))} fill="#6f6355" />
      ))}
      {leftWindows.map((w, i) => (
        <polygon key={`lw${i}`} points={w.points} fill={w.fill} />
      ))}
      {rightWindows.map((w, i) => (
        <polygon key={`rw${i}`} points={w.points} fill={w.fill} />
      ))}
      <polygon points={wall(-820, -200, 7000, 0, 2800)} fill={`url(#${id}-shade)`} />
      <polygon points={ground(-520, 520, -200, 9000)} fill={`url(#${id}-road)`} />
      <polygon points={ground(-820, -520, -200, 9000)} fill="#7e7b74" />
      <polygon points={ground(520, 820, -200, 9000)} fill="#a39c8f" />
      <polygon points={wall(-520, -200, 9000, 0, 18)} fill="#a29c91" />
      <polygon points={wall(520, -200, 9000, 0, 18)} fill="#c9c1b3" />
      {Array.from({ length: 12 }, (_, i) => (
        <polygon key={`d${i}`} points={ground(-10, 10, i * 420, i * 420 + 200)} fill="#e6e1d6" opacity="0.8" />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <polygon key={`c${i}`} points={ground(-480 + i * 110, -410 + i * 110, 140, 420)} fill="#e2ded6" opacity="0.85" />
      ))}
      <ellipse cx="800" cy="500" rx="420" ry="150" fill={`url(#${id}-haze)`} />
      {pedestrians.map((person, i) => (
        <g key={`p${i}`} fill="#2b3036">
          <circle cx={person.hx} cy={person.hy} r={person.r} />
          <rect
            x={person.fx - person.w / 2}
            y={person.hy + person.r}
            width={person.w}
            height={person.fy - person.hy - person.r}
            rx={person.w / 2}
          />
        </g>
      ))}
      {streetLamps.map((lamp, i) => (
        <g key={`lp${i}`}>
          <line x1={lamp.bx} y1={lamp.by} x2={lamp.tx} y2={lamp.ty} stroke="#2a2f35" strokeWidth={lamp.w} />
          <circle cx={lamp.tx} cy={lamp.ty} r={lamp.r * 2.4} fill={`url(#${id}-lamp)`} opacity="0.55" />
        </g>
      ))}
      {[...streetTrees].reverse().map((tree, i) => (
        <g key={`t${i}`}>
          <line x1={tree.bx} y1={tree.by} x2={tree.cx} y2={tree.cy} stroke="#2f2a24" strokeWidth={tree.w} />
          <g fill={tree.x < 0 ? "#2c3a32" : "#4f5d45"}>
            <circle cx={tree.cx} cy={tree.cy} r={tree.r} />
            <circle cx={tree.cx - tree.r * 0.6} cy={tree.cy + tree.r * 0.25} r={tree.r * 0.72} />
            <circle cx={tree.cx + tree.r * 0.62} cy={tree.cy + tree.r * 0.2} r={tree.r * 0.68} />
          </g>
          <circle cx={tree.cx + tree.r * 0.3} cy={tree.cy - tree.r * 0.35} r={tree.r * 0.45} fill={tree.x < 0 ? "#3a4a3f" : "#75805f"} opacity="0.6" />
        </g>
      ))}
    </>
  );
}

/* ---- Reading: a window seat in a café at dusk ---- */
const bokeh = (() => {
  const rand = random(7);
  const colors = ["#ffd79a", "#ffbf75", "#fff1d0", "#9fc2ff", "#ffcf8a"];
  return Array.from({ length: 46 }, () => ({
    cx: fixed(170 + rand() * 1260),
    cy: fixed(300 + rand() * 390),
    r: fixed(10 + rand() * 40),
    fill: colors[Math.floor(rand() * colors.length)],
    opacity: fixed(0.25 + rand() * 0.5),
  }));
})();
const skyline = (() => {
  const rand = random(3);
  const shapes: { x: number; y: number; w: number }[] = [];
  for (let x = 140; x < 1460; ) {
    const w = fixed(60 + rand() * 150);
    shapes.push({ x, y: fixed(330 + rand() * 230), w });
    x += w + 8;
  }
  return shapes;
})();

function CafeScene({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#33271f" />
          <stop offset="1" stopColor="#1b1410" />
        </linearGradient>
        <linearGradient id={`${id}-dusk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6e7f97" />
          <stop offset="0.5" stopColor="#c99b74" />
          <stop offset="1" stopColor="#7c6559" />
        </linearGradient>
        <linearGradient id={`${id}-table`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a5236" />
          <stop offset="1" stopColor="#3a2519" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-pendant`}>
          <stop offset="0" stopColor="#ffc983" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ffc983" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-window`}>
          <rect x="140" y="70" width="1320" height="640" />
        </clipPath>
        <filter id={`${id}-bokeh`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id={`${id}-far`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${id}-near`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${id}-wall)`} />
      <g clipPath={`url(#${id}-window)`}>
        <rect x="140" y="70" width="1320" height="640" fill={`url(#${id}-dusk)`} />
        <g fill="#4b3f45" opacity="0.75" filter={`url(#${id}-far)`}>
          {skyline.map((shape, i) => (
            <rect key={i} x={shape.x} y={shape.y} width={shape.w} height={720 - shape.y} />
          ))}
        </g>
        <g filter={`url(#${id}-bokeh)`}>
          {bokeh.map((light, i) => (
            <circle key={i} cx={light.cx} cy={light.cy} r={light.r} fill={light.fill} opacity={light.opacity} />
          ))}
        </g>
        <rect x="140" y="70" width="1320" height="640" fill={`url(#${id}-glass)`} />
      </g>
      <g fill="#1a130f">
        <rect x="122" y="52" width="1356" height="18" />
        <rect x="122" y="52" width="18" height="666" />
        <rect x="1460" y="52" width="18" height="666" />
        <rect x="572" y="70" width="16" height="640" />
        <rect x="1012" y="70" width="16" height="640" />
        <rect x="140" y="326" width="1320" height="12" />
      </g>
      <rect x="104" y="704" width="1392" height="30" fill="#6b4a34" />
      <rect x="104" y="704" width="1392" height="3" fill="#a07453" />
      <path d="M1250 0V54" stroke="#120d0a" strokeWidth="3" />
      <path d="M1190 96Q1250 40 1310 96Z" fill="#1d1612" />
      <circle cx="1250" cy="120" r="300" fill={`url(#${id}-pendant)`} />
      <polygon points="0,800 1600,776 1600,1000 0,1000" fill={`url(#${id}-table)`} />
      <path d="M0 800L1600 776" stroke="#b07f5b" strokeWidth="3" opacity="0.6" />
      <g stroke="#8d6446" strokeWidth="2" fill="none" opacity="0.35">
        <path d="M0 860Q400 840 820 856T1600 838" />
        <path d="M0 920Q500 900 900 918T1600 902" />
        <path d="M0 970Q420 958 860 974T1600 962" />
      </g>
      <ellipse cx="1250" cy="880" rx="300" ry="90" fill="#ffc983" opacity="0.12" />
      <g filter={`url(#${id}-near)`}>
        <ellipse cx="1236" cy="904" rx="132" ry="26" fill="#1d130d" opacity="0.5" />
        <ellipse cx="1232" cy="892" rx="122" ry="25" fill="#ebe5dc" />
        <path d="M1160 822h144l-10 62q-4 14-24 14h-76q-20 0-24-14z" fill="#f2ede6" />
        <path d="M1304 836q40 0 36 24t-40 20" fill="none" stroke="#e7e0d6" strokeWidth="10" />
        <ellipse cx="1232" cy="822" rx="72" ry="13" fill="#d8d0c4" />
        <ellipse cx="1232" cy="823" rx="62" ry="9.5" fill="#4a2e1d" />
        <g transform="rotate(-5 380 900)">
          <rect x="230" y="852" width="310" height="104" rx="4" fill="#cbc3b2" />
          <rect x="230" y="852" width="310" height="9" fill="#e4ddcf" />
          <path d="M385 852v104" stroke="#a69d8b" strokeWidth="3" />
        </g>
      </g>
      <g fill="#24331f" filter={`url(#${id}-far)`}>
        <ellipse cx="70" cy="520" rx="70" ry="180" transform="rotate(-18 70 520)" />
        <ellipse cx="170" cy="610" rx="56" ry="160" transform="rotate(14 170 610)" />
        <ellipse cx="40" cy="720" rx="90" ry="150" />
        <ellipse cx="250" cy="700" rx="50" ry="120" transform="rotate(32 250 700)" />
      </g>
    </>
  );
}

/* ---- Navigation: a riverside path at golden hour ---- */
const farBank = (() => {
  const rand = random(19);
  const top: Point[] = [];
  for (let z = 12000; z >= -200; z -= 250) top.push(p(-2400, 420 + rand() * 260, z));
  return pts(p(-2400, 0, -200), p(-2400, 0, 12000), ...top);
})();
const hills = (() => {
  const rand = random(5);
  let d = "M0 512";
  for (let x = 0; x <= 1600; x += 80) d += ` L${x} ${fixed(470 + rand() * 30)}`;
  return `${d} L1600 512Z`;
})();
const sunGlints = (() => {
  const rand = random(23);
  return Array.from({ length: 40 }, () => {
    const depth = rand();
    const y = 506 + depth * depth * 300;
    const w = 6 + depth * 70 * (0.4 + rand());
    const spread = 10 + depth * 90;
    return {
      x: fixed(560 - w / 2 + (rand() - 0.5) * spread),
      y: fixed(y),
      w: fixed(w),
      h: fixed(1.2 + depth * 3),
      opacity: fixed(0.85 - depth * 0.55),
    };
  });
})();
const railPosts = Array.from({ length: 16 }, (_, i) => {
  const z = 60 + i * 240;
  const [bx, by] = p(-250, 0, z);
  const [tx, ty] = p(-250, 110, z);
  return { bx: fixed(bx), by: fixed(by), tx: fixed(tx), ty: fixed(ty), w: fixed(14 * scale(z)) };
});
const bridgeZ = 1600;
const bridge = (() => {
  const top = 370;
  const deck = 300;
  const piers = [-2400, -1700, -1000, -250];
  let d = `M${pts(p(-2400, 0, bridgeZ))} L${pts(p(-2400, top, bridgeZ))} L${pts(p(-250, top, bridgeZ))} L${pts(p(-250, 0, bridgeZ))}`;
  for (let i = piers.length - 1; i > 0; i--) {
    const [x1, y1] = p(piers[i] - 60, 0, bridgeZ);
    const [cx, cy] = p((piers[i] + piers[i - 1]) / 2, deck * 1.25, bridgeZ);
    const [x0, y0] = p(piers[i - 1] + 60, 0, bridgeZ);
    d += ` L${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x0.toFixed(1)} ${y0.toFixed(1)}`;
  }
  return `${d} Z`;
})();
const bridgeRail = pts(p(-2400, 370, bridgeZ), p(-250, 370, bridgeZ));
const pathLamps = [500, 1400, 2300, 3200].map((z) => {
  const [bx, by] = p(280, 0, z);
  const [tx, ty] = p(280, 520, z);
  return { bx: fixed(bx), by: fixed(by), tx: fixed(tx), ty: fixed(ty), w: fixed(12 * scale(z)), r: fixed(80 * scale(z)) };
});
const riverTrees = (() => {
  const rand = random(41);
  return [
    { x: 1250, z: -40, r: 470 },
    { x: 980, z: 520, r: 330 },
    { x: 1200, z: 1100, r: 360 },
    { x: 860, z: 1700, r: 300 },
    { x: 1100, z: 2400, r: 340 },
    { x: 820, z: 3100, r: 300 },
    { x: 1000, z: 4000, r: 320 },
  ].map(({ x, z, r }) => {
    const s = scale(z);
    const [cx, cy] = p(x, 760, z);
    const [bx, by] = p(x, 0, z);
    const lobes = Array.from({ length: 7 }, () => ({
      dx: fixed((rand() - 0.5) * 1.5 * r * s),
      dy: fixed((rand() - 0.6) * 1.1 * r * s),
      r: fixed((0.45 + rand() * 0.35) * r * s),
      light: rand() > 0.6,
    }));
    return { cx: fixed(cx), cy: fixed(cy), bx: fixed(bx), by: fixed(by), w: fixed(38 * s), lobes, near: z < 0 };
  });
})();
const walkers = [
  { x: 20, z: 1300 },
  { x: -60, z: 2400 },
].map(({ x, z }) => {
  const s = scale(z);
  const [hx, hy] = p(x, 168, z);
  const [fx, fy] = p(x, 0, z);
  return { hx: fixed(hx), hy: fixed(hy), r: fixed(15 * s), fx: fixed(fx), fy: fixed(fy), w: fixed(52 * s) };
});

function RiversideScene({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5f7fa0" />
          <stop offset="0.45" stopColor="#b9a8a2" />
          <stop offset="0.85" stopColor="#efc28f" />
          <stop offset="1" stopColor="#f6d6a8" />
        </linearGradient>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efc995" />
          <stop offset="0.12" stopColor="#a69a97" />
          <stop offset="0.5" stopColor="#4f6670" />
          <stop offset="1" stopColor="#2b3e45" />
        </linearGradient>
        <linearGradient id={`${id}-path`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7cfa3" />
          <stop offset="1" stopColor="#a68c6c" />
        </linearGradient>
        <linearGradient id={`${id}-grass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b0a66f" />
          <stop offset="0.3" stopColor="#748a4f" />
          <stop offset="1" stopColor="#3d5130" />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor="#fff4d8" />
          <stop offset="0.12" stopColor="#ffe3ad" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffd28f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-lamp`}>
          <stop offset="0" stopColor="#ffe2a8" />
          <stop offset="1" stopColor="#ffe2a8" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={`${id}-near`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id={`${id}-glint`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${id}-sky)`} />
      <g fill="#f3d9c4" opacity="0.4" filter={`url(#${id}-soft)`}>
        <ellipse cx="300" cy="190" rx="260" ry="18" />
        <ellipse cx="1180" cy="140" rx="340" ry="22" />
        <ellipse cx="900" cy="290" rx="220" ry="12" />
      </g>
      <circle cx="560" cy="462" r="460" fill={`url(#${id}-sun)`} />
      <path d={hills} fill="#8a8f97" opacity="0.75" filter={`url(#${id}-soft)`} />
      <polygon points={ground(-2400, -230, -200, 14000)} fill={`url(#${id}-water)`} />
      <g fill="#ffe7bd" filter={`url(#${id}-glint)`}>
        {sunGlints.map((glint, i) => (
          <rect key={i} x={glint.x} y={glint.y} width={glint.w} height={glint.h} rx={glint.h / 2} opacity={glint.opacity} />
        ))}
      </g>
      <polygon points={farBank} fill="#435a48" />
      <path d={bridge} fill="#4a4540" />
      <polyline points={bridgeRail} stroke="#3a3632" strokeWidth="3" fill="none" />
      <polygon points={ground(-230, 230, -200, 14000)} fill={`url(#${id}-path)`} />
      <polygon points={ground(230, 6000, -200, 14000)} fill={`url(#${id}-grass)`} />
      <polygon points={wall(-250, -200, 4000, 96, 112)} fill="#2f3431" />
      {railPosts.map((post, i) => (
        <line key={i} x1={post.bx} y1={post.by} x2={post.tx} y2={post.ty} stroke="#2f3431" strokeWidth={post.w} />
      ))}
      {walkers.map((person, i) => (
        <g key={`w${i}`} fill="#3a3330">
          <circle cx={person.hx} cy={person.hy} r={person.r} />
          <rect x={person.fx - person.w / 2} y={person.hy + person.r} width={person.w} height={person.fy - person.hy - person.r} rx={person.w / 2} />
        </g>
      ))}
      {pathLamps.map((lamp, i) => (
        <g key={`l${i}`}>
          <line x1={lamp.bx} y1={lamp.by} x2={lamp.tx} y2={lamp.ty} stroke="#2c2a27" strokeWidth={lamp.w} />
          <circle cx={lamp.tx} cy={lamp.ty} r={lamp.r} fill={`url(#${id}-lamp)`} />
        </g>
      ))}
      {[...riverTrees].reverse().map((tree, i) => (
        <g key={`t${i}`} filter={tree.near ? `url(#${id}-near)` : undefined}>
          <line x1={tree.bx} y1={tree.by} x2={tree.cx} y2={tree.cy} stroke="#2a2620" strokeWidth={tree.w} />
          {tree.lobes.map((lobe, j) => (
            <circle
              key={j}
              cx={tree.cx + lobe.dx}
              cy={tree.cy + lobe.dy}
              r={lobe.r}
              fill={lobe.light ? "#5f6b40" : "#36452c"}
            />
          ))}
        </g>
      ))}
    </>
  );
}

const sceneLabels: Record<WorldSceneId, string> = {
  music: "A city street on a clear morning",
  reading: "A café window seat at dusk",
  navigation: "A riverside path at golden hour",
};

/** The world seen through the glasses. Only the listed scenes are drawn. */
export function WorldScene({
  active,
  scenes = [active],
  className = "",
}: {
  active: WorldSceneId;
  scenes?: WorldSceneId[];
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`world-scenes ${className}`} aria-hidden="true">
      {scenes.map((scene) => (
        <svg
          key={scene}
          className={`world-scene${scene === active ? " is-active" : ""}`}
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMid slice"
          aria-label={sceneLabels[scene]}
        >
          {scene === "music" && <CityScene id={`${id}m`} />}
          {scene === "reading" && <CafeScene id={`${id}r`} />}
          {scene === "navigation" && <RiversideScene id={`${id}n`} />}
        </svg>
      ))}
      <div className="world-tint" />
    </div>
  );
}
