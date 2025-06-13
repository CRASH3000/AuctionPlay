import React from "react";
import "./PendingModal.css";

export default function PendingModal({ onClose }) {
    return (
        <div className="overlay">
            <div className="modal pm-modal">
                <p>Ваша заявка на рассмотрении</p>
                <p>Результат будет отправлен на электронную почту</p>
                <button className="pm-close" onClick={onClose}>
                    Закрыть
                </button>
            </div>
        </div>
    );
}
