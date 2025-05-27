import React, { useState, useEffect } from "react";
import Header from "../../components/Header.jsx";
import AddPostButton from "../../components/AddPostButton.jsx";
import PostCard from "../../components/PostCard.jsx";
import PostModal from "../../components/PostModal.jsx";
import AuthModal from "../../components/AuthModal.jsx";
import "./HomePage.css";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setPosts([
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
        img: "/default-image.jpg"
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
        img: "/default-image.jpg"
      }
    ]);
  }, []);

  return (
    <>
      <Header onProfileClick={() => setShowAuthModal(true)} />
      <main className="page">
        <div className="page-inner">
          {posts.map(p => <PostCard key={p.id} {...p} />)}
        </div>
        <AddPostButton onClick={() => setShowPostModal(true)} />
      </main>

      {/* модалки */}
      {showPostModal && <PostModal onClose={() => setShowPostModal(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
