import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import AddPostButton from "../../components/AddPostButton.jsx";
import PostCard from "../../components/PostCard.jsx";
import PostModal from "../../components/PostModal.jsx";
import ProfileOptions from "../../components/ProfileOptionsModal.jsx";
import "./HomePage.css";

const API_URL = "http://localhost:8000";

export default function HomePage({ currentUser, onLogout} ) {
  const navigate = useNavigate();
  // пока примеры постов, потом надо будет подгружать
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showProfileOptions, setShowProfileOptions] = useState(false);

  useEffect(() => {
    setPosts([
        // мок посты
      {
        id: 1,
        title: "Игровые наушники Logitech",
        text: "Отличное состояние, все работает как новое – никаких хрипов, перебоев или царапин. Объемный 7.1-канальный звук, удобная посадка с мягкими амбушюрами и чистый микрофон с шумоподавлением.",
        author: "Николай",
        avatar: "/test-user-avatar1.png",
        date: "25 июня, 18:05",
        created: "22 июня, 18:05",
        fav: true,
        price: 67,
        img: "/default-image.jpg",
      },
      {
        id: 2,
        title: "Микрофон HyperX",
        text: "Игровой микрофон HyperX в отличном состоянии. Четкий звук, нет фона и хрипов, все функции работают. В комплекте: крепление, кабель, оригинальная упаковка. Продаю из-за ненадобности – цена ниже новой.",
        author: "Роман",
        avatar: "/test-user-avatar2.png",
        date: "24 июня, 14:12",
        created: "21 июня, 14:12",
        fav: false,
        price: 31,
        img: "/default-image.jpg",
      },
    ]);
  }, []);
  // для выхода из акка
  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        onLogout(); // чистим currentUser в родителе
        setShowProfileOptions(false);
        navigate("/login", { replace: true }); // перенаправляем на страницу логина
      } else {
        console.error("Не получилось выйти:", res.status);
      }
    } catch (err) {
      console.error("Ошибка при выходе:", err);
    }
  };

  const handleProfileNavigate = () => {
    navigate("/profile");
  };

  const handleLoginClick = () => {
    navigate("/login")
  };

  return (
      <>
        {/* Шапка с логотипом, фильтрами и аватаром */}
        <Header
            onProfileClick={() => setShowProfileOptions(true)}
            currentUser={currentUser}
        />

        {/* Основной контент - список карточек постов */}
        <main className="page">
          <div className="page-inner">
            {posts.map((p) => (
                <PostCard key={p.id} {...p} />
            ))}
          </div>
          {/* Кнопка для создания нового поста (плюсик) */}
          <AddPostButton onClick={() => setShowPostModal(true)} />
        </main>

        {/* Модалка для создания поста */}
        {showPostModal && <PostModal onClose={() => setShowPostModal(false)} />}
        {/* Контекстное меню */}
        {showProfileOptions && (
            <ProfileOptions
                onClose={() => setShowProfileOptions(false)}
                currentUser={currentUser}
                onLoginClick={handleLoginClick}
                onLogoutClick={handleLogout}
                onProfileNavigate={handleProfileNavigate}
            />
            )}
      </>
  );
}
