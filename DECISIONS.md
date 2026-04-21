# Технические решения проекта

Документ объясняет **каждое архитектурное и техническое решение** — почему выбрано именно это, а не альтернатива.

---

## 1. Стек технологий

### Backend: Django + Django REST Framework
**Решение:** Django вместо FastAPI или Flask.

Django — это «batteries included» фреймворк: встроенная ORM, миграции, админка, авторизация. DRF добавляет готовые инструменты для REST API — сериализаторы, ViewSet, роутеры. Для учебного проекта с реляционной БД это оптимальный выбор: меньше кода, больше готовой инфраструктуры.

FastAPI был бы быстрее, но требует ручной настройки миграций (Alembic), авторизации, и не имеет встроенной админки.

### Frontend: Angular
**Решение:** Angular вместо React или Vue.

Angular — строго типизированный фреймворк с встроенными инструментами: роутинг, HTTP клиент, формы, DI. Не нужно выбирать сторонние библиотеки. TypeScript — обязателен по умолчанию.

### База данных: PostgreSQL
**Решение:** PostgreSQL вместо SQLite или MySQL.

SQLite не подходит для продакшна — не поддерживает одновременные записи. PostgreSQL — стандарт для Django в продакшне, поддерживает все нужные типы данных и индексы.

---

## 2. Аутентификация: JWT через SimpleJWT

**Решение:** JWT (Bearer токены) вместо сессионной авторизации Django.

Сессионная авторизация Django требует хранения состояния на сервере и использует Cookie. JWT — stateless: сервер не хранит сессии, токен содержит всю информацию. Это идеально для SPA (Angular) и мобильных клиентов.

`rest_framework_simplejwt` — официальная библиотека JWT для DRF. Даёт `/login/` (получение пары access+refresh токенов) и `/token/refresh/` из коробки.

