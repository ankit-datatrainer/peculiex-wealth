"use client";

import { ReactLenis } from "lenis/react";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // allowNestedScroll lets a scrollable element inside the page (a modal
    // body, a dropdown list) scroll natively instead of Lenis swallowing the
    // wheel event and moving the page behind it. Individual popups are also
    // tagged with data-lenis-prevent; this is the safety net for any that
    // are added later without one.
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.5,
        smoothWheel: true,
        allowNestedScroll: true
      }}
    >
      {children}
    </ReactLenis>
  );
}
