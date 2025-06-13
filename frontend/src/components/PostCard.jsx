import "./PostCard.css";

export default function PostCard({ author, avatar, date, created, title, text, img, fav, price }) {
  const fallbackAvatar = "/default-avatar.svg";

  return (
      <article className="card">
          <header className="card-top">
              <div className="card-user">
                  <img src={avatar || fallbackAvatar} alt={author} className="card-avatar"/>
                  <div>
                      <strong className="card-author">{author}</strong>
                      <div className="card-date">{date}</div>
                  </div>
              </div>
              <div className="card-created">{created}</div>
              <button className="card-fav" title="Добавить в избранное">⭐ {price}</button>
          </header>

          <img src={img} alt={title} className="card-img"/>

          <div className="card-body">
              <h3 className="card-title">{title}</h3>
              <p className="card-text">{text}</p>
          </div>

          <footer className="card-foot">
              <span className="card-price">💰 {price}</span>
          </footer>
      </article>
  );
}
