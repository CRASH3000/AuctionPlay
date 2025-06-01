import React, { useState } from "react";
import {useLocation, useNavigate} from "react-router-dom";
import Logo from "../assets/Logo.png";
import "./Header.css";

const API_URL = "http://localhost:8000";

const Header = ({ onProfileClick, currentUser }) => {
    // Локальный стейт для выбора вкладки активные/архивные лоты
  const [activeTab, setActiveTab] = useState("active");
  // хук для перехода по маршрутам
  const navigate = useNavigate();
    // хук для определения текущего пути
  const { pathname } = useLocation();
  const isProfile = pathname === "/profile";

    // составление полного urlа аватарки (мб поменяю позже)
    const getAvatarUrl = () => {
        if (!currentUser || !currentUser.avatar) {
            return null;
        }
        return `${API_URL}${currentUser.avatar}`;
    };
  const avatarUrl = getAvatarUrl();

  return (
      <header className="header">
          {/* наше лого, по клику перекидывает на главную страницу */}
          <img
              src={Logo}
              alt="AuctionPlay"
              className="header-logo-img"
              onClick={() => navigate("/home")}
          />

          {isProfile ? (
              // если в лк, то показываем это
                  <h1 className="header-page-title">Мой профиль</h1>
              ) : (
              // иначе две кнопки-фильтра
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
              </div>)}
          {/* блок с аватаркой или иконкой*/}
          <div className="header-profile" onClick={onProfileClick}>
              {currentUser ? (
                  avatarUrl ? (
                      <img
                          className="header-avatar-img"
                          src={`${avatarUrl}?t=${Date.now()}`}
                          alt="Аватар пользователя"
                      />
                  ) : (
                      // если есть юзер, но аватарка не задана, показываем дефолтную заглушку
                      <img
                          className="header-avatar-img"
                          src={`${API_URL}/static/avatars/default.png`}
                          alt="Заглушка аватара"
                      />
                  )
              ) : (
                  // если юзер наш не зашел, то показываем это!!!!!!!!!!!!!!
                  <span className="header-avatar-letter">👤</span>
              )}
          </div>
      </header>
  );
};

export default Header;
