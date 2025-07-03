import React, { useState, useEffect } from "react";
import {useLocation, useNavigate} from "react-router-dom";
import Header from "../../components/Header.jsx";
import AddPostButton from "../../components/AddPostButton.jsx";
import PostCard from "../../components/PostCard.jsx";
import PostModal from "../../components/PostModal.jsx";
import ProfileOptions from "../../components/ProfileOptionsModal.jsx";
import SellerRequiredModal from "../../components/SellerRequiredModal.jsx";
import AuthRequiredModal from "../../components/AuthRequiredModal.jsx";
import "./HomePage.css";

import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonSpinner
} from '@ionic/react';
import { API_URL } from '../../config.js';


export default function HomePage({ currentUser, onLogout} ) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const archive = params.get("archive") === "1";

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/posts?limit=10&page=1&archive=${archive ? "1" : "0"}`, {
        credentials: "include",
      });
      if (!res.ok) new Error(`Ошибка ${res.status}`);
      const data = await res.json();
      const mapped = data.map((p) => ({
        id: p.id,
        title: p.title,
        text: p.text,
        img: p.cover,
        author: p.author.username,
        authorId: p.author.id,
        avatar: p.author.avatar,
        date: p.created_at,
        created: archive
          ? (p.finished_at || p.time_until_locked)
          : p.time_until_locked,
        price: p.price,
        fav: favorites.has(p.id),
        active: p.active,
      }));
      setPosts(mapped);
    } catch (err) {
      console.error("Не удалось загрузить посты:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
    if (currentUser) {
      fetch(`${API_URL}/me/favorites`, {credentials: "include",})
        .then((r) => r.json())
        .then((json) => {
          const favIds = new Set(json.favorites.map((p) => p.id));
          setFavorites(favIds);
          setPosts((old) =>
            old.map((p) => ({ ...p, fav: favIds.has(p.id) }))
          );
        })
        .catch(() => {});
    }
  }, [currentUser, archive]);

  const toggleFav = async (postId, isFav) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (isFav) {
      await fetch(`${API_URL}/favorites/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } else {
      await fetch(`${API_URL}/favorites/${postId}`, {
        method: "POST",
        credentials: "include",
      });
    }
    setFavorites((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts((old) =>
      old.map((p) =>
        p.id === postId ? { ...p, fav: !isFav } : p
      )
    );
  };

  const handleAddPostClick = () => {
    if (!currentUser) {
      setShowAuthModal(true);
    } else if (currentUser.role !== "seller") {
      setShowSellerModal(true);
    } else {
      setShowPostModal(true);
    }
  };
  
// для выхода из акка
  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        onLogout();
        setShowProfileOptions(false);
        navigate("/login", { replace: true });
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
    <IonPage>
      <IonHeader style={{ display: 'none' }}>
        <IonToolbar>
          <IonTitle>{archive ? "Архив" : "Актуальные лоты"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        {/* Шапка с логотипом, фильтрами и аватаром */}
        <Header
          onProfileClick={() => setShowProfileOptions(true)}
          currentUser={currentUser}
        />
        
        {/* Основной контент - список карточек постов */}
        <main className="page">
          <div className="page-inner">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <IonSpinner name="crescent" />
              </div>
            ) : (
              posts.map((p) => (
                <PostCard key={p.id}
                  {...p}
                  currentUser={currentUser}
                  authorId={p.authorId}
                  startingPrice={p.price}
                  onFavToggle={() => toggleFav(p.id, p.fav)} />
              ))
            )}
          </div>
          {/* Кнопка для создания нового поста (плюсик) */}
          <AddPostButton onClick={handleAddPostClick} />
        </main>

        {showAuthModal && (
          <AuthRequiredModal onClose={() => setShowAuthModal(false)}
            onLogin={() => navigate("/login")}
          />
        )}

        {showSellerModal && (
          <SellerRequiredModal onClose={() => setShowSellerModal(false)}
            onProfile={() => navigate("/profile")}/>
        )}
        {/* Модалка для создания поста */}
        {showPostModal && (
          <PostModal
            onClose={() => setShowPostModal(false)}
            onPostCreated={() => {loadPosts(); setShowPostModal(false);}}/>
        )}
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
      </IonContent>
    </IonPage>
  );
}
