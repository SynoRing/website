import { useId } from "react";

/** Replace a slot's null value with a /public image URL when final renders arrive. */
export const productMedia: Record<
  "hero" | "detail" | "lifestyle" | "closing" | "exploded",
  string | null
> = {
  hero: null,
  detail: null,
  lifestyle: null,
  closing: null,
  exploded: null,
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
  const src = productMedia[slot];
  return src ? (
    <img
      className={`product-render ${className}`}
      src={src}
      loading={slot === "hero" ? "eager" : "lazy"}
      decoding="async"
      alt={`SynoRing ${slot === "lifestyle" ? "in everyday use" : "gesture controller concept"}`}
    />
  ) : (
    <RingVisual className={className} />
  );
}

/** An intentionally schematic assembly placeholder, replaced by productMedia.exploded. */
export function ExplodedVisual() {
  const id = useId().replace(/:/g, "");
  const annulus =
    "M300 0C400 0 470 32 470 72C470 112 400 144 300 144C200 144 130 112 130 72C130 32 200 0 300 0ZM300 26C220 26 170 47 170 72C170 97 220 118 300 118C380 118 430 97 430 72C430 47 380 26 300 26Z";
  return (
    <svg
      className="exploded-visual"
      viewBox="0 0 600 670"
      role="img"
      aria-label="Schematic exploded view of a ring enclosure, touch layer, electronics, and inner liner"
    >
      <defs>
        <linearGradient
          id={`${id}-metal`}
          x1="130"
          y1="0"
          x2="470"
          y2="130"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#48514e" />
          <stop offset=".2" stopColor="#bdc5bf" />
          <stop offset=".43" stopColor="#f0f3ec" />
          <stop offset=".6" stopColor="#a0aaa3" />
          <stop offset=".83" stopColor="#404c47" />
          <stop offset="1" stopColor="#a8b3a9" />
        </linearGradient>
        <linearGradient
          id={`${id}-edge`}
          x1="130"
          y1="0"
          x2="470"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3b4741" />
          <stop offset=".5" stopColor="#8f9e91" />
          <stop offset="1" stopColor="#293c31" />
        </linearGradient>
      </defs>
      <g stroke="#c8d1c4" strokeDasharray="3 9" strokeWidth="1">
        <path d="M163 109L163 530M437 109L437 530" />
      </g>
      <g transform="translate(0 35)">
        <path
          d="M130 72V110C130 150 200 182 300 182C400 182 470 150 470 110V72C470 112 400 144 300 144C200 144 130 112 130 72Z"
          fill={`url(#${id}-edge)`}
        />
        <path d={annulus} fill={`url(#${id}-metal)`} fillRule="evenodd" />
        <ellipse
          cx="300"
          cy="72"
          rx="130"
          ry="46"
          fill="none"
          stroke="#f0f4e9"
          strokeOpacity=".6"
        />
        <path
          d="M269 165L330 165"
          stroke="#bfceaa"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(0 205)">
        <path d={annulus} fill="#b9c4ad" fillRule="evenodd" />
        <path d={annulus} stroke="#e4e8d7" strokeWidth="2" fill="none" />
        <path
          d="M171 93C210 131 370 137 431 91"
          fill="none"
          stroke="#f1eee0"
          strokeWidth="8"
          strokeDasharray="8 10"
        />
        <path
          d="M185 31C250 1 366 13 417 40"
          fill="none"
          stroke="#798e6c"
          strokeWidth="2"
        />
      </g>
      <g transform="translate(0 350)">
        <path d={annulus} fill="#384e3c" fillRule="evenodd" />
        <path
          d="M160 84C170 126 414 150 445 82M165 53C213 14 383 16 437 52"
          stroke="#9db178"
          strokeWidth="2"
          fill="none"
        />
        <rect
          x="265"
          y="115"
          width="65"
          height="30"
          rx="3"
          fill="#202e27"
          stroke="#a6b58e"
        />
        <rect
          x="148"
          y="65"
          width="30"
          height="24"
          rx="2"
          fill="#929d80"
          transform="rotate(15 163 77)"
        />
        <rect
          x="406"
          y="88"
          width="30"
          height="17"
          rx="2"
          fill="#c5c9a1"
          transform="rotate(-20 421 96)"
        />
        <g fill="#b3bc90">
          {[210, 230, 353, 373].map((x) => (
            <rect key={x} x={x} y="122" width="8" height="9" rx="1" />
          ))}
        </g>
      </g>
      <g transform="translate(0 495)">
        <path
          d="M130 72V86C130 126 200 158 300 158C400 158 470 126 470 86V72C470 112 400 144 300 144C200 144 130 112 130 72Z"
          fill="#7b8b7e"
        />
        <path d={annulus} fill={`url(#${id}-metal)`} fillRule="evenodd" />
        <ellipse
          cx="300"
          cy="72"
          rx="130"
          ry="46"
          fill="none"
          stroke="#d2dbcb"
          strokeWidth="3"
        />
      </g>
    </svg>
  );
}
