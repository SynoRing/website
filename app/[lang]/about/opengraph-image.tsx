import { ImageResponse } from "next/og";
import { accent, asset, ink, Lines, muted, Wordmark } from "../../_og/shared";
import { locales } from "../../i18n";

export const alt =
  "About SynoRing Labs: spatial computing needs a smaller gesture";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function Image() {
  const [wordmark, logo] = await Promise.all([
    asset("wordmark-dark.png"),
    asset("logo.png"),
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
      {/* The emblem from the About page: the mark inside two rings. */}
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 150,
          width: 360,
          height: 360,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          border: "1.5px solid #bdc9ad",
        }}
      >
        <div
          style={{
            width: 310,
            height: 310,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            border: "1.5px solid #cfd8c3",
          }}
        >
          <img src={logo} width={186} height={186} style={{ opacity: 0.72 }} />
        </div>
      </div>
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
          About SynoRing Labs
        </div>
        <Lines
          lines={["Spatial computing", "needs a smaller", "gesture."]}
          size={60}
          color={ink}
        />
        <div
          style={{ display: "flex", marginTop: 30, fontSize: 23, color: muted }}
        >
          Designed in the US · Manufactured in China
        </div>
      </div>
    </div>,
    size,
  );
}
