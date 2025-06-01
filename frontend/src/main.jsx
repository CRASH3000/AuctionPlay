import React, {useEffect, useState} from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import App from "./App.jsx";
import HomePage from "./pages/HomePage/HomePage.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import ReactDOM from "react-dom/client";
import "./index.css";

function Main() {
    // Стейт для хранения текущего пользователя
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoadingMe, setIsLoadingMe] = useState(true);
    // При монтировании проверяем /me (fetchMe) — если залогинен, получаем профиль
    useEffect(() => {
        async function fetchMe() {
            try {
                const res = await fetch("http://localhost:8000/me", {
                    method: "GET",
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data);
                } else {
                    setCurrentUser(null);
                }
            } catch (e) {
                console.error("Ошибка при запросе /me:", e);
                setCurrentUser(null);
            } finally {
                setIsLoadingMe(false);
            }
        }
        fetchMe();
    }, []);

    if (isLoadingMe) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>Загрузка...</div>
        );
    }
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App currentUser={currentUser}
                                              onAuthSuccess={(user) => setCurrentUser(user)}
                                              onLogout={() => setCurrentUser(null)}/>} />
                <Route
                    path="/home"
                    element={
                        <HomePage
                            currentUser={currentUser}
                            onLogout={() => setCurrentUser(null)}
                        />
                    }
                />
                <Route
                    path="/profile"
                    element={
                        currentUser ? (
                            <ProfilePage
                                currentUser={currentUser}
                                onAuthSuccess={(updatedUser) => setCurrentUser(updatedUser)}
                                onLogout={() => setCurrentUser(null)}
                            />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
                <Route
                    path="/login"
                    element={
                        currentUser ? (
                            <Navigate to="/profile" replace />
                        ) : (
                            <LoginPage onAuthSuccess={(user) => setCurrentUser(user)} />
                        )
                    }
                />
                <Route
                    path="/register"
                    element={
                        currentUser ? (
                            <Navigate to="/profile" replace />
                        ) : (
                            <RegisterPage onAuthSuccess={(user) => setCurrentUser(user)} />
                        )
                    }
                />
                <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Main />
    </React.StrictMode>
);