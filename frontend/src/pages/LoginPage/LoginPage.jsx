import React, {useState} from "react";
import Header from "../../components/Header.jsx";
import AuthForm from "../../components/AuthForm.jsx";
import "./LoginPage.css";
import {useNavigate} from "react-router-dom";

export default function LoginPage({ onAuthSuccess }) {
    const navigate = useNavigate();
    const [showAuthModal, setShowAuthModal] = useState(true);

    return (
        <div className="login-page">
            {/* Здесь мы просто показываем шапку (где нет аватара, т. к. currentUser=null) */}
            <Header onProfileClick={() => {}} currentUser={null} />
            <div className="login-container">
                <AuthForm
                    initialView="auth"
                    isPage={true}
                    onClose={() => {setShowAuthModal(false); navigate("/home");}}
                    onAuthSuccess={onAuthSuccess}
                    onSwitchView={(view) => {
                        if (view === "register") {
                            // Переход на страницу регистрации
                            window.location.href = "/register";
                        }
                    }}
                />
            </div>
        </div>
    );
}