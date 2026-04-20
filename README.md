# Gear Rental

Платформа для аренды фото- и видеооборудования. Пользователи могут просматривать каталог, проверять доступность и бронировать технику по дням.

## Стек технологий

| Слой | Технология |
|---|---|
| Backend | Django 5.0 + Django REST Framework |
| Auth | SimpleJWT (JWT-токены) |
| База данных | PostgreSQL 16 |
| Frontend | Angular 18 (standalone components) |
| Стили | Tailwind CSS |
| Веб-сервер | Nginx |
| Контейнеризация | Docker + Docker Compose |

---

## Структура проекта

```
gear-rental/
├── backend/                  # Django-приложение
│   ├── core/                 # Настройки, URLs, WSGI
│   ├── equipment/            # Модели и API для оборудования
│   ├── bookings/             # Модели и API для бронирований
│   ├── users/                # Регистрация и авторизация
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # Angular-приложение
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/         # Сервисы, интерцепторы, гарды
│   │   │   └── features/     # Страницы: home, catalog, detail, bookings, auth
│   │   └── assets/
│   └── Dockerfile
├── nginx/                    # Конфигурация реверс-прокси
├── docker-compose.yml
├── postman_collection.json   # Коллекция Postman
└── .env                      # Переменные окружения (создать вручную)
```

---

## Требования

- [Docker](https://www.docker.com/) версии 24+
- [Docker Compose](https://docs.docker.com/compose/) версии 2+

Проверить установку:

```bash
docker --version
docker compose version
```

---

## Запуск проекта

### 1. Клонировать репозиторий

```bash
git clone <url-репозитория>
cd gear-rental
```

### 2. Создать файл `.env`

В корне проекта создайте файл `.env` со следующим содержимым:

```env
# База данных
POSTGRES_DB=gear_rental
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgres://postgres:postgres@db:5432/gear_rental

# Django
SECRET_KEY=замените-на-случайную-строку-50-символов
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
```

> Для генерации `SECRET_KEY` можно использовать команду:
> ```bash
> python3 -c "import secrets; print(secrets.token_urlsafe(50))"
> ```

### 3. Запустить все сервисы

```bash
docker compose up --build
```

При первом запуске Docker:
- соберёт образы backend и frontend (занимает 3–5 минут)
- запустит PostgreSQL, выполнит миграции
- соберёт статику Django
- запустит Gunicorn и Nginx

После успешного запуска сайт доступен по адресу: **http://localhost**

### 4. Заполнить базу тестовыми данными

В отдельном терминале:

```bash
docker compose exec backend python manage.py seed_equipment
```

Команда создаст 6 категорий и 21 единицу оборудования с фотографиями.

Чтобы сбросить данные и залить заново:

```bash
docker compose exec backend python manage.py seed_equipment --clear
```

### 5. Создать администратора

```bash
docker compose exec backend python manage.py createsuperuser
```

Введите имя пользователя, email и пароль. После этого панель администратора доступна по адресу **http://localhost/admin**.

---

## Страницы приложения

| URL | Описание |
|---|---|
| `http://localhost/` | Главная страница (герой, каталог, отзывы) |
| `http://localhost/catalog` | Каталог оборудования с фильтрами |
| `http://localhost/equipment/:id` | Страница товара с формой бронирования |
| `http://localhost/bookings` | Мои бронирования (требует авторизации) |
| `http://localhost/login` | Вход |
| `http://localhost/register` | Регистрация |
| `http://localhost/admin` | Панель администратора Django |

---

## API

Базовый URL: `http://localhost/api`

### Аутентификация

| Метод | URL | Описание |
|---|---|---|
| `POST` | `/auth/register/` | Регистрация нового пользователя |
| `POST` | `/auth/login/` | Получение JWT-токенов (access + refresh) |
| `POST` | `/auth/token/refresh/` | Обновление access-токена |
| `POST` | `/auth/logout/` | Выход |

### Оборудование

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/equipment/` | Список оборудования (с фильтрами) |
| `GET` | `/equipment/:id/` | Детали оборудования |
| `POST` | `/equipment/` | Создать (только админ) |
| `PUT` | `/equipment/:id/` | Обновить (только админ) |
| `PATCH` | `/equipment/:id/` | Частично обновить (только админ) |
| `DELETE` | `/equipment/:id/` | Удалить (только админ) |

**Параметры фильтрации** (`GET /equipment/`):
- `category` — слаг категории: `cameras`, `lenses`, `lighting`, `audio`, `stabilizers`, `drones`
- `min_price` / `max_price` — диапазон цены (₸)
- `is_available` — `true` / `false`

### Бронирования

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/bookings/` | Список моих бронирований |
| `POST` | `/bookings/` | Создать бронирование |
| `POST` | `/bookings/check-availability/` | Проверить доступность дат |
| `PATCH` | `/bookings/:id/cancel/` | Отменить бронирование |

### Пример запроса (создание бронирования)

```bash
curl -X POST http://localhost/api/bookings/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "equipment": 1,
    "start_date": "2026-05-01",
    "end_date": "2026-05-05"
  }'
```

---

## Postman

В корне проекта находится файл `postman_collection.json`.

1. Откройте Postman
2. **Import** → выберите `postman_collection.json`
3. Выполните запрос **Auth → Login** — токены сохранятся автоматически в переменные коллекции
4. Все остальные запросы будут работать без дополнительных настроек

---

## Полезные команды

```bash
# Запустить в фоне
docker compose up -d --build

# Остановить все сервисы
docker compose down

# Остановить и удалить данные БД
docker compose down -v

# Просмотр логов backend
docker compose logs -f backend

# Просмотр логов frontend
docker compose logs -f frontend

# Выполнить миграции вручную
docker compose exec backend python manage.py migrate

# Открыть Django shell
docker compose exec backend python manage.py shell

# Открыть psql
docker compose exec db psql -U postgres -d gear_rental
```

---

## Архитектура

```
Браузер
   │
   ▼
Nginx :80
   ├── /api/*        → backend (Gunicorn :8000)
   ├── /admin/*      → backend
   ├── /static/*     → backend (whitenoise)
   ├── /media/*      → backend
   └── /*            → frontend (Nginx :80, Angular SPA)
```

Все четыре сервиса (`db`, `backend`, `frontend`, `nginx`) работают в одной Docker-сети. Nginx является единственной точкой входа и раздаёт трафик между backend и frontend по префиксу URL.
