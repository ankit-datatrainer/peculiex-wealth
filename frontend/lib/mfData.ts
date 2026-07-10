// Real AMFI-registered AMC list, scraped from the InvestWell widget used by
// visionarytrailblazers.in (the same distributor-platform data every AMFI
// distributor's MF tools are built on). 70 AMCs, exact names as filed with AMFI.
export const AMC_LIST: { code: string; name: string }[] = [
  { code: "F0084", name: "360 ONE Mutual Fund" },
  { code: "F1029", name: "Abakkus Mutual Fund" },
  { code: "F0003", name: "Aditya Birla Sun Life Mutual Fund" },
  { code: "F1043", name: "AlphaGrep Mutual Fund" },
  { code: "F1018", name: "Angel One Mutual Fund" },
  { code: "F1033", name: "APEX SIF Mutual Fund" },
  { code: "F1036", name: "Arthaya SIF Mutual Fund" },
  { code: "F1030", name: "Arudha SIF Mutual Fund" },
  { code: "F0075", name: "Axis Mutual Fund" },
  { code: "F1014", name: "Bajaj Finserv Mutual Fund" },
  { code: "F0013", name: "Bandhan Mutual Fund" },
  { code: "F0066", name: "Bank Of India Mutual Fund" },
  { code: "F0004", name: "Baroda BNP Paribas Mutual Fund" },
  { code: "F0005", name: "Canara Robeco Mutual Fund" },
  { code: "F1021", name: "Capitalmind Mutual Fund" },
  { code: "F1026", name: "Choice Mutual Fund" },
  { code: "F1027", name: "DIVINITI SIF Mutual Fund" },
  { code: "F0007", name: "DSP Mutual Fund" },
  { code: "F1032", name: "Dyna SIF Mutual Fund" },
  { code: "F1008", name: "Edelweiss Alpha Fund" },
  { code: "F0068", name: "Edelweiss Mutual Fund" },
  { code: "F1024", name: "Edelweiss SIF Mutual Fund" },
  { code: "F1040", name: "Foreign Securities" },
  { code: "F0032", name: "Franklin Templeton Mutual Fund" },
  { code: "F0085", name: "Groww Mutual Fund" },
  { code: "F0014", name: "HDFC Mutual Fund" },
  { code: "F1015", name: "Helios Mutual Fund" },
  { code: "F0037", name: "HSBC Mutual Fund" },
  { code: "F0025", name: "ICICI Prudential Mutual Fund" },
  { code: "F1031", name: "ICICI Prudential SIF Mutual Fund" },
  { code: "F1039", name: "Infinity SIF Mutual Fund" },
  { code: "F0060", name: "Invesco Mutual Fund" },
  { code: "F1010", name: "ITI Mutual Fund" },
  { code: "F1020", name: "Jio BlackRock Mutual Fund" },
  { code: "F0019", name: "JM Financial Mutual Fund" },
  { code: "F0020", name: "Kotak Mutual Fund" },
  { code: "F0022", name: "LIC Mutual Fund" },
  { code: "F1006", name: "Mahindra Manulife Mutual Fund" },
  { code: "F0065", name: "Mirae Asset Mutual Fund" },
  { code: "F0079", name: "Motilal Oswal Mutual Fund" },
  { code: "F0077", name: "NAVI Mutual Fund" },
  { code: "F0026", name: "Nippon India Mutual Fund" },
  { code: "F1012", name: "NJ Mutual Fund" },
  { code: "F1017", name: "Old Bridge Mutual Fund" },
  { code: "F0080", name: "PGIM India Mutual Fund" },
  { code: "F1037", name: "Platinum SIF Mutual Fund" },
  { code: "F1003", name: "PPFAS Mutual Fund" },
  { code: "F1041", name: "Prism SIF Mutual Fund" },
  { code: "F0009", name: "Quant Mutual Fund" },
  { code: "F1022", name: "Quant SIF Mutual Fund" },
  { code: "F0044", name: "Quantum Mutual Fund" },
  { code: "F1038", name: "RedHex SIF Mutual Fund" },
  { code: "F1013", name: "Samco Mutual Fund" },
  { code: "F1034", name: "Sapphire SIF Mutual Fund" },
  { code: "F0027", name: "SBI Mutual Fund" },
  { code: "F1025", name: "SBI SIF Mutual Fund" },
  { code: "F1005", name: "Shriram Mutual Fund" },
  { code: "F1042", name: "Summit SIF Mutual Fund" },
  { code: "F0029", name: "Sundaram Mutual Fund" },
  { code: "F0030", name: "Tata Mutual Fund" },
  { code: "F0031", name: "Taurus Mutual Fund" },
  { code: "F1023", name: "The Wealth Company Mutual Fund" },
  { code: "F1028", name: "TITANIUM SIF Mutual Fund" },
  { code: "F1011", name: "TRUST Mutual Fund" },
  { code: "F1019", name: "Unifi Mutual Fund" },
  { code: "F0082", name: "Union Mutual Fund" },
  { code: "F0034", name: "UTI Mutual Fund" },
  { code: "F1009", name: "WhiteOak Capital Mutual Fund" },
  { code: "F1035", name: "WSIF Mutual Fund" },
  { code: "F1016", name: "Zerodha Mutual Fund" }
];

// Scheme categories, exact values used by the reference site's factsheet filter.
export const SCHEME_CATEGORIES = ["Equity", "Debt", "Fmp", "Hybrid", "Other"] as const;

// SIP dates 1–31, matching the reference site's SIP date dropdown.
export const SIP_DATES = Array.from({ length: 31 }, (_, i) => i + 1);

// The mfapi.in / AMFI scheme-name text search works best on the AMC's short
// brand name rather than the full legal "... Mutual Fund" suffix.
export const amcSearchTerm = (amcName: string) =>
  amcName.replace(/\s*Mutual Fund$/i, "").trim();
