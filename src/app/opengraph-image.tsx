import { ImageResponse } from "next/og";

export const alt = "Klaas Kroezen — Meer omzet, minder stress";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0E0C0A",
          color: "#F7F4EF",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "#B5622A",
            marginBottom: 24,
          }}
        >
          KLAAS KROEZEN
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: 24,
          }}
        >
          <span>Meer omzet.</span>
          <span style={{ color: "rgba(247,244,239,0.4)", fontStyle: "italic", fontWeight: 400 }}>
            Minder stress.
          </span>
        </div>
        <div
          style={{
            fontSize: 22,
            color: "rgba(247,244,239,0.7)",
            lineHeight: 1.6,
            maxWidth: 600,
          }}
        >
          Sales- en Customer Success trainingen. Oprecht en ontspannen — geen trucjes, geen scripts. 25+ jaar ervaring.
        </div>
      </div>
    ),
    { ...size }
  );
}
