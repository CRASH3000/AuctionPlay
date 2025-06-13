import React, { useState } from "react";
import Header from "./components/Header.jsx";
import AddPostButton from "./components/AddPostButton.jsx";
import PostModal from "./components/PostModal.jsx";
import "./App.css";
import {useNavigate} from "react-router-dom";

export default function App({ currentUser, onLogout , onAuthSuccess }) {
    const [showPostModal, setShowPostModal] = useState(false);
    const navigate = useNavigate();
    return (
        <div className="App">
            {/* Шапка, через onProfileClick либо переходим в /profile, либо на /login */}
            <Header
                currentUser={currentUser}
                onProfileClick={() => {
                    if (currentUser) {
                        navigate("/profile");
                    } else {
                        navigate("/login");
                    }
                }}
                onLogout={onLogout}
            />
            <AddPostButton onClick={() => setShowPostModal(true)} />
            {/* Если нужно показать модалку создания поста — рендерим PostModal */}
            {showPostModal && (
                <PostModal onClose={() => setShowPostModal(false)} />
            )}
        </div>
    );
}
