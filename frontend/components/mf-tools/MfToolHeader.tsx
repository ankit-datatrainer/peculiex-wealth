"use client";
import { useContent } from "@/lib/content";

/**
 * Heading + intro at the top of every MF resources tool. The copy is the
 * `tools` section of the "resources-mf" CMS page (`<id>Title` / `<id>Intro`);
 * the props are the shipped defaults.
 */
export default function MfToolHeader({
  id,
  title,
  intro
}: {
  id: string;
  title: string;
  intro: string;
}) {
  const cms = useContent("resources-mf");
  return (
    <div className="mf-tool-header">
      <h2>{cms.t("tools", `${id}Title`, title)}</h2>
      <p>{cms.t("tools", `${id}Intro`, intro)}</p>
    </div>
  );
}
