import React, {useEffect, useRef, useState} from "react";
import TermsModal from "./TermsModal";
import UploadAvatarModal from "./UploadAvatarModal";
import "./AuthModal.css";

const API_URL = "http://localhost:8000";

export default function AuthModal({ onClose, onAuthSuccess,
                                      initialView = "auth", onSwitchView, isPage = true}) {
    const modalRef = useRef(null);
    const [view, setView] = useState(initialView);

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
        if (!loginUsername || !loginPassword) {
            setLoginError("Введите логин и пароль");
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
        // проверки
        if (!username || !email || !password || !confirmPassword || !telegram) {
            setRegError("Заполните все поля");
            return;
        }
        if (username.length < 3 || telegram.length < 3) {
            setRegError("Имя пользователя и Telegram должны быть ≥ 3 символов");
            return;
        }
        if (password.length < 8) {
            setRegError("Для пароля нужно не менее 8 символов");
            return;
        }
        const emailPattern = /^\S+@\S+\.\S+$/;
        if (!emailPattern.test(email)) {
            setRegError("Неверный формат email");
            return;
        }
        if (password !== confirmPassword) {
            setRegError("Пароли не совпадают");
            return;
        }
        try {
            // форма для регистрации
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("firstname", ""); // это надо не? на всякий случай оставлю, не мешает
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
                return;
            }
            if (!res.ok) {
                setRegError(`Ошибка при регистрации (код ${res.status})`);
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
                    <p className="error-text" style={{ marginTop: "1rem" }}>
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
        <div className="auth-modal" ref={modalRef}>
            {view === "auth" && (
                <>
                    <h2 className="modal-title">Добро пожаловать!</h2>
                    <div className="form-group">
                        <label>Логин</label>
                        <input
                            type="text"
                            placeholder="Введите логин"
                            value={loginUsername}
                            onChange={e => setLoginUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            placeholder="Введите пароль"
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                        />
                    </div>
                    {loginError && <p className="error-text">{loginError}</p>}

                    <div className="auth-buttons">
                        <button className="submit-btn" onClick={handleLogin}>
                            Войти
                        </button>
                        <button
                            className="submit-btn"
                            onClick={() => {
                                handleGotoTerms();
                            }}
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
                        <input
                            type="text"
                            placeholder="Введите логин"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            placeholder="Минимум 8 символов"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Подтвердите пароль</label>
                        <input
                            type="password"
                            placeholder="Повторите пароль"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Telegram-логин</label>
                        <input
                            type="text"
                            placeholder="@username"
                            value={telegram}
                            onChange={e => setTelegram(e.target.value)}
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
                            aria-label="Назад"
                        >
                            ←
                        </button>
                        <button
                            className="create-profile-btn"
                            onClick={() => {
                                handleSubmitRegister();
                            }}
                        >
                            Создать профиль
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}