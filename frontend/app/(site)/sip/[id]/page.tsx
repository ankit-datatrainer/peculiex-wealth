import { fetcher } from "@/lib/api";
import { fmtINR } from "@/lib/util";
import Link from "next/link";

type SipShare = {
  id: string;
  amount: number;
  rate: number;
  years: number;
  invested: number;
  gains: number;
  total: number;
  created_at?: string;
};

export const dynamic = "force-dynamic";

export default async function SipSharePage({
  params
}: {
  params: { id: string };
}) {
  let data: SipShare | null = null;
  try {
    const r = await fetch(
      (process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:4000") +
        "/api/sip/share/" +
        encodeURIComponent(params.id),
      { cache: "no-store" }
    );
    if (r.ok) data = await r.json();
  } catch {}

  if (!data) {
    return (
      <main style={{ padding: "8rem 1.5rem 4rem", maxWidth: 720, margin: "0 auto" }}>
        <h1 className="stitle">Projection not found</h1>
        <p className="sdesc">
          This share link no longer exists or never existed.{" "}
          <Link href="/calculator" style={{ color: "var(--color-primary)" }}>
            Back to the SIP calculator →
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: "8rem 1.5rem 4rem", maxWidth: 720, margin: "0 auto" }}>
      <div className="label">Shared projection</div>
      <h1 className="stitle">
        ₹{fmtINR(data.amount).replace("₹", "")}/mo at {data.rate}%, for{" "}
        {data.years} {data.years === 1 ? "year" : "years"} →{" "}
        <em>{fmtINR(data.total)}</em>
      </h1>
      <p className="sdesc">
        Invested {fmtINR(data.invested)} · Estimated gains {fmtINR(data.gains)}.
      </p>
      <p style={{ marginTop: "2rem" }}>
        <Link href="/calculator" className="btn btn-primary btn-lg" data-magnetic>
          Try your own projection →
        </Link>
      </p>
    </main>
  );
}
