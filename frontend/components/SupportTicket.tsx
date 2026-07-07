"use client";
import { useEffect, useRef, useState } from "react";
import { postJSON } from "@/lib/api";

type Status = "idle" | "sending" | "sent" | "error";

export default function SupportTicket() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await postJSON("/api/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || "Support ticket",
        message: form.message.trim()
      });
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="support-ticket-root" ref={rootRef}>
      {open && (
        <div className="support-panel" role="dialog" aria-label="Raise a support ticket">
          <div className="support-panel-head">
            <div>
              <strong>Need help?</strong>
              <span>Raise a ticket — we reply within a few hours.</span>
            </div>
            <button type="button" className="support-close" aria-label="Close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          {status === "sent" ? (
            <div className="support-sent">
              <div className="support-sent-check">✓</div>
              <p>Thanks! Your ticket is in. Our team will get back to you shortly.</p>
              <button type="button" className="btn btn-ghost" onClick={() => setStatus("idle")}>
                Raise another
              </button>
            </div>
          ) : (
            <form className="support-form" onSubmit={submit}>
              <input required placeholder="Your name" value={form.name} onChange={update("name")} />
              <input required type="email" placeholder="Email" value={form.email} onChange={update("email")} />
              <input placeholder="Subject" value={form.subject} onChange={update("subject")} />
              <textarea required rows={4} placeholder="How can we help?" value={form.message} onChange={update("message")} />
              {status === "error" && <p className="support-err">Something went wrong. Please try again.</p>}
              <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Submit ticket"}
              </button>
            </form>
          )}
        </div>
      )}
      <button
        type="button"
        className="support-fab"
        aria-label="Support"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="support-fab-text">Support</span>
      </button>
    </div>
  );
}
