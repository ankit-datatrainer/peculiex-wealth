"use client";
import { useState, useEffect, useRef } from "react";

const DEFAULT_NUMBER = "919999999999"; // Replace via NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local
const DEFAULT_MESSAGE =
  "Hi Peculiex team! I'd like to know more about investing through your platform.";
// Replace via NEXT_PUBLIC_WHATSAPP_COMMUNITY in .env.local (the group/community invite link)
const DEFAULT_COMMUNITY = "https://chat.whatsapp.com/";

const WA_ICON = (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="currentColor" role="img" aria-label="WhatsApp">
    <path d="M16.001 3.2C9.043 3.2 3.4 8.842 3.4 15.8c0 2.227.581 4.4 1.683 6.314L3.2 28.8l6.864-1.802a12.59 12.59 0 0 0 5.937 1.51h.005c6.957 0 12.6-5.642 12.6-12.6 0-3.367-1.31-6.531-3.69-8.91A12.521 12.521 0 0 0 16.001 3.2zm0 22.918h-.004a10.46 10.46 0 0 1-5.33-1.46l-.382-.227-3.973 1.043 1.06-3.873-.249-.397a10.46 10.46 0 0 1-1.605-5.604c0-5.785 4.706-10.49 10.486-10.49 2.802 0 5.434 1.092 7.413 3.073a10.42 10.42 0 0 1 3.07 7.42c0 5.785-4.706 10.515-10.486 10.515zm5.747-7.86c-.314-.157-1.86-.918-2.148-1.024-.288-.105-.498-.158-.708.158-.21.314-.812 1.024-.997 1.234-.184.21-.367.236-.682.079-.314-.158-1.327-.49-2.527-1.56-.934-.833-1.564-1.86-1.748-2.175-.184-.314-.02-.484.138-.641.142-.142.314-.367.472-.55.157-.184.21-.314.314-.524.105-.21.053-.394-.026-.55-.078-.158-.708-1.706-.97-2.336-.255-.612-.515-.529-.708-.539-.184-.009-.394-.011-.604-.011a1.16 1.16 0 0 0-.84.394c-.288.314-1.103 1.077-1.103 2.625 0 1.55 1.13 3.046 1.286 3.255.158.21 2.222 3.392 5.385 4.756.753.325 1.34.519 1.798.665.755.24 1.443.207 1.987.125.606-.09 1.86-.76 2.122-1.494.262-.733.262-1.36.184-1.494-.078-.131-.288-.21-.604-.367z" />
  </svg>
);

export default function WhatsAppButton() {
  const number = (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_NUMBER
  ).replace(/\D/g, "");
  const message = encodeURIComponent(
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || DEFAULT_MESSAGE
  );
  const chatHref = `https://wa.me/${number}?text=${message}`;

  return (
    <div className="whatsapp-root">
      <a
        href={chatHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="whatsapp-btn"
        style={{ textDecoration: 'none' }}
      >
        <span aria-hidden="true" className="whatsapp-btn-icon-wrap">
          <span className="whatsapp-pulse" />
          <span style={{ position: "relative", display: "grid", placeItems: "center" }}>{WA_ICON}</span>
        </span>
        <span className="whatsapp-btn-text">Chat with us</span>
      </a>
    </div>
  );
}
