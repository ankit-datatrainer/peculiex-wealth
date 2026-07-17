# 🏆 The Cinematic 3D-Scroll Website Playbook

A repeatable recipe for building award-level, cinematic "scroll-story" websites
(the Lando-Norris / Awwwards feel) for **any** domain — weddings, finance, real
estate, product, portfolio. Re-skin 4 layers; the engine stays identical.

---

## Part 0 — What "3D / award-level scroll" actually is

It is **not** necessarily WebGL/Three.js. The "3D" feeling comes from **the
perception of depth + cinematic motion controlled by scroll**. You get ~90% of
the award-winning feel from four cheap techniques:

1. **Scroll-scrubbed video** — the scrollbar becomes the video's play-head.
   Scroll down = the shot moves forward. The single most important trick.
2. **Sticky pinning** — an element freezes full-screen while the user scrolls
   "through" it.
3. **Progress-driven choreography** — text/images fade, scale, and slide based
   on a `0 → 1` scroll-progress number.
4. **Staged reveals** — content enters one beat at a time, never all at once.

Master these four and you can rebuild the feel for a bank, a watch brand, or a
SaaS.

---

## Part 1 — The core engine: scroll-scrubbed video

**Concept:** A tall invisible "track" (e.g. `320vh`). Inside it, a
`position: sticky` container holds a full-screen `<video>`. As you scroll the
track, compute progress `0→1` and set `video.currentTime = progress × duration`.

```jsx
"use client";
import { useEffect, useRef, useState } from "react";

export default function ScrollVideo({ desktopSrc, mobileSrc, poster, children }) {
  const trackRef = useRef(null);
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => setIsMobile(window.matchMedia("(max-width:767px)").matches), []);

  useEffect(() => {
    const video = videoRef.current, track = trackRef.current;
    if (!video || !track) return;
    let raf = 0, target = 0;

    const onScroll = () => {
      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      const p = scrollable > 0 ? scrolled / scrollable : 0;
      setProgress(p);
      target = p * ((video.duration || 10) - 0.05);
    };

    // Chase the target time every frame with easing → buttery, not jumpy
    const tick = () => {
      if (video.readyState >= 2) {
        const diff = target - video.currentTime;
        if (Math.abs(diff) > 0.008) video.currentTime += diff * 0.28;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  const src = isMobile ? mobileSrc : desktopSrc;

  return (
    <section ref={trackRef} className="relative h-[320vh] bg-black">
      <div className="sticky top-0 h-screen overflow-hidden">
        <video ref={videoRef} key={src} src={src} poster={poster}
               muted playsInline preload="auto"
               className="absolute inset-0 h-full w-full object-cover" />
        {children(progress)}
      </div>
    </section>
  );
}
```

**The two dials you tune:**
- **Track height** (`h-[320vh]`): longer = slower, more luxurious scrub.
  300–400vh is the sweet spot.
- **Easing factor** (`× 0.28`): lower = smoother/laggier, higher = snappier.
  0.25–0.35 feels premium.

**Progress-driven overlays** — this is your cinematic timing / director's cue sheet:

```js
const clamp = v => Math.min(Math.max(v, 0), 1);

// Title visible at start, gone by 42% scroll
const titleOpacity = clamp(1 - progress / 0.42);

// A block that fades IN at 40%, holds, fades OUT at 72%
const midOpacity =
  progress < 0.40 ? 0
  : progress < 0.62 ? clamp((progress - 0.40) / 0.22)
  : clamp(1 - (progress - 0.72) / 0.18);
```

Combine with `style={{ opacity, transform: `scale(${1 + progress * 0.15})` }}`
for the slow zoom-in feel.

---

## Part 2 — Generating the hero video (Google Veo / Gemini)

The video is what makes it look like a $50k production.

**Prompt formula — always these 5 blocks, in order:**

> **[Camera move] + [Subject/scene] + [Foreground passes] + [Lighting & mood] + [Technical tags]**

Template (swap the middle for your topic):

> *Cinematic **slow push-in / crane-down**, camera **glides forward through**
> [foreground element], revealing [main subject]. [Lighting: golden-hour / neon
> / soft studio]. [Mood: sacred / luxurious / futuristic]. Shallow depth of
> field, gentle floating particles, slow graceful dolly motion. Photorealistic,
> 4K, cinematic color grade, **no text, no people**.*

**Non-negotiable specs:**

| Setting | Value | Why |
|---|---|---|
| Generate **two** clips | 16:9 **and** 9:16 | Desktop letterboxes badly on phones |
| Resolution | 1920×1080 / 1080×1920 | Native, no upscaling |
| Duration | **6–10 sec** | Scrub stretches it across the whole scroll |
| Motion | **One continuous camera move** | Multiple cuts scrub badly |
| Content | **No text, no people, no fast motion** | Text bakes in wrong; people look uncanny when scrubbed |

**Negative prompt:** `text, watermark, distorted faces, blurry, low quality, fast cuts, jump cuts`

---

## Part 3 — Encoding the video for scrubbing (the part nobody tells you)

A normal MP4 **stutters** when scrubbed — it only has a keyframe every ~2s, and
seeking between them forces slow decodes. **Fix: re-encode as all-keyframe, no
audio.**

```bash
ffmpeg -y -i input.mp4 \
  -an \                      # strip audio (music comes separately)
  -g 1 -keyint_min 1 \       # a keyframe on EVERY frame → instant seeking
  -sc_threshold 0 \
  -c:v libx264 -crf 20 \     # ← the quality dial (see below)
  -preset slow \
  -pix_fmt yuv420p \
  -movflags +faststart \     # lets it start before fully downloaded
  intro-desktop.mp4
```

**The CRF lesson (learned the hard way):** all-keyframe spreads bits across every
frame, so quality/size behave differently than normal video:

