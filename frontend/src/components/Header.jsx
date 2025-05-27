import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ onProfileClick }) => {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <header className="header">
      <div className="header-logo" onClick={() => window.location.href = "/home"}>
        <span className="header-logo-main">Auction</span>
        <span className="header-logo-accent">Play</span>
      </div>

      <div className="header-filters">
        <button
          className={`header-filter ${activeTab === "active" ? "selected" : "unselected"} left`}
          onClick={() => setActiveTab("active")}
        >
          Актуальные лоты
        </button>
        <button
          className={`header-filter ${activeTab === "archive" ? "selected" : "unselected"} right`}
          onClick={() => setActiveTab("archive")}
        >
          Архив
        </button>
      </div>

      <div className="header-profile" onClick={onProfileClick}>
        <span>👤</span>
      </div>
    </header>
  );
};

export default Header;
