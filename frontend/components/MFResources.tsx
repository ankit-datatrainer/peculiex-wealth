"use client";
import { useState } from "react";
import PastSipPerformance from "./mf-tools/PastSipPerformance";
import CurrentNfos from "./mf-tools/CurrentNfos";
import LatestNav from "./mf-tools/LatestNav";
import FundFactsheets from "./mf-tools/FundFactsheets";
import MfPerformanceTool from "./mf-tools/MfPerformanceTool";
import SchemeComparison from "./mf-tools/SchemeComparison";
import RecentDividends from "./mf-tools/RecentDividends";
import SwpCalculator from "./mf-tools/SwpCalculator";

const MENU_ITEMS = [
  { id: "past-sip", label: "Past SIP Performance" },
  { id: "current-nfo", label: "Current NFOs" },
  { id: "latest-nav", label: "Latest NAV" },
  { id: "fund-factsheets", label: "Fund Factsheets" },
  { id: "mf-performance", label: "MF Performance" },
  { id: "scheme-comparison", label: "Scheme Comparison" },
  { id: "recent-dividends", label: "Recent Announced Dividends" },
  { id: "swp-calculator", label: "SWP Calculator" },
];

export default function MFResources() {
  const [activeTab, setActiveTab] = useState("past-sip");

  const renderContent = () => {
    switch (activeTab) {
      case "past-sip":
        return <PastSipPerformance />;
      case "current-nfo":
        return <CurrentNfos />;
      case "latest-nav":
        return <LatestNav />;
      case "fund-factsheets":
        return <FundFactsheets />;
      case "mf-performance":
        return <MfPerformanceTool />;
      case "scheme-comparison":
        return <SchemeComparison />;
      case "recent-dividends":
        return <RecentDividends />;
      case "swp-calculator":
        return <SwpCalculator />;
      default:
        return null;
    }
  };

  return (
    <section className="mf-resources-sec">
      <div className="container mf-layout">
        
        {/* Sidebar */}
        <aside className="mf-sidebar">
          <h3 className="mf-sidebar-title">MF Resources</h3>
          <nav className="mf-sidebar-nav">
            {MENU_ITEMS.map(item => (
              <button
                key={item.id}
                className={`mf-nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="mf-content">
          {renderContent()}
        </div>
        
      </div>
    </section>
  );
}
