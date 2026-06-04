type Props = {
  children: React.ReactNode;
  maxWidth?: number;
};

export default function ContentBody({ children, maxWidth = 800 }: Props) {
  return (
    <section style={{ padding: "0 0 120px" }}>
      <div className="container">
        <div
          style={{
            maxWidth,
            margin: "0 auto",
            fontSize: "1.0625rem",
            lineHeight: 1.75,
            color: "var(--color-text)"
          }}
          className="content-body"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