**Конфигурация:**
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```
- Access токен живёт 60 минут — короткий срок снижает риск при утечке.
- Refresh токен живёт 7 дней — пользователь не переавторизуется каждый час.
- `ROTATE_REFRESH_TOKENS` — при каждом обновлении access токена выдаётся новый refresh, старый инвалидируется.

---

## 3. Структура приложений Django

**Решение:** Три отдельных приложения — `users`, `equipment`, `bookings`.

Каждое приложение отвечает за одну предметную область (принцип Single Responsibility). Это упрощает навигацию по коду и позволяет изолированно тестировать каждую часть.

Альтернатива — один монолитный `api/` модуль — быстро превращается в неуправляемый файл на 1000+ строк.

---

## 4. Модели и связи

### ForeignKey с `on_delete=CASCADE`
**Решение:** При удалении пользователя или оборудования — удаляются все связанные бронирования и отзывы.

Альтернатива `SET_NULL` означала бы "висящие" записи без владельца, что усложняет логику.

### `settings.AUTH_USER_MODEL` вместо прямого импорта `User`
```python
user = models.ForeignKey(settings.AUTH_USER_MODEL, ...)
```
**Решение:** Использование `settings.AUTH_USER_MODEL` позволяет в будущем заменить встроенную модель User на кастомную без изменения кода в `bookings` и других приложениях.

### `unique_together` в Review
```python
unique_together = [('user', 'equipment')]
```
**Решение:** Один пользователь — один отзыв на единицу оборудования. Ограничение на уровне БД, а не только в коде — надёжнее.

### `editable=False` и `default=0` для `total_price`
```python
total_price = models.DecimalField(..., editable=False, default=0)
```
**Решение:** Цена вычисляется автоматически в сериализаторе (`daily_rate × days`), пользователь не может её передать напрямую. `editable=False` исключает поле из форм Django Admin.

---

## 5. Сериализаторы

### Два типа: `Serializer` и `ModelSerializer`

**`ModelSerializer`** (`BookingSerializer`, `CategorySerializer`, `EquipmentSerializer`) — автоматически генерирует поля из модели. Используется там, где нужно читать/писать данные модели напрямую.

**`Serializer`** (`RegisterSerializer`, `AvailabilitySerializer`) — полностью ручной контроль над полями. Используется для операций без прямой записи в одну модель:
- `RegisterSerializer` — создаёт User через `create_user()`, а не через ORM напрямую (нужно хеширование пароля).
- `AvailabilitySerializer` — только проверяет данные, ничего не сохраняет.

### Вложенный сериализатор в EquipmentSerializer
```python
category_detail = CategorySerializer(source='category', read_only=True)
```
**Решение:** Клиент получает полный объект категории вместо просто `category_id`. Поле `read_only` — при создании/редактировании оборудования передаётся `category` (ID), а `category_detail` возвращается только на чтение.

### Валидация дат в BookingSerializer
**Решение:** Вся валидация бизнес-логики — в сериализаторе, а не во view. Это позволяет переиспользовать сериализатор в нескольких местах и держит view тонкими.

Проверки:
- `start >= end` — некорректный диапазон
- `start < today` — нельзя бронировать в прошлом
- `(end - start).days > 90` — максимум 90 дней аренды
- Пересечение с существующими бронированиями — запрос к БД

---

## 6. Views: CBV и FBV

**Решение:** Комбинация Class-Based Views и Function-Based Views.

**CBV используется для стандартных операций:**
- `BookingListCreateView(generics.ListCreateAPIView)` — список + создание. DRF предоставляет готовую реализацию, нужно только переопределить `get_queryset` и `perform_create`.
- `EquipmentViewSet(viewsets.ModelViewSet)` — полный CRUD одним классом.
- `RegisterView(APIView)`, `LogoutView(APIView)` — для нестандартной логики с HTTP методами.

**FBV используется для специфичных операций:**
- `check_availability` — это не CRUD операция, а проверка. FBV с `@api_view(['POST'])` читается проще.
- `cancel_booking` — частичное обновление с бизнес-логикой (проверка даты начала). FBV даёт больше контроля без overhead CBV.

### `perform_create` для привязки к пользователю
```python
def perform_create(self, serializer):
    serializer.save(user=self.request.user)
```
**Решение:** Пользователь берётся из JWT токена запроса, а не из тела запроса. Клиент не может создать бронирование от имени другого пользователя.

### Разные права доступа в EquipmentViewSet
```python
def get_permissions(self):
    if self.action in ('create', 'update', 'partial_update', 'destroy'):
        return [IsAdminUser()]
    return [AllowAny()]
