# Auction App — Backend

>   Социальная платформа для размещения лотов и проведения аукционов.

## 🐍 Требования

- Python **3.11** (❗ версии выше могут не поддерживаться)
- PostgreSQL
- Docker (для запуска БД)
- Alembic (для миграций)
- DBeaver (по желанию, для просмотра БД)

---

## 📦 Установка зависимостей
```bash
pip install -r requirements.txt
```

## 📁 Структура проекта- alembic/ — миграция
- app/ — основное бэк-приложение
- db/ — схемы базы данных
- tests/ — автотесты
- .env — переменные окружения

## Запуск базы данных PostgreSQL

1. Установите Docker и PostgreSQL
2. Выполните в терминале:

```bash
docker run --name auctionplay-postgres -p 5433:5432 \
 -e POSTGRES_USER=postgres \ -e POSTGRES_PASSWORD=123 \ -e POSTGRES_DB=auctionplay \ -d postgres```
  ```
3. Примените миграции

```bash
alembic upgrade head
```

## 🚀 Запуск приложения
```bash
uvicorn app.main:app --reload
```

## 🧪 Запуск тестов
```bash
pytest -v
```
> ⚠️ Убедитесь, что приложение запущено перед запуском тестов.

**Добавление тестовых пользователей:**
```bash
python test_users.py
```
> ⚠️ Убедитесь, что база данных уже запущена.

## 👥 Участники команды- Backend: Данила
- DB / модели: Никита
- Frontend: Лиза
- Тесты и сборка: Влад