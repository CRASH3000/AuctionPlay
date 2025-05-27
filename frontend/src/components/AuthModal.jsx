import React, { useRef, useState, useEffect } from "react";
import TermsModal from "./TermsModal";
import "./AuthModal.css";

const AuthModal = ({ onClose }) => {
  const modalRef = useRef(null);
  const [view, setView] = useState("auth"); // "auth" | "terms" | "register"

  // Закрываем по клику вне своего модала (auth/register)
  useEffect(() => {
    const handleClickOutside = (e) => {
      // применяем только если мы НЕ в режиме "terms"
      if (view !== "terms" &&
          modalRef.current &&
          !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, view]);

  // 1) Если "terms" — возвращаем его оверлей и окно целиком
  if (view === "terms") {
    return (
      <TermsModal
        onBack={() => setView("auth")}
        onClose={onClose}
        onAgree={() => setView("register")}
      />
    );
  }

  // 2) Иначе рендерим свой оверлей + модалку для auth и register
  return (
    <div className="modal-overlay">
      <div className="auth-modal" ref={modalRef}>
        <button className="close-button" onClick={onClose}>✕</button>

        {view === "auth" && (
          <>
            <h2 className="modal-title">Добро пожаловать!</h2>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="example@gmail.com" />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input type="password" placeholder="Введите пароль" />
            </div>
            <div className="auth-buttons">
              <button
                className="submit-btn"
                onClick={() => {
                  onClose();
                }}
              >
                Войти
              </button>
              <button
                className="submit-btn"
                onClick={() => setView("terms")}
              >
                Регистрация
              </button>
            </div>
          </>
        )}

        {view === "register" && (
          <>
            {/* Панель «← Назад» + заголовок */}
            <div className="terms-header" style={{ width: "100%", marginBottom: "10px" }}>
              <button
                className="terms-back"
                onClick={() => setView("auth")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#000"
                }}
              >
                ←
              </button>
              <h2 className="modal-title" style={{ flex: 1, textAlign: "center" }}>
                Регистрация
              </h2>
              <div style={{ width: "24px" }} />
            </div>

            {/* Новые поля */}
            <div className="form-group">
              <label>Имя пользователя</label>
              <input type="text" placeholder="Введите логин" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="example@gmail.com" />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input type="password" placeholder="Минимум 8 символов" />
            </div>
            <div className="form-group">
              <label>Подтвердите пароль</label>
              <input type="password" placeholder="Повторите пароль" />
            </div>
            <div className="form-group">
              <label>Telegram-логин</label>
              <input type="text" placeholder="@username" />
            </div>

            <div className="auth-buttons">
              <button
                  className="submit-btn create-profile-btn"
                  onClick={() => {
                    onClose();
                  }}
              >
                Создать профиль
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
