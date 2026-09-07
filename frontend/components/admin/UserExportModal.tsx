"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Check,
  X,
  Eye,
  Sliders,
  Users as UsersIcon
} from "lucide-react";
import type { AdminUser } from "@/lib/admin-api";
import {
  EXPORT_COLUMNS,
  ExportColumnKey,
  ExportFormat,
  exportUsersToCSV,
  exportUsersToExcel,
  exportUsersToPDF,
  formatCellValue
} from "@/lib/user-export";

interface UserExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: AdminUser[];
  selectedUsers: AdminUser[];
  initialFormat?: ExportFormat;
}

export default function UserExportModal({
  isOpen,
  onClose,
  allUsers,
  selectedUsers,
  initialFormat = "csv"
}: UserExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>(initialFormat);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<ExportColumnKey[]>(
    EXPORT_COLUMNS.filter((c) => c.defaultSelected).map((c) => c.key)
  );
  // If some rows were checked in the table, default to "selected", otherwise "all"
  const [rowScope, setRowScope] = useState<"all" | "selected">(
    selectedUsers.length > 0 ? "selected" : "all"
  );
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Sync rowScope when modal opens with selectedUsers
  React.useEffect(() => {
    if (isOpen) {
      if (selectedUsers.length > 0) {
        setRowScope("selected");
      } else {
        setRowScope("all");
      }
      setExportError(null);
      setShowSuccessToast(false);
    }
  }, [isOpen, selectedUsers.length]);

  const targetUsers = useMemo(() => {
    return rowScope === "selected" && selectedUsers.length > 0
      ? selectedUsers
      : allUsers;
  }, [rowScope, selectedUsers, allUsers]);

  const toggleColumn = (key: ExportColumnKey) => {
    setSelectedColumnKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAllColumns = () => {
    setSelectedColumnKeys(EXPORT_COLUMNS.map((c) => c.key));
  };

  const clearAllColumns = () => {
    setSelectedColumnKeys([]);
  };

  const selectPreset = (preset: "emailOnly" | "mobileOnly" | "contactOnly" | "default") => {
    switch (preset) {
      case "emailOnly":
        setSelectedColumnKeys(["email"]);
        break;
      case "mobileOnly":
        setSelectedColumnKeys(["mobile"]);
        break;
      case "contactOnly":
        setSelectedColumnKeys(["name", "email", "mobile"]);
        break;
      case "default":
        setSelectedColumnKeys(
          EXPORT_COLUMNS.filter((c) => c.defaultSelected).map((c) => c.key)
        );
        break;
    }
  };

  const handleExport = async () => {
    if (targetUsers.length === 0) {
      setExportError("No user records available to export.");
      return;
    }
    if (selectedColumnKeys.length === 0) {
      setExportError("Please select at least one column to export.");
      return;
    }

    setExportError(null);
    setIsExporting(true);

    try {
      if (format === "csv") {
        exportUsersToCSV(targetUsers, selectedColumnKeys);
      } else if (format === "excel") {
        exportUsersToExcel(targetUsers, selectedColumnKeys);
      } else if (format === "pdf") {
        exportUsersToPDF(targetUsers, selectedColumnKeys);
      }

      setShowSuccessToast(true);
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsExporting(false);
      setExportError(err?.message || "Export failed. Please try again.");
    }
  };

  if (!isOpen) return null;

  const activeColumns = EXPORT_COLUMNS.filter((c) =>
    selectedColumnKeys.includes(c.key)
  );

  return (
    <div className="admin-modal" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="admin-modal-body export-modal-body"
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <header className="export-modal-header">
          <div className="export-modal-title-group">
            <div className="export-modal-icon-badge">
              <Download size={20} className="text-emerald-700" />
            </div>
            <div>
              <h2 className="export-modal-title">Export User Data</h2>
              <p className="export-modal-sub">
                Export selected records and custom columns to CSV, Excel, or PDF
              </p>
            </div>
          </div>
          <button
            type="button"
            className="admin-icon-btn export-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </header>

        {exportError && <div className="admin-error">{exportError}</div>}

        {showSuccessToast && (
          <div className="export-success-banner">
            <Check size={16} /> File generated successfully! Starting download…
          </div>
        )}

        <div className="export-modal-content">
          {/* Section 1: Choose Format */}
          <div className="export-section">
            <div className="export-section-label">
              <span>1. Select Export Format</span>
            </div>
            <div className="export-format-grid">
              {/* CSV Card */}
              <button
                type="button"
                className={`export-format-card ${format === "csv" ? "active" : ""}`}
                onClick={() => setFormat("csv")}
              >
                <div className="format-badge format-badge-csv">CSV</div>
                <div className="format-icon-wrap">
                  <FileText size={24} />
                </div>
                <div className="format-info">
                  <div className="format-name">CSV Spreadsheet</div>
                  <div className="format-desc">Standard comma-separated file (.csv)</div>
                </div>
                {format === "csv" && (
                  <div className="format-check">
                    <Check size={14} />
                  </div>
                )}
              </button>

              {/* Excel Card */}
              <button
                type="button"
                className={`export-format-card ${format === "excel" ? "active" : ""}`}
                onClick={() => setFormat("excel")}
              >
                <div className="format-badge format-badge-excel">XLSX</div>
                <div className="format-icon-wrap">
                  <FileSpreadsheet size={24} />
                </div>
                <div className="format-info">
                  <div className="format-name">Microsoft Excel</div>
                  <div className="format-desc">Formatted workbook with auto-widths (.xlsx)</div>
                </div>
                {format === "excel" && (
                  <div className="format-check">
                    <Check size={14} />
                  </div>
                )}
              </button>

              {/* PDF Card */}
              <button
                type="button"
                className={`export-format-card ${format === "pdf" ? "active" : ""}`}
                onClick={() => setFormat("pdf")}
              >
                <div className="format-badge format-badge-pdf">PDF</div>
                <div className="format-icon-wrap">
                  <FileText size={24} />
                </div>
                <div className="format-info">
                  <div className="format-name">PDF Document</div>
                  <div className="format-desc">Branded printable Finvoq report (.pdf)</div>
                </div>
                {format === "pdf" && (
                  <div className="format-check">
                    <Check size={14} />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Choose Row Scope */}
          <div className="export-section">
            <div className="export-section-label">
              <span>2. Select Rows to Include</span>
            </div>
            <div className="export-scope-options">
              <label
                className={`export-scope-card ${rowScope === "all" ? "active" : ""}`}
                onClick={() => setRowScope("all")}
              >
                <input
                  type="radio"
                  name="rowScope"
                  checked={rowScope === "all"}
                  onChange={() => setRowScope("all")}
                />
                <div className="scope-text">
                  <strong>All Users</strong>
                  <span>Export all {allUsers.length} accounts in this view</span>
                </div>
                <span className="scope-count-badge">{allUsers.length}</span>
              </label>

              <label
                className={`export-scope-card ${
                  rowScope === "selected" ? "active" : ""
                } ${selectedUsers.length === 0 ? "disabled" : ""}`}
                onClick={() => {
                  if (selectedUsers.length > 0) setRowScope("selected");
                }}
              >
                <input
                  type="radio"
                  name="rowScope"
                  checked={rowScope === "selected"}
                  disabled={selectedUsers.length === 0}
                  onChange={() => {
                    if (selectedUsers.length > 0) setRowScope("selected");
                  }}
                />
                <div className="scope-text">
                  <strong>Selected Rows Only</strong>
                  <span>
                    {selectedUsers.length > 0
                      ? `Export the ${selectedUsers.length} selected row(s)`
                      : "No rows selected in table yet"}
                  </span>
                </div>
                <span className="scope-count-badge">
                  {selectedUsers.length}
                </span>
              </label>
            </div>
          </div>

          {/* Section 3: Choose Columns */}
          <div className="export-section">
            <div className="export-section-label-row">
              <div className="export-section-label">
                <span>3. Select Columns ({selectedColumnKeys.length} of {EXPORT_COLUMNS.length})</span>
              </div>
              <div className="export-quick-presets">
                <button
                  type="button"
                  className="preset-btn"
                  onClick={selectAllColumns}
                >
                  All Columns
                </button>
                <span className="preset-divider">|</span>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => selectPreset("emailOnly")}
                  title="Only export Email addresses"
                >
                  Email Only
                </button>
                <span className="preset-divider">|</span>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => selectPreset("mobileOnly")}
                  title="Only export Mobile numbers"
                >
                  Mobile Only
                </button>
                <span className="preset-divider">|</span>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => selectPreset("contactOnly")}
                  title="Export Name, Email & Mobile"
                >
                  Contact Info
                </button>
                <span className="preset-divider">|</span>
                <button
                  type="button"
                  className="preset-btn text-danger"
                  onClick={clearAllColumns}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="export-column-grid">
              {EXPORT_COLUMNS.map((col) => {
                const isSelected = selectedColumnKeys.includes(col.key);
                return (
                  <button
                    key={col.key}
                    type="button"
                    className={`export-column-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleColumn(col.key)}
                  >
                    <span className="col-checkbox">
                      {isSelected ? <Check size={13} strokeWidth={3} /> : null}
                    </span>
                    <span className="col-name">{col.label}</span>
                  </button>
                );
              })}
            </div>
            {selectedColumnKeys.length === 0 && (
              <div className="export-warning-note">
                ⚠️ Please select at least one column to enable export.
              </div>
            )}
          </div>

          {/* Section 4: Live Data Preview */}
          {activeColumns.length > 0 && targetUsers.length > 0 && (
            <div className="export-section">
              <div className="export-preview-header">
                <div className="export-section-label">
                  <Eye size={15} />
                  <span>Preview Data (first {Math.min(targetUsers.length, 3)} of {targetUsers.length} records)</span>
                </div>
              </div>
              <div className="export-preview-table-wrap">
                <table className="export-preview-table">
                  <thead>
                    <tr>
                      {activeColumns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {targetUsers.slice(0, 3).map((u, idx) => (
                      <tr key={u.id || idx}>
                        {activeColumns.map((col) => (
                          <td key={col.key}>
                            {formatCellValue(u, col.key) || <span className="text-muted">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="admin-modal-foot export-modal-footer">
          <div className="export-summary-text">
            Exporting <strong>{targetUsers.length}</strong> record{targetUsers.length === 1 ? "" : "s"} with{" "}
            <strong>{selectedColumnKeys.length}</strong> column{selectedColumnKeys.length === 1 ? "" : "s"} as{" "}
            <strong className="uppercase">{format}</strong>
          </div>
          <div className="export-modal-action-btns">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary export-execute-btn"
              onClick={handleExport}
              disabled={
                isExporting ||
                targetUsers.length === 0 ||
                selectedColumnKeys.length === 0
              }
            >
              {isExporting ? (
                <>
                  <span className="admin-spinner-sm" /> Generating…
                </>
              ) : (
                <>
                  <Download size={16} /> Export to {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
