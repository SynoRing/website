import { ImageResponse } from "next/og";
import { asset, Lines, Wordmark } from "../../_og/shared";
import { locales } from "../../i18n";

export const alt =
  "SynoRing for developers: map a tap, a glide, or a circle to your app";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const mono = { letterSpacing: 0.5 };

export default async function Image() {
  const wordmark = await asset("wordmark-light.png");
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #2c4334 0%, #15261e 100%)",
        color: "#f2f5ee",
      }}
    >
      <Wordmark src={wordmark} />
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 168,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            marginBottom: 20,
            fontSize: 22,
            color: "#b5c3b0",
          }}
        >
          SynoRing for developers
        </div>
        <Lines
          lines={["Give your spatial app", "a sense of touch."]}
          size={62}
          color="#f2f5ee"
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 44,
            fontSize: 23,
            color: "#c5d1c0",
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="#c5d1c0"
            style={{ marginRight: 12 }}
          >
            <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.97 3.22 9.18 7.69 10.67.56.1.77-.24.77-.54l-.02-1.93c-3.13.68-3.79-1.51-3.79-1.51-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.7 10.7 0 0 1 5.64 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.33-2.64 5.29-5.15 5.56.4.35.76 1.03.76 2.08l-.01 3.08c0 .3.2.65.78.54 4.46-1.49 7.68-5.7 7.68-10.67C23.25 5.48 18.27.5 12 .5Z" />
          </svg>
          github.com/SynoRing
        </div>
      </div>
      {/* Gesture mapping card, as on the Developers page. */}
      <div
        style={{
          position: "absolute",
          right: 64,
          top: 112,
          width: 430,
          display: "flex",
          flexDirection: "column",
          padding: 30,
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 17,
            color: "#c6d3b8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 8,
                height: 8,
                marginRight: 10,
                borderRadius: 999,
                background: "#b8d88c",
              }}
            />
            Gesture mapping
          </div>
          <div style={{ display: "flex", color: "#8ba47e" }}>Concept</div>
        </div>
        <div style={{ display: "flex", margin: "28px 0 22px" }}>
          {["tap", "glide", "circle"].map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                marginRight: 12,
                padding: "7px 18px",
                borderRadius: 999,
                border: "1px solid #718a5b",
                background: "#2e4430",
                fontSize: 19,
                ...mono,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
        {[
          ["gesture", "circle.clockwise"],
          ["app context", "reader"],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: "1px solid rgba(102,127,73,0.3)",
              fontSize: 19,
              color: "#87a17a",
              ...mono,
            }}
          >
            <div style={{ display: "flex" }}>{label}</div>
            <div style={{ display: "flex", color: "#d0ddbf" }}>{value}</div>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 22,
            padding: "18px 20px",
            borderRadius: 14,
            border: "1px solid rgba(211,231,164,0.18)",
            background: "rgba(211,231,164,0.04)",
          }}
        >
          <div style={{ display: "flex", fontSize: 15, color: "#93ad7f" }}>
            Mapped action
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 8,
              fontSize: 28,
              letterSpacing: -0.6,
            }}
          >
            Increase text size
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
