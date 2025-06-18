import React, { useEffect, useState } from "react";
import "./BidsModal.css";

export default function BidsModal({ postId, currentUser, apiUrl, startingPrice, authorId }) {
    const [bids, setBids] = useState([]);
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const maxPrice = bids[0]?.price;
    const userRole = currentUser?.role && typeof currentUser.role !== "string"
        ? currentUser.role.name
        : currentUser?.role || null
    const loadBids = () => {
        fetch(`${apiUrl}/comments?id=${postId}`, {
            credentials: "include",
        })
            .then(r => r.json())
            .then(json => {
                const sorted = (json.comments || []).slice().sort((a,b) => b.price - a.price);
                setBids(sorted);
            })
            .catch(console.error);
    };

    useEffect(loadBids, [postId]);

    const handleSubmit = async () => {
        setError("");
        if (!currentUser) {
            setError("❗ Пожалуйста, войдите, чтобы сделать ставку");
            return;
        }
        if (currentUser.id === authorId || userRole === "seller") {
            setError("❗ Вы не можете делать ставки по этому лоту");
            return;
        }
        const base = startingPrice;
        const maxBid = bids.length
            ? Math.max(...bids.map(b=>b.price), base)
            : base;
        if (+value <= maxBid) {
            setError(`❗ Ставка должна быть больше текущей максимальной (${maxBid})`);
            return;
        }
        try {
            const form = new FormData();
            form.append("post_id", postId);
            form.append("price", value);
            const res = await fetch(`${apiUrl}/comments`, {
                method: "POST",
                credentials: "include",
                body: form,
            });
            const json = await res.json();
            if (!res.ok) new Error(json.detail || "Ошибка");
            setValue("");
            loadBids();
        } catch (e) {
            setError(e.message);
        }
    };

    return (
            <div className="bids-modal" onClick={e => e.stopPropagation()}>
                <div className="bids-list">
                    {bids.length > 0 ? bids.map(b => (
                        <div key={b.id}  className={`bid-entry${b.price === maxPrice ? " highest" : ""}`}
                             >
                            <span className="bid-author">{b.author?.username || "—"}</span>
                            <span className="bid-price">{b.price}</span>
                        </div>
                    )) : (<div className="bids-empty">
                        Ставок пока нет.<br/>
                        <strong>Начальная ставка: 💰 {startingPrice}</strong>
                    </div>
                    )}
                    </div>
                        <div className="bids-input">
                        <input
                        type="number"
                        placeholder="Ваша ставка"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                    />
                    <button onClick={handleSubmit}>➤</button>
                    {error && <div className="bids-error">{error}</div>}
                </div>
            </div>
    );
}