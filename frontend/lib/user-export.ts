import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AdminUser } from "./admin-api";

export type ExportColumnKey =
  | "name"
  | "email"
  | "mobile"
  | "role"
  | "created_at"
  | "id"
  | "email_verified";

export type ExportFormat = "csv" | "excel" | "pdf";

export interface ExportColumnDef {
  key: ExportColumnKey;
  label: string;
  defaultSelected: boolean;
  description?: string;
}

export const EXPORT_COLUMNS: ExportColumnDef[] = [
  { key: "name", label: "Name", defaultSelected: true, description: "Full user name" },
  { key: "email", label: "Email", defaultSelected: true, description: "Email address" },
  { key: "mobile", label: "Mobile", defaultSelected: true, description: "Phone number with country code" },
  { key: "role", label: "Role", defaultSelected: true, description: "Assigned user permission role" },
  { key: "created_at", label: "Joined Date", defaultSelected: true, description: "Account creation date" },
  { key: "id", label: "User ID", defaultSelected: false, description: "Unique database identifier" },
  { key: "email_verified", label: "Verified", defaultSelected: false, description: "Email confirmation status" }
];

const ROLE_LABEL: Record<string, string> = {
  user: "User",
  manager: "Manager",
  admin: "Admin",
  superadmin: "Super-admin"
};

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export function formatCellValue(user: AdminUser, key: ExportColumnKey): string {
  switch (key) {
    case "name":
      return user.name || "";
    case "email":
      return user.email || "";
    case "mobile":
      return user.mobile || "";
    case "role":
      return ROLE_LABEL[user.role] || user.role || "";
    case "created_at":
      return formatDisplayDate(user.created_at);
    case "id":
      return user.id || "";
    case "email_verified":
      return (user as any).email_verified ? "Yes" : "No";
    default:
      return "";
  }
}

function getTimestampSuffix(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  return `${yyyy}${mm}${dd}-${hh}${min}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export selected users & selected columns to CSV
 */
export function exportUsersToCSV(
  users: AdminUser[],
  columnKeys: ExportColumnKey[],
  baseFilename = "finvoq-users"
) {
  const activeCols = EXPORT_COLUMNS.filter((c) => columnKeys.includes(c.key));
  if (activeCols.length === 0) {
    throw new Error("Please select at least one column to export.");
  }

  const escapeCSV = (val: string): string => {
    if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const headers = activeCols.map((c) => escapeCSV(c.label)).join(",");
  const rows = users.map((u) =>
    activeCols.map((col) => escapeCSV(formatCellValue(u, col.key))).join(",")
  );

  // Prepend UTF-8 BOM so Excel opens Hindi, special characters, and numbers without encoding bugs
  const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${baseFilename}-${getTimestampSuffix()}.csv`);
}

/**
 * Export selected users & selected columns to Excel (.xlsx)
 */
export function exportUsersToExcel(
  users: AdminUser[],
  columnKeys: ExportColumnKey[],
  baseFilename = "finvoq-users"
) {
  const activeCols = EXPORT_COLUMNS.filter((c) => columnKeys.includes(c.key));
  if (activeCols.length === 0) {
    throw new Error("Please select at least one column to export.");
  }

  // Build row objects with clean column labels as keys
  const data = users.map((u) => {
    const row: Record<string, string> = {};
    for (const col of activeCols) {
      row[col.label] = formatCellValue(u, col.key);
    }
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths based on maximum content length
  const colWidths = activeCols.map((col) => {
    let maxLen = col.label.length;
    for (const u of users) {
      const val = formatCellValue(u, col.key);
      if (val.length > maxLen) maxLen = val.length;
    }
    return { wch: Math.min(Math.max(maxLen + 4, 12), 45) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  triggerDownload(blob, `${baseFilename}-${getTimestampSuffix()}.xlsx`);
}

/**
 * Export selected users & selected columns to PDF with Finvoq branding
 */
export function exportUsersToPDF(
  users: AdminUser[],
  columnKeys: ExportColumnKey[],
  baseFilename = "finvoq-users"
) {
  const activeCols = EXPORT_COLUMNS.filter((c) => columnKeys.includes(c.key));
  if (activeCols.length === 0) {
    throw new Error("Please select at least one column to export.");
  }

  // Use landscape if more than 4 columns to give ample room
  const orientation = activeCols.length > 4 ? "landscape" : "portrait";
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Finvoq Branding
  // Emerald primary accent bar
  doc.setFillColor(19, 115, 93); // #13735d
  doc.rect(0, 0, pageWidth, 5, "F");

  // Title & Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 25, 22);
  doc.text("FINVOQ", 14, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(19, 115, 93);
  doc.text("SUPER ADMIN PORTAL", 50, 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(40, 44, 42);
  doc.text("User Directory Report", 14, 25);

  const exportDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 105, 102);
  doc.text(`Generated: ${exportDate} · Total Records: ${users.length}`, 14, 30);

  // Table columns & rows
  const head = [activeCols.map((c) => c.label)];
  const body = users.map((u) =>
    activeCols.map((col) => formatCellValue(u, col.key))
  );

  // Execute AutoTable
  autoTable(doc, {
    head,
    body,
    startY: 35,
    margin: { left: 14, right: 14, bottom: 18 },
    theme: "grid",
    headStyles: {
      fillColor: [19, 115, 93], // #13735d Finvoq dark emerald
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
      halign: "left",
      cellPadding: 3.5
    },
    styles: {
      font: "helvetica",
      fontSize: 8,
      textColor: [40, 44, 42],
      cellPadding: 3,
      lineColor: [230, 230, 226],
      lineWidth: 0.2,
      overflow: "linebreak"
    },
    alternateRowStyles: {
      fillColor: [250, 250, 247] // #fafaf7
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageNumber = (doc.internal as any).getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(140, 145, 142);

      // Left footer
      doc.text(
        "Finvoq Wealth Management · Confidential — Super Admin Only",
        14,
        pageHeight - 8
      );

      // Right footer: Page X of Y
      const pageStr = `Page ${data.pageNumber} of ${pageNumber}`;
      const textWidth = doc.getTextWidth(pageStr);
      doc.text(pageStr, pageWidth - 14 - textWidth, pageHeight - 8);
    }
  });

  doc.save(`${baseFilename}-${getTimestampSuffix()}.pdf`);
}
