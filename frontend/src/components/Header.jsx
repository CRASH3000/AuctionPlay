import {useLocation, useNavigate} from "react-router-dom";
import Logo from "../assets/Logo.png";
import DefaultAvatar from "../assets/default-avatar.png";
import "./Header.css";

const API_URL = "http://localhost:8000";

const Header = ({ onProfileClick, currentUser }) => {
  // хук для перехода по маршрутам
  const navigate = useNavigate();
    // хук для определения текущего пути
  const { pathname, search  } = useLocation();
  const isProfile = pathname === "/profile";
  const params = new URLSearchParams(search);
  const isArchive = params.get("archive") === "1";

    // составление полного urlа аватарки (мб поменяю позже)
    const getAvatarUrl = () => {
        if (!currentUser || !currentUser.avatar) {
            return null;
        }
        if (
            currentUser.avatar.endsWith("default.png") ||
            currentUser.avatar.includes("/avatars/default.png") ||
            currentUser.avatar.includes("static/avatars/default.png")
        ) {
            return null;
        }
        if (currentUser.avatar.startsWith("/static/")) {
            return `${API_URL}${currentUser.avatar}`;
        }
        if (currentUser.avatar.startsWith("/avatars/")) {
            return `${API_URL}/static${currentUser.avatar}`;
        }
        return `${API_URL}/${currentUser.avatar.replace(/^\/?/, "")}`;
    };
  const avatarUrl = getAvatarUrl();

  return (
      <header className="header">
          {/* наше лого, по клику перекидывает на главную страницу */}
          <img
              src={Logo}
              alt="AuctionPlay"
              className="header-logo-img"
              data-testid="header-logo"
              onClick={() => navigate("/home?archive=0")}
          />

          {isProfile ? (
              // если в лк, то показываем это
              <div className="page-title-container">
                  <div className="page-title-box">
                      <h1 className="page-title">Мой профиль</h1>
                  </div>
              </div>
          ) : (
              // иначе две кнопки-фильтра
              <div className="header-filters">
                  <button
                      className={`header-filter ${!isArchive ? "selected" : ""}`}
                      onClick={() => navigate("/home?archive=0")}
                  >
                      Актуальные лоты
                  </button>
                  <button
                      className={`header-filter ${ isArchive ? "selected" : ""}`}
                      onClick={() => navigate("/home?archive=1")}
                  >
                      Архив
                  </button>
              </div>)}
          {/* блок с аватаркой или иконкой*/}
          <div className="header-profile" onClick={onProfileClick} data-testid="profile-button">
              {currentUser ? (
                  avatarUrl ? (
                      <img
                          className="header-avatar-img"
                          src={`${avatarUrl}?t=${Date.now()}`}
                          alt="Аватар пользователя"
                          data-testid="user-avatar"
                      />
                  ) : (
                      // если есть юзер, но аватарка не задана, показываем дефолтную заглушку
                      <img
                          className="header-avatar-img"
                          src={DefaultAvatar}
                          alt="Заглушка аватара"
                          data-testid="default-avatar"
                      />
                  )
              ) : (
                  // если юзер наш не зашел, то показываем это!!!!!!!!!!!!!!
                  <span className="header-avatar-letter" data-testid="guest-icon">👤</span>
              )}
          </div>
      </header>
  );
};

export default Header;
