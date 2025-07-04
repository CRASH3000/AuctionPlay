import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import "./PostPage.css";


import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonSpinner,
  IonInput,
  IonButton
} from '@ionic/react';
import { API_URL } from '../../config.js';


export default function PostPage({ currentUser }) {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [bidValue, setBidValue] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/posts/${postId}`, {
            credentials: "include",
        })
            .then((r) => {
                if (!r.ok) throw new Error("Пост не найден");
                return r.json();
            })
            .then(json => {
                setPost(json);
                setLoading(false);
            })
            .catch((e) => {
                console.error(e);
                navigate("/home", { replace: true });
            });
    }, [postId, navigate]);

    const reloadPost = () => {
        fetch(`${API_URL}/posts/${postId}`, { credentials: "include" })
            .then(r => r.json())
            .then(json => setPost(json))
            .catch(console.error);
    };

    const loadComments = () => {
        fetch(`${API_URL}/comments?id=${postId}`, {
            credentials: "include",
        })
            .then((r) => r.json())
            .then((json) => {
                if (json.comments) {
                    const sorted = json.comments.slice().sort((a, b) => b.price - a.price);
                    setComments(sorted);
                }
            })
            .catch(console.error);
    };
    useEffect(loadComments, [postId]);

    const handleBid = async () => {
        setError("");
        if (!currentUser) {
            setError("❗ Пожалуйста, войдите, чтобы сделать ставку");
            return;
        }
        if (currentUser.id === post.author.id || currentUser.role === "seller") {
            setError("❗ Вы не можете делать ставки по этому лоту");
            return;
        }
        const base = post.price;
        const maxBid = comments.length
            ? Math.max(...comments.map((c) => c.price), base) : base;
        if (+bidValue <= maxBid) {
            setError(`❗ Ставка должна быть больше текущей максимальной (${maxBid})`);
            return;
        }
        try {
            const form = new FormData();
            form.append("post_id", postId);
            form.append("price", bidValue);
            const res = await fetch(`${API_URL}/comments`, {
                method: "POST",
                credentials: "include",
                body: form,
            });
            const json = await res.json();
            if (!res.ok) new Error(json.detail || "Ошибка");
            setBidValue("");
            loadComments();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleFinish = async () => {
        if (!window.confirm("Вы уверены, что хотите завершить аукцион?")) return;
        const res = await fetch(`${API_URL}/posts/${postId}/winner`, {
            method: "PATCH",
            credentials: "include"
        });
        const json = await res.json();
        if (!res.ok) {
            alert(json.detail || "Не удалось завершить аукцион");
            return;
        }
        reloadPost();
    };

    const normalizeAvatar = (avatarPath) => {
        if (!avatarPath) {
            return `${API_URL}/static/avatars/default.png`;
        }
        if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
            return avatarPath;
        }
        return `${API_URL}/${avatarPath.replace(/^\/?/, "")}`;
    };

    if (loading) {
        return (
            <IonPage>
                <IonHeader style={{ display: 'none' }}>
                    <IonToolbar>
                        <IonTitle>Загрузка...</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <IonSpinner name="crescent" />
                        <p>Загрузка поста...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (!post) {
        return (
            <IonPage>
                <IonHeader style={{ display: 'none' }}>
                    <IonToolbar>
                        <IonTitle>Ошибка</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Пост не найден</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader style={{ display: 'none' }}>
                <IonToolbar>
                    <IonTitle>{post.title}</IonTitle>
                </IonToolbar>
            </IonHeader>
            
            <IonContent>
                <div className="post-page">
                    <Header
                        currentUser={currentUser}
                        onProfileClick={() =>
                            currentUser ? navigate("/profile") : navigate("/login")
                        }
                    />

                    <div className="post-container">
                        <div className="post-left">
                            <h2>Название</h2>
                            <IonInput className="input-field" readonly value={post.title}/>

                            <h2>Описание товара</h2>
                            <textarea className="input-field-text" readOnly value={post.text}/>

                            <h2>Начальная ставка</h2>
                            <IonInput className="input-field" readonly value={post.price}/>

                            <h2>Конец аукциона</h2>
                            {post.active
                                ? <p className="lot-end-time">{post.time_until_locked}</p>
                                : <p className="lot-ended">Аукцион окончен</p>
                            }

                            <div className="post-author">
                                <img
                                    src={normalizeAvatar(post.author.avatar)}
                                    alt={post.author.username}
                                />
                                <span className="post-username">{post.author.username}</span>
                            </div>
                            {currentUser?.id === post.author.id && post.active && (
                                <button className="finish-btn" onClick={handleFinish}>
                                    Завершить аукцион
                                </button>
                            )}
                            {!post.active && post.winner && (
                                <div className="post-winner-section">
                                    <h3 className="winner-label">Победитель аукциона</h3>
                                    <div className="post-winner">
                                    <img
                                        src={normalizeAvatar(post.winner.avatar)}
                                        alt={post.winner.username}
                                    />
                                    <span className="post-winner-username">{post.winner.username}</span>
                                </div>
                                    </div>
                            )}
                        </div>

                        <div className="post-right">
                            <img
                                className="post-cover"
                                src={`${API_URL}${post.cover}`}
                                alt={post.title}
                            />
                        </div>
                    </div>
                    {post.active && (
                        <section className="post-comments">
                        <div className="chat-header">
                        <h3>Ставки</h3>
                        </div>

                        <div className="chat-messages">
                            {comments.length > 0 ? (
                                comments.map((c, idx) => (
                                    <div
                                        key={c.id}
                                        className={`chat-bubble ${
                                            c.author?.username === currentUser?.username ? "me" : "them"
                                        }${idx === 0 ? " highest" : ""}`}
                                    >
                                        <div className="bubble-author">{c.author?.username || "—"}</div>
                                        <div className="bubble-text">💰 {c.price}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="chat-empty">
                                    Ставок пока нет.
                                    <br/>
                                    <strong>Начальная ставка: 💰 {post.price}</strong>
                                </div>
                            )}
                        </div>
                        <div className="chat-input">
                            <IonInput
                                type="number"
                                placeholder="Ваша ставка"
                                value={bidValue}
                                onIonInput={(e) => setBidValue(e.detail.value)}
                            />
                            <button onClick={handleBid}>➤</button>
                            {error && <div className="chat-error">{error}</div>}
                        </div>
                    </section>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
}