import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import UploadAvatarIcon from "../../assets/upload-avatar-icon.png";
import ScoreIcon from "../../assets/score.png";
import SellerRequestModal from "../../components/SellerRequestModal.jsx";
import PendingModal from "../../components/PendingModal.jsx";
import ProfileOptionsModal from "../../components/ProfileOptionsModal.jsx";
import UploadAvatarModal from "../../components/UploadAvatarModal.jsx";
import DefaultAvatar from "../../assets/default-avatar.png";
import "./ProfilePage.css";

const API_URL = "http://localhost:8000";

export default function ProfilePage({ currentUser, onAuthSuccess, onLogout }) {
    const navigate = useNavigate();
    // локальные стейты подгруженных данных профиля
    const [profileInfo, setProfileInfo] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [error, setError] = useState(null);
    // стейты для показа модалок
    const [showProfileOptions, setShowProfileOptions] = useState(false);
    const [showSellerForm, setShowSellerForm] = useState(false);
    const [showPending, setShowPending] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    // таб выбора между активными и архивными лотами
    const [activeTab, setActiveTab] = useState("active");
    const [activeLots, setActiveLots] = useState([]);
    const [archiveLots, setArchiveLots] = useState([]);

    // если юзера нет, сразу кидаем на страницу входа
    useEffect(() => {
        if (!currentUser) {
            navigate("/login", { replace: true });
        }
    }, [currentUser, navigate]);
    // убедились, что юзер есть, начинаем делать запросы
    useEffect(() => {
        if (!currentUser) return;
        const userId = currentUser.id;

        async function fetchProfileData() {
            try {
                // запрос данных юзера и его постов
                const res1 = await fetch(`${API_URL}/profile/${userId}`, {
                    method: "GET",
                    credentials: "include",
                });
                if (!res1.ok) {
                    setError(`Ошибка ${res1.status} при получении профиля`);
                    return;
                }
                const json1 = await res1.json();
                const { user, posts } = json1;
                setProfileInfo(user);
                setActiveLots(posts.active || []);
                setArchiveLots(posts.archived || []);
            } catch (err) {
                console.error("Ошибка при запросе /profile/{userId}:", err);
                setError("Не удалось загрузить информацию профиля");
            }

            try {
                // запрос для избранного
                const res2 = await fetch(`${API_URL}/me/favorites`, {
                    method: "GET",
                    credentials: "include",
                });
                if (!res2.ok) {
                    console.warn(`Ошибка ${res2.status} при получении избранного`);
                    return;
                }
                const json2 = await res2.json();
                setFavorites(json2.favorites || []);
            } catch (err) {
                console.error("Ошибка при запросе /me/favorites:", err);
                setError("Не удалось загрузить избранное");
            }
        }

        fetchProfileData();
    }, [currentUser]);
    if (error) {
        return (
            <div className="profile-page-wrapper">
                <p className="error-text">{error}</p>
            </div>
        );
    }

    if (currentUser && !profileInfo) {
        return (
            <div className="profile-page-wrapper">
                <p>Загрузка данных профиля...</p>
            </div>
        );
    }
    const correctCurrentAvatar =
        profileInfo.avatar && profileInfo.avatar.startsWith("/static/")
            ? profileInfo.avatar
            : null;

    const handleLogout = async () => {
        try {
            const res = await fetch(`${API_URL}/logout`, {
                method: "POST",
                credentials: "include",
            });
            if (res.ok) {
                onLogout();
                setShowProfileOptions(false);
                navigate("/home");
            } else {
                console.error("Logout failed:", res.status);
            }
        } catch (err) {
            console.error("Ошибка при logout:", err);
        }
    };
    const handleAvatarUploaded = (newAvatarUrl) => {
        setProfileInfo((prev) => ({ ...prev, avatar: newAvatarUrl }));
        if (onAuthSuccess) {
            onAuthSuccess({ ...currentUser, avatar: newAvatarUrl });
        }
        setShowUploadModal(false);
    };
    const handleSkipAvatar = () => {
        setShowUploadModal(false);
    };
    const handleProfileNavigate = () => {
        setShowProfileOptions(false);
        navigate("/profile");
    };

    return (
        <div className="profile-page-wrapper">
            {/* Шапка страницы и выпадающее меню */}
            <Header onProfileClick={() => setShowProfileOptions(true)}
                    currentUser={currentUser}/>
            <div className="pp-body">
                <section className="pp-about">
                    <h2 className="pp-section-title">Обо мне</h2>
                    <div className="pp-about-inner">
                        <div className="fields">
                            <label>Имя</label>
                            <input
                                className="input"
                                value={profileInfo.username}
                                readOnly
                            />
                            <label>Тип профиля</label>
                            <input
                                className="input"
                                value={
                                    profileInfo.role === "user"
                                        ? "Покупатель"
                                        : profileInfo.role === "seller"
                                            ? "Продавец"
                                            : profileInfo.role
                                }
                                readOnly
                            />
                            <label>Логин Telegram</label>
                            <input
                                className="input"
                                value={profileInfo.telegram_username}
                                readOnly
                            />
                            <label>Email</label>
                            <input
                                className="input"
                                value={currentUser.email}
                                readOnly
                            />
                        </div>
                        {/* Блок аватарки */}
                        <div className="avatar-wrapper">
                            { !profileInfo.avatar || profileInfo.avatar === "/avatars/default.png" ? (
                                <img
                                    className="avatar-img"
                                    src={DefaultAvatar}
                                    alt="Заглушка аватара"
                                />
                            ) : (
                                <img
                                    className="avatar-img"
                                    src={`${API_URL}${profileInfo.avatar}?t=${Date.now()}`}
                                    alt="Аватар пользователя"
                                />
                            )}

                            <button
                                className="avatar-upload"
                                onClick={() => setShowUploadModal(true)}
                            >
                                <img
                                    src={UploadAvatarIcon}
                                    alt="Сменить фото"
                                    className="avatar-upload-icon"
                                />
                            </button>
                        </div>
                    </div>
                </section>
                {/* Если роль юзера, предлагаем стать продавцом */}
                {profileInfo.role === "user" && (
                    <section className="pp-seller-section">
                        <h2 className="pp-section-title">Стать продавцом</h2>
                        <button
                            className="pp-seller-button"
                            onClick={() => setShowSellerForm(true)}
                        >
                            Отправить заявку
                        </button>
                    </section>
                )}
                {/* Если роль продавца - показываем его лоты */}
                {profileInfo.role === "seller" && (
                    <section className="pp-posts">
                        <h2 className="pp-section-title pp-posts-title">Мои посты</h2>
                        <div className="posts-tabs">
                            <button
                                className={`tab ${activeTab === "active" ? "active" : ""}`}
                                onClick={() => setActiveTab("active")}
                            >
                                Актуальные лоты
                            </button>
                            <button
                                className={`tab ${activeTab === "archive" ? "active" : ""}`}
                                onClick={() => setActiveTab("archive")}
                            >
                                Архив
                            </button>
                        </div>
                        <div className="posts-cards">
                            {activeTab === "active" ? (
                                activeLots.length ? (
                                    activeLots.map((lot) => (
                                        <div key={lot.id} className="card">
                                            <img
                                                src={lot.cover}
                                                alt={lot.title}
                                                className="card-img"
                                            />
                                            <div className="card-info">
                                                <div className="info-top">
                                                    <span className="card-title">{lot.title}</span>
                                                    <div className="score-badge">
                                                        <img
                                                            src={ScoreIcon}
                                                            alt="молния"
                                                            className="score-icon"
                                                        />
                                                        <span className="card-score">{lot.price}</span>
                                                    </div>
                                                </div>
                                                <button className="fav-unsub">Отписаться</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="active-empty">У вас нет активных лотов.</p>
                                )
                            ) : (
                                archiveLots.length ? (
                                    archiveLots.map((lot) => (
                                        <div key={lot.id} className="card">
                                            <img
                                                src={lot.cover}
                                                alt={lot.title}
                                                className="card-img"
                                            />
                                            <div className="card-info">
                                                <div className="info-top">
                                                    <span className="card-title">{lot.title}</span>
                                                    <div className="score-badge">
                                                        <img
                                                            src={ScoreIcon}
                                                            alt="молния"
                                                            className="score-icon"
                                                        />
                                                        <span className="card-score">{lot.price}</span>
                                                    </div>
                                                </div>
                                                <button className="fav-unsub">Отписаться</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="archive-empty">Архив пока пуст.</p>
                                )
                            )}
                        </div>
                    </section>
                )}
                {/* Список избранного если юзер */}
                {profileInfo.role === "user" && (
                    <section className="pp-favorites">
                        <h2 className="pp-section-title">Избранное</h2>
                        {favorites.length ? (
                            <div className="fav-cards">
                                {favorites.map((f) => (
                                    <div key={f.id} className="fav-card">
                                        <img
                                            src={f.cover || f.img}
                                            className="fav-img"
                                            alt={f.title}
                                        />
                                        <div className="fav-info">
                                            <div className="info-top">
                                                <span className="fav-title">{f.title}</span>
                                                <div className="score-badge">
                                                    <img
                                                        src={ScoreIcon}
                                                        alt="молния"
                                                        className="score-icon"
                                                    />
                                                    <span className="fav-score">{f.price}</span>
                                                </div>
                                            </div>
                                            <button className="fav-unsub">Отписаться</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="fav-empty">Тут пока ничего нет</p>
                        )}
                    </section>
                )}
            </div>
            {/* Модалка заявки на продавца */}
            {showSellerForm && (
                <SellerRequestModal
                    onClose={() => setShowSellerForm(false)}
                    onSubmit={(link) => {
                        setShowSellerForm(false);
                        setShowPending(true);
                    }}
                />
            )}
            {/* Модалка "Заявка отправлена" */}
            {showPending && <PendingModal onClose={() => setShowPending(false)}/>}
            {/* Контекстное меню профиля */}
            {showProfileOptions && (
                <ProfileOptionsModal
                    onClose={() => setShowProfileOptions(false)}
                    currentUser={currentUser}
                    onLoginClick={() => {
                        navigate("/login");
                    }}
                    onLogoutClick={handleLogout}
                    onProfileNavigate={handleProfileNavigate}
                />
            )}
            {/* Модалка загрузки аватара */}
            {showUploadModal && (
                <UploadAvatarModal
                    userId={currentUser.id}
                    currentAvatar={correctCurrentAvatar}
                    onSkip={handleSkipAvatar}
                    onUploaded={handleAvatarUploaded}
                />
            )}
        </div>
    );
}
