import { ImageResponse } from "next/og";

// Sitewide default social-share card. Next.js picks this up as og:image and
// twitter:image for every route that does not define its own image, which is
// what makes WhatsApp / X / LinkedIn previews render instead of going blank.
export const runtime = "edge";
export const alt = "Finvoq — India's advisory-led investment marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #06231d 0%, #13735d 60%, #13735d 100%)",
          color: "#ffffff",
          fontFamily: "Georgia, serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              background: "#ffffff",
              color: "#13735d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 700
            }}
          >
            f
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>Finvoq</div>
        </div>

        {/* Satori (the renderer behind ImageResponse) throws if any div has more
            than one child without an explicit display. So each line of the
            headline is its own single-child div rather than text + <br />. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 66, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2 }}>
            <div style={{ display: "flex" }}>India&apos;s advisory-led</div>
            <div style={{ display: "flex" }}>investment marketplace</div>
          </div>
          <div style={{ display: "flex", fontSize: 30, opacity: 0.85, lineHeight: 1.35 }}>
            Listed &amp; unlisted shares · Mutual funds · PMS · AIF · Bonds · Insurance
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, opacity: 0.7 }}>finvoq.com</div>
      </div>
    ),
    size
  );
}
