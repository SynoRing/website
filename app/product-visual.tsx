import { useId } from "react";

export type MediaImage = { src: string; srcSet?: string; alt: string };

/** V11 renders on a transparent background, cropped to the ring (1346 × 1372)
    and exported 600 and 1200 px wide. Shadows are added in CSS. */
function ringRender(file: string, finish: string): MediaImage {
  return {
    src: `/images/synoring-${file}-1200.webp`,
    srcSet: `/images/synoring-${file}-600.webp 600w, /images/synoring-${file}-1200.webp 1200w`,
    alt: `SynoRing in ${finish}`,
  };
}
export const ringRenders = {
  "space-gray": ringRender("graphite", "Space Gray"),
  platinum: ringRender("platinum", "Platinum"),
  "rose-gold": ringRender("rose-gold", "Rose Gold"),
  gold: ringRender("yellow-gold", "Gold"),
};
export const ringRenderSize = { width: 1200, height: 1223 };

/** The Space Gray front orthographic view, cropped to the ring (1552 × 1542)
    so the bore centre is the image centre. */
export const ringFrontView = {
  src: "/images/synoring-front-1552.webp",
  srcSet: "/images/synoring-front-800.webp 800w, /images/synoring-front-1552.webp 1552w",
  width: 1552,
  height: 1542,
};

/** The V2 vertical exploded view (800 × 2410 crop): shell, circuit, battery,
    and inner band, top to bottom. `y` is each layer's centre as a share of
    the image height, used to place the callouts. */
export const explodedView = {
  src: "/images/synoring-exploded-800.webp",
  srcSet: "/images/synoring-exploded-400.webp 400w, /images/synoring-exploded-800.webp 800w",
  width: 800,
  height: 2410,
  layers: { shell: 12.9, circuit: 37.4, battery: 66.0, band: 86.6 },
};

/** The flexible circuit and arc battery shown together (square crop). */
export const circuitView: MediaImage = {
  src: "/images/synoring-circuit-1200.webp",
  srcSet: "/images/synoring-circuit-600.webp 600w, /images/synoring-circuit-1200.webp 1200w",
  alt: "SynoRing flexible circuit wrapped around its arc battery",
};

/** A null slot keeps its drawn placeholder. */
export const productMedia: Record<"detail" | "lifestyle", MediaImage | null> = {
  detail: ringRenders["rose-gold"],
  lifestyle: null,
};
const mediaSizes: Record<keyof typeof productMedia, string> = {
  detail: "300px",
  lifestyle: "100vw",
};

