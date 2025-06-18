import React from "react";
import "./AuthRequiredModal.css";

export default function AuthRequiredModal({ onClose, onLogin }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">Требуется авторизация</h2>
                <p className="modal-description">
                    Чтобы публиковать посты, пожалуйста, войдите в свой аккаунт.
                </p>
                <button
                    className="modal-button"
                    onClick={() => {
                        onClose();
                        onLogin();
                    }}
                >
                    Войти
                </button>
            </div>
        </div>
    );
}