```
**Решение:** Просматривать каталог может любой (в том числе незарегистрированный), а изменять оборудование — только администратор.

---

## 7. Роутинг

### DefaultRouter для Equipment
```python
router = DefaultRouter()
router.register(r'', EquipmentViewSet, basename='equipment')
```
**Решение:** `DefaultRouter` автоматически генерирует все URL для ViewSet (`GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`). Не нужно прописывать каждый маршрут вручную.

### Ручные URL для Bookings
```python
path('', BookingListCreateView.as_view()),
path('check-availability/', check_availability),
path('<int:pk>/cancel/', cancel_booking),
```
**Решение:** В bookings нет полного CRUD (нельзя удалить или обновить бронирование произвольно), поэтому ViewSet с роутером был бы избыточен — пришлось бы отключать ненужные actions.

---

## 8. CORS

```python
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
```
**Решение:** Разрешены все origin'ы, так как фронтенд и бэкенд могут быть на разных поддоменах. В реальном продакшне `CORS_ALLOWED_ORIGINS` следует ограничить конкретными доменами.

`corsheaders.middleware.CorsMiddleware` стоит **выше** `CommonMiddleware` в `MIDDLEWARE` — это обязательное требование библиотеки, иначе preflight OPTIONS запросы не обрабатываются.

---

## 9. Nginx как обратный прокси

**Решение:** Один Nginx обслуживает и фронтенд, и бэкенд на порту 80.

```
/api/*    → backend:8000  (Django)
/admin/*  → backend:8000  (Django Admin)
/static/* → backend:8000  (статика Django)
/media/*  → backend:8000  (загруженные файлы)
/*        → frontend:80   (Angular SPA)
```

Без Nginx пришлось бы открывать два порта (например, 8000 и 4200) и прописывать абсолютные URL в Angular. С Nginx — единый домен, нет CORS между фронтендом и API.

**SPA fallback:**
```nginx
error_page 404 = @fallback;
location @fallback { proxy_pass http://frontend; }
```
Angular — SPA с client-side роутингом. При прямом переходе на `/bookings` Nginx не найдёт файл и вернёт 404. Fallback перенаправляет все 404 обратно на Angular, который сам разбирает маршрут.

---

## 10. Docker Compose

**Решение:** Четыре отдельных сервиса — `db`, `backend`, `frontend`, `nginx`.

```yaml
depends_on:
  db:
    condition: service_healthy
```
**`service_healthy`** вместо `service_started` — бэкенд запускается только после того, как PostgreSQL реально готов принимать соединения (healthcheck проверяет `pg_isready`). Без этого Django падает с `connection refused` при старте.

**Команда запуска бэкенда:**
```yaml
command: >
  sh -c "python manage.py makemigrations users equipment bookings --noinput &&
         python manage.py migrate --noinput &&
         python manage.py seed_equipment &&
         python manage.py collectstatic --noinput &&
         gunicorn ..."
```
`makemigrations` в команде запуска — автоматически создаёт миграции при добавлении новых моделей. `seed_equipment` использует `get_or_create`, поэтому безопасен при повторных запусках.

---

## 11. Angular: архитектура фронтенда

### Standalone компоненты
**Решение:** Все компоненты — `standalone: true`, без NgModule.

Начиная с Angular 14+, standalone компоненты — рекомендованный подход. Каждый компонент явно импортирует только то, что использует. Нет скрытых зависимостей через общий NgModule.

### Lazy loading маршрутов
```typescript
loadComponent: () => import('./features/catalog/catalog.component')
```
**Решение:** Каждая страница загружается только при первом переходе на неё. Уменьшает размер начального bundle — страница открывается быстрее.

### `core/` папка
**Решение:** Guards, interceptors, interfaces и services вынесены в `core/` — это код, который используется глобально и загружается один раз.

`features/` — страницы, каждая со своей логикой. `shared/` — переиспользуемые UI компоненты.

### JWT Interceptor
```typescript
const authReq = token
  ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
  : req;
```
**Решение:** Вместо того чтобы в каждом сервисе вручную добавлять заголовок `Authorization`, interceptor перехватывает **все** HTTP запросы и добавляет токен автоматически. Один interceptor — одна точка изменений.

Также interceptor обрабатывает 401 ответ — удаляет токены и перенаправляет на `/login`.

### ngModel вместо Reactive Forms
**Решение:** Template-driven формы (`ngModel`) для простых форм логина/регистрации.

Reactive Forms мощнее, но требуют больше boilerplate. Для 2-4 полей с базовой валидацией `ngModel` + `required` + `minlength` — достаточно и читается проще.

### Токены в localStorage
**Решение:** `localStorage` вместо cookies для хранения JWT.

Cookies требуют настройки `HttpOnly`, `SameSite`, CSRF защиты. localStorage проще для SPA — доступен напрямую из JavaScript, не отправляется автоматически с каждым запросом (CSRF невозможен по определению).

---

## 12. Seed данные

**Решение:** `get_or_create` вместо `create` в seed-команде.

```python
cat, created = Category.objects.get_or_create(slug=..., defaults={...})
```
`get_or_create` идемпотентен — запуск команды несколько раз не создаёт дубликаты. Это позволяет включить seed в автозапуск Docker Compose без проверок.
