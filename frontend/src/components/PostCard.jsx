import React, {useEffect, useRef, useState} from 'react';
import './PostCard.css';
import {Link} from "react-router-dom";
import BidsModal from "../components/BidsModal.jsx";
import { API_URL } from '../config.js';



function resolveUrl(path) {
      if (!path) return null;
          if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
          }
      return `${API_URL}${path}`;
    }
export default function PostCard({
                                     id,
                                     author,
                                     avatar,
                                     date,
                                     created,
                                     title,
                                     text,
                                     img,
                                     authorId,
                                     fav,
                                     onFavToggle,
                                     currentUser,
                                     startingPrice,
                                     active
                                 }) {
    const [showBids, setShowBids] = useState(false);
    const [bidCount, setBidCount] = useState(0);
    const fallbackAvatar = `${API_URL}/static/avatars/default.png`;
    const avatarUrl = resolveUrl(avatar);
    const coverUrl = resolveUrl(img);
    const [pos, setPos] = useState({top: 0, left: 0});
    const btnRef = useRef(null);
    const popRef = useRef(null);

    const loadCount = async () => {
        try {
            const res = await fetch(`${API_URL}/comments?id=${id}`, {
                credentials: 'include'
            });
            const json = await res.json();
            setBidCount(json.comments?.length || 0);
        } catch (e) { console.error(e) }
    };

    useEffect(() => { loadCount(); }, [id, showBids]);

    const openPopover = () => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        setPos({
            top: rect.bottom - 180,
            left: rect.left
        });
        setShowBids(true);
    };
    useEffect(() => {
        if (!showBids) return;

        const updatePos = () => {
            if (!btnRef.current) return;
            const rect = btnRef.current.getBoundingClientRect();
            setPos({
                top:  rect.bottom - 180,
                left: rect.left
            });
        };

        window.addEventListener("scroll", updatePos, { passive: true });
        window.addEventListener("resize", updatePos);
        updatePos();

        return () => {
            window.removeEventListener("scroll", updatePos);
            window.removeEventListener("resize", updatePos);
        };
    }, [showBids]);

    useEffect(() => {
        fetch(`${API_URL}/comments?id=${id}`, { credentials: "include" })
            .then(r => r.json())
            .then(json => {
                const arr = json.comments || [];
                setBidCount(arr.length);
            })
            .catch(console.error);
        }, [id]);

    return (
        <article className="card">
            <header className="card-top">
                <div className="card-user">
                    <div className="card-dates">
                        <div className="date-block">
                            <span className="date-label">Начало аукциона</span>
                            <span className="card-date">{date}</span>
                        </div>
                        <div className="date-block">
                            <span className="date-label">Конец аукциона</span>
                            <span className="card-created">{created}</span>
                        </div>
                    </div>
                    <img
                        src={avatarUrl || fallbackAvatar}
                        alt={author}
                        className="card-avatar"
                        onError={e => {
                            e.currentTarget.src = fallbackAvatar;
                        }}
                    />
                    <div>
                        <strong className="card-author">{author}</strong>
                    </div>
                </div>

                {active && (
                    <button className={`card-fav${fav ? " fav-active" : ""}`} onClick={onFavToggle}>
                        ⭐
                    </button>
                )}
            </header>

            {coverUrl && (
                <div className="card-img-wrapper">
                    <Link to={`/posts/${id}`}>
                        <img
                            src={coverUrl}
                            alt={title}
                            className="card-img-post"
                            onError={e => {
                                e.currentTarget.style.display = 'none';
                            }
                            }
                        />
                    </Link>
                </div>
            )}

            <div className="card-body">
                <h3 className="card-title">
                    <Link to={`/posts/${id}`} className="card-link">{title}</Link></h3>
                <p className="card-text">{text}</p>
            </div>

            {active && (
                <button className="card-bids-button" onClick={openPopover} ref={btnRef}>
                    💰 {bidCount}
                </button>
            )}
            {showBids && (
                <div
                    className="bids-overlay"
                    onClick={() => setShowBids(false)}
                    >
                <div
                    ref={popRef}
                    className="bids-popover-content"
                    onClick={e => e.stopPropagation()}
                    style={{
                        top: `${pos.top}px`,
                        left: `${pos.left}px`,
                    }}
                >
                    <BidsModal
                        postId={id}
                        apiUrl={API_URL}
                        onClose={() => setShowBids(false)}
                        currentUser={currentUser}
                        authorId={authorId}
                        startingPrice={startingPrice}
                    />
                </div>
                    </div>
            )}
        </article>
    );
}