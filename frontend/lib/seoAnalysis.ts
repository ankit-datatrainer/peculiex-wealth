/**
 * Rank-Math-style content analysis for the blog editor.
 *
 * Implements the test suite Rank Math and Yoast run on every post, in the
 * same four groups they present: Basic SEO, Additional, Title Readability
 * and Content Readability. Each test returns a status, the actionable hint,
 * and the points it contributed, so the editor can render both a score and a
 * list you can work down.
 *
 * Everything here is pure string work — no DOM — so it runs identically on
 * the server and during typing.
 */

export type SeoStatus = "good" | "warn" | "bad" | "neutral";

export type SeoGroup = "basic" | "additional" | "title" | "readability";

export type SeoCheck = {
  id: string;
  group: SeoGroup;
  /** Rank Math phrases these as the desired state, not the current one. */
  label: string;
  status: SeoStatus;
  /** What to actually do about it. */
  detail: string;
  points: number;
  max: number;
};

export type SeoStats = {
  words: number;
  readingMinutes: number;
  sentences: number;
  paragraphs: number;
  headings: number;
  images: number;
  internalLinks: number;
  externalLinks: number;
  dofollowExternal: number;
  keywordCount: number;
  keywordDensity: number;
  flesch: number;
  fleschLabel: string;
  titleLength: number;
  descriptionLength: number;
  slugLength: number;
};

export type SeoReport = {
  score: number;
  grade: "Not set" | "Needs work" | "Good" | "Excellent";
  checks: SeoCheck[];
  stats: SeoStats;
};

export type SeoInput = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  slug: string;
  bodyHtml: string;
  focusKeyword: string;
  secondaryKeywords?: string;
  coverImage?: string;
  coverAlt?: string;
  /** Focus keywords already claimed by other posts, for the uniqueness test. */
  otherKeywords?: string[];
  /** Links to this host count as internal. */
  siteHost?: string;
};

/* ── Text helpers ─────────────────────────────────────────────────────── */

const BLOCK_CLOSE = /<\/(p|div|h[1-6]|li|blockquote|section|article|tr)>/gi;

