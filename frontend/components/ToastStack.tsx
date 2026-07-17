"use client";
import { useEffect, useRef } from "react";

type Activity = {
  name: string;
  city: string;
  action: string;
  detail: string;
  time: string;
  color: string;
};

// Mutual Fund / SIP-only social proof.
const ACTIVITIES: Activity[] = [
  { name: "Aarav S.", city: "Bengaluru", action: "Started SIP", detail: "₹15,000/mo", time: "2 min", color: "#0E3F76" },
  { name: "Priya K.", city: "Mumbai", action: "SIP · HDFC Flexi Cap", detail: "₹10,000/mo", time: "4 min", color: "#7c3aed" },
  { name: "Vikram I.", city: "Delhi", action: "Lump sum in Mutual Fund", detail: "₹2,00,000", time: "6 min", color: "#13735d" },
  { name: "Neha R.", city: "Hyderabad", action: "New ELSS investment", detail: "₹1,50,000", time: "9 min", color: "#ea7c1c" },
  { name: "Karan M.", city: "Pune", action: "SIP · Nippon Small Cap", detail: "₹8,000/mo", time: "12 min", color: "#16a34a" },
  { name: "Rahul B.", city: "Chennai", action: "Increased SIP", detail: "₹25,000/mo", time: "15 min", color: "#dc2626" },
  { name: "Anjali T.", city: "Kolkata", action: "Started SIP · Parag Parikh", detail: "₹12,000/mo", time: "18 min", color: "#2563eb" },
  { name: "Suresh G.", city: "Ahmedabad", action: "SIP · ICICI Bluechip", detail: "₹20,000/mo", time: "21 min", color: "#13735d" },
  { name: "Meera D.", city: "Jaipur", action: "New SIP started", detail: "₹5,000/mo", time: "24 min", color: "#9333ea" },
  { name: "Arjun P.", city: "Surat", action: "SIP · Mirae Large & Mid", detail: "₹18,000/mo", time: "27 min", color: "#0891b2" }
];

export default function ToastStack() {
  const stackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    let idx = 0;
    let timer: ReturnType<typeof setInterval> | null = null;
    let kickoff: ReturnType<typeof setTimeout> | null = null;

    const showToast = () => {
      const a = ACTIVITIES[idx % ACTIVITIES.length];
      idx++;
      while (stack.children.length >= 3) stack.firstElementChild?.remove();
      const toast = document.createElement("div");
      toast.className = "toast";
      const initial = a.name.charAt(0);
      toast.innerHTML = `
        <span class="toast-avatar" style="background:${a.color}">${initial}</span>
        <div class="toast-body">
          <b>${a.name} from ${a.city}</b>
          <i>${a.action} · ${a.detail}</i>
        </div>
        <span class="toast-time">${a.time} ago</span>`;
      stack.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add("in"));
      setTimeout(() => {
        toast.classList.remove("in");
        toast.classList.add("out");
        setTimeout(() => toast.remove(), 500);
      }, 4200);
    };

    // Show the first toast after 1 minute, then a new one every 2 minutes.
    kickoff = setTimeout(() => {
      showToast();
      timer = setInterval(showToast, 120000);
    }, 60000);

    return () => {
      if (kickoff) clearTimeout(kickoff);
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div
      className="toast-stack"
      id="toastStack"
      aria-live="polite"
      aria-atomic="false"
      ref={stackRef}
    />
  );
}
