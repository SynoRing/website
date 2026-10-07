import { ImageResponse } from "next/og";
import {
  accent,
  asset,
  finishSwatches,
  ink,
  muted,
  Wordmark,
} from "../../_og/shared";
import { locales } from "../../i18n";

export const alt =
  "Pre-order SynoRing R1 for $99, regularly $129, shipping Q1 2027";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function Image() {
  const [wordmark, ring] = await Promise.all([
    asset("wordmark-dark.png"),
    asset("ring-space-gray.png"),
  ]);
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #f5f6f3 0%, #e2e6e1 100%)",
      }}
    >
      <Wordmark src={wordmark} />
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 150,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "8px 18px",
            borderRadius: 999,
            background: "#e6eddd",
            color: accent,
            fontSize: 20,
          }}
        >
          Pre-order
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 96,
            lineHeight: 1,
            letterSpacing: -4,
            color: ink,
          }}
        >
          SynoRing R1
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 30 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              lineHeight: 1,
              letterSpacing: -3,
              color: ink,
            }}
          >
            $99
          </div>
          <div
            style={{
              display: "flex",
              margin: "0 0 6px 10px",
              fontSize: 22,
              color: muted,
            }}
          >
            USD
          </div>
          <div
            style={{
              display: "flex",
              margin: "0 0 4px 22px",
              fontSize: 32,
              color: "#a5aca4",
              textDecoration: "line-through",
            }}
          >
            $129
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 25,
            color: "#4f5952",
          }}
        >
          Ships Q1 2027 · Free US shipping
        </div>
        <div style={{ display: "flex", marginTop: 34 }}>
          {finishSwatches.map((swatch) => (
            <div
              key={swatch}
              style={{
                width: 36,
                height: 36,
                marginRight: 14,
                borderRadius: 999,
                background: swatch,
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            />
          ))}
        </div>
      </div>
      {/* A soft floor shadow grounds the transparent render. */}
      <div
        style={{
          position: "absolute",
          left: 700,
          top: 520,
          width: 400,
          height: 60,
          borderRadius: 999,
          background:
            "radial-gradient(ellipse at center, rgba(28,38,44,0.28), rgba(28,38,44,0) 70%)",
        }}
      />
      <img
        src={ring}
        width={470}
        height={479}
        style={{ position: "absolute", left: 665, top: 70 }}
      />
    </div>,
    size,
  );
}
