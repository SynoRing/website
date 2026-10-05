import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* Shared pieces for the build-time Open Graph images (1200 × 630). The
   renderer's default font is Geist, which matches the site. Source PNGs live
   in assets/og because the renderer does not read WebP. */

export const ink = "#1e2420";
export const muted = "#6b756d";
export const accent = "#4b6a3c";
export const hud = "#62f59a";

export async function asset(name: string) {
  const data = await readFile(join(process.cwd(), "assets/og", name));
  const type = name.endsWith(".jpg") ? "image/jpeg" : "image/png";
  return `data:${type};base64,${data.toString("base64")}`;
}

export function Wordmark({ src, top = 52 }: { src: string; top?: number }) {
  return (
    <img
      src={src}
      width={150}
      height={50}
      style={{ position: "absolute", left: 64, top }}
    />
  );
}

/** Headline lines are separate blocks: the renderer has no <br>. */
export function Lines({
  lines,
  size,
  color,
  align = "left",
}: {
  lines: string[];
  size: number;
  color: string;
  align?: "left" | "center";
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        fontSize: size,
        lineHeight: 1.06,
        letterSpacing: -size * 0.04,
        color,
      }}
    >
      {lines.map((line) => (
        <div key={line} style={{ display: "flex" }}>
          {line}
        </div>
      ))}
    </div>
  );
}

/** Display corner marks for a box of known size, drawn as solid bars and
    placed with top/left only, which the renderer handles reliably. */
export function Corners({
  color,
  width,
  height,
  size = 24,
  weight = 2,
}: {
  color: string;
  width: number;
  height: number;
  size?: number;
  weight?: number;
}) {
  const bars = [
    [0, 0, size, weight],
    [0, 0, weight, size],
    [width - size, 0, size, weight],
    [width - weight, 0, weight, size],
    [0, height - weight, size, weight],
    [0, height - size, weight, size],
    [width - size, height - weight, size, weight],
    [width - weight, height - size, weight, size],
  ];
  return (
    <>
      {bars.map(([left, top, w, h]) => (
        <div
          key={`${left}-${top}-${w}`}
          style={{
            position: "absolute",
            left,
            top,
            width: w,
            height: h,
            background: color,
          }}
        />
      ))}
    </>
  );
}

export const finishSwatches = [
  "linear-gradient(135deg, #93989d, #32373b 65%, #636b70)",
  "linear-gradient(135deg, #ffffff, #c8cccd 60%, #f0f1ed)",
  "linear-gradient(135deg, #f7dbcf, #bf8872 60%, #e8bda8)",
  "linear-gradient(135deg, #ffebae, #b99445 65%, #ead18b)",
];
