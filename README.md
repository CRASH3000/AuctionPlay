# Auction App

>   Социальная платформа для размещения лотов и проведения аукционов.

## 🐍 Требования

- Python **3.11** (❗ версии выше могут не поддерживаться)
- PostgreSQL
- Docker
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

## 👥 Участники команды
- Backend: Данила
- DB / модели: Никита
- Frontend: Лиза
- Тесты и сборка: Влад

## 🐳 Запуск проекта через Docker

```bash
docker-compose up --build
```

## Инструкция для работы с Фронтенд

1. Структура проекта
Фронтенд на React, собран через Vite. Всё лежит в папке frontend/.

```bash
public/             # статические файлы (иконки, заглушки)
src/
├──components/      # UI-компоненты (шапка, карточки, модалки и т.д.)
├──pages/
│   └──HomePage/    # главная страница и её стили (адрес главной http://localhost:5173/home)
├── assets/         # SVG и другие ресурсы
├── App.jsx         # корневой компонент
└── main.jsx        # точка входа
```

2. Что используется
- React 18 + JSX
- CSS-модули (обычные .css, всё разнесено по компонентам)
- Vite — максимально быстрый dev-сервер
- Шрифты: Raleway, подключён локально
- Модалки реализованы без библиотек, полностью вручную

3. Что нужно установить после клонирования репозитория?

1) Перейти в папку с проектом:
```bash
cd frontend
```

2) Установить зависимости:
```bash
npm install
```
3) Запустить dev-сервер:
```bash
npm run dev
```
4) Открыть в браузере:
```bash
http://localhost:5173
```


## Инструкция для работы с Бэкендом и Фронтендом

1. Установите Python, Node.js, Docker и PostgreSQL
2. Создайте окружение внутри папки с проектом
```
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```
3. Установите зависимости
```
pip install -r requirements.txt
```
4. Создайте .env, перенесите его в папку backend и добавьте туда:
```
DATABASE_URL=postgresql+asyncpg://postgres:123@localhost:5433/auctionplay
SECRET_KEY=Тут уже сами сгенерируйте
DEBUG=True
```
5. Перейдите в папку с бэком
```
cd backend
```
6. Соберите и запустите контейнеры фоном
```
docker-compose up -d --build
```
7. Примените миграции
```
alembic upgrade head
docker-compose exec web alembic -c backend/alembic.ini upgrade head
```
8. Остановите и заново запустите контейнеры
```
docker-compose down
docker-compose up --build
```
9. Можно тестировать бэк, открываем в браузере:
```
http://localhost:8000/docs
```
10. Во втором терминале запускаем фронт. Для начала перейдем в папку с проектом
```
cd frontend
```
11. Устанавливаем зависимости
```
npm install
```
12. Запускаем dev-сервер
```
npm run dev
```
13. Фронт запущен, открываем в браузере
```
http://localhost:5173
```


## Инструкция для работы с мобильной версией

1. Установите Android Studio и Android SDK
2. Переходим в папку frontend и устанавливаем Ionic React:
```
cd frontend
npm install @ionic/react @ionic/core --legacy-peer-deps
```
3. Устанавливаем Capacitor для мобильных приложений
```
npm install @capacitor/core @capacitor/cli @capacitor/android 
```
4. Собираем проект для эмулятора
```
npm run build
npx cap init AuctionPlay com.auctionplay.app --web-dir=dist
npx cap add android
npx cap sync android
```
5. В Android Studio создаем виртуальный девайс:
  1) Заходим в Android Studio
  2) Нажимаем на "⋮" и выбираем "Virtual Device Manager"
  3) Выбираем устройство и системный образ, жмякаем finish
  4) Ждем загрузки и готово!
6. В терминале уже пишем:
```
npx cap open android
```
Затем выбираем во вкладке Device Manager созданный образ, если он не выбран по умолчанию
7. Перед тем как начать работать в эмуляторе, нужно добавить ip адреса для работы с мобильной версией сайта:
  1) Для начала запускаем сервер:
  ```
  npm run dev
  ```
  2) Если понадобиться, в backend/app/main.py меняем ip адреса на ваши (после запуска сервера, в терминале они будут указаны как Network: http://192.168.1.8:5173/):
  ```
  origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.1.8:5173",
  ]
  ```
  3) Также и в frontend/src/config.js:
  ```
    if (window.location.protocol === 'capacitor:') {
    return 'http://192.168.1.8:8000'; // текущий IP, изменить на ваш (порт не менять)
  }
  ```
  4) и готово!
8. Запускаем эмулятор и можно тестировать!