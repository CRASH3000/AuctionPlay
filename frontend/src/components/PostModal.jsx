import React, {useState, useRef, useEffect} from "react";
import "./PostModal.css";

const DURATION_MAP = {
  "24 часа": "24h",
  "3 дня": "3d",
  "5 дней": "5d",
};

export default function PostModal({ onClose, onPostCreated }) {
  const modalRef = useRef(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [price, setPrice] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("24 часа");
  const [coverFile, setCoverFile] = useState(null);
  const durations = Object.keys(DURATION_MAP);

  useEffect(() => {
    const handleOutside = e => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  const handleSubmit = async () => {
    // простые валидации
    if (!title || !text || !price || !coverFile) {
      alert("Заполните все поля и загрузите фото");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("text", text);
    formData.append("price", price);
    // бэкенд ждет поле cover как файл
    formData.append("cover", coverFile);
    formData.append("duration", DURATION_MAP[selectedDuration]);

    try {
      const res = await fetch("http://localhost:8000/posts", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        new Error(err.detail || res.statusText);
      }
      const { post_id } = await res.json();
      onPostCreated && onPostCreated(post_id);
      onClose();
    } catch (err) {
      console.error("Не удалось создать пост:", err);
      alert("Ошибка при публикации: " + err.message);
    }
  };

  return (
      <div className="modal-overlay">
        <div className="post-modal" ref={modalRef}>
          <button className="close-button" onClick={onClose}>✕</button>
          <h2 className="modal-title">Опубликовать пост</h2>

          <div className="form-group">
            <label>Название</label>
            <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Введите название..."
            />
          </div>

          <div className="form-group">
            <label>Описание товара</label>
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Введите описание..."
            />
          </div>

          <div className="form-group">
            <label>Начальная ставка</label>
            <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Срок действия аукциона</label>
            <div className="auction-buttons">
              {durations.map(d => (
                  <button
                      key={d}
                      className={selectedDuration === d ? "selected" : ""}
                      onClick={() => setSelectedDuration(d)}
                  >
                    {d}
                  </button>
              ))}
            </div>
          </div>

          <div className="upload">
            <input
                type="file"
                accept="image/*"
                id="file-upload"
                className="file-input"
                onChange={e => setCoverFile(e.target.files[0])}
            />
            <label htmlFor="file-upload" className="upload-btn">⬆</label>
            <span>{coverFile?.name ?? "Загрузите фото"}</span>
          </div>

          <button className="submit-btn" onClick={handleSubmit}>
            Опубликовать
          </button>
        </div>
      </div>
  );
}
