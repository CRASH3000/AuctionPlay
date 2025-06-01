import React from "react";
import Header from "../../components/Header.jsx";
import AuthModal from "../../components/AuthModal.jsx";
import "./RegisterPage.css";
import {useNavigate} from "react-router-dom";

export default function RegisterPage({ onAuthSuccess }) {
    return (
        <div className="register-page">
            <Header onProfileClick={() => {}} currentUser={null} />
            <div className="register-container">
                <AuthModal
                    initialView="register"
                    onAuthSuccess={onAuthSuccess}
                    onSwitchView={(view) => {
                        if (view === "auth") {
                            window.location.href = "/login";
                        }
                    }}
                />
            </div>
        </div>
    );
}