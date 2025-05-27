import React, { useState, useRef } from "react";
import "./PostModal.css";

const PostModal = ({ onClose }) => {
  // Сохраняю ссылку на модальное окно, чтобы отследить клики вне его
  const modalRef = useRef(null);

  // Стейт для хранения выбранного срока аукциона (по умолчанию "24 часа")
  const [selectedDuration, setSelectedDuration] = useState("24 часа");

  // Возможные варианты длительности аукциона
  const durations = ["24 часа", "3 дня", "5 дней"];

  // Закрываю модалку, если пользователь кликнул вне окна
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose(); // вызываю переданную функцию закрытия
    }
  };

  return (
    // Задний фон модалки, ловит клик вне окна
    <div className="modal-overlay" onClick={handleClickOutside}>
      {/* Само модальное окно — через ref отслеживаем "внутрь ли кликнули" */}
      <div className="post-modal" ref={modalRef}>
        {/* Кнопка закрытия модалки (в правом верхнем углу) */}
        <button className="close-button" onClick={onClose}>✕</button>

        <h2 className="modal-title">Опубликовать пост</h2>

        {/* Название лота */}
        <div className="form-group">
          <label>Название</label>
          <input type="text" placeholder="Введите название..." />
        </div>

        {/* Описание лота */}
        <div className="form-group">
          <label>Описание товара</label>
          <textarea placeholder="Введите описание..." />
        </div>

        {/* Начальная ставка */}
        <div className="form-group">
          <label>Начальная ставка</label>
          <input type="number" placeholder="0" />
        </div>

        {/* Переключение срока действия аукциона */}
        <div className="form-group">
          <label>Срок действия аукциона</label>
          <div className="auction-buttons">
            {durations.map((duration) => (
              <button
                key={duration}
                className={selectedDuration === duration ? "selected" : ""}
                onClick={() => setSelectedDuration(duration)} // обновляю выбранный срок
              >
                {duration}
              </button>
            ))}
          </div>
        </div>

        {/* Кнопка загрузки фото + скрытый input */}
        <div className="upload">
          <input
            type="file"
            accept="image/*"
            id="file-upload"
            className="file-input"
            onChange={(e) => console.log("Файл выбран:", e.target.files[0])} // пока просто логирую выбранный файл
          />
          <label htmlFor="file-upload" className="upload-btn">⬆</label>
          <span>Загрузите фото</span>
        </div>

        <button className="submit-btn">Опубликовать</button>
      </div>
    </div>
  );
};

export default PostModal;