export function stripHtml(html: string): string {
  return String(html || "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(BLOCK_CLOSE, " $& ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(text: string): string[] {
  return text.split(/[^A-Za-z0-9'’₹%-]+/).filter(Boolean);
}

/** Escape a user-typed keyword so it can go into a RegExp literally. */
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-phrase, case-insensitive occurrences of `needle` in `hay`. */
function countPhrase(hay: string, needle: string): number {
  if (!needle) return 0;
  const re = new RegExp(`(^|[^A-Za-z0-9])${escapeRe(needle)}([^A-Za-z0-9]|$)`, "gi");
  let n = 0;
  // A manual walk, because overlapping boundary chars would otherwise make
  // `exec` skip an adjacent second hit.
  let m: RegExpExecArray | null;
  while ((m = re.exec(hay)) !== null) {
    n += 1;
    re.lastIndex = m.index + Math.max(1, m[0].length - 1);
  }
  return n;
}

function has(hay: string, needle: string): boolean {
  return countPhrase(hay, needle) > 0;
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const cleaned = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const groups = cleaned.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

function fleschLabelFor(score: number): string {
  if (score >= 90) return "Very easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly easy";
  if (score >= 60) return "Plain English";
  if (score >= 50) return "Fairly difficult";
  if (score >= 30) return "Difficult";
  return "Very confusing";
}

/* Rank Math ships a long power-word list; this is the slice that actually
   turns up in finance and business headlines. */
const POWER_WORDS = [
  "amazing", "astonishing", "authentic", "backed", "best", "bold", "brilliant",
  "ca", "case study", "cheat sheet", "complete", "comprehensive", "critical",
  "definitive", "effective", "elite", "essential", "exclusive", "expert",
  "extraordinary", "free", "full", "guaranteed", "guide", "hidden", "honest",
  "how to", "improve", "incredible", "insider", "instant", "key", "latest",
  "leading", "little-known", "must", "new", "official", "outstanding",
  "powerful", "practical", "premium", "proven", "quick", "rare", "real",
  "reliable", "remarkable", "right", "secret", "simple", "smart", "special",
  "step-by-step", "strategic", "stunning", "successful", "surprising",
  "tested", "top", "trusted", "ultimate", "unbeatable", "uncommon", "unique",
  "urgent", "valuable", "verified", "vital", "why", "winning", "worst"
];

const SENTIMENT_WORDS = [
  "avoid", "beat", "best", "better", "beware", "boost", "crash", "danger",
  "dominate", "easy", "fail", "fast", "gain", "grow", "hard", "lose", "loss",
  "mistake", "never", "overrated", "painful", "perfect", "profit", "risk",
  "safe", "save", "smart", "stop", "strong", "stupid", "success", "top",
  "trap", "underrated", "warning", "weak", "win", "worst", "wrong"
];

/* ── Analysis ─────────────────────────────────────────────────────────── */

export function analyseSeo(input: SeoInput): SeoReport {
  const focus = (input.focusKeyword || "").trim().toLowerCase();
  const secondary = (input.secondaryKeywords || "")
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  const html = input.bodyHtml || "";
  const plain = stripHtml(html);
  const plainLower = plain.toLowerCase();
  const wordList = words(plain);
  const wordCount = wordList.length;

  const seoTitle = (input.metaTitle || input.title || "").trim();
  const seoTitleLower = seoTitle.toLowerCase();
  const description = (input.metaDescription || input.excerpt || "").trim();
  const descriptionLower = description.toLowerCase();
  const slug = (input.slug || "").toLowerCase();

  /* Structure */
  const headingMatches = Array.from(html.matchAll(/<h([2-6])[^>]*>([\s\S]*?)<\/h\1>/gi));
  const headingText = headingMatches.map((m) => stripHtml(m[2])).join(" ").toLowerCase();

  const imgMatches = Array.from(html.matchAll(/<img\b[^>]*>/gi)).map((m) => m[0]);
  const altText = imgMatches
    .map((tag) => (tag.match(/\balt\s*=\s*["']([^"']*)["']/i) || [, ""])[1])
    .join(" ")
    .toLowerCase();
  const imagesWithoutAlt = imgMatches.filter(
    (tag) => !/\balt\s*=\s*["'][^"']+["']/i.test(tag)
  ).length;
  const hasVideo = /<(iframe|video)\b/i.test(html);

  const anchors = Array.from(html.matchAll(/<a\b([^>]*)>/gi)).map((m) => m[1]);
  const host = (input.siteHost || "finvoq.com").toLowerCase();
  let internalLinks = 0;
  let externalLinks = 0;
  let dofollowExternal = 0;
  for (const attrs of anchors) {
    const hrefMatch = attrs.match(/\bhref\s*=\s*["']([^"']*)["']/i);
    const href = (hrefMatch ? hrefMatch[1] : "").trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue;
    }
    const absolute = /^https?:\/\//i.test(href);
    if (!absolute || href.toLowerCase().includes(host)) {
      internalLinks += 1;
    } else {
      externalLinks += 1;
      if (!/\brel\s*=\s*["'][^"']*nofollow/i.test(attrs)) dofollowExternal += 1;
    }
  }

  const paragraphBlocks = Array.from(html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)).map((m) =>
    stripHtml(m[1])
  );
  const paragraphs = paragraphBlocks.filter(Boolean);
  const longParagraphs = paragraphs.filter((p) => words(p).length > 120).length;

  const sentenceList = plain.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 1);
  const sentences = Math.max(1, sentenceList.length);
  const syllables = wordList.reduce((n, w) => n + countSyllables(w), 0);
  const flesch = wordCount
    ? Math.max(
        0,
        Math.min(
          100,
          206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / Math.max(1, wordCount))
        )
      )
    : 0;

  /* Keyword placement */
  const keywordCount = focus ? countPhrase(plainLower, focus) : 0;
  const density = wordCount ? (keywordCount * words(focus).length * 100) / wordCount : 0;
  const first10 = plainLower.slice(0, Math.max(120, Math.floor(plain.length * 0.1)));

  const checks: SeoCheck[] = [];
  const add = (
    id: string,
    group: SeoGroup,
    label: string,
    ok: boolean | "warn",
    detail: string,
    max: number
  ) => {
    const status: SeoStatus = ok === true ? "good" : ok === "warn" ? "warn" : "bad";
    checks.push({
      id,
      group,
      label,
      status,
      detail,
      points: ok === true ? max : ok === "warn" ? Math.round(max / 2) : 0,
      max
    });
  };

  if (!focus) {
    checks.push({
      id: "focus-missing",
      group: "basic",
      label: "Set a focus keyword",
      status: "bad",
      detail:
        "Every other keyword test depends on this. Enter the phrase you want this post to rank for.",
      points: 0,
      max: 0
    });
  }

  /* ── Basic SEO ── */
  add(
    "kw-title",
    "basic",
    "Focus keyword in the SEO title",
    focus ? has(seoTitleLower, focus) : false,
    focus
      ? has(seoTitleLower, focus)
        ? "The title carries the keyword."
        : `Work "${input.focusKeyword}" into the SEO title.`
      : "Set a focus keyword first.",
    8
  );

  add(
    "kw-desc",
    "basic",
    "Focus keyword in the meta description",
    focus ? has(descriptionLower, focus) : false,
    focus
      ? has(descriptionLower, focus)
        ? "The description carries the keyword."
        : "Google bolds the keyword in the snippet — add it to the description."
      : "Set a focus keyword first.",
    6
  );

  add(
    "kw-url",
    "basic",
    "Focus keyword in the URL",
    focus ? slug.includes(focus.replace(/[^a-z0-9]+/g, "-")) : false,
    focus
      ? slug.includes(focus.replace(/[^a-z0-9]+/g, "-"))
        ? "The permalink carries the keyword."
        : "Add the keyword to the permalink slug."
      : "Set a focus keyword first.",
    6
  );

  add(
    "kw-opening",
    "basic",
    "Focus keyword near the start of the content",
    focus ? has(first10, focus) : false,
    focus
      ? has(first10, focus)
        ? "It appears in the opening section."
        : "Use the keyword in the first paragraph or two."
      : "Set a focus keyword first.",
    6
  );

  add(
    "kw-content",
    "basic",
    "Focus keyword in the content",
    focus ? keywordCount > 0 : false,
    focus
      ? keywordCount > 0
        ? `Found ${keywordCount} time${keywordCount === 1 ? "" : "s"} in the body.`
        : "The keyword does not appear in the article body at all."
      : "Set a focus keyword first.",
    8
  );

  const lengthOk = wordCount >= 600;
  const lengthWarn = wordCount >= 300;
  add(
    "length",
    "basic",
    "Content is long enough",
    lengthOk ? true : lengthWarn ? "warn" : false,
    lengthOk
      ? `${wordCount} words — a solid length.`
      : `${wordCount} words. Aim for 600+; long-form posts rank more reliably.`,
    8
  );

  /* ── Additional ── */
  add(
    "kw-subheading",
    "additional",
    "Focus keyword in a subheading",
    focus ? has(headingText, focus) : false,
    focus
      ? has(headingText, focus)
        ? "At least one H2/H3 carries the keyword."
        : "Use the keyword in one of your H2 or H3 subheadings."
      : "Set a focus keyword first.",
    6
  );

  const allAlt = `${altText} ${(input.coverAlt || "").toLowerCase()}`;
  add(
    "kw-alt",
    "additional",
    "Focus keyword in image alt text",
    imgMatches.length || input.coverImage
      ? focus
        ? has(allAlt, focus)
        : false
      : false,
    !imgMatches.length && !input.coverImage
      ? "No images yet — add one and describe it with the keyword."
      : focus
        ? has(allAlt, focus)
          ? "An image alt attribute carries the keyword."
          : "Add the keyword to an image's alt text."
        : "Set a focus keyword first.",
    5
  );

  const densityOk = density >= 0.5 && density <= 2.5;
  add(
    "density",
    "additional",
    "Keyword density is in range",
    focus ? (densityOk ? true : density > 0 ? "warn" : false) : false,
    focus
      ? `${density.toFixed(2)}% (${keywordCount} use${keywordCount === 1 ? "" : "s"}). Ideal is 0.5–2.5%.`
      : "Set a focus keyword first.",
    6
  );

  add(
    "url-length",
    "additional",
    "URL is short",
    slug.length > 0 && slug.length <= 75,
    slug.length === 0
      ? "No permalink slug yet."
      : slug.length <= 75
        ? `${slug.length} characters.`
        : `${slug.length} characters — trim it under 75.`,
    3
  );

  add(
    "links-external",
    "additional",
    "Links out to other sites",
    externalLinks > 0,
    externalLinks > 0
      ? `${externalLinks} external link${externalLinks === 1 ? "" : "s"}.`
      : "Cite a source or two. Outbound links signal a researched post.",
    4
  );

  add(
    "links-dofollow",
    "additional",
    "At least one external link is do-follow",
    externalLinks === 0 ? false : dofollowExternal > 0,
    externalLinks === 0
      ? "No external links yet."
      : dofollowExternal > 0
        ? `${dofollowExternal} do-follow.`
        : "Every outbound link is nofollow — let at least one pass authority.",
    3
  );

  add(
    "links-internal",
    "additional",
    "Links to your own content",
    internalLinks > 0,
    internalLinks > 0
      ? `${internalLinks} internal link${internalLinks === 1 ? "" : "s"}.`
      : "Link to a related post or product page to spread authority.",
    5
  );

  const duplicate =
    focus && (input.otherKeywords || []).some((k) => (k || "").trim().toLowerCase() === focus);
  add(
    "kw-unique",
    "additional",
    "Focus keyword is used only once across the site",
    focus ? !duplicate : false,
    !focus
      ? "Set a focus keyword first."
      : duplicate
        ? "Another post already targets this keyword — they will compete with each other."
        : "No other post targets this keyword.",
    4
  );

  if (secondary.length) {
    const found = secondary.filter((k) => has(plainLower, k));
    add(
      "kw-secondary",
      "additional",
      "Secondary keywords appear in the content",
      found.length === secondary.length ? true : found.length ? "warn" : false,
      found.length === secondary.length
        ? `All ${secondary.length} secondary keywords are used.`
        : `${found.length} of ${secondary.length} used. Missing: ${secondary
            .filter((k) => !has(plainLower, k))
            .join(", ")}.`,
      4
    );
  }

  /* ── Title readability ── */
  add(
    "title-start",
    "title",
    "SEO title starts with the focus keyword",
    focus
      ? seoTitleLower.startsWith(focus)
        ? true
        : has(seoTitleLower, focus)
          ? "warn"
          : false
      : false,
    !focus
      ? "Set a focus keyword first."
      : seoTitleLower.startsWith(focus)
        ? "Front-loaded, which is what you want."
        : "Move the keyword closer to the start of the title.",
    4
  );

  const hasNumber = /\d/.test(seoTitle);
  add(
    "title-number",
    "title",
    "Title contains a number",
    hasNumber,
    hasNumber
      ? "Numbers lift click-through."
      : "Titles with a number or a year tend to earn more clicks.",
    3
  );

  const titlePower = POWER_WORDS.some((w) => seoTitleLower.includes(w));
  add(
    "title-power",
    "title",
    "Title contains a power word",
    titlePower,
    titlePower ? "Found one." : "Try a word like ultimate, proven, essential or complete.",
    3
  );

  const titleSentiment = SENTIMENT_WORDS.some((w) => seoTitleLower.includes(w));
  add(
    "title-sentiment",
    "title",
    "Title has positive or negative sentiment",
    titleSentiment,
    titleSentiment
      ? "The title takes a position."
      : "Neutral titles under-perform. Take a stance.",
    3
  );

  const titleLen = seoTitle.length;
  const titleLenOk = titleLen >= 40 && titleLen <= 60;
  add(
    "title-length",
    "title",
    "SEO title length is right",
    titleLenOk ? true : titleLen > 0 ? "warn" : false,
    titleLen === 0
      ? "No title yet."
      : `${titleLen} characters. Google truncates past roughly 60.`,
    4
  );

  const descLen = description.length;
  const descLenOk = descLen >= 120 && descLen <= 160;
  add(
    "desc-length",
    "title",
    "Meta description length is right",
    descLenOk ? true : descLen > 0 ? "warn" : false,
    descLen === 0
      ? "No description yet."
      : `${descLen} characters. Aim for 120–160.`,
    4
  );

  /* ── Content readability ── */
  add(
    "media",
    "readability",
    "Content contains an image or video",
    imgMatches.length > 0 || hasVideo || Boolean(input.coverImage),
    imgMatches.length > 0 || hasVideo
      ? `${imgMatches.length} image${imgMatches.length === 1 ? "" : "s"}${hasVideo ? " and a video" : ""} in the body.`
      : input.coverImage
        ? "Only a cover image. Add one inside the article too."
        : "Add at least one image.",
    5
  );

  add(
    "alt-complete",
    "readability",
    "Every image has alt text",
    imgMatches.length === 0 ? false : imagesWithoutAlt === 0,
    imgMatches.length === 0
      ? "No body images yet."
      : imagesWithoutAlt === 0
        ? "All body images are described."
        : `${imagesWithoutAlt} image${imagesWithoutAlt === 1 ? " is" : "s are"} missing alt text.`,
    4
  );

  add(
    "paragraphs",
    "readability",
    "Paragraphs are short",
    paragraphs.length === 0 ? false : longParagraphs === 0,
    paragraphs.length === 0
      ? "No paragraphs yet."
      : longParagraphs === 0
        ? "No wall-of-text paragraphs."
        : `${longParagraphs} paragraph${longParagraphs === 1 ? " runs" : "s run"} over 120 words — split them up.`,
    4
  );

  add(
    "subheads",
    "readability",
    "Content is broken up with subheadings",
    headingMatches.length === 0
      ? false
      : wordCount / Math.max(1, headingMatches.length) <= 300
        ? true
        : "warn",
    headingMatches.length === 0
      ? "No H2/H3 subheadings. Add some structure."
      : `${headingMatches.length} subheading${headingMatches.length === 1 ? "" : "s"} across ${wordCount} words.`,
    4
  );

  const fleschOk = flesch >= 60;
  add(
    "flesch",
    "readability",
    "Content is easy to read",
    fleschOk ? true : flesch >= 40 ? "warn" : false,
    `Flesch reading ease ${Math.round(flesch)} — ${fleschLabelFor(flesch)}. Aim for 60+.`,
    4
  );

  const earned = checks.reduce((n, c) => n + c.points, 0);
  const possible = checks.reduce((n, c) => n + c.max, 0) || 1;
  const score = Math.round((earned / possible) * 100);

  const grade: SeoReport["grade"] = !focus && wordCount === 0
    ? "Not set"
    : score >= 80
      ? "Excellent"
      : score >= 50
        ? "Good"
        : "Needs work";

  return {
    score,
    grade,
    checks,
    stats: {
      words: wordCount,
      readingMinutes: Math.max(1, Math.round(wordCount / 200)),
      sentences: sentenceList.length,
      paragraphs: paragraphs.length,
      headings: headingMatches.length,
      images: imgMatches.length,
      internalLinks,
      externalLinks,
      dofollowExternal,
      keywordCount,
      keywordDensity: Number(density.toFixed(2)),
      flesch: Math.round(flesch),
      fleschLabel: fleschLabelFor(flesch),
      titleLength: titleLen,
      descriptionLength: descLen,
      slugLength: slug.length
    }
  };
}

export const SEO_GROUP_LABELS: Record<SeoGroup, string> = {
  basic: "Basic SEO",
  additional: "Additional",
  title: "Title readability",
  readability: "Content readability"
};
