# Структура проекта

```
gear-rental/
├── backend/                        # Django + DRF сервер
│   ├── core/                       # Настройки проекта
│   │   ├── settings.py             # Конфигурация Django (БД, JWT, CORS и т.д.)
│   │   ├── urls.py                 # Главный роутер — все URL маршруты
│   │   ├── views.py                # Обработчики 404/500 ошибок
│   │   ├── wsgi.py                 # Точка входа для продакшн-сервера (gunicorn)
│   │   └── asgi.py                 # Точка входа для асинхронного сервера
│   │
│   ├── users/                      # Приложение для авторизации
│   │   ├── models.py               # Пустой — используется встроенный User Django
│   │   ├── serializers.py          # RegisterSerializer — валидация регистрации
│   │   └── views.py                # RegisterView, LogoutView
│   │
│   ├── equipment/                  # Приложение для оборудования
│   │   ├── models.py               # Модели Category и Equipment
│   │   ├── serializers.py          # CategorySerializer, EquipmentSerializer
│   │   ├── views.py                # EquipmentViewSet — полный CRUD
│   │   ├── urls.py                 # Маршруты /api/equipment/
│   │   ├── admin.py                # Регистрация моделей в админке
│   │   └── management/
│   │       └── commands/
│   │           └── seed_equipment.py  # Команда для заполнения БД тестовыми данными
│   │
│   ├── bookings/                   # Приложение для бронирований
│   │   ├── models.py               # Модели Booking и Review
│   │   ├── serializers.py          # BookingSerializer, AvailabilitySerializer
│   │   ├── views.py                # BookingListCreateView (CBV), check_availability, cancel_booking (FBV)
│   │   ├── urls.py                 # Маршруты /api/bookings/
│   │   └── admin.py                # Регистрация моделей в админке
│   │
│   ├── media/                      # Загружаемые файлы (фото оборудования)
│   ├── manage.py                   # CLI Django
│   ├── requirements.txt            # Python зависимости
│   └── Dockerfile                  # Сборка Docker-образа бэкенда
│
├── frontend/                       # Angular приложение
│   └── src/
│       ├── app/
│       │   ├── core/               # Глобальная логика приложения
│       │   │   ├── guards/         # auth.guard — защита маршрутов от неавторизованных
│       │   │   ├── interceptors/   # auth.interceptor — добавляет JWT токен к каждому запросу
│       │   │   ├── interfaces/     # TypeScript интерфейсы (Equipment, Booking, User)
│       │   │   └── services/       # HTTP сервисы (auth, equipment, booking)
│       │   │
│       │   ├── features/           # Страницы приложения
│       │   │   ├── home/           # Главная страница
│       │   │   ├── catalog/        # Каталог оборудования с фильтрами
│       │   │   ├── detail/         # Страница оборудования + форма бронирования
│       │   │   ├── bookings/       # Список бронирований пользователя
│       │   │   ├── auth/
│       │   │   │   ├── login/      # Страница входа
│       │   │   │   └── register/   # Страница регистрации
│       │   │   └── not-found/      # Страница 404
│       │   │
│       │   ├── shared/             # Общие компоненты (переиспользуемые)
│       │   ├── app.routes.ts       # Маршруты Angular
│       │   ├── app.config.ts       # Конфигурация приложения (провайдеры, interceptors)
│       │   └── app.component.ts    # Корневой компонент
│       │
│       ├── assets/                 # Статические файлы (изображения, видео)
│       ├── environments/           # Переменные окружения (dev/prod API URL)
│       ├── styles.scss             # Глобальные стили
│       └── index.html              # Точка входа HTML
│
├── nginx/                          # Nginx — обратный прокси
│   ├── nginx.conf                  # Конфигурация: проксирует /api/ на бэкенд, остальное на фронтенд
│   └── Dockerfile                  # Сборка Docker-образа nginx
│
├── postman/                        # Коллекция Postman для тестирования API
│   └── gear-rental.json
│
├── docker-compose.yml              # Оркестрация всех сервисов (db, backend, frontend, nginx)
├── .env                            # Переменные окружения (секреты, не в git)
├── .env.example                    # Пример .env файла
└── .gitignore
```