type RingFinish = "space-gray" | "platinum" | "rose-gold" | "gold";
const ringPalettes: Record<RingFinish, string[]> = {
  "space-gray": [
    "#adb2b6",
    "#727a82",
    "#373e46",
    "#171c22",
    "#555e69",
    "#c6cdd3",
    "#4b535b",
    "#232b33",
  ],
  platinum: [
    "#ffffff",
    "#d6dadc",
    "#9ba3a8",
    "#727b81",
    "#d3d8da",
    "#ffffff",
    "#b7bfc4",
    "#8a949c",
  ],
  "rose-gold": [
    "#ffebe2",
    "#d9a48d",
    "#ad735d",
    "#744537",
    "#cf957c",
    "#ffe4d5",
    "#c38e76",
    "#885342",
  ],
  gold: [
    "#fff3c8",
    "#dbc17d",
    "#ad8738",
    "#71521d",
    "#d5b368",
    "#fff0ba",
    "#c4a053",
    "#8c6a28",
  ],
};
export function RingVisual({
  className = "",
  finish,
}: {
  className?: string;
  finish?: RingFinish;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={`ring-visual ${className}`}
      viewBox="0 0 600 560"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-body`}
          x1="132"
          y1="80"
          x2="470"
          y2="470"
          gradientUnits="userSpaceOnUse"
        >
          {(finish
            ? ringPalettes[finish]
            : [
                "#f2f3ef",
                "#9bacae",
                "#34474a",
                "#162629",
                "#64777a",
                "#e4eae7",
                "#647677",
                "#1a2c2e",
              ]
          ).map((color, index) => (
            <stop
              key={index}
              offset={[0, 0.16, 0.28, 0.43, 0.6, 0.73, 0.85, 1][index]}
              stopColor={color}
            />
          ))}
        </linearGradient>
        <linearGradient
          id={`${id}-rim`}
          x1="135"
          y1="135"
          x2="427"
          y2="459"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={finish ? ringPalettes[finish][0] : "#f4f8f5"} />
          <stop
            offset=".27"
            stopColor={finish ? ringPalettes[finish][2] : "#738888"}
          />
          <stop
            offset=".49"
            stopColor={finish ? ringPalettes[finish][5] : "#d9e4df"}
          />
          <stop
            offset=".72"
            stopColor={finish ? ringPalettes[finish][6] : "#718681"}
          />
          <stop
            offset="1"
            stopColor={finish ? ringPalettes[finish][0] : "#f0f4ed"}
          />
        </linearGradient>
        <linearGradient
          id={`${id}-inside`}
          x1="222"
          y1="115"
          x2="370"
          y2="465"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={finish ? ringPalettes[finish][3] : "#0d181b"} />
          <stop
            offset=".32"
            stopColor={finish ? ringPalettes[finish][7] : "#273b3d"}
          />
          <stop
            offset=".63"
            stopColor={finish ? ringPalettes[finish][6] : "#829593"}
          />
          <stop
            offset=".82"
            stopColor={finish ? ringPalettes[finish][5] : "#d5ddd6"}
          />
          <stop
            offset="1"
            stopColor={finish ? ringPalettes[finish][2] : "#304747"}
          />
        </linearGradient>
      </defs>
      <g transform="rotate(-29 300 280)">
        <path
          d="M300 53C413 53 496 150 496 276C496 401 413 507 300 507C187 507 104 401 104 276C104 150 187 53 300 53ZM300 102C218 102 166 182 166 279C166 377 219 453 300 453C381 453 434 377 434 279C434 182 382 102 300 102Z"
          fill={`url(#${id}-body)`}
          fillRule="evenodd"
        />
        <path
          d="M300 99C219 99 163 179 163 279C163 379 219 456 300 456C381 456 437 379 437 279C437 179 381 99 300 99ZM301 132C363 132 403 199 403 281C403 363 363 429 301 429C239 429 199 363 199 281C199 199 239 132 301 132Z"
          fill={`url(#${id}-inside)`}
          fillRule="evenodd"
        />
        <ellipse
          cx="300"
          cy="280"
          rx="191"
          ry="221"
          stroke={`url(#${id}-rim)`}
          strokeWidth="4"
        />
        <ellipse
          cx="300"
          cy="279"
          rx="136"
          ry="179"
          stroke={`url(#${id}-rim)`}
          strokeWidth="3"
        />
        <path
          d="M142 173C165 104 224 66 285 65"
          stroke="white"
          strokeOpacity=".75"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M440 365C419 428 367 481 310 493"
          stroke="#eff3eb"
          strokeOpacity=".55"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="277" y="74" width="45" height="5" rx="2.5" fill="#c3e6a1" />
        <path
          d="M119 273C117 386 192 489 293 497"
          stroke="#102225"
          strokeOpacity=".65"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}

export function ProductVisual({
  slot,
  className = "",
}: {
  slot: keyof typeof productMedia;
  className?: string;
}) {
  const media = productMedia[slot];
  return media ? (
    <img
      className={`product-render ${className}`}
      src={media.src}
      srcSet={media.srcSet}
      sizes={mediaSizes[slot]}
      width={ringRenderSize.width}
      height={ringRenderSize.height}
      loading="lazy"
      decoding="async"
      alt={media.alt}
    />
  ) : (
    <RingVisual className={className} />
  );
}
