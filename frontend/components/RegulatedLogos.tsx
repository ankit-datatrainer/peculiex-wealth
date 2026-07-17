import React from "react";

// SEBI Logo
export const SebiLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 40" width="95" height="28" fill="currentColor" {...props}>
    <text x="5" y="28" fontFamily="'Hanken Grotesk', sans-serif" fontWeight="900" fontSize="28" letterSpacing="0.5">SEBI</text>
    <path d="M 5,34 C 40,34 80,31 115,25 C 80,29 40,29 5,34 Z" fill="var(--color-primary)" />
  </svg>
);

// RBI Logo
export const RbiLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 40" width="105" height="28" fill="currentColor" {...props}>
    <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
    <path d="M 20,27 L 20,15 M 20,19 Q 15,16 13,17 M 20,17 Q 15,13 14,15 M 20,15 Q 16,11 18,12 M 20,15 Q 24,11 22,12 M 20,17 Q 25,13 26,15 M 20,19 Q 25,16 27,17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M 14,26 Q 17,24 21,25 Q 24,26 26,24 L 27,26 L 25,28 L 21,28 Q 17,27 14,26 Z" fill="currentColor" />
    <text x="44" y="24" fontFamily="Georgia, serif" fontWeight="bold" fontSize="15" letterSpacing="0.5">RBI</text>
    <text x="44" y="32" fontFamily="'Hanken Grotesk', sans-serif" fontWeight="600" fontSize="7.5" letterSpacing="0.15" opacity="0.8">RESERVE BANK</text>
  </svg>
);

// NSE Logo
export const NseLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 40" width="95" height="28" fill="currentColor" {...props}>
    <path d="M 8,28 Q 15,8 30,12 Q 22,20 18,28 Z" fill="var(--color-primary)" />
    <path d="M 32,14 Q 38,24 28,32 Q 22,24 24,16 Z" fill="currentColor" opacity="0.8" />
    <text x="44" y="27" fontFamily="'Hanken Grotesk', sans-serif" fontWeight="800" fontSize="20" letterSpacing="0.5">NSE</text>
  </svg>
);

// BSE Logo
export const BseLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 40" width="95" height="28" fill="currentColor" {...props}>
    <circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M 11,20 A 9,9 0 0,0 29,20" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
    <circle cx="20" cy="20" r="4" fill="currentColor" />
    <text x="44" y="27" fontFamily="'Hanken Grotesk', sans-serif" fontWeight="800" fontSize="20" letterSpacing="0.5">BSE</text>
  </svg>
);

// NSDL Logo
export const NsdlLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 40" width="105" height="28" fill="currentColor" {...props}>
    <circle cx="18" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <line x1="8" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="1" />
    <line x1="18" y1="10" x2="18" y2="30" stroke="currentColor" stroke-width="1" />
    <ellipse cx="18" cy="20" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1" />
    <text x="36" y="27" fontFamily="'Hanken Grotesk', sans-serif" fontWeight="800" fontSize="18" letterSpacing="0.5">NSDL</text>
  </svg>
);

// CDSL Logo
export const CdslLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 40" width="105" height="28" fill="currentColor" {...props}>
    <path d="M 10,14 L 18,10 L 26,14 L 26,22 C 26,27 18,31 18,31 C 18,31 10,27 10,22 Z" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="18" r="4" fill="currentColor" />
    <text x="36" y="27" fontFamily="'Hanken Grotesk', sans-serif" fontWeight="800" fontSize="18" letterSpacing="0.5">CDSL</text>
  </svg>
);

// AMFI Logo
export const AmfiLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 40" width="105" height="28" fill="currentColor" {...props}>
    <path d="M 8,24 C 8,14 18,8 28,14 C 20,18 14,24 12,32 Z" fill="var(--color-primary)" />
    <path d="M 28,14 C 32,18 30,28 22,32 C 28,26 30,20 28,14 Z" fill="currentColor" opacity="0.7" />
    <text x="36" y="27" fontFamily="'Hanken Grotesk', sans-serif" fontWeight="800" fontSize="18" letterSpacing="0.5">AMFI</text>
  </svg>
);

// NPCI Logo
export const NpciLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 40" width="105" height="28" fill="currentColor" {...props}>
    <path d="M 8,24 L 18,12 L 32,12 L 20,28 Z" fill="var(--color-primary)" />
    <path d="M 22,24 L 28,16 L 32,24 Z" fill="currentColor" opacity="0.6" />
    <text x="36" y="27" fontFamily="'Hanken Grotesk', sans-serif" fontWeight="800" fontSize="18" letterSpacing="0.5">NPCI</text>
  </svg>
);
