import React from "react";
import Header from "../../components/Header.jsx";
import AuthForm from "../../components/AuthForm.jsx";
import "./LoginPage.css";
import {useNavigate} from "react-router-dom";

import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent
} from '@ionic/react';

export default function LoginPage({ onAuthSuccess }) {
    const navigate = useNavigate();

    return (
        <IonPage>
            <IonHeader style={{ display: 'none' }}>
                <IonToolbar>
                    <IonTitle>Вход</IonTitle>
                </IonToolbar>
            </IonHeader>
            
            <IonContent>
                <div className="login-page">
                    {/* Здесь мы просто показываем шапку (где нет аватара, т. к. currentUser=null) */}
                    <Header onProfileClick={() => {}} currentUser={null} />
                    <div className="login-container">
                        <AuthForm
                            initialView="auth"
                            isPage={true}
                            onClose={() => navigate("/home")}
                            onAuthSuccess={onAuthSuccess}
                            onSwitchView={(view) => {
                                if (view === "register") {
                                    window.location.href = "/register";
                                }
                            }}
                        />
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}