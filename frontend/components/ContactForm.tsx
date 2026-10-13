"use client";
import { useState } from "react";
import { postJSON } from "@/lib/api";
import { useContent } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "error";

/* Fallback topics, mirroring the CMS default (Contact → Contact form header). */
const TOPICS = [
  { label: "General enquiry" },
  { label: "Mutual funds" },
  { label: "PMS / AIF" },
  { label: "Bonds & fixed income" },
  { label: "Unlisted equity" },
  { label: "NRI services" },
  { label: "Existing investment" },
  { label: "Grievance" },
];

export default function ContactForm() {
  const cms = useContent("contact");
  const t = (field: string, fallback: string) => cms.t("form", field, fallback);
  const topics = cms
    .list("form", "topics", TOPICS)
    .map((o) => o.label)
    .filter(Boolean);

  const [status, setStatus] = useState<Status>("idle");
  // "" means "the first topic in the list": the list can change under the
  // form when the CMS copy arrives, and the select must never hold a stale one.
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "",
    message: "",
  });
  const topic = topics.includes(form.topic) ? form.topic : topics[0] || "";

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
        subject: `${topic}${form.phone ? ` — ${form.phone.trim()}` : ""}`,
        message: form.message.trim(),
      });
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", topic: "", message: "" });
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
        <h3 style={{ margin: "0 0 8px", fontSize: "1.15rem" }}>
          {t("successTitle", "Thank you — we've got it.")}
        </h3>
        <p style={{ margin: 0, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          {t(
            "successBody",
            "A member of the team will reply within one working day. If it's urgent, call us on the number listed on this page during working hours."
          )}
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
          {t("anotherLabel", "Send another message")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div>
          <label htmlFor="c-name" style={label}>{t("nameLabel", "Your name")}</label>
          <input id="c-name" required value={form.name} onChange={update("name")} style={field} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="c-email" style={label}>{t("emailLabel", "Email")}</label>
          <input id="c-email" type="email" required value={form.email} onChange={update("email")} style={field} autoComplete="email" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div>
          <label htmlFor="c-phone" style={label}>
            {t("phoneLabel", "Phone")}{" "}
            <span style={{ fontWeight: 400 }}>{t("phoneOptional", "(optional)")}</span>
          </label>
          <input id="c-phone" type="tel" value={form.phone} onChange={update("phone")} style={field} autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="c-topic" style={label}>{t("topicLabel", "What is this about?")}</label>
          <select id="c-topic" value={topic} onChange={update("topic")} style={field}>
            {topics.map((o, i) => <option key={`${o}-${i}`} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="c-message" style={label}>{t("messageLabel", "Message")}</label>
        <textarea id="c-message" required rows={5} value={form.message} onChange={update("message")} style={{ ...field, resize: "vertical" }} />
      </div>

      {status === "error" && (
        <p role="alert" style={{ margin: 0, color: "#b3261e", fontSize: "0.9rem" }}>
          {t(
            "errorText",
            "Something went wrong sending that. Please try again, or email us directly using the address on this page."
          )}
        </p>
      )}

      <div>
        <button type="submit" className="btn btn-primary" disabled={status === "sending"} style={{ minWidth: 180 }}>
          {status === "sending" ? t("sendingLabel", "Sending…") : t("submitLabel", "Send message")}
        </button>
      </div>

      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
        {t("privacyNote", "We use your details only to respond to this enquiry. We never sell your data.")}
      </p>
    </form>
  );
}
