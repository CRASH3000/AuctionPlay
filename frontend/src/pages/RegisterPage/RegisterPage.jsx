import React from "react";
import Header from "../../components/Header.jsx";
import AuthForm from "../../components/AuthForm.jsx";
import "./RegisterPage.css";

import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent
} from '@ionic/react';

export default function RegisterPage({ onAuthSuccess }) {
    return (
        <IonPage>
            <IonHeader style={{ display: 'none' }}>
                <IonToolbar>
                    <IonTitle>Регистрация</IonTitle>
                </IonToolbar>
            </IonHeader>
            
            <IonContent>
        <div className="register-page">
            <Header onProfileClick={() => {}} currentUser={null} />
            <div className="register-container">
                <AuthForm
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
            </IonContent>
        </IonPage>
    );
}