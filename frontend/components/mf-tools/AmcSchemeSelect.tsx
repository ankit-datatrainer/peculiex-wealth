"use client";
import { useEffect, useState } from "react";
import { AMC_LIST, amcSearchTerm } from "@/lib/mfData";
import { apiUrl } from "@/lib/api";

type SchemeOption = { schemeCode: number; schemeName: string };

export default function AmcSchemeSelect({
  amc,
  onAmcChange,
  scheme,
  onSchemeChange,
  idPrefix
}: {
  amc: string;
  onAmcChange: (amc: string) => void;
  scheme: SchemeOption | null;
  onSchemeChange: (s: SchemeOption | null) => void;
  idPrefix: string;
}) {
  const [schemes, setSchemes] = useState<SchemeOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!amc) {
      setSchemes([]);
      return;
    }
    const amcEntry = AMC_LIST.find((a) => a.name === amc);
    if (!amcEntry) return;
    let killed = false;
    setLoading(true);
    fetch(apiUrl(`/api/mf/search?q=${encodeURIComponent(amcSearchTerm(amcEntry.name))}`))
      .then((r) => r.json())
      .then((data: SchemeOption[]) => {
        if (killed) return;
        setSchemes(Array.isArray(data) ? data.slice(0, 300) : []);
      })
      .catch(() => !killed && setSchemes([]))
      .finally(() => !killed && setLoading(false));
    return () => {
      killed = true;
    };
  }, [amc]);

  return (
    <>
      <div className="mf-form-row">
        <label htmlFor={`${idPrefix}-amc`}>AMC</label>
        <select
          id={`${idPrefix}-amc`}
          className="mf-input"
          value={amc}
          onChange={(e) => {
            onAmcChange(e.target.value);
            onSchemeChange(null);
          }}
        >
          <option value="">Select</option>
          {AMC_LIST.map((a) => (
            <option key={a.code} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mf-form-row">
        <label htmlFor={`${idPrefix}-scheme`}>Scheme</label>
        <select
          id={`${idPrefix}-scheme`}
          className="mf-input"
          value={scheme?.schemeCode ?? ""}
          disabled={!amc || loading}
          onChange={(e) => {
            const found = schemes.find((s) => String(s.schemeCode) === e.target.value);
            onSchemeChange(found || null);
          }}
        >
          <option value="">
            {!amc ? "Select an AMC first" : loading ? "Loading…" : "Select"}
          </option>
          {schemes.map((s) => (
            <option key={s.schemeCode} value={s.schemeCode}>
              {s.schemeName}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

export type { SchemeOption };
