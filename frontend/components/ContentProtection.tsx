"use client";

import { useEffect } from "react";

/**
 * ContentProtection:
 * Disables right-click context menu, text copying/cutting, image dragging,
 * and page/image save shortcuts across the entire website.
 *
 * Keeps input fields and textareas functional so search bars, contact forms,
 * authentication inputs, and admin editors remain fully usable for typing.
 */
export default function ContentProtection() {
  useEffect(() => {
    // 1. Disable Right-Click context menu globally
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable Dragging of any images (prevents dragging to desktop or new tab)
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "IMG" ||
          target.closest("img") ||
          target.tagName === "PICTURE" ||
          target.tagName === "VIDEO")
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Disable Copy & Cut of content (except inside editable input/textarea)
    const isEditableElement = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      const tag = el.tagName.toUpperCase();
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        el.isContentEditable ||
        el.getAttribute("contenteditable") === "true"
      );
    };

    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!isEditableElement(target)) {
        e.preventDefault();
        return false;
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!isEditableElement(target)) {
        e.preventDefault();
        return false;
      }
    };

    // 4. Disable keyboard shortcuts: Ctrl/Cmd + C/X/S/U, F12, Ctrl+Shift+I/J/C
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const editable = isEditableElement(target);
      const key = e.key ? e.key.toLowerCase() : "";
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Copy / Cut outside inputs
      if (isCtrlOrMeta && (key === "c" || key === "x") && !editable) {
        e.preventDefault();
        return false;
      }

      // Save page / Save as (Ctrl+S / Cmd+S)
      if (isCtrlOrMeta && key === "s") {
        e.preventDefault();
        return false;
      }

      // View Source (Ctrl+U / Cmd+U)
      if (isCtrlOrMeta && key === "u") {
        e.preventDefault();
        return false;
      }

      // DevTools shortcuts (F12, Ctrl+Shift+I / J / C)
      if (
        e.key === "F12" ||
        (isCtrlOrMeta && e.shiftKey && (key === "i" || key === "j" || key === "c"))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Attach passive: false listeners so e.preventDefault() is guaranteed to work
    document.addEventListener("contextmenu", handleContextMenu, { capture: true });
    document.addEventListener("dragstart", handleDragStart, { capture: true });
    document.addEventListener("copy", handleCopy, { capture: true });
    document.addEventListener("cut", handleCut, { capture: true });
    document.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      document.removeEventListener("dragstart", handleDragStart, { capture: true });
      document.removeEventListener("copy", handleCopy, { capture: true });
      document.removeEventListener("cut", handleCut, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);

  return null;
}
