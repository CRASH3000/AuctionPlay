// src/components/TermsModal.jsx
import React, { useRef, useEffect, useState } from "react";  // добавили useState
import "./TermsModal.css";

const TermsModal = ({ onClose, onBack, onAgree }) => {
  const modalRef = useRef();
  const [isChecked, setIsChecked] = useState(false);  // стейт для чек-бокса

  // Закрываем по клику вне окна
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="terms-overlay">
      <div className="terms-modal" ref={modalRef}>
        {/* Верхняя панель: кнопка «Назад» и крестик «Закрыть» */}
        <div className="terms-header">
          <button className="terms-back" onClick={onBack}>←</button>
          <button className="terms-close" onClick={onClose}>✕</button>
        </div>

        <h2 className="terms-title">Правила сервиса</h2>

        <div className="terms-body">
          {/* Здесь можно вставить длинный текст, можно с <p> или <ul> */}
          <p>1. Использование AuctionPlay…</p>
          <p>2. Правила создания лота…</p>
          <p>3. Запрещённый контент…</p>
          {/* … */}
        </div>

        <div className="terms-footer">
          <label>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}  // управляем стейтом
            />
            Я принимаю правила сервиса
          </label>
          <button
            className="terms-continue"
            onClick={() => onAgree(true)}
            disabled={!isChecked}                    // дизейблим, если unchecked
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
