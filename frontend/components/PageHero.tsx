type Props = {
  label: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
};

export default function PageHero({ label, title, subtitle, align = "left" }: Props) {
  return (
    <section style={{ padding: "150px 0 60px", position: "relative" }}>
      <div className="container">
        <div className={`sec-head${align === "center" ? " sec-head-center" : ""}`}>
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
