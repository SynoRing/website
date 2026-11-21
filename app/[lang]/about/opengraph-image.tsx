import { ImageResponse } from "next/og";
import { accent, asset, ink, Lines, muted, Wordmark } from "../../_og/shared";
import { locales } from "../../i18n";

export const alt =
  "About Syno Ring R1, a gesture ring for AR and smart glasses";
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
        background:
          "radial-gradient(ellipse 60% 80% at 22% 55%, #f6f8f2 0%, #ebf0e5 70%)",
      }}
    >
      <Wordmark src={wordmark} />
      <img src={ring} width={350} height={357}
        style={{ position: "absolute", left: 92, top: 154, objectFit: "contain" }} />
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 196,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            marginBottom: 22,
            fontSize: 22,
            color: accent,
          }}
        >
          Syno Ring R1
        </div>
        <Lines
          lines={["Why a ring?"]}
          size={60}
          color={ink}
        />
        <div
          style={{ display: "flex", marginTop: 30, fontSize: 23, color: muted }}
        >
          Gesture control for smart glasses
        </div>
      </div>
    </div>,
    size,
  );
}
