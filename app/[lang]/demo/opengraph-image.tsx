import { ImageResponse } from "next/og";
import { asset, Corners, hud, Lines, Wordmark } from "../../_og/shared";
import { locales } from "../../i18n";

export const alt =
  "Try SynoRing in your browser: a green smart-glasses display over a city street";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const hudDim = "rgba(98,245,154,0.62)";
const hudFaint = "rgba(98,245,154,0.28)";
const glow = "0 0 12px rgba(98,245,154,0.45)";
const hudLeft = 700;
const hudTop = 112;
const hudWidth = 420;
const hudHeight = 300;

export default async function Image() {
  const [wordmark, street] = await Promise.all([
    asset("wordmark-light.png"),
    asset("demo-street.jpg"),
  ]);
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#101613",
      }}
    >
      <img
        src={street}
        width={1200}
        height={630}
        style={{ position: "absolute", left: 0, top: 0 }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(4,9,7,0.86) 0%, rgba(4,9,7,0.6) 46%, rgba(4,9,7,0.3) 100%)",
        }}
      />
      <Wordmark src={wordmark} />
      <div
        style={{
          position: "absolute",
          left: 64,
          bottom: 64,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            marginBottom: 18,
            fontSize: 22,
            color: hud,
          }}
        >
          Interactive demo
        </div>
        <Lines
          lines={["Try SynoRing", "in your browser."]}
          size={64}
          color="#ffffff"
        />
        <div
          style={{
            display: "flex",
            marginTop: 20,
            width: 500,
            fontSize: 24,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.74)",
          }}
        >
          Music, reading, and navigation on a smart glasses display. No hardware
          needed.
        </div>
      </div>
      {/* The line-only HUD, as it appears through the glasses. */}
      <div
        style={{
          position: "absolute",
          left: hudLeft,
          top: hudTop,
          width: hudWidth,
          height: hudHeight,
          display: "flex",
          color: hud,
          textShadow: glow,
        }}
      >
        <Corners color={hudDim} width={hudWidth} height={hudHeight} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: "28px 32px 30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingBottom: 16,
              borderBottom: `1px solid ${hudFaint}`,
              fontSize: 17,
              letterSpacing: 3,
            }}
          >
            <div style={{ display: "flex" }}>MUSIC</div>
            <div style={{ display: "flex", color: hudDim }}>1 / 5</div>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 14,
              letterSpacing: 4,
              color: hudDim,
            }}
          >
            NOW PLAYING
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 8,
              fontSize: 46,
              letterSpacing: -1.2,
            }}
          >
            Open spaces
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 4,
              fontSize: 20,
              color: hudDim,
            }}
          >
            Morning collection
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 26,
              fontSize: 15,
              color: hudDim,
            }}
          >
            <div style={{ display: "flex" }}>1:12</div>
            <div
              style={{
                position: "relative",
                display: "flex",
                flex: 1,
                height: 2,
                margin: "0 14px",
                background: hudFaint,
              }}
            >
              <div
                style={{
                  width: "34%",
                  height: 3,
                  marginTop: -0.5,
                  background: hud,
                  boxShadow: glow,
                }}
              />
            </div>
            <div style={{ display: "flex" }}>3:42</div>
          </div>
        </div>
      </div>
      {/* The ring cursor. */}
      <div
        style={{
          position: "absolute",
          left: 1040,
          top: 452,
          width: 46,
          height: 46,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `2.5px solid ${hud}`,
          borderRadius: 999,
          boxShadow: glow,
        }}
      >
        <div
          style={{ width: 6, height: 6, borderRadius: 999, background: hud }}
        />
      </div>
    </div>,
    size,
  );
}
