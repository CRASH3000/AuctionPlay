import React from "react";
import "./SellerRequiredModal.css";

export default function SellerRequiredModal({ onClose, onProfile }) {
    return (
        <div className="modal-overlay-seller" onClick={onClose}>
            <div className="seller-modal" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title-seller">Требуется статус продавца</h2>
                <p className="modal-description-seller">
                    Для публикации постов вам необходимо стать продавцом. Перейдите в
                    настройки профиля и отправьте заявку.
                </p>
                <button
                    className="modal-button-seller"
                    onClick={() => {
                        onClose();
                        onProfile();
                    }}
                >
                    Перейти в профиль
                </button>
            </div>
        </div>
    );
}
