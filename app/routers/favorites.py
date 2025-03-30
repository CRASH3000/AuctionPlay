from fastapi import APIRouter, HTTPException, Depends
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()

favorites_db = {}  # тут пока хранятся избранные посты


@router.post("/favorites", summary="Добавить пост в избранное")
def add_to_favorites(post_id: int, current_user: User = Depends(get_current_user)):
    from app.routers.posts import posts_db
    if not any(p["id"] == post_id for p in posts_db):
        raise HTTPException(status_code=404, detail="Пост не найден")
    user_favorites = favorites_db.get(current_user.id, [])
    if post_id in user_favorites:
        return {"status": "ok", "message": "Пост уже в избранном"}
    user_favorites.append(post_id)
    favorites_db[current_user.id] = user_favorites
    return {"status": "ok"}
