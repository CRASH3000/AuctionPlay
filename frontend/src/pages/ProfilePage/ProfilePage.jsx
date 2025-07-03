import React, { useState, useEffect } from "react";
import {Link, useNavigate} from "react-router-dom";
import Header from "../../components/Header.jsx";
import UploadAvatarIcon from "../../assets/upload-avatar-icon.png";
import ScoreIcon from "../../assets/score.png";
import SellerRequestModal from "../../components/SellerRequestModal.jsx";
import PendingModal from "../../components/PendingModal.jsx";
import ProfileOptionsModal from "../../components/ProfileOptionsModal.jsx";
import UploadAvatarModal from "../../components/UploadAvatarModal.jsx";
import DefaultAvatar from "../../assets/default-avatar.png";
import "./ProfilePage.css";

import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonSpinner,
  IonInput,
  IonButton,
} from '@ionic/react';
import { API_URL } from '../../config.js';


export default function ProfilePage({ currentUser, onAuthSuccess, onLogout }) {
    const navigate = useNavigate();
    // локальные стейты подгруженных данных профиля
    const [profileInfo, setProfileInfo] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
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
            setLoading(true);
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
            } finally {
                setLoading(false);
            }
        }

        fetchProfileData();
    }, [currentUser]);
    if (error) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Профиль</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div style={{ padding: '1rem', textAlign: 'center' }}>
                        <p>{error}</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (currentUser && (!profileInfo || loading)) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Профиль</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <IonSpinner name="crescent" />
                        <p>Загрузка данных профиля...</p>
                    </div>
                </IonContent>
            </IonPage>
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
    const handleDeleteProfile = async () => {
        if (!window.confirm("Вы точно хотите удалить свой профиль?")) return;
        try {
            const res = await fetch(`${API_URL}/profile/delete`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                onLogout();
                navigate("/login", { replace: true });
            } else {
                const json = await res.json().catch(() => ({}));
                console.error("Ошибка удаления:", res.status, json);
                alert("Не удалось удалить профиль: " + (json.detail || res.status));
            }
        } catch (err) {
            console.error("Сетевая ошибка:", err);
            alert("Сетевая ошибка при удалении профиля");
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
        <IonPage>
            <IonHeader style={{ display: 'none' }}>
                <IonToolbar>
                    <IonTitle>Мой профиль</IonTitle>
                </IonToolbar>
            </IonHeader>
            
            <IonContent>
                <Header onProfileClick={() => setShowProfileOptions(true)}
                        currentUser={currentUser}/>
                
                <div className="profile-page-wrapper">
                    {/* Шапка страницы и выпадающее меню */}
                    <div className="pp-body">
                        <section className="pp-about">
                            <h2 className="pp-section-title">Обо мне</h2>
                            <div className="pp-about-inner">
                                <div className="fields">
                                    <label>Имя</label>
                                    <IonInput
                                        className="input"
                                        value={profileInfo.username}
                                        readonly
                                    />
                                    <label>Тип профиля</label>
                                    <IonInput
                                        className="input"
                                        value={
                                            profileInfo.role === "user"
                                                ? "Покупатель"
                                                : profileInfo.role === "seller"
                                                    ? "Продавец"
                                                    : profileInfo.role
                                        }
                                        readonly
                                    />
                                    <label>Логин Telegram</label>
                                    <IonInput
                                        className="input"
                                        value={profileInfo.telegram_username}
                                        readonly
                                    />
                                    <label>Email</label>
                                    <IonInput
                                        className="input"
                                        value={currentUser.email}
                                        readonly
                                    />
                                    <button
                                        className="delete-profile-btn"
                                        onClick={handleDeleteProfile}
                                    >
                                        Удалить профиль
                                    </button>
                                </div>
                                {/* Блок аватарки */}
                                <div className="avatar-wrapper">
                                    { !profileInfo.avatar || profileInfo.avatar === "static/avatars/default.png" ? (
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
                                                    <Link to={`/posts/${lot.id}`}>
                                                    <img
                                                        src={`${API_URL}${lot.cover}`}
                                                        alt={lot.title}
                                                        className="card-img"
                                                        onError={e =>
                                                            e.currentTarget.style.display = 'none'}
                                                    />
                                                    </Link>
                                                    <div className="card-info">
                                                        <div className="info-top">
                                                            <span className="card-title">
                                                                 <Link to={`/posts/${lot.id}`} className="card-title-link">
                                                                     {lot.title}
                                                                 </Link>
                                                                 </span>
                                                            <div className="score-badge">
                                                                <img
                                                                    src={ScoreIcon}
                                                                    alt="молния"
                                                                    className="score-icon"
                                                                />
                                                                <span className="card-score">{lot.bids_count}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="delete-lot-btn" onClick={() => {
                                                            if (window.confirm("Удалить этот лот навсегда?")) {
                                                                fetch(`${API_URL}/posts/${lot.id}`, {
                                                                    method: "DELETE",
                                                                    credentials: "include"
                                                                }).then(() => {
                                                                    setActiveLots(activeLots.filter(l => l.id !== lot.id));
                                                                });
                                                            }
                                                        }}
                                                            >
                                                            Удалить лот
                                                        </button>
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
                                                    <Link to={`/posts/${lot.id}`}>
                                                    <img
                                                        src={`${API_URL}${lot.cover}`}
                                                        alt={lot.title}
                                                        className="card-img"
                                                    />
                                                    </Link>
                                                    <div className="card-info">
                                                        <div className="info-top">
                                                            <span className="card-title">
                                                                <Link to={`/posts/${lot.id}`} className="card-title-link">
                                                                    {lot.title}</Link>
                                                            </span>
                                                            <div className="score-badge">
                                                                <img
                                                                    src={ScoreIcon}
                                                                    alt="молния"
                                                                    className="score-icon"
                                                                />
                                                                <span className="card-score">{lot.bids_count}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                        className="delete-lot-btn" onClick={() => {
                                                        if (window.confirm("Удалить этот лот навсегда?")) {
                                                            fetch(`${API_URL}/posts/${lot.id}`, {
                                                                method: "DELETE",
                                                                credentials:"include"
                                                        }).
                                                                then(() => {
                                                                    setActiveLots(activeLots.filter(l => l.id !== lot.id));
                                                                });
                                                        }
                                                    }}
                                                        >
                                                        Удалить лот
                                                    </button>
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
                                                <Link to={`/posts/${f.id}`}>
                                                <img
                                                    src={`${API_URL}${f.cover || f.img}`}
                                                    className="fav-img"
                                                    alt={f.title}
                                                />
                                                </Link>
                                                <div className="fav-info">
                                                    <div className="info-top">
                                                        <span className="fav-title">
                                                            <Link to={`/posts/${f.id}`} className="fav-title-link">
                                                                {f.title}
                                                            </Link>
                                                        </span>
                                                        <div className="score-badge">
                                                            <img
                                                                src={ScoreIcon}
                                                                alt="молния"
                                                                className="score-icon"
                                                            />
                                                            <span className="fav-score">{f.bids_count}</span>
                                                        </div>
                                                    </div>
                                                    <button className="fav-unsub" onClick={async () => {
                                                        await fetch(`${API_URL}/favorites/${f.id}`,{
                                                         method: "DELETE",
                                                         credentials: "include",
                                                            }
                                                         );
                                                        setFavorites((prev) =>
                                                            prev.filter((item) => item.id !== f.id)
                                                        );
                                                    }}
                                                        >Отписаться</button>
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
                            onSubmit={async () => {
                                setShowSellerForm(false);
                                try {
                                    const res = await fetch(`${API_URL}/profile/become_seller`, {
                                        method: "POST",
                                        credentials: "include",
                                    });
                                    if (!res.ok) new Error(`Ошибка ${res.status}`);
                                    setProfileInfo(info => ({ ...info, role: "seller" }));
                                    setShowPending(true);
                                    onAuthSuccess({ ...currentUser, role: "seller" });
                                } catch (err) {
                                    console.error("Не удалось стать продавцом:", err);
                                    alert("Пожалуйста, попробуйте позже");
                                }
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
            </IonContent>
        </IonPage>
    );
}
