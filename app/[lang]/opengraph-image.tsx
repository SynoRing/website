import { ImageResponse } from "next/og";
import { asset, Lines, Wordmark } from "../_og/shared";
import { locales } from "../i18n";

export const alt =
  "SynoRing R1: control your devices without breaking the moment";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function Image() {
  const [wordmark, ring] = await Promise.all([
    asset("wordmark-light.png"),
    asset("front.png"),
  ]);
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #34424e 0%, #6c7880 50%, #d6dad7 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(242,244,240,0.95), rgba(242,244,240,0) 70%)",
        }}
      />
      <Wordmark src={wordmark} />
      <div
        style={{
          position: "absolute",
          top: 62,
          right: 64,
          fontSize: 22,
          color: "rgba(255,255,255,0.78)",
        }}
      >
        SynoRing R1 · Pre-order now
      </div>
      <div style={{ display: "flex", marginTop: 128 }}>
        <Lines
          lines={["Control your devices", "without breaking the moment."]}
          size={64}
          color="#ffffff"
          align="center"
        />
      </div>
      {/* The front view rises from the bottom edge as a half ring. */}
      <img
        src={ring}
        width={660}
        height={656}
        style={{ position: "absolute", left: 270, top: 630 - 328 }}
      />
    </div>,
    size,
  );
}
