"use client";
import { useState } from "react";
import { postJSON } from "@/lib/api";

type Status = "idle" | "sending" | "sent" | "error";

const TOPICS = [
  "General enquiry",
  "Mutual funds",
  "PMS / AIF",
  "Bonds & fixed income",
  "Unlisted equity",
  "NRI services",
  "Existing investment",
  "Grievance",
] as const;

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: TOPICS[0] as string,
    message: "",
  });

  const update =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      await postJSON("/api/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: `${form.topic}${form.phone ? ` — ${form.phone.trim()}` : ""}`,
        message: form.message.trim(),
      });
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", topic: TOPICS[0], message: "" });
    } catch {
      setStatus("error");
    }
  };

  const field: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid var(--color-border, rgba(0,0,0,0.12))",
    background: "var(--color-surface, #fff)",
    color: "var(--color-text, inherit)",
    fontSize: "0.95rem",
    fontFamily: "inherit",
  };
  const label: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    marginBottom: 6,
    color: "var(--color-text-muted)",
  };

  // Success replaces the form rather than sitting hidden in the DOM beside it,
  // so it is never read out or indexed before the user has actually submitted.
  if (status === "sent") {
    return (
      <div
        role="status"
        style={{
          padding: "28px 24px",
          borderRadius: 14,
          border: "1px solid rgba(19,115,93,0.35)",
          background: "rgba(19,115,93,0.06)",
        }}
      >
        <h3 style={{ margin: "0 0 8px", fontSize: "1.15rem" }}>Thank you — we&apos;ve got it.</h3>
        <p style={{ margin: 0, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          A member of the team will reply within one working day. If it&apos;s urgent, call us on
          the number listed on this page during working hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          style={{
            marginTop: 16,
            background: "none",
            border: "none",
            padding: 0,
            color: "var(--color-primary)",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div>
          <label htmlFor="c-name" style={label}>Your name</label>
          <input id="c-name" required value={form.name} onChange={update("name")} style={field} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="c-email" style={label}>Email</label>
          <input id="c-email" type="email" required value={form.email} onChange={update("email")} style={field} autoComplete="email" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div>
          <label htmlFor="c-phone" style={label}>Phone <span style={{ fontWeight: 400 }}>(optional)</span></label>
          <input id="c-phone" type="tel" value={form.phone} onChange={update("phone")} style={field} autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="c-topic" style={label}>What is this about?</label>
          <select id="c-topic" value={form.topic} onChange={update("topic")} style={field}>
            {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="c-message" style={label}>Message</label>
        <textarea id="c-message" required rows={5} value={form.message} onChange={update("message")} style={{ ...field, resize: "vertical" }} />
      </div>

      {status === "error" && (
        <p role="alert" style={{ margin: 0, color: "#b3261e", fontSize: "0.9rem" }}>
          Something went wrong sending that. Please try again, or email us directly using the
          address on this page.
        </p>
      )}

      <div>
        <button type="submit" className="btn btn-primary" disabled={status === "sending"} style={{ minWidth: 180 }}>
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>

      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
        We use your details only to respond to this enquiry. We never sell your data.
      </p>
    </form>
  );
}
