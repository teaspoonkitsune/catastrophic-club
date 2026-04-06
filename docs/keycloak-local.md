**Local Keycloak**

Локальный Keycloak для проекта лежит в [infra/keycloak/podman-compose.yml](../infra/keycloak/podman-compose.yml).

Канонический локальный сценарий:
- приложение: `http://localhost:3000`
- Keycloak: `http://localhost:8080`

Лучше не смешивать `localhost`, `127.0.0.1`, IP из локальной сети и нестандартные порты внутри одного auth-flow.

Что уже подготовлено для встроенного входа:
- realm `catastrophic-club`
- client `catastrophic-club-web`
- local-only secret `change-me-for-local-dev`
- разрешённая регистрация пользователей
- direct access grants для встроенного логина

Что оставлено в настройках клиента для совместимости:
- PKCE `S256`
- redirect URI `http://localhost:3000/api/auth/callback`
- post logout redirect `http://localhost:3000/*`
- root/base URL клиента `http://localhost:3000`

Файлы:
- compose: [podman-compose.yml](../infra/keycloak/podman-compose.yml)
- import realm: [catastrophic-club-realm.json](../infra/keycloak/realm-import/catastrophic-club-realm.json)
- env для контейнера: [.env.example](../infra/keycloak/.env.example)
- env для приложения: [.env.example](../.env.example)

Запуск:

```sh
cd infra/keycloak
cp .env.example .env
podman compose up -d
```

Если `podman compose` у тебя не установлен, можно запускать напрямую:

```sh
cd infra/keycloak
podman volume create keycloak-data
podman run -d \
  --name catastrophic-club-keycloak \
  -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  -v "$(pwd)/realm-import:/opt/keycloak/data/import:Z" \
  -v keycloak-data:/opt/keycloak/data:Z \
  quay.io/keycloak/keycloak:26.5.5 \
  start-dev --import-realm --hostname=http://localhost:8080
```

Админка:

```text
http://localhost:8080/admin/
```

Локальный логин по умолчанию. Эти значения только для разработки, не для общего окружения:
- username: `admin`
- password: `admin`

Для приложения создай `.env` в корне проекта на основе [.env.example](../.env.example).

Минимальный набор:

```env
AUTH_SECRET=replace-with-a-long-random-string
AUTH_SESSION_TTL_SECONDS=604800
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=catastrophic-club
KEYCLOAK_CLIENT_ID=catastrophic-club-web
KEYCLOAK_CLIENT_SECRET=change-me-for-local-dev
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
# Optional defaults:
# KEYCLOAK_SCOPE=openid profile email
# KEYCLOAK_ADMIN_REALM=master
# KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
```

`KEYCLOAK_ADMIN_USERNAME` и `KEYCLOAK_ADMIN_PASSWORD` выше — локальные значения для контейнера из примера. Для другого окружения их нужно заменить.

Проверка после запуска:
1. Открой приложение только на `http://localhost:3000`.
2. Войди через форму в сайдбаре или открой регистрацию в модальном окне.
3. После успешного входа должна появиться cookie `catastrophic_club_session` на `localhost:3000`.
4. В шапке и панели аккаунта должно появиться имя пользователя.

Если нужно переимпортировать realm с нуля:

```sh
cd infra/keycloak
podman compose down -v
podman compose up -d
```

Это удалит volume `keycloak-data` и поднимет Keycloak заново с импортом realm.
