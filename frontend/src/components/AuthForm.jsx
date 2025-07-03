import React, {useEffect, useRef, useState} from "react";
import TermsModal from "./TermsModal";
import UploadAvatarModal from "./UploadAvatarModal";
import "./AuthForm.css";

import { 
  IonInput,
  IonButton,
  IonSpinner
} from '@ionic/react';

import { API_URL } from '../config.js';

export default function AuthForm({ onClose, onAuthSuccess,
                                      initialView = "auth", onSwitchView, isPage = true}) {
    const modalRef = useRef(null);
    const [view, setView] = useState(initialView);
    const [loading, setLoading] = useState(false);

    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [telegram, setTelegram] = useState("");
    const [registeredUser, setRegisteredUser] = useState(null);
    const [regError, setRegError] = useState("");

    useEffect(() => {
        if (isPage) return
        const handleClickOutside = (e) => {
            if (
                (view === "auth" || view === "register") &&
                modalRef.current &&
                !modalRef.current.contains(e.target)
            ) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose, view]);

    // логин
    const handleLogin = async () => {
        setLoginError("");
        setLoading(true);
        if (!loginUsername || !loginPassword) {
            setLoginError("Введите логин и пароль");
            setLoading(false);
            return;
        }

        const formData = new URLSearchParams();
        formData.append("username", loginUsername);
        formData.append("password", loginPassword);

        try {
            const res = await fetch(`${API_URL}/auth`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData.toString(),
                credentials: "include",
            });

            if (!res.ok) {
                if (res.status === 401) {
                    setLoginError("Неверный логин или пароль");
                } else if (res.status === 422) {
                    setLoginError("Неверные данные при входе");
                } else {
                    let errJson;
                    try {
                        errJson = await res.json();
                    } catch {
                        errJson = null;
                    }
                    if (errJson && errJson.detail) {
                        if (typeof errJson.detail === "string") {
                            setLoginError(errJson.detail);
                        } else if (Array.isArray(errJson.detail)) {
                            setLoginError(errJson.detail.map(item => item.msg || JSON.stringify(item)).join("; "));
                        } else {
                            setLoginError("Ошибка при входе");
                        }
                    } else {
                        setLoginError("Ошибка при входе");
                    }
                }
                setLoading(false);
                return;
            }
            // запрос профиля при успешном входе
            const meRes = await fetch(`${API_URL}/me`, {
                method: "GET",
                credentials: "include",
            });
            if (meRes.ok) {
                const userData = await meRes.json();
                onAuthSuccess(userData);
            } else if (meRes.status === 401) {
                // если истёк jwt пробуем запросить заново
                const refRes = await fetch(`${API_URL}/jwt`, {
                    method: "POST",
                    credentials: "include",
                });
                if (refRes.ok) {
                    const meRes2 = await fetch(`${API_URL}/me`, {
                        method: "GET",
                        credentials: "include",
                    });
                    if (meRes2.ok) {
                        const userData = await meRes2.json();
                        onAuthSuccess(userData);
                        return;
                    }
                }
                setLoginError("Сессия истекла, войдите заново");
            } else {
                setLoginError("Не удалось получить профиль");
            }
        } catch (err) {
            console.error("Ошибка входа:", err);
            setLoginError("Сетевая ошибка при входе");
        } finally {
            setLoading(false);
        }
    };

    // переход к окошку с правилами
    const handleGotoTerms = () => {
        setRegError("");
        setView("terms");
    };
    // после согласия переход к регистрации
    const handleAfterAgree = () => {
        setRegError("");
        setView("register");
    };
    // собсна сама регистрация
    const handleSubmitRegister = async () => {
        setRegError("");
        setLoading(true);
        // проверки
        if (!username || !email || !password || !confirmPassword || !telegram) {
            setRegError("Заполните все поля");
            setLoading(false);
            return;
        }
        if (username.length < 3 || telegram.length < 3) {
            setRegError("Имя пользователя и Telegram должны быть ≥ 3 символов");
            setLoading(false);
            return;
        }
        if (password.length < 8) {
            setRegError("Для пароля нужно не менее 8 символов");
            setLoading(false);
            return;
        }
        const emailPattern = /^\S+@\S+\.\S+$/;
        if (!emailPattern.test(email)) {
            setRegError("Неверный формат email");
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setRegError("Пароли не совпадают");
            setLoading(false);
            return;
        }
        try {
            // форма для регистрации
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("firstname", "");
            formData.append("lastname", "");
            formData.append("email", email);
            formData.append("telegram_username", telegram);
            formData.append("password", password);

            const res = await fetch(`${API_URL}/registration`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData.toString(),
                credentials: "include",
            });
            if (res.status === 409) {
                let data = null;
                try {
                    data = await res.json();
                } catch {
                    data = null;
                }
                if (data && data.detail) {
                    setRegError(data.detail);
                } else {
                    setRegError("Username или email уже существует");
                }
                setLoading(false);
                return;
            }
            if (res.status === 422) {
                let data = null;
                try {
                    data = await res.json();
                } catch {
                    data = null;
                }
                if (data && data.detail) {
                    if (Array.isArray(data.detail)) {
                        const messages = data.detail
                            .map((item) => {
                                if (item.msg && typeof item.msg === "string") return item.msg;
                                if (item.message && typeof item.message === "string") return item.message;
                                return JSON.stringify(item);
                            })
                            .join("; ");
                        setRegError(messages);
                    } else if (typeof data.detail === "string") {
                        setRegError(data.detail);
                    } else {
                        setRegError("Ошибка при регистрации (неожиданный формат)");
                    }
                } else {
                    setRegError("Ошибка при регистрации (неверные данные)");
                }
                setLoading(false);
                return;
            }
            if (!res.ok) {
                setRegError(`Ошибка при регистрации (код ${res.status})`);
                setLoading(false);
                return;
            }
            // авторизация юзера после регистрации
            const meRes = await fetch(`${API_URL}/me`, {
                method: "GET",
                credentials: "include",
            });
            if (meRes.ok) {
                const userData = await meRes.json();
                setRegisteredUser(userData);
                // тут вот переходим на экран загрузки авы
                setView("upload");
            } else {
                setRegError("Не удалось получить профиль после регистрации");
            }
        } catch (err) {
            console.error("Ошибка регистрации:", err);
            setRegError("Сетевая ошибка при регистрации");
        } finally {
            setLoading(false);
        }
    };
    // извлечение авы нового юзера (если есть)
    const correctCurrentAvatar =
        registeredUser &&
        registeredUser.avatar &&
        registeredUser.avatar.startsWith("/static/avatars/")
            ? registeredUser.avatar
            : null;
    // если решил кто-то скипнуть аву
    const handleSkipAvatar = () => {
        if (registeredUser) {
            onAuthSuccess(registeredUser);
        }
    };
    // хэндлер успешной загрузки авы
    const handleAvatarUploaded = avatarUrl => {
        if (registeredUser) {
            onAuthSuccess({ ...registeredUser, avatar: avatarUrl });
        }
    };
    if (view === "terms") {
        return (
            <TermsModal
                onBack={() => {
                    setRegError("");
                    setView("auth");
                }}
                onClose={onClose}
                onAgree={handleAfterAgree}
            >
                {setRegError && (
                    <p className="error-text">
                        {setRegError}
                    </p>
                )}
            </TermsModal>
        );
    }
    if (view === "upload" && registeredUser) {
        return (
            <UploadAvatarModal
                userId={registeredUser.id}
                currentAvatar={correctCurrentAvatar}
                onSkip={handleSkipAvatar}
                onUploaded={handleAvatarUploaded}
                onClose={onClose}
            />
        );
    }
    return (
        <>
        <div className="auth-modal" ref={modalRef}>
            {view === "auth" && (
                <>
                    <h2 className="modal-title">Добро пожаловать!</h2>
                    <div className="form-group">
                        <label>Логин</label>
                            <IonInput
                                placeholder="example@example.com"
                            value={loginUsername}
                                onIonInput={e => setLoginUsername(e.detail.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                            <IonInput
                            type="password"
                                placeholder="••••••••••••"
                            value={loginPassword}
                                onIonInput={e => setLoginPassword(e.detail.value)}
                        />
                    </div>
                    {loginError && <p className="error-text">{loginError}</p>}

                    <div className="auth-buttons">
                            <button 
                                className="submit-btn"
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                {loading ? <IonSpinner name="crescent" /> : "Войти"}
                        </button>
                        <button
                            className="submit-btn"
                                onClick={handleGotoTerms}
                                disabled={loading}
                        >
                            Регистрация
                        </button>
                    </div>
                </>
            )}
            {view === "register" && (
                <>
                    <h2 className="modal-title">Регистрация</h2>
                    <div className="form-group">
                        <label>Имя пользователя</label>
                            <IonInput
                            placeholder="Введите логин"
                            value={username}
                                onIonInput={e => setUsername(e.detail.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                            <IonInput
                            type="email"
                            placeholder="example@gmail.com"
                            value={email}
                                onIonInput={e => setEmail(e.detail.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                            <IonInput
                            type="password"
                            placeholder="Минимум 8 символов"
                            value={password}
                                onIonInput={e => setPassword(e.detail.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Подтвердите пароль</label>
                            <IonInput
                            type="password"
                            placeholder="Повторите пароль"
                            value={confirmPassword}
                                onIonInput={e => setConfirmPassword(e.detail.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Telegram-логин</label>
                            <IonInput
                            placeholder="@username"
                            value={telegram}
                                onIonInput={e => setTelegram(e.detail.value)}
                        />
                    </div>
                    {regError && <p className="error-text">{regError}</p>}

                    <div className="auth-buttons">
                        <button
                            className="back-button"
                            onClick={() => {
                                setView("auth");
                                setRegError("");
                                if (onSwitchView) onSwitchView("auth");
                            }}
                                disabled={loading}
                        >
                            ←
                        </button>
                        <button
                            className="create-profile-btn"
                                onClick={handleSubmitRegister}
                                disabled={loading}
                        >
                                {loading ? <IonSpinner name="crescent" /> : "Создать профиль"}
                        </button>
                    </div>
                </>
            )}
        </div>
        </>
    );
}