import Logo from "./Logo";

type Props = {
  label: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
};

export default function PageHero({ label, title, subtitle, align = "left" }: Props) {
  const center = align === "center";
  return (
    <section className="page-hero">
      <div className="container">
        <div className={`sec-head${center ? " sec-head-center" : ""}`}>
          {/* Finvoq branding above the page heading */}
          <Logo
            width={148}
            height={58}
            className="page-hero-logo"
            style={center ? { margin: "0 auto 22px" } : { margin: "0 0 22px" }}
          />
          <div className="label">{label}</div>
          <h1 className="stitle" style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}>
            {title}
          </h1>
          {subtitle && <p className="sdesc">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}
