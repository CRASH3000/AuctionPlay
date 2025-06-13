// Модалка заявки на продавца
import React, { useState } from "react";
import "./SellerRequestModal.css";

export default function SellerRequestModal({ onClose, onSubmit }) {
    const [link, setLink] = useState("");

    return (
        <div className="overlay">
            <div className="modal sr-modal">
                <h3>Стать продавцом</h3>
                <p>Продавцы могут выставлять свои товары на торги</p>
                <div className="sr-input-wrapper">
                    <input
                        className="sr-input"
                        placeholder="Ссылка"
                        value={link}
                        onChange={e => setLink(e.target.value)}
                    />
                </div>
                <button className="sr-submit" onClick={() => onSubmit(link)}>
                Отправить заявку
                </button>
                <button className="sr-cancel" onClick={onClose}>Отмена</button>
            </div>
        </div>
    );
}