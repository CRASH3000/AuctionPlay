import React, {useRef, useState} from "react";
import UploadIcon from "../assets/upload-avatar-icon.png";
import "./UploadAvatarModal.css";
import DefaultAvatar from "../assets/default-avatar.png";

const API_URL = "http://localhost:8000";

export default function UploadAvatarModal({ userId, onSkip, onUploaded, currentAvatar}) {
    const modalRef = useRef(null);
    // Если аватар уже задан (например, при редизайне), показываем превью
    const initialPreview = currentAvatar
        ? `${API_URL}${currentAvatar}?t=${Date.now()}`
        : null;
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(initialPreview);
    const [uploadError, setUploadError] = useState("");
    const [isUploading, setIsUploading] = useState(false);


    const handleFileChange = (e) => {
        setUploadError("");
        const file = e.target.files[0];
        if (!file) {
            setSelectedFile(null);
            setPreviewUrl(initialPreview);
            return;
        }
        // Проверка на изображение
        if (!file.type.startsWith("image/")) {
            setUploadError("Нужно выбрать файл изображения");
            return;
        }
        // Проверяем размер
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("Файл слишком большой (макс. 5 МБ)");
            return;
        }
        setSelectedFile(file);

        // Генерим превью в base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };
    const handleUpload = async () => {
        setUploadError("");
        if (!selectedFile) {
            setUploadError("Сначала выберите файл");
            return;
        }
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("user", userId);
            formData.append("image", selectedFile);

            const res = await fetch(`${API_URL}/set_avatar`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!res.ok) {
                if (res.status === 422) {
                    setUploadError("Ошибка загрузки (код 422)");
                }
                else if (res.status === 403) {
                    setUploadError("Нельзя обновить аватар другого пользователя");
                }
                else {
                    setUploadError(`Ошибка загрузки (код ${res.status})`);
                }
                setIsUploading(false);
                return;
            }

            const data = await res.json();
            if (data.avatar_url) {
                onUploaded(data.avatar_url);
            } else {
                setUploadError("Сервер вернул ошибку");
            }
            setIsUploading(false);
        } catch (err) {
            console.error("Ошибка при загрузке аватара:", err);
            setUploadError("Сетевая ошибка при загрузке");
            setIsUploading(false);
        }
    };

    return (
        <div className="uav-overlay">
            <div className="uav-modal" ref={modalRef}>
                <h2 className="uav-title">Последний штрих: загрузите фото</h2>
                <div className="uav-body">
                    <div className="uav-avatar-preview">
                        <img
                            src={previewUrl || DefaultAvatar}
                            alt="Заглушка или превью"
                            className="uav-avatar-img"
                        />
                        <label htmlFor="avatar-upload-input" className="uav-upload-label">
                            <img src={UploadIcon} alt="Загрузить фото" className="uav-upload-icon"/>
                        </label>
                        <input
                            id="avatar-upload-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{display: "none"}}
                        />
                    </div>
                </div>

                {uploadError && <p className="uav-error-text">{uploadError}</p>}

                <div className="uav-footer">
                    <button className="uav-skip-btn" onClick={onSkip} disabled={isUploading}>
                        Пропустить
                    </button>
                    <button
                        className="uav-upload-btn"
                        onClick={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? "Загрузка..." : "Готово"}
                    </button>
                </div>
            </div>
        </div>
    );
}