| CRF | Result | Verdict |
|---|---|---|
| 24 | ~10 Mbps, soft/**blurry** on big screens | ❌ too low |
| 16 | ~25 Mbps, 31 MB, **choked the browser** while scrubbing | ❌ too heavy |
| **20** | ~17 Mbps, 21 MB, **sharp AND smooth** | ✅ sweet spot |

→ **For scroll-scrubbing 1080p, live at CRF 18–20.** Sharpness and decode-load
both matter; don't max one.

**Extract the poster** (shown while the video loads — kills the flash of black):
```bash
ffmpeg -y -i intro-desktop.mp4 -frames:v 1 -q:v 2 intro-poster.jpg
```

**Always keep your source files** in a git-ignored `_source/` folder.
Re-encoding a re-encode loses detail permanently.

---

## Part 4 — The gotchas that WILL bite you (hard-won)

1. **`overflow-x: hidden` silently breaks `position: sticky`.**
   It turns `html`/`body` into a scroll container and sticky stops pinning.
   **Use `overflow-x: clip` instead** — stops horizontal scroll without killing
   sticky. (This bug once collapsed the whole video to a black strip.)

2. **Text over bright video disappears — fix with layers, not opacity.**
   - a base **gradient veil** (dark at top + bottom),
   - an **extra scrim** behind the text zone (`bg-black/35` + a blurred dark blob),
   - **double text-shadow**: `[text-shadow:0_2px_6px_rgba(0,0,0,.9),0_4px_24px_rgba(0,0,0,.9)]`,
   - put UI hints (like "Scroll") **in a dark pill** (`bg-black/40 backdrop-blur`).

3. **Desktop vs mobile video swap needs a mount-time check.**
   Pick the source with `matchMedia("(max-width:767px)")` inside `useEffect`
   (client only), and put `key={src}` on the `<video>` so it remounts cleanly.
   SSR renders desktop first; the effect corrects on mount.

4. **Audio can't autoplay — gate it behind one tap.**
   Add a **"Tap to Begin" splash**; the tap is the user gesture that lets
   `audio.play()` start. Bonus: it doubles as a beautiful title card.

Plus: `preload="auto"` + `poster` on the video, and lazy-load below-the-fold.

---

## Part 5 — Generating on-brand supporting art (the frame trick)

Generate a **decorative frame with an empty middle** (Nano-Banana / any image
model), then lay real HTML text in the open center. Reusable for any hero card.

**"Open-center frame" prompt formula:**
> *[Style] decorative frame/border in [palette]. [Motifs] framing all four edges.
> The **entire center is empty [surface]** with plenty of open space for text.
> No text, no people.*

CSS: `<img className="object-cover -z-10" />` as background, content column with
**generous percentage padding** (`px-[13%] pt-[16%]`) so text never collides
with painted edges. Verify padding numerically (measure each element's distance
to the card edge) since live screenshots can be flaky.

**Why it beats pure CSS:** watercolor/hand-painted/photographic richness CSS
can't fake, while keeping text crisp and editable.

---

## Part 6 — Applying it to ANY domain (worked finance example)

The engine is identical; re-skin **4 layers**. Fintech / wealth-management:

| Layer | Wedding version | → Finance version |
|---|---|---|
| **Video subject** | temple push-in | slow fly-through of a glowing skyline at dusk / flowing liquid-gold data streams |
| **Palette** | cream + gold + maroon | deep navy `#0a1628` + electric teal + soft gold |
| **Typography** | script + serif | confident grotesk (Inter/Söhne) + one elegant serif for headlines |
| **Motion feel** | sacred, floating petals | precise, weighted, subtle particle "data motes" |

**Finance Veo prompt (drop-in):**
> *Cinematic slow aerial push-forward over a serene modern city skyline at
> blue-hour, glowing office towers reflecting on water, faint streams of golden
> light flowing between buildings like data. Calm, premium, trustworthy mood.
> Shallow depth of field, slow graceful dolly, subtle floating light particles.
> Photorealistic, 4K, cinematic grade, no text, no people.*

**Section choreography** (reuse the progress helpers):
- `0–35%` → tagline fades over the skyline ("Wealth, engineered.")
- `35–65%` → a single hero stat scales in ("$2.4B managed")
- `65–100%` → hand off into real content (product, pricing, "Book a call")

Everything else — encoding, sticky, overflow-clip, text-shadow, tap-to-begin —
is **copy-paste identical**.

---

## Part 7 — The reusable checklist (pin this)

```
□ Write Veo prompt with the 5-block formula → generate 16:9 AND 9:16, 6–10s, no text/people
□ Re-encode both: all-keyframe, no audio, CRF 18–20, +faststart
□ Extract poster.jpg from frame 1
□ Keep originals in git-ignored _source/
□ Build ScrollVideo: tall track (≈320vh) + sticky h-screen + rAF currentTime-chase (ease 0.28)
□ Swap desktop/mobile source via matchMedia in useEffect + key={src}
□ Overlay text with progress-driven opacity/scale helpers (clamp windows)
□ Readability: veil gradient + center scrim + double text-shadow + dark pill for hints
□ Gate audio behind a "Tap to Begin" splash (also your title card)
□ GLOBAL CSS: overflow-x: clip (NEVER hidden) so sticky survives
□ Optional hero card: generate an "open-center frame" image, lay HTML text in the middle with % padding
□ Verify on real desktop AND 375px mobile; check no horizontal overflow
□ Re-skin per domain: video subject · palette · type · motion feel — engine stays the same
```

---

**Mental model:** *scroll = timeline. Video = the shot. Sticky = the stage.
Progress 0→1 = your director's cue sheet.* Once that clicks, every "how did they
build that award site?" becomes obvious.
