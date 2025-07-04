//окошко в шапке для входа в аккаунт и выхода
import React, { useRef, useEffect } from "react";
import "./ProfileOptionsModal.css";
import DefaultAvatar from "../assets/default-avatar.png";
import { API_URL } from '../config.js';



export default function ProfileOptionsModal({
                                                onClose,
                                                currentUser,
                                                onLoginClick,
                                                onLogoutClick,
                                                onProfileNavigate,
                                            }) {
    // отслеживание кликов вне окна
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            // если кликнуть куда-либо вне окошка, оно закроется
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // вычисление url аватарки
    const getAvatarUrl = () => {
        if (!currentUser || !currentUser.avatar) {
            return null;
        }
        if (currentUser.avatar.startsWith("/static/")) {
            return `${API_URL}${currentUser.avatar}`;
        }
        if (currentUser.avatar.startsWith("/avatars/")) {
            return `${API_URL}/static${currentUser.avatar}`;
        }
        return null;
    };

    const avatarUrl = getAvatarUrl();

    return (
        <div className="pom-overlay">
            <div className="pom-modal" ref={modalRef}>
                {currentUser ? (
                    // если человек залогиненный
                    <>
                        <div className="pom-header">
                            <div className="pom-avatar-circle">
                                {avatarUrl ? (
                                    <img
                                        src={`${avatarUrl}?t=${Date.now()}`}
                                        alt="Аватар пользователя"
                                        className="pom-avatar-img"
                                    />
                                ) : (
                                    // заглушка, если аватарки нету (мб потом поменяю)
                                    <img
                                        src={DefaultAvatar}
                                        alt="Заглушка аватара"
                                        className="pom-avatar-img"
                                    />
                                )}
                            </div>
                            <div className="pom-username">{currentUser.username}</div>
                        </div>
                        <div className="pom-actions">
                            <button
                                className="pom-action-btn"
                                onClick={() => {
                                    onProfileNavigate();
                                    onClose();
                                }}
                            >
                                Мой профиль
                            </button>
                            <button
                                className="pom-action-btn"
                                onClick={() => {
                                    onLogoutClick();
                                    onClose();
                                }}
                            >
                                Выйти
                            </button>
                        </div>
                    </>
                ) : (
                    // тут если человек не залогинен
                    <>
                        <div className="pom-header">
                            <div className="pom-avatar-circle">👤</div>
                            <div className="pom-username">Гость</div>
                        </div>
                        <div className="pom-actions">
                            <button
                                className="pom-action-btn"
                                onClick={() => {
                                    onLoginClick();
                                    onClose();
                                }}
                            >
                                Войти
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
