import { mkdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
// Serve the installed PDF.js worker unchanged, with its license notice intact.
// Next 14's asset minifier cannot process this ES module worker as a JS asset.
const destination = new URL("../public/pdfjs/", import.meta.url);
mkdirSync(destination, { recursive: true });
copyFileSync(
  fileURLToPath(
    new URL(
      "../node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ),
  ),
  fileURLToPath(new URL("pdf.worker.min.mjs", destination)),
);
