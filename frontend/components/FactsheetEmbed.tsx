"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import "./factsheet-embed.css";

type Payload = { exists: boolean; html?: string; updatedAt?: string; servedVariant?: string };

/**
 * Renders a super-admin-supplied HTML factsheet.
 *
 * The document is rendered inside a sandboxed iframe rather than injected
 * into the page, for two independent reasons:
 *
 *  1. Isolation — these factsheets are full HTML documents that style
 *     `body`, load their own fonts and define generic class names. Inlined,
 *     their CSS would leak out and restyle the site.
 *  2. Security — the markup is arbitrary and includes <script>. The sandbox
 *     omits `allow-same-origin`, so the frame runs on an opaque origin and
 *     cannot reach the parent DOM, cookies or the auth token. React's
 *     dangerouslySetInnerHTML would not run the scripts at all (so the
 *     factsheet would render blank) *and* would offer none of this isolation.
 *
 * Height is reported back over postMessage because an opaque-origin frame
 * can't be measured from the parent.
 */

const HEIGHT_REPORTER = `
<style>
  html, body {
    overflow: hidden !important;
    scrollbar-width: none !important;
  }
  ::-webkit-scrollbar {
    display: none !important;
  }
</style>
<script>
(function(){
  function send(){
    var h = Math.max(
      document.body ? document.body.scrollHeight : 0,
      document.documentElement ? document.documentElement.scrollHeight : 0
    );
    if (h > 0) parent.postMessage({ __fvFactsheetHeight: h }, "*");
  }
  window.addEventListener("load", send);
  window.addEventListener("resize", send);
  // Catches view switches, filtering and any other in-frame reflow.
  if (window.ResizeObserver && document.documentElement) {
    new ResizeObserver(send).observe(document.documentElement);
  }
  // A few nudges for late async work (web fonts, chart animations).
  [100, 400, 1200, 2500].forEach(function(t){ setTimeout(send, t); });
  send();
})();
<\/script>
`;

export default function FactsheetEmbed({ slug, label }: { slug: string; label: string }) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState(600);
  const { resolvedTheme } = useTheme();
  // Until the theme resolves on the client, ask for light (the site default) so
  // SSR and first paint agree; SWR re-fetches the dark variant once known.
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  const { data, error, isLoading } = useSWR<Payload>(
    `/api/factsheet-html/${slug}?theme=${theme}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false, keepPreviousData: true }
  );

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Only trust messages from this specific frame.
      if (!frameRef.current || e.source !== frameRef.current.contentWindow) return;
      const h = (e.data as any)?.__fvFactsheetHeight;
      // Clamp: a broken factsheet shouldn't be able to blow the page up.
      if (typeof h === "number" && h > 0) setHeight(Math.min(Math.ceil(h), 30000));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // No factsheet for this product (404) — render nothing at all.
  if (error || (!isLoading && !data?.exists)) return null;

  if (isLoading) {
    return (
      <section className="fse-section">
        <div className="container">
          <div className="fse-skeleton" aria-hidden="true" />
        </div>
      </section>
    );
  }

  const srcDoc = (data?.html || "") + HEIGHT_REPORTER;

  return (
    <section className="fse-section">
      <div className="container">
        <iframe
          ref={frameRef}
          className="fse-frame"
          style={{ height }}
          srcDoc={srcDoc}
          loading="lazy"
          scrolling="no"
          title={`${label} factsheet`}
          // No allow-same-origin: keeps the frame on an opaque origin so it
          // cannot touch the parent page or its storage.
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer"
        />
      </div>
    </section>
  );
}
